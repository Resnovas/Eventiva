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
/**
 * Decide whether a finding blocks the gate; internal-rationale candidates are review-only.
 *
 * @param {{ rule: string }} entry - One finding or ledger entry.
 * @returns {boolean} Whether the entry counts as blocking debt.
 */
const blocking = (entry) => entry.rule !== 'review-internal-rationale';
const entryKeys = ['id', 'file', 'line', 'kind', 'name', 'rule'];
/**
 * Count the blocking entries recorded against one file.
 *
 * @param {{ file: string, rule: string }[]} entries - Findings or ledger entries.
 * @param {string} file - The repository-relative file to count.
 * @returns {number} How many blocking entries belong to that file.
 */
const count = (entries, file) =>
    entries.filter(
        /**
         * Keep blocking entries for the requested file.
         *
         * @param {{ file: string, rule: string }} entry - One finding or ledger entry.
         * @returns {boolean} Whether the entry is blocking and belongs to the file.
         */
        (entry) => entry.file === file && blocking(entry)
    ).length;
/**
 * Serialize the fields that identify a declaration's debt, ignoring its current line.
 *
 * @param {{ id: string, file: string, kind: string, name: string, rule: string }} entry - One finding or ledger entry.
 * @returns {string} A JSON key that two entries share only when they describe the same debt.
 */
const identity = (entry) => JSON.stringify([entry.id, entry.file, entry.kind, entry.name, entry.rule]);
const backlogPath = 'docs/planning/documentation-backlog.md';
const begin = '<!-- documentation:inventory:start -->';
const end = '<!-- documentation:inventory:end -->';

/**
 * Render the complete per-file inventory; mechanical absence stays distinct from heuristic review work.
 *
 * @param {{ entries: { file: string, rule: string }[] }} ledger - A valid documentation debt ledger.
 * @returns {string} The generated inventory section, including its start and end markers.
 * @since 0.0.1
 * @example
 * const section = renderInventory(JSON.parse(readFileSync('tools/documentation/debt.json', 'utf8')));
 */
export const renderInventory = (ledger) => {
    const entries = validateLedger(ledger).entries;
    const files = [
        ...new Set(
            entries.map(
                /**
                 * Read the file an entry belongs to.
                 *
                 * @param {{ file: string }} entry - One ledger entry.
                 * @returns {string} Its repository-relative file.
                 */
                (entry) => entry.file
            )
        ),
    ].sort();
    /**
     * Assign a file to its remediation batch by top-level location.
     *
     * @param {string} file - A repository-relative file.
     * @returns {string} The batch label, from `D01` to `D06`.
     */
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
    /**
     * Count every ledger entry recorded under one rule.
     *
     * @param {string} rule - A ledger rule name.
     * @returns {number} How many entries carry that rule.
     */
    const ruleTotal = (rule) =>
        entries.filter(
            /**
             * Keep entries recorded under the requested rule.
             *
             * @param {{ rule: string }} entry - One ledger entry.
             * @returns {boolean} Whether the entry carries the rule.
             */
            (entry) => entry.rule === rule
        ).length;
    /**
     * Count the ledger entries recorded against one file under one rule.
     *
     * @param {string} file - A repository-relative file.
     * @param {string} rule - A ledger rule name.
     * @returns {number} How many entries match both.
     */
    const tally = (file, rule) =>
        entries.filter(
            /**
             * Keep entries for the requested file and rule.
             *
             * @param {{ file: string, rule: string }} entry - One ledger entry.
             * @returns {boolean} Whether the entry matches both.
             */
            (entry) => entry.file === file && entry.rule === rule
        ).length;
    /**
     * Render one file's per-rule counts as table cells.
     *
     * @param {string} file - A repository-relative file.
     * @returns {string} The counts in rule order, separated by table pipes.
     */
    const counts = (file) =>
        rules
            .map(
                /**
                 * Count one rule's entries for the file.
                 *
                 * @param {string} rule - A ledger rule name.
                 * @returns {number} How many entries the file has under it.
                 */
                (rule) => tally(file, rule)
            )
            .join(' | ');
    /**
     * Render one inventory table row.
     *
     * @param {string} file - A repository-relative file.
     * @returns {string} The Markdown row with batch, linked file and per-rule counts.
     */
    const row = (file) => `| ${batch(file)} | [${file}](../../${file}) | ${counts(file)} |`;
    return `${begin}\n## Exact current inventory (generated)\n\n${entries.length} remaining findings across ${files.length} files: ${ruleTotal('missing-jsdoc')} mechanically missing JSDoc; ${ruleTotal('review-jsdoc')} prose-review candidates; ${ruleTotal('review-internal-rationale')} internal-rationale review candidates. Review candidates are not asserted semantic policy violations. Exact declaration identities and source locations are in [debt.json](../../tools/documentation/debt.json).\n\n| Batch | File | Missing JSDoc | Prose review | Rationale review |\n| --- | --- | --- | --- | --- |\n${files.map(row).join('\n')}\n${end}`;
};

/**
 * Regenerate only the bounded inventory; retain the human-maintained remediation plan around it.
 * Malformed or misordered inventory markers raise an error instead of guessing where the section is.
 *
 * @param {string} root - The repository root.
 * @param {{ entries: object[] }} ledger - The documentation debt ledger to render.
 * @returns {{ current: string, next: string }} The backlog document as committed and as it should read.
 */
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

/**
 * Exact entries only: no patterns, parse-error exemptions, duplicate identities or unrecognized fields.
 * An invalid header or entry raises an error.
 *
 * @param {{ version: number, initialBase: string, authority: string, entries: object[] }} ledger - A parsed debt ledger.
 * @returns {{ version: number, initialBase: string, authority: string, entries: object[] }} The same ledger, once validated.
 * @since 0.0.1
 * @example
 * const ledger = validateLedger(JSON.parse(readFileSync('tools/documentation/debt.json', 'utf8')));
 */
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
            entry.file.split('/').some(
                /**
                 * Reject empty, current-directory and parent-directory path segments.
                 *
                 * @param {string} part - One segment of the entry's file path.
                 * @returns {boolean} Whether the segment is not a plain name.
                 */
                (part) => ['.', '..', ''].includes(part)
            ) ||
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

/**
 * Compare candidate debt to trusted history and current findings; never authorize an added finding.
 * Invalid ledgers, or a candidate ledger that rewrites the trusted provenance, raise an error.
 *
 * @param {object} options - The candidate state and the trusted history to judge it against.
 * @param {object[]} options.findings - Current findings from the documentation checker.
 * @param {{ initialBase: string, authority: string, entries: object[] }} options.ledger - The candidate debt ledger.
 * @param {object[]} options.previousFindings - Findings at the trusted base commit.
 * @param {{ initialBase: string, authority: string, entries: object[] } | null} [options.previousLedger] - The ledger at the trusted base, or null when none existed; defaults to null.
 * @param {string[]} [options.touched] - Files changed since the trusted base; defaults to none.
 * @param {Map<string, [number, number][]>} [options.added] - Added line ranges per changed file; defaults to an empty map.
 * @returns {string[]} One message per ratchet violation; empty when the candidate passes.
 * @since 0.0.1
 * @example
 * const errors = evaluate({ findings, ledger, previousFindings, previousLedger, touched, added });
 */
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
    const allowed = new Map(
        (previousLedger?.entries ?? previousFindings).map(
            /**
             * Key a trusted entry by its fingerprint.
             *
             * @param {{ id: string }} entry - One trusted ledger entry or base finding.
             * @returns {[string, string]} The fingerprint and the entry's debt identity.
             */
            (entry) => [entry.id, identity(entry)]
        )
    );
    const actual = new Map(
        findings.map(
            /**
             * Key a current finding by its fingerprint.
             *
             * @param {{ id: string }} entry - One current finding.
             * @returns {[string, string]} The fingerprint and the finding's debt identity.
             */
            (entry) => [entry.id, identity(entry)]
        )
    );
    const recorded = new Map(
        ledger.entries.map(
            /**
             * Key a candidate ledger entry by its fingerprint.
             *
             * @param {{ id: string }} entry - One candidate ledger entry.
             * @returns {[string, string]} The fingerprint and the entry's debt identity.
             */
            (entry) => [entry.id, identity(entry)]
        )
    );
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
        if (
            (added.get(finding.file) ?? []).some(
                /**
                 * Detect whether the finding sits inside an added line range.
                 *
                 * @param {[number, number]} range - The first and last added line, inclusive.
                 * @returns {boolean} Whether the finding's line falls within the range.
                 */
                (range) => finding.line >= range[0] && finding.line <= range[1]
            )
        )
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

/**
 * Parse only added-line ranges, keeping filenames separate so spaces and Git quoting cannot hide edits.
 *
 * @param {string} diff - A single-file `git diff --unified=0` output.
 * @returns {[number, number][]} The first and last line of each added hunk, inclusive.
 * @since 0.0.1
 * @example
 * addedRanges('@@ -1,0 +2,3 @@\n+a\n+b\n+c\n'); // [[2, 4]]
 */
export const addedRanges = (diff) =>
    [...diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)]
        .filter(
            /**
             * Drop hunks that add no lines.
             *
             * @param {RegExpMatchArray} match - One hunk header match.
             * @returns {boolean} Whether the hunk adds at least one line.
             */
            (match) => match[2] !== '0'
        )
        .map(
            /**
             * Convert a hunk header into its added line range.
             *
             * @param {RegExpMatchArray} match - One hunk header match.
             * @returns {[number, number]} The first and last added line, inclusive.
             */
            (match) => [Number(match[1]), Number(match[1]) + Number(match[2] ?? 1) - 1]
        );

/**
 * Load an explicit trusted commit, its original source inventory and original ledger, never candidate-edited baselines.
 * An untrusted base, a non-ancestor base or an ambiguous fingerprint reconciliation raises an error.
 *
 * @param {string} root - The repository root.
 * @param {string | undefined} input - `HEAD` locally, or a full trusted commit SHA from the CI event.
 * @returns {{ base: string, previousFindings: object[], previousLedger: object | null, touched: string[], added: Map<string, [number, number][]>, normalizeLedger: (ledger: object) => object, fingerprintChanges: { previous: object, current: object }[] }} The trusted base state and a ledger normalizer for it.
 * @since 0.0.1
 * @example
 * const trusted = history(process.cwd(), 'HEAD');
 */
export const history = (root, input) => {
    if (input !== 'HEAD' && !/^[a-f0-9]{40}$/.test(input ?? ''))
        throw new Error('Pass --base HEAD locally or a full trusted commit SHA from the CI event');
    /**
     * Run one read-only Git command in the repository.
     *
     * @param {string[]} args - The Git arguments.
     * @returns {string} The command's standard output.
     */
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
        const text = git(['show', `${base}:${file}`]);
        const canonical = inspectSource(file, text);
        const legacy = inspectSource(file, text, { internalLegacyFingerprint: true });
        if (canonical.length !== legacy.length) throw new Error('Fingerprint reconciliation changed finding count');
        for (const [index, current] of canonical.entries()) {
            const previous = legacy[index];
            /**
             * Serialize every entry field except the fingerprint.
             *
             * @param {object} entry - One finding.
             * @returns {string} A JSON key for the finding's metadata.
             */
            const metadata = (entry) =>
                JSON.stringify(
                    entryKeys
                        .filter(
                            /**
                             * Leave out the fingerprint field.
                             *
                             * @param {string} key - One entry field name.
                             * @returns {boolean} Whether the field is not `id`.
                             */
                            (key) => key !== 'id'
                        )
                        .map(
                            /**
                             * Read one field from the finding.
                             *
                             * @param {string} key - One entry field name.
                             * @returns {unknown} The finding's value for that field.
                             */
                            (key) => entry[key]
                        )
                );
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
    /**
     * Rewrite legacy fingerprints in a ledger to their canonical form without changing any other field.
     * A rewrite that would reassign declaration metadata raises an error.
     *
     * @param {{ entries: { id: string }[] }} ledger - A parsed debt ledger.
     * @returns {{ entries: { id: string }[] }} A validated ledger with canonical fingerprints.
     */
    const normalizeLedger = (ledger) => {
        validateLedger(ledger);
        const entries = ledger.entries.map(
            /**
             * Replace one entry's fingerprint with its canonical counterpart, when one exists.
             *
             * @param {{ id: string }} entry - One ledger entry.
             * @returns {{ id: string }} The entry with its canonical fingerprint.
             */
            (entry) => {
                const current = legacyPairs.get(entry.id) ?? canonicalPairs.get(entry.id);
                if (!current) return entry;
                if (identity({ ...entry, id: current.id }) !== identity(current))
                    throw new Error('Fingerprint reconciliation cannot reassign declaration metadata');
                return { ...entry, id: current.id };
            }
        );
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
        touched.map(
            /**
             * Pair a changed file with the line ranges it adds since the base.
             *
             * @param {string} file - A changed repository-relative file.
             * @returns {[string, [number, number][]]} The file and its added line ranges.
             */
            (file) => [file, addedRanges(git(['diff', '--no-ext-diff', '--unified=0', base, '--', file]))]
        )
    );
    return { base, previousFindings, previousLedger, touched, added, normalizeLedger, fingerprintChanges };
};

/**
 * Prune resolved entries only; bootstrap may record only exact findings that already exist at the trusted source base.
 *
 * @param {object[]} current - Current findings from the documentation checker.
 * @param {{ initialBase: string, entries: object[] } | null} prior - The existing ledger, or null when bootstrapping.
 * @param {string} base - The trusted base commit SHA, used as `initialBase` when bootstrapping.
 * @returns {{ version: number, initialBase: string, authority: string, entries: object[] }} The refreshed ledger, with current line numbers.
 * @since 0.0.1
 * @example
 * const ledger = refreshLedger(inspectRepository(root).findings, prior, trusted.base);
 */
export const refreshLedger = (current, prior, base) => {
    const ids = new Set(
        current.map(
            /**
             * Read a current finding's fingerprint.
             *
             * @param {{ id: string }} entry - One current finding.
             * @returns {string} Its fingerprint.
             */
            (entry) => entry.id
        )
    );
    return {
        version: 1,
        initialBase: prior?.initialBase ?? base,
        authority: 'Jonathan, 2026-11-17: reviewed documentation debt ratchet; tracked under EVE-13/EVE-261',
        entries: (prior?.entries ?? current)
            .filter(
                /**
                 * Keep entries that are still current findings.
                 *
                 * @param {{ id: string }} entry - One ledger entry or finding.
                 * @returns {boolean} Whether the finding still exists.
                 */
                (entry) => ids.has(entry.id)
            )
            .map(
                /**
                 * Copy an entry's ledger fields, taking the line from the current finding.
                 *
                 * @param {{ id: string }} entry - One surviving ledger entry or finding.
                 * @returns {object} The entry with exactly the ledger fields.
                 */
                (entry) =>
                    Object.fromEntries(
                        entryKeys.map(
                            /**
                             * Read one ledger field, using the current finding's line number.
                             *
                             * @param {string} key - One ledger field name.
                             * @returns {[string, unknown]} The field name and its value.
                             */
                            (key) => [
                                key,
                                key === 'line'
                                    ? current.find(
                                          /**
                                           * Find the current finding with the same fingerprint.
                                           *
                                           * @param {{ id: string }} candidate - One current finding.
                                           * @returns {boolean} Whether it matches the entry.
                                           */
                                          (candidate) => candidate.id === entry.id
                                      ).line
                                    : entry[key],
                            ]
                        )
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
    const reviewOnly = result.findings.filter(
        /**
         * Keep findings that are review-only rather than blocking.
         *
         * @param {{ rule: string }} entry - One current finding.
         * @returns {boolean} Whether the finding is not blocking.
         */
        (entry) => !blocking(entry)
    ).length;
    console.log(
        `Documentation ratchet: ${result.checked} files; ${result.findings.filter(blocking).length} blocking findings; ${reviewOnly} rationale review-only candidates; ${errors.length} violations; trusted base ${trusted.base}.`
    );
    process.exitCode = errors.length ? 1 : 0;
}
