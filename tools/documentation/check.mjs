/**
 * @file tools/documentation/check.mjs
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

/**
 * Exclude only upstream/history and reproducible output, never editable tests or declarations.
 *
 * @since 0.0.1
 * @param {string} path - A repository-relative path using forward slashes.
 * @returns {boolean} Whether the path is TypeScript source that the documentation contract covers.
 * @example
 * isEditableTypeScript('packages/schema/src/index.ts'); // true
 */
export const isEditableTypeScript = (path) =>
    /\.(?:[cm]?ts|tsx)$/.test(path) &&
    !/^(?:Examples|examples|externals|graphify-out|\.amp)\//.test(path) &&
    !/^\.(?:claude\/(?:skills|commands)|cursor\/commands)\//.test(path) &&
    !/(?:^|\/)(?:node_modules|dist|out-tsc|coverage|test-output|test-results|playwright-report|\.nx|\.expo)(?:\/|$)/.test(
        path
    );

/**
 * Reject placeholders and name-only paraphrases; semantic accuracy still requires human review.
 *
 * @since 0.0.1
 * @param {string} text - The raw JSDoc body, with or without leading `*` gutters and tags.
 * @param {string} [name] - The documented declaration's identifier, whose words do not count as information.
 * @returns {boolean} Whether the prose has at least two distinct words and one that does not just repeat the name.
 * @example
 * usefulDescription('Load the catalogue from storage.', 'loadCatalogue'); // true
 */
export const usefulDescription = (text, name = '') => {
    const prose = text
        .replace(/^\s*\*\s?/gm, '')
        .replace(/@(internal|public|private|protected|readonly|deprecated)\b\s*/g, '')
        .replace(/@[\w-]+[^\n]*/g, '')
        .replace(/[`{}]/g, '')
        .trim();
    if (/\b(?:todo|fixme|tbd|placeholder|documentation goes here)\b/i.test(prose)) return false;
    const words = prose.toLowerCase().match(/[a-z][a-z'-]*/g) ?? [];
    const names = new Set(
        name
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .toLowerCase()
            .match(/[a-z]+/g) ?? []
    );
    const informative = words.filter(
        /**
         * Keep words that add meaning beyond the declaration name and filler words.
         *
         * @param {string} word - One lower-case word from the description.
         * @returns {boolean} Whether the word is neither part of the name nor a filler word.
         */
        (word) => !names.has(word) && !['the', 'a', 'an', 'function', 'method', 'class', 'interface'].includes(word)
    );
    return words.length >= 2 && informative.length >= 1 && new Set(words).size >= 2;
};

/**
 * Include executable and type-level callable syntax, including anonymous callbacks and accessors.
 *
 * @param {ts.Node} node - Any syntax node of the parsed file.
 * @returns {boolean} Whether the node is a callable, class or interface declaration that requires a contract.
 */
const needsDocumentation = (node) =>
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isMethodSignature(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node) ||
    ts.isClassDeclaration(node) ||
    ts.isClassExpression(node) ||
    ts.isInterfaceDeclaration(node) ||
    ts.isFunctionTypeNode(node) ||
    ts.isConstructorTypeNode(node) ||
    ts.isCallSignatureDeclaration(node) ||
    ts.isConstructSignatureDeclaration(node);

/**
 * A binding's doc describes its direct initializer, not arbitrary callbacks nested inside it.
 *
 * @param {ts.Node} node - A declaration selected by `needsDocumentation`.
 * @returns {ts.Node} The statement, property, alias or parameter whose leading comment documents the node, or the node itself.
 */
const documentationOwner = (node) => {
    let owner = node;
    while (
        ts.isParenthesizedExpression(owner.parent) ||
        ts.isAsExpression(owner.parent) ||
        ts.isSatisfiesExpression(owner.parent)
    )
        owner = owner.parent;
    if (ts.isVariableDeclaration(owner.parent) && (owner.parent.initializer === owner || owner.parent.type === owner)) {
        owner = owner.parent;
        if (owner.parent.declarations.length === 1) owner = owner.parent.parent;
    } else if (
        (ts.isPropertyAssignment(owner.parent) || ts.isPropertyDeclaration(owner.parent)) &&
        owner.parent.initializer === owner
    )
        owner = owner.parent;
    else if (ts.isTypeAliasDeclaration(owner.parent) && owner.parent.type === owner) owner = owner.parent;
    else if (ts.isPropertySignature(owner.parent) && owner.parent.type === owner) owner = owner.parent;
    else if (ts.isParameter(owner.parent) && owner.parent.type === owner) owner = owner.parent;
    return owner;
};

/**
 * Select only the adjacent contract, allowing the required vendor-boundary marker between it and its owner.
 *
 * @param {ts.Node} node - A declaration selected by `needsDocumentation`.
 * @param {ts.SourceFile} source - The parsed file that holds the node.
 * @param {string} text - The full source text the file was parsed from.
 * @returns {ts.CommentRange | undefined} The range of the JSDoc block directly above the owner, or undefined when none is attached.
 */
const documentationRange = (node, source, text) => {
    const owner = documentationOwner(node);
    const ranges = [
        ...(ts.getLeadingCommentRanges(text, owner.pos) ?? []),
        ...(ts.getTrailingCommentRanges(text, owner.pos) ?? []),
    ].sort(
        /**
         * Order comment ranges by where they start in the file.
         *
         * @param {ts.CommentRange} a - The first range to compare.
         * @param {ts.CommentRange} b - The second range to compare.
         * @returns {number} A negative number when `a` starts first, positive when `b` does.
         */
        (a, b) => a.pos - b.pos
    );
    const last = ranges.findLast(
        /**
         * Skip vendor-boundary markers so the comment above them is found.
         *
         * @param {ts.CommentRange} range - One leading or trailing comment of the owner.
         * @returns {boolean} Whether the comment is anything other than an `effect-boundary` marker.
         */
        (range) => !/^\/\/\s*effect-boundary:/.test(text.slice(range.pos, range.end))
    );
    return last &&
        text.slice(last.pos, last.end).startsWith('/**') &&
        text
            .slice(last.end, owner.getStart(source))
            .replace(/\/\/\s*effect-boundary:[^\r\n]*/g, '')
            .trim() === ''
        ? last
        : undefined;
};

/**
 * Inspect the same declarations in both modes; the internal legacy option exists only for trusted-history reconciliation.
 *
 * @since 0.0.1
 * @param {string} file - The repository-relative path recorded on every finding and hashed into its id.
 * @param {string} text - The TypeScript source to parse.
 * @param {object} [options] - How finding ids are fingerprinted.
 * @param {boolean} [options.internalLegacyFingerprint] - Hash scanner tokens, including JSDoc, as older trusted history did; defaults to false.
 * @returns {Array<{ id?: string, file: string, line: number, kind: string, name: string, rule: string }>} One finding per parse error, undocumented declaration or uninformative description.
 * @example
 * const findings = inspectSource('src/a.ts', 'export const a = () => 1;');
 */
export const inspectSource = (file, text, { internalLegacyFingerprint = false } = {}) => {
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    const findings = [];
    const declarations = [];
    /**
     * Gather every declaration that needs a contract, depth first.
     *
     * @param {ts.Node} node - The subtree to walk.
     */
    const collect = (node) => {
        if (needsDocumentation(node)) declarations.push(node);
        ts.forEachChild(node, collect);
    };
    collect(source);
    const contracts = new Map(
        declarations.map(
            /**
             * Pair a declaration with its attached JSDoc range.
             *
             * @param {ts.Node} node - A declaration that needs a contract.
             * @returns {[ts.Node, ts.CommentRange | undefined]} The declaration and its JSDoc range, if any.
             */
            (node) => [node, documentationRange(node, source, text)]
        )
    );
    const occurrences = new Map();
    /**
     * Record a finding whose id is a stable hash of the declaration's code tokens, numbered per duplicate.
     *
     * @param {ts.Node} node - The declaration being reported.
     * @param {string} rule - Either `missing-jsdoc` or `review-jsdoc`.
     * @param {string} name - The declaration's name, or `<anonymous>`.
     */
    const report = (node, rule, name) => {
        const tokens = [];
        if (internalLegacyFingerprint) {
            const scanner = ts.createScanner(
                ts.ScriptTarget.Latest,
                true,
                source.languageVariant,
                node.getText(source)
            );
            while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) tokens.push(scanner.getTokenText());
        } else {
            /**
             * Append the text of every non-JSDoc token below a node, so editing docs keeps the id stable.
             *
             * @param {ts.Node} child - The node whose tokens are collected.
             */
            const collectTokens = (child) => {
                if (child.kind === ts.SyntaxKind.JSDocComment) return;
                if (ts.isToken(child)) {
                    if (child.kind !== ts.SyntaxKind.EndOfFileToken) tokens.push(child.getText(source));
                } else child.getChildren(source).forEach(collectTokens);
            };
            collectTokens(node);
        }
        const hash = createHash('sha256')
            .update(JSON.stringify([file, node.kind, name, rule, tokens]))
            .digest('hex');
        const occurrence = occurrences.get(hash) ?? 0;
        occurrences.set(hash, occurrence + 1);
        findings.push({
            id: `${hash}:${occurrence}`,
            file,
            line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
            kind: ts.SyntaxKind[node.kind],
            name,
            rule,
        });
    };
    for (const diagnostic of source.parseDiagnostics) {
        findings.push({
            file,
            line: source.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line + 1,
            kind: 'Syntax',
            name: '',
            rule: 'parse-error',
        });
    }
    for (const node of declarations) {
        const owner = documentationOwner(node);
        const namingOwner =
            (ts.isFunctionTypeNode(node) || ts.isConstructorTypeNode(node)) &&
            (ts.isParameter(node.parent) || ts.isVariableDeclaration(node.parent))
                ? node
                : owner;
        const name =
            node.name?.getText(source) ??
            namingOwner.name?.getText(source) ??
            namingOwner.declarationList?.declarations[0]?.name.getText(source) ??
            '<anonymous>';
        const attached = contracts.get(node);
        const doc = attached ? text.slice(attached.pos + 3, attached.end - 2) : '';
        if (!doc || /@file\b/.test(doc)) report(node, 'missing-jsdoc', name);
        else if (!usefulDescription(doc, name)) report(node, 'review-jsdoc', name);
    }
    return findings;
};

/**
 * Enumerate Git-visible source, including new files, without traversing ignored builds or upstream trees.
 *
 * @since 0.0.1
 * @param {string} root - The repository root to list with `git ls-files`.
 * @returns {{ checked: number, findings: object[] }} How many files were read and every finding from `inspectSource`.
 * @example
 * const { checked, findings } = inspectRepository(process.cwd());
 */
export const inspectRepository = (root) => {
    const paths = [
        ...new Set(
            execFileSync(
                'git',
                [
                    'ls-files',
                    '-z',
                    '--cached',
                    '--others',
                    '--exclude-standard',
                    '--',
                    '*.ts',
                    '*.tsx',
                    '*.mts',
                    '*.cts',
                    ':!:Examples/**',
                    ':!:examples/**',
                    ':!:externals/**',
                ],
                { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }
            ).split('\0')
        ),
    ]
        .filter(isEditableTypeScript)
        .sort();
    const findings = [];
    let checked = 0;
    for (const file of paths) {
        let text;
        try {
            text = readFileSync(join(root, file), 'utf8');
        } catch (error) {
            if (error.code === 'ENOENT') continue;
            throw error;
        }
        checked += 1;
        findings.push(...inspectSource(file, text));
    }
    return { checked, findings };
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const result = inspectRepository(resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
    if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
    else {
        for (const finding of result.findings)
            console.log(`${finding.file}:${finding.line} ${finding.rule} ${finding.kind} ${finding.name}`);
        console.log(
            `Documentation: ${result.checked} editable TypeScript files; ${result.findings.length} findings (missing docs and heuristic review candidates). No baseline or suppressions applied.`
        );
    }
    process.exitCode = result.findings.length === 0 ? 0 : 1;
}
