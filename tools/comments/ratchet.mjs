/**
 * @file tools/comments/ratchet.mjs
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
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import {
    isExemptComment,
    isHouseSyncedSource,
    isInScopeCommentFile,
    normalizeRelPath,
    readIfPresent,
} from './policy.mjs';

const LEDGER_REL_PATH = 'tools/comments/ratchet.json';
const POLICY_DESCRIPTION =
    'Ban non-JSDoc inline and block comments; monotonic ratchet allows only downward reduction until zero.';

/**
 * Extract all banned inline and block comments from a parsed source, so regex and template text never count as comments.
 *
 * @since 0.0.1
 * @param {string} filename - The file's path, used for scope, script kind and the test-only exemption.
 * @param {string} text - The source text.
 * @returns {Array<object>} Each banned comment's file, kind, line range, offsets and raw text, in source order.
 * @example
 * const findings = scanBannedComments('packages/a.ts', '// note\nexport const a = 1;\n');
 */
export const scanBannedComments = (filename, text) => {
    if (isHouseSyncedSource(text)) return [];
    const relPath = normalizeRelPath(filename);
    const kind = /\.[cm]?jsx?$/.test(relPath)
        ? ts.ScriptKind.JSX
        : /\.tsx$/.test(relPath)
          ? ts.ScriptKind.TSX
          : ts.ScriptKind.TS;
    const sourceFile = ts.createSourceFile(relPath, text, ts.ScriptTarget.Latest, true, kind);
    const ranges = new Map();
    /**
     * Record comment ranges by start offset, so a comment reached from two tokens counts once.
     *
     * @param {ReadonlyArray<object> | undefined} list - Comment ranges from the TypeScript scanner.
     */
    const remember = (list) => {
        for (const range of list ?? []) ranges.set(range.pos, range);
    };
    /**
     * Collect the comments around every token, skipping JSDoc nodes, which are never banned.
     *
     * @param {object} node - One TypeScript AST node.
     */
    const visit = (node) => {
        if (node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode) return;
        const children = node.getChildren(sourceFile);
        if (children.length === 0) {
            remember(ts.getLeadingCommentRanges(text, node.getFullStart()));
            remember(ts.getTrailingCommentRanges(text, node.getEnd()));
            return;
        }
        for (const child of children) visit(child);
    };
    visit(sourceFile);
    remember(ts.getLeadingCommentRanges(text, sourceFile.endOfFileToken.getFullStart()));

    const findings = [];
    for (const range of [...ranges.values()].sort(
        /**
         * Order ranges by position in the file.
         *
         * @param {{ pos: number }} left - One comment range.
         * @param {{ pos: number }} right - Another comment range.
         * @returns {number} Their offset difference.
         */
        (left, right) => left.pos - right.pos
    )) {
        const raw = text.slice(range.pos, range.end);
        const type = range.kind === ts.SyntaxKind.SingleLineCommentTrivia ? 'Line' : 'Block';
        const value = type === 'Line' ? raw.slice(2) : raw.slice(2, -2);
        if (isExemptComment({ type, value, raw }, { filename: relPath })) continue;
        findings.push({
            file: relPath,
            type,
            line: sourceFile.getLineAndCharacterOfPosition(range.pos).line + 1,
            endLine: sourceFile.getLineAndCharacterOfPosition(range.end).line + 1,
            start: range.pos,
            end: range.end,
            raw,
        });
    }
    return findings;
};

/**
 * Remove every banned comment from a source string, dropping lines left blank and the whitespace before trailing comments.
 *
 * @since 0.0.1
 * @param {string} filename - The file's path.
 * @param {string} text - The source text.
 * @returns {{ text: string, removed: number }} The source without banned comments, and how many were removed.
 * @example
 * const { text, removed } = stripBannedComments('packages/a.ts', source);
 */
export const stripBannedComments = (filename, text) => {
    const findings = scanBannedComments(filename, text);
    let output = text;
    for (const { start, end } of findings.toReversed()) {
        const lineStart = output.lastIndexOf('\n', start - 1) + 1;
        const newline = output.indexOf('\n', end);
        const lineEnd = newline === -1 ? output.length : newline;
        const before = output.slice(lineStart, start);
        const after = output.slice(end, lineEnd);
        if (before.trim() === '' && after.trim() === '') {
            const next = newline === -1 ? lineEnd : lineEnd + 1;
            const blankAround = output.slice(lineStart - 2, lineStart) === '\n\n' && output.startsWith('\n', next);
            output = output.slice(0, lineStart) + output.slice(blankAround ? next + 1 : next);
        } else if (after.trim() === '') output = output.slice(0, lineStart) + before.trimEnd() + output.slice(lineEnd);
        else output = output.slice(0, start) + output.slice(end).replace(/^[ \t]+/, before.endsWith(' ') ? '' : ' ');
    }
    return { text: output, removed: findings.length };
};

/**
 * Validate the structure and invariants of a comment ratchet ledger object.
 *
 * @since 0.0.1
 * @param {object} ledger - The parsed ledger.
 * @returns {object} The same ledger, after checking its header, every entry and that the total matches.
 * @example
 * validateRatchetLedger(JSON.parse(readFileSync('tools/comments/ratchet.json', 'utf8')));
 */
export const validateRatchetLedger = (ledger) => {
    if (
        !ledger ||
        typeof ledger !== 'object' ||
        ledger.version !== 1 ||
        typeof ledger.policy !== 'string' ||
        typeof ledger.total !== 'number' ||
        !Number.isInteger(ledger.total) ||
        ledger.total < 0 ||
        typeof ledger.files !== 'object' ||
        ledger.files === null ||
        Array.isArray(ledger.files)
    ) {
        throw new Error('Invalid comment ratchet ledger header');
    }

    let sum = 0;
    for (const [file, count] of Object.entries(ledger.files)) {
        if (
            !isInScopeCommentFile(file) ||
            file.split('/').some(
                /**
                 * Reject traversal and empty path segments.
                 *
                 * @param {string} part - One path segment.
                 * @returns {boolean} Whether it is `.`, `..` or empty.
                 */
                (part) => ['.', '..', ''].includes(part)
            ) ||
            /[\\*?[\]]/.test(file) ||
            !Number.isInteger(count) ||
            count < 1
        ) {
            throw new Error(`Invalid comment ratchet ledger entry: ${file}`);
        }
        sum += count;
    }
    if (sum !== ledger.total) {
        throw new Error(`Comment ratchet total (${ledger.total}) does not match file sum (${sum})`);
    }
    return ledger;
};

/**
 * Build a normalized ratchet ledger from per-file comment counts.
 *
 * @since 0.0.1
 * @param {Record<string, number>} counts - Each file's banned-comment count.
 * @returns {object} A version 1 ledger listing files with comments, sorted, with their total.
 * @example
 * const ledger = buildRatchetLedger({ 'packages/a.ts': 2 });
 */
export const buildRatchetLedger = (counts) => {
    const entries = Object.entries(counts)
        .filter(
            /**
             * Keep files that still have comments.
             *
             * @param {[string, number]} entry - A file and its count.
             * @returns {boolean} Whether the count is positive.
             */
            (entry) => entry[1] > 0
        )
        .sort(
            /**
             * Order entries by file path.
             *
             * @param {[string, number]} left - One entry.
             * @param {[string, number]} right - Another entry.
             * @returns {number} The path comparison.
             */
            (left, right) => left[0].localeCompare(right[0])
        );
    const files = Object.fromEntries(entries);
    const total = entries.reduce(
        /**
         * Sum the per-file counts.
         *
         * @param {number} sum - The running total.
         * @param {[string, number]} entry - A file and its count.
         * @returns {number} The total including this file.
         */
        (sum, entry) => sum + entry[1],
        0
    );
    return {
        version: 1,
        policy: POLICY_DESCRIPTION,
        total,
        files,
    };
};

/**
 * Evaluate actual banned-comment counts against the candidate ledger and optional trusted base ledger.
 *
 * @since 0.0.1
 * @param {{ actualCounts: Record<string, number>, ledger: object, previousLedger?: object | null }} input - The measured counts, the candidate ledger and the trusted base ledger.
 * @param {Record<string, number>} input.actualCounts - Each file's measured comment count.
 * @param {object} input.ledger - The candidate ledger being checked.
 * @param {object | null} [input.previousLedger] - The ledger at the trusted base commit, if any.
 * @returns {Array<string>} One message per raised budget, over-budget file, or stale budget that should be tightened.
 * @example
 * const errors = evaluateRatchet({ actualCounts, ledger, previousLedger });
 */
export const evaluateRatchet = ({ actualCounts, ledger, previousLedger = null }) => {
    validateRatchetLedger(ledger);
    if (previousLedger) validateRatchetLedger(previousLedger);

    const errors = [];
    if (previousLedger) {
        for (const [file, budget] of Object.entries(ledger.files)) {
            const priorBudget = previousLedger.files[file] ?? 0;
            if (budget > priorBudget) {
                errors.push(
                    `Ratchet budget increased for ${file} (${priorBudget} -> ${budget}); comment budgets may only decrease.`
                );
            }
        }
    }

    const allFiles = new Set([...Object.keys(actualCounts), ...Object.keys(ledger.files)]);
    for (const file of [...allFiles].sort()) {
        const actual = actualCounts[file] ?? 0;
        const budget = ledger.files[file] ?? 0;
        if (actual > budget) {
            errors.push(
                `${file}: has ${actual} inline/block comments, exceeding ratchet budget of ${budget}. Delete comments or move decisions to docs/adr/.`
            );
        } else if (actual < budget) {
            errors.push(
                `${file}: has ${actual} inline/block comments, below stale ratchet budget of ${budget}. Tighten tools/comments/ratchet.json with: node tools/comments/ratchet.mjs --update`
            );
        }
    }

    return errors;
};

/**
 * Tighten an existing ratchet ledger downward to match lower actual counts; refuse any upward increase.
 *
 * @since 0.0.1
 * @param {Record<string, number>} actualCounts - Each file's measured comment count.
 * @param {object} priorLedger - The current ledger.
 * @returns {object} A new ledger with every budget lowered to its measured count.
 * @example
 * const next = tightenRatchetLedger(actualCounts, prior);
 */
export const tightenRatchetLedger = (actualCounts, priorLedger) => {
    validateRatchetLedger(priorLedger);
    const violations = [];
    for (const [file, actual] of Object.entries(actualCounts)) {
        const budget = priorLedger.files[file] ?? 0;
        if (actual > budget) {
            violations.push(`${file}: ${actual} exceeds current ratchet budget ${budget}`);
        }
    }
    if (violations.length > 0) {
        throw new Error(`Cannot tighten ratchet while files exceed their budget:\n  ${violations.join('\n  ')}`);
    }
    return buildRatchetLedger(actualCounts);
};

/**
 * Inspect all git-visible editable first-party files in the repository.
 *
 * @since 0.0.1
 * @param {string} root - The checkout whose tracked and untracked files Git lists.
 * @returns {{ checked: number, actualCounts: Record<string, number>, findings: Array<object> }} How many files were read, each file's count and every banned comment.
 * @example
 * const { actualCounts } = inspectRepositoryComments(process.cwd());
 */
export const inspectRepositoryComments = (root) => {
    const rawPaths = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    }).split('\0');

    const files = [...new Set(rawPaths)]
        .filter(
            /**
             * Keep in-scope source paths.
             *
             * @param {string} file - One path Git reports.
             * @returns {boolean} Whether it is a non-empty in-scope path.
             */
            (file) => file && isInScopeCommentFile(file)
        )
        .sort();
    const findings = [];
    const actualCounts = {};
    let checked = 0;

    for (const file of files) {
        const fullPath = join(root, file);
        const text = readIfPresent(fullPath);
        if (text === undefined) continue;
        checked += 1;
        const fileFindings = scanBannedComments(file, text);
        if (fileFindings.length > 0) {
            actualCounts[file] = fileFindings.length;
            findings.push(...fileFindings);
        }
    }

    return { checked, actualCounts, findings };
};

/**
 * Read the ratchet ledger at a trusted git commit if it exists there.
 *
 * @param {string} root - The repository root.
 * @param {string | undefined} baseRef - The trusted commit to read from.
 * @returns {object | null} The validated base ledger, or null when there is no base or no ledger at it.
 */
const readBaseLedger = (root, baseRef) => {
    if (!baseRef) return null;
    try {
        const raw = execFileSync('git', ['show', `${baseRef}:${LEDGER_REL_PATH}`], {
            cwd: root,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        });
        return validateRatchetLedger(JSON.parse(raw));
    } catch {
        return null;
    }
};

/**
 * Run the command-line tool: `--inventory [--json]`, `--strip <paths>`, `--bootstrap`, `--update`, or the default
 * check with an optional `--base <ref>`.
 *
 * @returns {number} The process exit code: 0 on success, 1 on a violation or missing ledger.
 */
const main = () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
    const args = process.argv.slice(2);
    const ledgerPath = join(root, LEDGER_REL_PATH);
    const { checked, actualCounts, findings } = inspectRepositoryComments(root);

    if (args.includes('--inventory')) {
        if (args.includes('--json')) {
            console.log(JSON.stringify({ checked, total: findings.length, findings }, null, 2));
        } else {
            for (const finding of findings) {
                console.log(`${finding.file}:${finding.line} ${finding.type} ${finding.raw}`);
            }
            console.log(`Comments inventory: ${checked} files checked; ${findings.length} inline/block comments.`);
        }
        return 0;
    }

    if (args.includes('--strip')) {
        const targets = args.filter(
            /**
             * Keep path arguments, not flags.
             *
             * @param {string} arg - One argument.
             * @returns {boolean} Whether it is not a flag.
             */
            (arg) => !arg.startsWith('--')
        );
        let removed = 0;
        for (const file of Object.keys(actualCounts).filter(
            /**
             * Keep files inside one of the target paths.
             *
             * @param {string} file - One file with comments.
             * @returns {boolean} Whether it is a target or lies below one.
             */
            (file) =>
                targets.some(
                    /**
                     * Match one target path.
                     *
                     * @param {string} target - A file or directory argument.
                     * @returns {boolean} Whether the file is it or inside it.
                     */
                    (target) => file === target || file.startsWith(`${target.replace(/\/$/, '')}/`)
                )
        )) {
            const fullPath = join(root, file);
            const result = stripBannedComments(file, readFileSync(fullPath, 'utf8'));
            writeFileSync(fullPath, result.text);
            removed += result.removed;
        }
        console.log(`Comments stripped: ${removed}. Run --update to tighten the ratchet.`);
        return 0;
    }

    if (args.includes('--bootstrap')) {
        const ledger = buildRatchetLedger(actualCounts);
        writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 4)}\n`);
        console.log(
            `Comment ratchet bootstrapped: ${checked} files checked; ${ledger.total} comments across ${Object.keys(ledger.files).length} files.`
        );
        return 0;
    }

    if (args.includes('--update')) {
        const priorText = readIfPresent(ledgerPath);
        if (priorText === undefined) {
            console.error(`Missing ${LEDGER_REL_PATH}; run with --bootstrap first.`);
            return 1;
        }
        const prior = JSON.parse(priorText);
        const next = tightenRatchetLedger(actualCounts, prior);
        writeFileSync(ledgerPath, `${JSON.stringify(next, null, 4)}\n`);
        console.log(
            `Comment ratchet tightened: ${prior.total} -> ${next.total} comments across ${Object.keys(next.files).length} files.`
        );
        return 0;
    }

    const ledgerText = readIfPresent(ledgerPath);
    if (ledgerText === undefined) {
        console.error(`Missing ${LEDGER_REL_PATH}.`);
        return 1;
    }
    const baseIndex = args.indexOf('--base');
    const baseRef = baseIndex !== -1 ? args[baseIndex + 1] : undefined;
    const ledger = JSON.parse(ledgerText);
    const previousLedger = readBaseLedger(root, baseRef);
    const errors = evaluateRatchet({ actualCounts, ledger, previousLedger });

    for (const error of errors) console.error(`comment-ratchet: ${error}`);
    console.log(
        `Comment ratchet: ${checked} files; ${findings.length} remaining inline/block comments; ${errors.length} violations.`
    );
    return errors.length === 0 ? 0 : 1;
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    process.exitCode = main();
}
