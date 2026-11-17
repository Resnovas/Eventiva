/**
 * @file tools/documentation/ratchet.mjs
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
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectRepository, inspectSource, isEditableTypeScript } from './check.mjs';

const ledgerPath = 'tools/documentation/debt.json';
const rules = ['missing-jsdoc', 'review-jsdoc', 'review-internal-rationale'];
// Rationale is a semantic review queue, not a calibrated automatic failure predicate.
const blocking = (entry) => entry.rule !== 'review-internal-rationale';
const entryKeys = ['id', 'file', 'line', 'kind', 'name', 'rule'];
const count = (entries, file) => entries.filter((entry) => entry.file === file && blocking(entry)).length;
const identity = (entry) => JSON.stringify([entry.id, entry.file, entry.kind, entry.name, entry.rule]);
const backlogPath = 'docs/planning/documentation-backlog.md';
const begin = '<!-- documentation:inventory:start -->';
const end = '<!-- documentation:inventory:end -->';

/** Render the complete per-file inventory; mechanical absence stays distinct from heuristic review work. */
export const renderInventory = (ledger) => {
    const entries = validateLedger(ledger).entries;
    const files = [...new Set(entries.map((entry) => entry.file))].sort();
    const batch = (file) =>
        file.startsWith('packages/contracts/') || file.startsWith('packages/schema/')
            ? 'D01'
            : file.startsWith('packages/runtime/')
              ? 'D02'
              : file.startsWith('packages/integrations/')
                ? 'D03'
                : file.startsWith('apps/')
                  ? 'D04'
                  : file.startsWith('tests/')
                    ? 'D05'
                    : 'D06';
    return `${begin}\n## Exact current inventory (generated)\n\n${entries.length} remaining findings across ${files.length} files: ${entries.filter((entry) => entry.rule === 'missing-jsdoc').length} mechanically missing JSDoc; ${entries.filter((entry) => entry.rule === 'review-jsdoc').length} prose-review candidates; ${entries.filter((entry) => entry.rule === 'review-internal-rationale').length} internal-rationale review candidates. Review candidates are not asserted semantic policy violations. Exact declaration identities and source locations are in [debt.json](../../tools/documentation/debt.json).\n\n| Batch | File | Missing JSDoc | Prose review | Rationale review |\n| --- | --- | --- | --- | --- |\n${files.map((file) => `| ${batch(file)} | [${file}](../../${file}) | ${rules.map((rule) => entries.filter((entry) => entry.file === file && entry.rule === rule).length).join(' | ')} |`).join('\n')}\n${end}`;
};

/** Regenerate only the bounded inventory; retain the human-maintained remediation plan around it. */
const inventoryDocument = (root, ledger) => {
    const current = readFileSync(join(root, backlogPath), 'utf8');
    if (
        current.split(begin).length !== 2 ||
        current.split(end).length !== 2 ||
        current.indexOf(begin) > current.indexOf(end)
    )
        throw new Error('Malformed documentation backlog markers');
    return {
        current,
        next:
            current.slice(0, current.indexOf(begin)) +
            renderInventory(ledger) +
            current.slice(current.indexOf(end) + end.length),
    };
};

/** Exact entries only: no patterns, parse-error exemptions, duplicate identities or unrecognized fields. */
export const validateLedger = (ledger) => {
    if (
        !ledger ||
        Object.keys(ledger).sort().join() !== ['version', 'initialBase', 'authority', 'entries'].sort().join() ||
        ledger.version !== 1 ||
        !/^[a-f0-9]{40}$/.test(ledger.initialBase) ||
        ledger.authority !==
            'Jonathan, 2026-11-17: reviewed documentation debt ratchet; tracked under EVE-13/EVE-261' ||
        !Array.isArray(ledger.entries)
    )
        throw new Error('Invalid documentation debt ledger header');
    const seen = new Set();
    for (const entry of ledger.entries) {
        if (
            Object.keys(entry).sort().join() !== [...entryKeys].sort().join() ||
            !/^[a-f0-9]{64}:\d+$/.test(entry.id) ||
            !isEditableTypeScript(entry.file) ||
            entry.file.split('/').some((part) => ['.', '..', ''].includes(part)) ||
            /[\\*?[\]]/.test(entry.file) ||
            !Number.isInteger(entry.line) ||
            entry.line < 1 ||
            !rules.includes(entry.rule) ||
            typeof entry.kind !== 'string' ||
            typeof entry.name !== 'string' ||
            seen.has(entry.id)
        )
            throw new Error('Invalid, duplicate or wildcard documentation debt entry');
        seen.add(entry.id);
    }
    return ledger;
};

/** Compare candidate debt to trusted history and current findings; never authorize an added finding. */
export const evaluate = ({
    findings,
    ledger,
    previousFindings,
    previousLedger = null,
    touched = [],
    added = new Map(),
}) => {
    validateLedger(ledger);
    if (previousLedger) {
        validateLedger(previousLedger);
        if (ledger.initialBase !== previousLedger.initialBase || ledger.authority !== previousLedger.authority)
            throw new Error('Documentation ledger provenance cannot be rewritten');
    }
    const allowed = new Map((previousLedger?.entries ?? previousFindings).map((entry) => [entry.id, identity(entry)]));
    const actual = new Map(findings.map((entry) => [entry.id, identity(entry)]));
    const recorded = new Map(ledger.entries.map((entry) => [entry.id, identity(entry)]));
    const errors = [];
    for (const entry of ledger.entries) {
        if (allowed.get(entry.id) !== identity(entry))
            errors.push(`Debt addition or mutation: ${entry.file}:${entry.line} ${entry.rule}`);
        if (actual.get(entry.id) !== identity(entry))
            errors.push(`Resolved/stale debt must be removed: ${entry.file}:${entry.line} ${entry.rule}`);
    }
    for (const finding of findings) {
        if (!blocking(finding)) continue;
        if (finding.rule === 'parse-error' || recorded.get(finding.id) !== identity(finding))
            errors.push(`New or changed undocumented syntax: ${finding.file}:${finding.line} ${finding.rule}`);
        // A copied identical callback cannot reuse an old fingerprint on an added source line.
        if ((added.get(finding.file) ?? []).some(([start, end]) => finding.line >= start && finding.line <= end))
            errors.push(`Changed source must comply immediately: ${finding.file}:${finding.line} ${finding.rule}`);
    }
    for (const file of touched) {
        const before = count(previousFindings, file);
        const after = count(findings, file);
        if (before > 0 && after >= before)
            errors.push(`Touched file must reduce debt: ${file} (${before} -> ${after})`);
    }
    return errors;
};

/** Parse only added-line ranges, keeping filenames separate so spaces and Git quoting cannot hide edits. */
export const addedRanges = (diff) =>
    [...diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)]
        .filter((match) => match[2] !== '0')
        .map((match) => [Number(match[1]), Number(match[1]) + Number(match[2] ?? 1) - 1]);

/** Load an explicit trusted commit, its original source inventory and original ledger, never candidate-edited baselines. */
export const history = (root, input) => {
    if (input !== 'HEAD' && !/^[a-f0-9]{40}$/.test(input ?? ''))
        throw new Error('Pass --base HEAD locally or a full trusted commit SHA from the CI event');
    const git = (args) =>
        execFileSync('git', args, {
            cwd: root,
            encoding: 'utf8',
            maxBuffer: 32 * 1024 * 1024,
            stdio: ['ignore', 'pipe', 'pipe'],
        });
    const base = git(['rev-parse', '--verify', `${input}^{commit}`]).trim();
    git(['merge-base', '--is-ancestor', base, 'HEAD']);
    const paths = git(['ls-tree', '-rz', '--name-only', base]).split('\0');
    const previousFindings = [];
    const legacyPairs = new Map();
    const canonicalPairs = new Map();
    const fingerprintChanges = [];
    for (const file of paths.filter(isEditableTypeScript)) {
        // Both identities come from the exact same trusted bytes and declaration order, never candidate source.
        const text = git(['show', `${base}:${file}`]);
        const canonical = inspectSource(file, text);
        const legacy = inspectSource(file, text, { internalLegacyFingerprint: true });
        if (canonical.length !== legacy.length) throw new Error('Fingerprint reconciliation changed finding count');
        for (const [index, current] of canonical.entries()) {
            const previous = legacy[index];
            const metadata = (entry) =>
                JSON.stringify(entryKeys.filter((key) => key !== 'id').map((key) => entry[key]));
            if (metadata(current) !== metadata(previous))
                throw new Error('Fingerprint reconciliation changed finding metadata or order');
            if (!current.id && !previous.id) continue;
            if (!current.id || !previous.id || legacyPairs.has(previous.id) || canonicalPairs.has(current.id))
                throw new Error('Ambiguous fingerprint reconciliation');
            legacyPairs.set(previous.id, current);
            canonicalPairs.set(current.id, current);
            if (previous.id !== current.id) fingerprintChanges.push({ previous, current });
        }
        previousFindings.push(...canonical);
    }
    for (const [id, current] of legacyPairs) {
        if (canonicalPairs.has(id) && canonicalPairs.get(id).id !== current.id)
            throw new Error('Overlapping legacy and canonical fingerprint identities');
    }
    // Keep the mapping private to this trusted history; callers cannot supply a map or broaden accepted debt.
    const normalizeLedger = (ledger) => {
        validateLedger(ledger);
        const entries = ledger.entries.map((entry) => {
            const current = legacyPairs.get(entry.id) ?? canonicalPairs.get(entry.id);
            if (!current) return entry;
            if (identity({ ...entry, id: current.id }) !== identity(current))
                throw new Error('Fingerprint reconciliation cannot reassign declaration metadata');
            return { ...entry, id: current.id };
        });
        return validateLedger({ ...ledger, entries });
    };
    const previousLedger = paths.includes(ledgerPath)
        ? normalizeLedger(JSON.parse(git(['show', `${base}:${ledgerPath}`])))
        : null;
    const touched = [
        ...new Set([
            ...git(['diff', '--name-only', '-z', base, '--']).split('\0'),
            ...git(['ls-files', '--others', '--exclude-standard', '-z']).split('\0'),
        ]),
    ].filter(isEditableTypeScript);
    const added = new Map(
        touched.map((file) => [file, addedRanges(git(['diff', '--no-ext-diff', '--unified=0', base, '--', file]))])
    );
    return { base, previousFindings, previousLedger, touched, added, normalizeLedger, fingerprintChanges };
};

/** Prune resolved entries only; bootstrap may record only exact findings that already exist at the trusted source base. */
export const refreshLedger = (current, prior, base) => {
    const ids = new Set(current.map((entry) => entry.id));
    return {
        version: 1,
        initialBase: prior?.initialBase ?? base,
        authority: 'Jonathan, 2026-11-17: reviewed documentation debt ratchet; tracked under EVE-13/EVE-261',
        entries: (prior?.entries ?? current)
            .filter((entry) => ids.has(entry.id))
            .map((entry) =>
                Object.fromEntries(
                    entryKeys.map((key) => [
                        key,
                        key === 'line' ? current.find((candidate) => candidate.id === entry.id).line : entry[key],
                    ])
                )
            ),
    };
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
    const baseAt = process.argv.indexOf('--base');
    const trusted = history(
        root,
        process.env.DOCUMENTATION_BASE ?? (baseAt === -1 ? undefined : process.argv[baseAt + 1])
    );
    const result = inspectRepository(root);
    const path = join(root, ledgerPath);
    const prior = existsSync(path) ? trusted.normalizeLedger(JSON.parse(readFileSync(path, 'utf8'))) : null;
    if (!prior && trusted.previousLedger) throw new Error('The accepted debt ledger cannot be deleted or reset');
    const update = process.argv.includes('--update-ledger');
    if (!prior && !update)
        throw new Error('Debt ledger missing; bootstrap is explicit and restricted to existing trusted-base findings');
    const ledger = update ? refreshLedger(result.findings, prior, trusted.base) : prior;
    const errors = evaluate({ findings: result.findings, ledger, ...trusted });
    const backlog = inventoryDocument(root, ledger);
    if (!update && backlog.current !== backlog.next)
        errors.push('Documentation backlog inventory is stale; prune/re-render with --update-ledger');
    if (errors.length === 0 && update) {
        writeFileSync(path, `${JSON.stringify(ledger, null, 2)}\n`);
        writeFileSync(join(root, backlogPath), backlog.next);
    }
    for (const error of errors) console.error(error);
    console.log(
        `Documentation ratchet: ${result.checked} files; ${result.findings.filter(blocking).length} blocking findings; ${result.findings.filter((entry) => !blocking(entry)).length} rationale review-only candidates; ${errors.length} violations; trusted base ${trusted.base}.`
    );
    process.exitCode = errors.length ? 1 : 0;
}
