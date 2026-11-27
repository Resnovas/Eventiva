/**
 * @file tools/function-telemetry/structure.mjs
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

import ts from 'typescript';

/**
 * Inventory executable source bodies without granting coverage from syntax or a wrapper's name.
 * This initial stage deliberately reports every function as blocked until emitted instrumentation is proved.
 * Identities are offline source coordinates, never production telemetry attribute values.
 *
 * @since 0.0.1
 * @param {string} source - The source text to parse.
 * @param {string} [file] - The repository path the source belongs to; it selects TSX parsing and owns top-level identities.
 * @returns {{ file: string, functions: Array<object>, diagnostics: Array<string>, capacityExceeded: boolean }} Every executable body with its identity and optimization record, the parse diagnostics, and whether the file exceeds the 8,192-function capacity.
 * @example
 * const { functions } = inspectStructure('export const run = () => 1;', 'src/run.ts');
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#s1-implementation-evidence
 */
export function inspectStructure(source, file = 'source.ts') {
    const parsed = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        /\.[jt]sx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
    const functions = [];
    const ordinals = new Map();

    /**
     * Preserve nested callable ownership while counting anonymous, pure and internal bodies equally.
     *
     * @param {import('typescript').Node} node - The AST node to inspect.
     * @param {string} [owner] - The identity of the enclosing callable or container; the file at the top level.
     * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#s1-implementation-evidence
     */
    function visit(node, owner = file) {
        let nextOwner = owner;
        if (ts.isClassLike(node) || ts.isObjectLiteralExpression(node) || ts.isModuleDeclaration(node)) {
            const name =
                node.name?.getText(parsed) ??
                (ts.isVariableDeclaration(node.parent) || ts.isPropertyAssignment(node.parent)
                    ? node.parent.name.getText(parsed)
                    : '<anonymous>');
            const key = `${owner}/${ts.SyntaxKind[node.kind]}:${name}`;
            const ordinal = (ordinals.get(key) ?? 0) + 1;
            ordinals.set(key, ordinal);
            nextOwner = `${key}#${ordinal}`;
        }
        if (ts.isFunctionLike(node) && node.body) {
            const name =
                node.name?.getText(parsed) ??
                (ts.isVariableDeclaration(node.parent) ? node.parent.name.getText(parsed) : '<anonymous>');
            const kind = ts.SyntaxKind[node.kind];
            const key = `${owner}/${kind}:${name}`;
            const ordinal = (ordinals.get(key) ?? 0) + 1;
            ordinals.set(key, ordinal);
            const id = `${key}#${ordinal}`;
            const docs = ts.getJSDocCommentsAndTags(node);
            const optimization = [];
            const documentation = [];
            for (const doc of docs) documentation.push(doc.getText(parsed));
            for (const tag of ts.getJSDocTags(node)) {
                if (tag.tagName.text === 'agent-optimization') {
                    optimization.push(typeof tag.comment === 'string' ? tag.comment.trim() : '');
                }
            }
            functions.push({
                id,
                identityGroup: key,
                name,
                kind,
                line: parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line + 1,
                text: node.getText(parsed),
                documentation: documentation.join('\n'),
                optimization,
                status: 'blocked',
                reason: 'No emitted instrumentation proof. Apply the shared generator/target adapter; do not suppress this occurrence.',
            });
            nextOwner = id;
        }
        ts.forEachChild(
            node,
            /**
             * Visit only original AST children; declarations without bodies do not invent executions.
             *
             * @param {import('typescript').Node} child - One direct AST child of the visited node.
             * @returns {void} Nothing; identities are recorded in the enclosing inventory.
             * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#s1-implementation-evidence
             */
            (child) => visit(child, nextOwner)
        );
    }
    visit(parsed);
    const diagnostics = [];
    for (const diagnostic of parsed.parseDiagnostics) {
        diagnostics.push(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
    return { file, functions, diagnostics, capacityExceeded: functions.length > 8192 };
}

/**
 * Check one precise optimization-evidence line, not the truth or quality of an optimization claim.
 * Reject impossible dates, duplicated tags, multiline text and traversal/absolute report references.
 *
 * @param {Array<string>} lines - The texts of every optimization tag on one body.
 * @returns {boolean} Whether there is exactly one well-formed record with a real date and a safe relative evidence path.
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#s1-implementation-evidence
 */
function validOptimization(lines) {
    if (lines.length !== 1) return false;
    const match =
        /^reviewed=(\d{4}-\d{2}-\d{2}); result=(best-found|candidate-rejected|candidate-adopted); evidence=([a-zA-Z0-9_./#-]+)$/.exec(
            lines[0]
        );
    if (!match) return false;
    const date = new Date(`${match[1]}T00:00:00Z`);
    if (!Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== match[1]) return false;
    const reference = match[3];
    return !reference.startsWith('/') && !reference.split('/').includes('..') && /\.(md|json)(#|$)/.test(reference);
}

/**
 * Require an attached optimization record for added/changed bodies or documentation, including nested helpers.
 * Syntax/identity uncertainty blocks the comparison. Unchanged source creates no migration baseline.
 * This in-memory proof does not replace trusted Git-base acquisition, emitted coverage or report review.
 *
 * @since 0.0.1
 * @param {string} before - The trusted base version of the file.
 * @param {string} after - The candidate version of the file.
 * @param {string} [file] - The repository path both versions belong to.
 * @returns {Array<object>} One finding per added or changed body without a valid record, or a single parse-blocked finding.
 * @example
 * const findings = inspectOptimizationChange(baseText, candidateText, 'src/run.ts');
 * @agent-optimization reviewed=2026-11-20; result=best-found; evidence=docs/architecture/function-telemetry.md#s1-implementation-evidence
 */
export function inspectOptimizationChange(before, after, file = 'source.ts') {
    const previous = inspectStructure(before, file);
    const current = inspectStructure(after, file);
    const findings = [];
    if (previous.diagnostics.length || current.diagnostics.length) {
        return [
            {
                file,
                rule: 'parse-blocked',
                message: 'Resolve source parse errors before asserting changed-function coverage.',
            },
        ];
    }
    const byIdentity = new Map();
    const previousGroups = new Map();
    const currentGroups = new Map();
    for (const entry of previous.functions) {
        byIdentity.set(entry.id, entry);
        previousGroups.set(entry.identityGroup, (previousGroups.get(entry.identityGroup) ?? 0) + 1);
    }
    for (const entry of current.functions) {
        currentGroups.set(entry.identityGroup, (currentGroups.get(entry.identityGroup) ?? 0) + 1);
    }
    for (const entry of current.functions) {
        const prior = byIdentity.get(entry.id);
        const sameMultiplicity = previousGroups.get(entry.identityGroup) === currentGroups.get(entry.identityGroup);
        if (prior && sameMultiplicity && prior.text === entry.text && prior.documentation === entry.documentation)
            continue;
        if (!validOptimization(entry.optimization)) {
            findings.push({
                file,
                line: entry.line,
                name: entry.name,
                rule: 'optimization-record',
                message:
                    'Add one attached @agent-optimization reviewed=YYYY-MM-DD; result=best-found|candidate-rejected|candidate-adopted; evidence=<relative .md/.json report>. Benchmark any candidate against the current version before commit; do not invent evidence.',
            });
        }
    }
    return findings;
}
