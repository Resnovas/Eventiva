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

/** Extract all banned inline and block comments from a parsed source, so regex and template text never count as comments. */
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
    const remember = (list) => {
        for (const range of list ?? []) ranges.set(range.pos, range);
    };
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
    for (const range of [...ranges.values()].sort((left, right) => left.pos - right.pos)) {
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

/** Remove every banned comment from a source string, dropping lines left blank and the whitespace before trailing comments. */
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

/** Validate the structure and invariants of a comment ratchet ledger object. */
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
            file.split('/').some((part) => ['.', '..', ''].includes(part)) ||
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

/** Build a normalized ratchet ledger from per-file comment counts. */
export const buildRatchetLedger = (counts) => {
    const entries = Object.entries(counts)
        .filter(([, count]) => count > 0)
        .sort(([left], [right]) => left.localeCompare(right));
    const files = Object.fromEntries(entries);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    return {
        version: 1,
        policy: POLICY_DESCRIPTION,
        total,
        files,
    };
};

/** Evaluate actual banned-comment counts against the candidate ledger and optional trusted base ledger. */
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

/** Tighten an existing ratchet ledger downward to match lower actual counts; refuse any upward increase. */
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

/** Inspect all git-visible editable first-party files in the repository. */
export const inspectRepositoryComments = (root) => {
    const rawPaths = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    }).split('\0');

    const files = [...new Set(rawPaths)].filter((file) => file && isInScopeCommentFile(file)).sort();
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

/** Read the ratchet ledger at a trusted git commit if it exists there. */
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
        const targets = args.filter((arg) => !arg.startsWith('--'));
        let removed = 0;
        for (const file of Object.keys(actualCounts).filter((file) =>
            targets.some((target) => file === target || file.startsWith(`${target.replace(/\/$/, '')}/`))
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
