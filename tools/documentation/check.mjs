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

/** Exclude only upstream/history and reproducible output, never editable tests or declarations. */
export const isEditableTypeScript = (path) =>
    /\.(?:[cm]?ts|tsx)$/.test(path) &&
    !/^(?:Examples|examples|externals|graphify-out|\.amp)\//.test(path) &&
    !/^\.(?:claude\/(?:skills|commands)|cursor\/commands)\//.test(path) &&
    !/(?:^|\/)(?:node_modules|dist|out-tsc|coverage|test-output|test-results|playwright-report|\.nx|\.expo)(?:\/|$)/.test(
        path
    );

/** Reject placeholders and name-only paraphrases; semantic accuracy still requires human review. */
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
        (word) => !names.has(word) && !['the', 'a', 'an', 'function', 'method', 'class', 'interface'].includes(word)
    );
    // A short accurate contract can be useful. Word-count padding is not documentation quality.
    return words.length >= 2 && informative.length >= 1 && new Set(words).size >= 2;
};

/** Include executable and type-level callable syntax, including anonymous callbacks and accessors. */
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

/** A binding's doc describes its direct initializer, not arbitrary callbacks nested inside it. */
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

/** Select only the adjacent contract, allowing the required vendor-boundary marker between it and its owner. */
const documentationRange = (node, source, text) => {
    const owner = documentationOwner(node);
    const ranges = [
        ...(ts.getLeadingCommentRanges(text, owner.pos) ?? []),
        ...(ts.getTrailingCommentRanges(text, owner.pos) ?? []),
    ].sort((a, b) => a.pos - b.pos);
    const last = ranges.findLast((range) => !/^\/\/\s*effect-boundary:/.test(text.slice(range.pos, range.end)));
    return last &&
        text.slice(last.pos, last.end).startsWith('/**') &&
        text
            .slice(last.end, owner.getStart(source))
            .replace(/\/\/\s*effect-boundary:[^\r\n]*/g, '')
            .trim() === ''
        ? last
        : undefined;
};

/** Recognize value selection syntax, not purity: explicit execution, callbacks and writes still require review. */
const valueOnly = (node) => {
    if (
        ts.isCallExpression(node) ||
        ts.isNewExpression(node) ||
        ts.isTaggedTemplateExpression(node) ||
        ts.isYieldExpression(node) ||
        ts.isAwaitExpression(node) ||
        ts.isDeleteExpression(node) ||
        ts.isPostfixUnaryExpression(node) ||
        needsDocumentation(node) ||
        (ts.isPrefixUnaryExpression(node) &&
            [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(node.operator)) ||
        (ts.isBinaryExpression(node) &&
            node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
            node.operatorToken.kind <= ts.SyntaxKind.LastAssignment)
    )
        return false;
    return !ts.forEachChild(node, (child) => !valueOnly(child));
};

/** Branches returning only values have no separate execution phase to narrate; retain callable contract checks. */
const valueSelector = (node) => {
    if (ts.isBlock(node)) return node.statements.every(valueSelector);
    if (ts.isReturnStatement(node)) return !node.expression || valueOnly(node.expression);
    if (ts.isIfStatement(node))
        return (
            valueOnly(node.expression) &&
            valueSelector(node.thenStatement) &&
            (!node.elseStatement || valueSelector(node.elseStatement))
        );
    if (ts.isSwitchStatement(node))
        return (
            valueOnly(node.expression) &&
            node.caseBlock.clauses.every(
                (clause) =>
                    (!clause.expression || valueOnly(clause.expression)) && clause.statements.every(valueSelector)
            )
        );
    if (ts.isVariableStatement(node))
        return (
            (node.declarationList.flags & ts.NodeFlags.Const) !== 0 &&
            node.declarationList.declarations.every(
                // Binding defaults and computed keys can execute even when the source is only a value.
                (declaration) =>
                    valueOnly(declaration.name) && declaration.initializer && valueOnly(declaration.initializer)
            )
        );
    return false;
};

/** Recognize bounded test declarations/assertions, never arbitrary work hidden in their inputs or callbacks. */
const testScaffolding = (source) => {
    const imports = source.statements.flatMap((statement) => {
        if (
            !ts.isImportDeclaration(statement) ||
            !ts.isStringLiteral(statement.moduleSpecifier) ||
            !['vitest', '@effect/vitest'].includes(statement.moduleSpecifier.text) ||
            statement.importClause?.isTypeOnly ||
            !statement.importClause?.namedBindings ||
            !ts.isNamedImports(statement.importClause.namedBindings)
        )
            return [];
        return statement.importClause.namedBindings.elements
            .filter((binding) => !binding.isTypeOnly)
            .map((binding) => ({
                binding,
                name: (binding.propertyName ?? binding.name).text,
                module: statement.moduleSpecifier.text,
            }));
    });
    if (imports.length === 0) return () => false;
    // Resolve lexical identity in this source only; external declarations cannot supply documentation or aliases.
    const program = ts.createProgram(
        [source.fileName],
        { noLib: true, noResolve: true },
        {
            getSourceFile: (file) => (file === source.fileName ? source : undefined),
            getDefaultLibFileName: () => '',
            writeFile: () => undefined,
            getCurrentDirectory: () => '',
            getDirectories: () => [],
            fileExists: (file) => file === source.fileName,
            readFile: () => undefined,
            getCanonicalFileName: (file) => file,
            useCaseSensitiveFileNames: () => true,
            getNewLine: () => '\n',
        }
    );
    const checker = program.getTypeChecker();
    const bindings = new Map(imports.map((entry) => [checker.getSymbolAtLocation(entry.binding.name), entry]));
    const escaped = new Set();
    const imported = (node) => {
        if (!ts.isIdentifier(node)) return undefined;
        const symbol = checker.getSymbolAtLocation(node);
        const entry = bindings.get(symbol);
        return symbol &&
            !escaped.has(symbol) &&
            symbol.declarations?.length === 1 &&
            symbol.declarations[0] === entry?.binding
            ? entry
            : undefined;
    };
    const argument = (node) => !ts.isSpreadElement(node) && valueOnly(node);
    const registration = (node) => {
        if (
            !ts.isCallExpression(node) ||
            node.questionDotToken ||
            node.arguments.length < 2 ||
            node.arguments.length > 3
        )
            return false;
        let callee = node.expression;
        let method;
        if (ts.isPropertyAccessExpression(callee) && !callee.questionDotToken) {
            method = callee.name.text;
            callee = callee.expression;
        }
        const entry = imported(callee);
        const callback = node.arguments[1];
        return (
            entry &&
            ['describe', 'it', 'test'].includes(entry.name) &&
            (!method ||
                (entry.module === '@effect/vitest' &&
                    entry.name === 'it' &&
                    ['effect', 'scoped', 'live', 'scopedLive'].includes(method))) &&
            argument(node.arguments[0]) &&
            (!node.arguments[2] || argument(node.arguments[2])) &&
            (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) &&
            callback.parameters.every(valueOnly)
        );
    };
    const matchers = new Map([
        ['toBe', [1, 1]],
        ['toEqual', [1, 1]],
        ['toStrictEqual', [1, 1]],
        ['toBeDefined', [0, 0]],
        ['toBeUndefined', [0, 0]],
        ['toBeNull', [0, 0]],
        ['toBeTruthy', [0, 0]],
        ['toBeFalsy', [0, 0]],
        ['toContain', [1, 1]],
        ['toHaveLength', [1, 1]],
        ['toHaveProperty', [1, 2]],
        ['toMatchObject', [1, 1]],
        ['toMatch', [1, 1]],
        ['toBeInstanceOf', [1, 1]],
        ['toBeTypeOf', [1, 1]],
    ]);
    const typeMatchers = new Set(['toEqualTypeOf', 'toMatchTypeOf', 'toExtend', 'toBeAny', 'toBeUnknown', 'toBeNever']);
    const assertion = (node) => {
        if (
            !ts.isCallExpression(node) ||
            node.questionDotToken ||
            !ts.isPropertyAccessExpression(node.expression) ||
            node.expression.questionDotToken
        )
            return false;
        const matcher = node.expression.name.text;
        let receiver = node.expression.expression;
        if (ts.isPropertyAccessExpression(receiver) && !receiver.questionDotToken && receiver.name.text === 'not')
            receiver = receiver.expression;
        if (!ts.isCallExpression(receiver) || receiver.questionDotToken) return false;
        const entry = imported(receiver.expression);
        if (!entry || !receiver.arguments.every(argument) || !node.arguments.every(argument)) return false;
        if (entry.name === 'expectTypeOf')
            return receiver.arguments.length <= 1 && node.arguments.length === 0 && typeMatchers.has(matcher);
        const arity = matchers.get(matcher);
        return (
            entry.name === 'expect' &&
            receiver.arguments.length >= 1 &&
            receiver.arguments.length <= 2 &&
            arity &&
            node.arguments.length >= arity[0] &&
            node.arguments.length <= arity[1]
        );
    };
    const references = (node) => {
        if (ts.isImportDeclaration(node)) return;
        if (ts.isIdentifier(node)) {
            const symbol = ts.isShorthandPropertyAssignment(node.parent)
                ? checker.getShorthandAssignmentValueSymbol(node.parent)
                : ts.isExportSpecifier(node.parent)
                  ? checker.getExportSpecifierLocalTargetSymbol(node.parent)
                  : checker.getSymbolAtLocation(node);
            if (bindings.has(symbol)) {
                // An alias, argument, write or unknown member can replace the DSL indirectly; reject the entire binding.
                let operation = node;
                while (
                    (ts.isPropertyAccessExpression(operation.parent) || ts.isCallExpression(operation.parent)) &&
                    operation.parent.expression === operation
                )
                    operation = operation.parent;
                if (!registration(operation) && !assertion(operation)) escaped.add(symbol);
            }
        }
        ts.forEachChild(node, references);
    };
    references(source);
    const statements = (node, operation) => {
        if (ts.isBlock(node)) return node.statements.every((statement) => statements(statement, operation));
        if (ts.isVariableStatement(node)) return valueSelector(node);
        return ts.isExpressionStatement(node) && operation(node.expression);
    };
    // Callback bodies are independently visited by inspectSource; a suite never lends its exemption to a scenario.
    return (body) => statements(body, registration) || statements(body, assertion);
};

/** Inspect the same declarations in both modes; the internal legacy option exists only for trusted-history reconciliation. */
export const inspectSource = (file, text, { internalLegacyFingerprint = false } = {}) => {
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    const findings = [];
    const comments = new Map();
    const declarations = [];
    const rememberComments = (position, trailing = false) => {
        for (const range of (trailing
            ? ts.getTrailingCommentRanges(text, position)
            : ts.getLeadingCommentRanges(text, position)) ?? []) {
            comments.set(range.pos, range);
        }
    };
    const collect = (node) => {
        rememberComments(node.pos);
        rememberComments(node.pos, true);
        rememberComments(node.end, true);
        if (needsDocumentation(node)) declarations.push(node);
        ts.forEachChild(node, collect);
    };
    collect(source);
    const contracts = new Map(declarations.map((node) => [node, documentationRange(node, source, text)]));
    const contractComments = new Set([...contracts.values()].filter(Boolean).map((range) => range.pos));
    const scaffolding = testScaffolding(source);
    const occurrences = new Map();
    const report = (node, rule, name) => {
        // Token identity survives line shifts and added prose, but never a changed implementation.
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
            const collectTokens = (child) => {
                // Parser context distinguishes template tails, regular expressions and JSX from punctuation.
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
        // Attachment calibration must not rename pre-existing callable-type debt identities.
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
        // A callable's contract cannot double as rationale for an enclosing implementation.
        const attached = contracts.get(node);
        const doc = attached ? text.slice(attached.pos + 3, attached.end - 2) : '';
        if (!doc || /@file\b/.test(doc)) report(node, 'missing-jsdoc', name);
        else if (!usefulDescription(doc, name)) report(node, 'review-jsdoc', name);

        if (!node.body || !ts.isBlock(node.body)) continue;
        const body = node.body;
        if (valueSelector(body) || scaffolding(body)) continue;
        // A one-guard body is not evidence of a meaningful phase boundary.
        if (body.statements.length === 1 && ts.isIfStatement(body.statements[0]) && !body.statements[0].elseStatement) {
            const branch = body.statements[0].thenStatement;
            if (
                ts.isReturnStatement(branch) ||
                (ts.isBlock(branch) && branch.statements.length === 1 && ts.isReturnStatement(branch.statements[0]))
            )
                continue;
        }
        // Control flow and separate calls remain review candidates, not semantic proof of missing rationale.
        let complex = false;
        let calls = 0;
        const assess = (child) => {
            if (child !== body && needsDocumentation(child)) return;
            if (ts.isCallExpression(child) || ts.isNewExpression(child)) calls += 1;
            if (
                ts.isIfStatement(child) ||
                ts.isIterationStatement(child, false) ||
                ts.isSwitchStatement(child) ||
                ts.isTryStatement(child)
            )
                complex = true;
            ts.forEachChild(child, assess);
        };
        assess(body);
        if (!complex && !(body.statements.length > 1 && calls > 1)) continue;
        const nested = declarations.filter(
            (child) => child !== node && child.pos >= body.pos && child.end <= body.end && child.body
        );
        const internal = [...comments.values()].some((range) => {
            const prose = text
                .slice(range.pos + (text.slice(range.pos, range.pos + 3) === '/**' ? 3 : 2), range.end)
                .replace(/\*\/$/, '')
                .replace(/^\s*\*\s?/gm, '')
                .trim();
            return (
                range.pos > body.getStart(source) &&
                range.end < body.end &&
                !contractComments.has(range.pos) &&
                !/@file\b/.test(prose) &&
                !nested.some((child) => range.pos >= child.pos && range.end <= child.end) &&
                !/^(?:set|assign|return|call|increment|decrement|create|get|read|write|run)\s+(?:the\s+)?\w+[.!]?\s*$/i.test(
                    prose
                ) &&
                usefulDescription(prose)
            );
        });
        if (!internal) report(node, 'review-internal-rationale', name);
    }
    return findings;
};

/** Enumerate Git-visible source, including new files, without traversing ignored builds or upstream trees. */
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
