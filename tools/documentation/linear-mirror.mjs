/**
 * @file tools/documentation/linear-mirror.mjs
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

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const begin = '<!-- linear:generated:start -->';
const end = '<!-- linear:generated:end -->';
const issueKeys = [
    'id',
    'title',
    'status',
    'statusType',
    'labels',
    'priority',
    'project',
    'parentId',
    'updatedAt',
    'archivedAt',
    'url',
    'relations',
    'description',
    'comments',
];
const relationKeys = ['blockedBy', 'blocks', 'relatedTo', 'duplicateOf'];
const order = (a, b) => Number(a.replace('EVE-', '')) - Number(b.replace('EVE-', ''));
const lexical = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const sortedIds = (ids) => [...ids].sort(order);
const includedIssue = (id) => id !== 'EVE-10';
const digest = (ids) => createHash('sha256').update(sortedIds(ids).join('\n')).digest('hex');
const safeText = (value) =>
    String(value)
        .replace(/[\r\n]/g, ' ')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\|/g, '&#124;')
        .replace(/\[/g, '&#91;')
        .replace(/\]/g, '&#93;');
const link = (id) => `[${id}](${id}.md)`;
const ids = (values) => values.map(link).join(', ') || 'None recorded';
const id = (value) => {
    if (!/^EVE-\d+$/.test(value)) throw new Error('Invalid EVE identifier');
    return value;
};
const text = (value) => {
    if (typeof value !== 'string') throw new Error('Missing text field');
    return value;
};
const nullableText = (value) => (value === null ? null : text(value));
const publishable = (value) => {
    if (
        value !== null &&
        /\b(?:lin_api_[a-z\d]{20,}|gh[pousr]_[a-z\d]{20,}|github_pat_[a-z\d_]{20,}|sk-(?:proj-)?[a-z\d_-]{32,})\b/i.test(
            value
        )
    )
        throw new Error('Potential credential in publication input; review and explicitly redact before publishing');
    return nullableText(value);
};
const sourceProse = (value) => value.replaceAll('<!-- linear:generated:', '&lt;!-- linear:generated:');
const exactKeys = (object, keys) => {
    if (
        !object ||
        typeof object !== 'object' ||
        Array.isArray(object) ||
        Object.keys(object).some((key) => !keys.includes(key)) ||
        keys.some((key) => !(key in object))
    )
        throw new Error('Unexpected or missing snapshot fields');
};

/** Validate the owner-authorized issue mirror; unrelated raw fields and credential-shaped values fail closed. */
export const validateSnapshot = (snapshot) => {
    exactKeys(snapshot, ['version', 'team', 'capturedOn', 'enumeratedAt', 'publication', 'enumeration', 'issues']);
    nullableText(snapshot.enumeratedAt);
    if (
        snapshot.version !== 2 ||
        snapshot.team !== 'EVE' ||
        snapshot.publication !== 'descriptions-and-comments' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.capturedOn)
    )
        throw new Error('Unsupported snapshot policy');
    exactKeys(snapshot.enumeration, [
        'includeArchived',
        'firstIds',
        'independentIds',
        'firstTerminal',
        'independentTerminal',
    ]);
    const enumeration = snapshot.enumeration;
    if (
        enumeration.includeArchived !== true ||
        enumeration.firstTerminal !== true ||
        enumeration.independentTerminal !== true
    )
        throw new Error('Incomplete enumeration');
    const sets = [enumeration.firstIds, enumeration.independentIds];
    for (const values of sets) {
        values.forEach(id);
        if (new Set(values).size !== values.length || digest(values) !== digest(sets[0]))
            throw new Error('Issue count or identifier set differs between enumerations/details');
    }
    const mirrored = snapshot.issues.map((issue) => issue.id);
    if (new Set(mirrored).size !== mirrored.length || digest(mirrored) !== digest(sets[0].filter(includedIssue)))
        throw new Error('Issue count or identifier set differs between enumerations/details');
    for (const issue of snapshot.issues) {
        exactKeys(issue, issueKeys);
        id(issue.id);
        for (const key of ['title', 'status', 'statusType', 'updatedAt', 'url']) text(issue[key]);
        if (
            !/^https:\/\/linear\.app\/resnovas\/issue\/EVE-\d+(?:\/[^\s]*)?$/.test(issue.url) ||
            (!issue.url.includes(`/issue/${issue.id}/`) && !issue.url.endsWith(`/issue/${issue.id}`))
        )
            throw new Error('Unsafe or mismatched source URL');
        issue.labels.forEach(text);
        nullableText(issue.project);
        nullableText(issue.archivedAt);
        if (issue.parentId !== null) id(issue.parentId);
        exactKeys(issue.priority, ['value', 'name']);
        if (!Number.isInteger(issue.priority.value) || issue.priority.value < 0 || issue.priority.value > 4)
            throw new Error('Invalid priority');
        text(issue.priority.name);
        publishable(issue.description);
        const commentIds = new Set();
        for (const comment of issue.comments) {
            exactKeys(comment, [
                'id',
                'body',
                'author',
                'onBehalfOf',
                'createdAt',
                'updatedAt',
                'parentId',
                'quotedText',
                'resolvedAt',
                'attachments',
            ]);
            for (const key of ['id', 'createdAt', 'updatedAt']) text(comment[key]);
            for (const key of ['author', 'onBehalfOf', 'parentId', 'resolvedAt']) nullableText(comment[key]);
            publishable(comment.body);
            publishable(comment.quotedText);
            comment.attachments.forEach(text);
            if (commentIds.has(comment.id)) throw new Error('Duplicate comment identifier');
            commentIds.add(comment.id);
        }
        exactKeys(issue.relations, relationKeys);
        for (const key of relationKeys) {
            const values =
                key === 'duplicateOf'
                    ? issue.relations[key] === null
                        ? []
                        : [issue.relations[key]]
                    : issue.relations[key];
            values.forEach(id);
        }
    }
    return snapshot;
};

/** Strip private fields at acquisition, and cross-check independently paginated accessible issue sets. */
export const normalizeAcquisition = (records, capturedOn) => {
    const enumeration = records.filter((record) => record.kind === 'issue-enumeration').at(-1);
    const pages =
        enumeration?.pages ?? records.filter((record) => record.kind === 'issue-page').map((record) => record.page);
    const originalDetails = records.flatMap((record) =>
        record.kind === 'detail-batch' ? record.items : record.kind === 'issue-detail' ? [record] : []
    );
    const detailMap = new Map(originalDetails.map((record) => [record.issue.id, record]));
    if (detailMap.size !== originalDetails.length)
        throw new Error('Duplicate acquired detail; use an explicit issue-refresh record');
    for (const record of records.filter((record) => record.kind === 'issue-refresh'))
        detailMap.set(record.issue.id, record);
    const details = [...detailMap.values()];
    const independent = records.filter((record) => record.kind === 'independent-count').at(-1);
    if (
        !independent ||
        independent.terminal !== true ||
        independent.includeArchived !== true ||
        independent.count !== independent.ids.length ||
        !pages.length ||
        pages.slice(0, -1).some((page) => page.hasNextPage !== true || !page.cursor) ||
        pages.at(-1).hasNextPage !== false
    )
        throw new Error('Missing terminal enumeration evidence');
    const commentPages = records.flatMap((record) =>
        record.kind === 'comment-batch' ? record.items : record.kind === 'comment-page' ? [record] : []
    );
    const issues = details
        .filter(({ issue }) => includedIssue(issue.id))
        .map(({ issue }) => ({
            ...Object.fromEntries(
                issueKeys.filter((key) => !['relations', 'comments'].includes(key)).map((key) => [key, issue[key]])
            ),
            labels: [...issue.labels].sort(),
            comments: (() => {
                const refresh = records
                    .filter((record) => record.kind === 'issue-refresh' && record.issue.id === issue.id)
                    .at(-1);
                const pages =
                    refresh?.commentPages ??
                    commentPages.filter((record) => record.issueId === issue.id).map((record) => record.page);
                if (
                    !pages.length ||
                    pages.at(-1).hasNextPage !== false ||
                    pages.slice(0, -1).some((page) => page.hasNextPage !== true || !page.cursor)
                )
                    throw new Error(`Incomplete comment pagination: ${issue.id}`);
                return pages
                    .flatMap((page) => page.comments)
                    .map((comment) => ({
                        id: comment.id,
                        body: comment.body,
                        author: comment.author?.name ?? null,
                        onBehalfOf: comment.onBehalfOf?.name ?? null,
                        createdAt: comment.createdAt,
                        updatedAt: comment.updatedAt,
                        parentId: comment.parentId,
                        quotedText: comment.quotedText,
                        resolvedAt: comment.resolvedAt,
                        attachments: comment.attachments.map((attachment) => attachment.title ?? 'Untitled attachment'),
                    }))
                    .sort((a, b) => lexical(a.createdAt, b.createdAt) || lexical(a.id, b.id));
            })(),
            relations: Object.fromEntries(
                relationKeys.map((key) => [
                    key,
                    key === 'duplicateOf'
                        ? (issue.relations[key]?.id ?? null)
                        : sortedIds(issue.relations[key].map((item) => item.id)),
                ])
            ),
        }))
        .sort((a, b) => order(a.id, b.id));
    return validateSnapshot({
        version: 2,
        team: 'EVE',
        capturedOn,
        enumeratedAt: enumeration?.acquiredAt ?? null,
        publication: 'descriptions-and-comments',
        enumeration: {
            includeArchived: true,
            firstIds: sortedIds(pages.flatMap((page) => page.issues.map((issue) => issue.id))),
            independentIds: sortedIds(independent.ids),
            firstTerminal: true,
            independentTerminal: true,
        },
        issues,
    });
};

/** Replace one generated region only; malformed markers fail closed rather than overwriting human context. */
export const mergeGenerated = (
    current,
    generated,
    initialContext = '## Repository context (human-maintained)\n\nAdd implementation notes here, with source links. This section never grants owner approval.\n'
) => {
    const block = `${begin}\n${generated.trim()}\n${end}`;
    if (current === null) return `${block}\n\n${initialContext}`;
    if (
        current.split(begin).length !== 2 ||
        current.split(end).length !== 2 ||
        current.indexOf(begin) > current.indexOf(end)
    )
        throw new Error('Malformed generated markers; human context preserved');
    return current.slice(0, current.indexOf(begin)) + block + current.slice(current.indexOf(end) + end.length);
};

/** Render all accessible issues deterministically without inferring approvals or extracting prose decisions. */
export const renderSnapshot = (input) => {
    const snapshot = validateSnapshot(input);
    const issues = [...snapshot.issues].sort((a, b) => order(a.id, b.id));
    const files = new Map();
    const omissions =
        `Enumerated visible EVE set: ${snapshot.enumeration.firstIds.length}; mirrored: ${issues.length}. Enumeration timestamp: ${snapshot.enumeratedAt ?? 'not recorded by acquisition adapter'}. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.\n\n` +
        'Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.';
    for (const issue of issues) {
        const children = issues.filter((child) => child.parentId === issue.id).map((child) => child.id);
        const discussion = issue.comments
            .map(
                (comment) =>
                    `### Comment ${comment.id}\n\nAuthor: ${comment.author === null ? 'Unavailable' : safeText(comment.author)}${comment.onBehalfOf === null ? '' : `; on behalf of ${safeText(comment.onBehalfOf)}`}. Created: ${safeText(comment.createdAt)}; updated: ${safeText(comment.updatedAt)}. [Live discussion source](${issue.url}) (comment ID above). Parent: ${comment.parentId === null ? 'None' : safeText(comment.parentId)}. Resolved: ${comment.resolvedAt === null ? 'Not recorded' : safeText(comment.resolvedAt)}.\n\n${comment.quotedText === null ? '' : `Quoted description text:\n\n${sourceProse(comment.quotedText)}\n\n`}${sourceProse(comment.body ?? '')}\n\n${comment.attachments.length ? `Attachment bodies omitted; titles: ${comment.attachments.map(safeText).join(', ')}.\n` : ''}`
            )
            .join('\n');
        files.set(
            `${issue.id}.md`,
            `# ${issue.id}: ${safeText(issue.title)}\n\n[Live Linear source](${issue.url}) | [Issue index](README.md) | [Maintained timeline](../timeline.md)\n\nSnapshot: ${snapshot.capturedOn}; Linear updated: ${safeText(issue.updatedAt)}. Generated source mirror; edit Linear and refresh, not this region.\n\n| Field | Value |\n| --- | --- |\n| Status | ${safeText(issue.status)} (${safeText(issue.statusType)}) |\n| Priority | ${issue.priority.value}: ${safeText(issue.priority.name)} |\n| Labels | ${issue.labels.map(safeText).join(', ') || 'None recorded'} |\n| Project | ${issue.project === null ? 'None recorded' : safeText(issue.project)} |\n| Archived | ${issue.archivedAt === null ? 'No' : safeText(issue.archivedAt)} |\n| Parent | ${issue.parentId === null ? 'None recorded' : link(issue.parentId)} |\n| Children | ${ids(children)} |\n| Blocked by | ${ids(issue.relations.blockedBy)} |\n| Blocks | ${ids(issue.relations.blocks)} |\n| Related to | ${ids(issue.relations.relatedTo)} |\n| Duplicate of | ${issue.relations.duplicateOf === null ? 'None recorded' : link(issue.relations.duplicateOf)} |\n\n## Publication omissions and authority\n\n${omissions}\n\n## Linear description\n\n${issue.description === null ? 'No description returned (null).' : sourceProse(issue.description)}\n\n## Linear comments (${issue.comments.length})\n\n${discussion || 'No comments returned after complete pagination.'}\n`
        );
    }
    const groups = Object.groupBy(issues, (issue) => issue.project ?? 'No project');
    const statuses = Object.entries(Object.groupBy(issues, (issue) => issue.status)).sort(([a], [b]) => lexical(a, b));
    const roadmap = ['flowchart LR'];
    for (const [phase, label, types] of [
        ['completed', 'Completed', ['completed']],
        ['current', 'Current', ['started']],
        ['upcoming', 'Upcoming', ['backlog', 'unstarted', 'triage']],
        ['other', 'Other recorded states', ['canceled', 'duplicate']],
    ]) {
        roadmap.push(`    subgraph ${phase}[${label}]`);
        for (const issue of issues.filter((item) => types.includes(item.statusType)))
            roadmap.push(`        E${issue.id.slice(4)}["${issue.id}"]`);
        roadmap.push('    end');
    }
    for (const issue of issues)
        for (const blocked of issue.relations.blocks)
            roadmap.push(`    E${issue.id.slice(4)} --> E${blocked.slice(4)}`);
    for (const issue of issues)
        roadmap.push(`    click E${issue.id.slice(4)} "https://linear.app/resnovas/issue/${issue.id}"`);
    files.set(
        'README.md',
        `# EVE issue mirror\n\n[Planning authority and refresh rules](../README.md) | [Human-maintained timeline and Mermaid roadmap](../timeline.md)\n\nGenerated from the owner-authorized normalized snapshot in \`tools/documentation/linear-snapshot.json\`. Linear is the live issue/status source. Repository Markdown is a durable implementation mirror, not independent approval.\n\n## Completeness\n\nCaptured ${snapshot.capturedOn}. ${issues.length} unique EVE issues including archived items, ${files.size} per-issue pages, ${issues.reduce((sum, issue) => sum + issue.comments.length, 0)} comments. Full pagination (250/page, creation order) and an independent enumeration (100/page, update order) reached terminal pages and returned identical ID sets. SHA-256 of numerically ordered IDs: \`${digest(issues.map((issue) => issue.id))}\`. This proves completeness for the connected key's visible EVE set, not administrator-only/deleted issues the service cannot expose.\n\nMetadata/relations unavailable: none in this snapshot. Descriptions and comments are mirrored under Jonathan's explicit publication instruction on 2026-11-17. There is no independent server total endpoint in the connected MCP schema; two full enumerations provide the count cross-check. Live changes during acquisition can require a retry; this is not an atomic Linear snapshot.\n\n${omissions}\n\n## Delivery status\n\n${statuses.map(([status, values]) => `- ${safeText(status)}: ${values.length}`).join('\n')}\n\nDone means Linear's recorded state, not renewed release approval. In Progress/started issues are current; Backlog/unstarted issues are upcoming; canceled/duplicate records remain visible rather than being silently dropped.\n\n${Object.entries(
            groups
        )
            .sort(([a], [b]) => lexical(a, b))
            .map(
                ([project, values]) =>
                    `## ${safeText(project)}\n\n| Issue | Title | Status | Priority | Blocked by |\n| --- | --- | --- | --- | --- |\n${values.map((issue) => `| ${link(issue.id)} | ${safeText(issue.title)} | ${safeText(issue.status)} | ${issue.priority.value} | ${ids(issue.relations.blockedBy)} |`).join('\n')}`
            )
            .join(
                '\n\n'
            )}\n\n## Complete recorded dependency roadmap\n\nAll ${issues.length} issues are grouped by Linear state type; arrows are recorded \`blocks\` relations only, never inferred approvals or new sequencing decisions. The tables above and each issue's relations provide the text equivalent. The curated platform sequence remains in the human-maintained timeline.\n\n<details>\n<summary>Expand the full Mermaid dependency graph</summary>\n\n\`\`\`mermaid\n${roadmap.join('\n')}\n\`\`\`\n\n</details>\n`
    );
    return files;
};

/** Audit or update generated regions, retaining all human-authored context and refusing stale issue deletion. */
export const synchronize = (root, snapshot, check = false) => {
    const directory = join(root, 'docs/planning/issues');
    const rendered = renderSnapshot(snapshot);
    if (!check) mkdirSync(directory, { recursive: true });
    if (existsSync(directory))
        for (const file of readdirSync(directory)) {
            if (/^EVE-\d+\.md$/.test(file) && !rendered.has(file))
                throw new Error(`Stale issue ${file}: review removal without deleting human context`);
        }
    const stale = [];
    for (const [file, content] of rendered) {
        const path = join(directory, file);
        const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
        const next = mergeGenerated(current, content);
        if (next === current) continue;
        stale.push(file);
        if (!check) writeFileSync(path, next);
    }
    return stale;
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
    const path = join(root, 'tools/documentation/linear-snapshot.json');
    const importAt = process.argv.indexOf('--import');
    if (importAt !== -1) {
        const source = readFileSync(resolve(process.argv[importAt + 1]), 'utf8')
            .trim()
            .split('\n')
            .map(JSON.parse);
        const snapshot = normalizeAcquisition(source, process.argv[importAt + 2]);
        writeFileSync(path, `${JSON.stringify(snapshot, null, 2)}\n`);
    }
    const snapshot = JSON.parse(readFileSync(path, 'utf8'));
    const check = process.argv.includes('--check');
    const stale = synchronize(root, snapshot, check);
    console.log(
        `Linear mirror: ${snapshot.issues.length} issues; ${snapshot.issues.reduce((sum, issue) => sum + issue.comments.length, 0)} comments; ${stale.length} ${check ? 'stale' : 'updated'} pages.`
    );
    process.exitCode = check && stale.length ? 1 : 0;
}
