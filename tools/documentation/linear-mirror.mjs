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
/**
 * Compare EVE identifiers by issue number, so `EVE-9` sorts before `EVE-10`.
 *
 * @param {string} a - The first identifier, such as `EVE-9`.
 * @param {string} b - The second identifier.
 * @returns {number} A negative number when `a` has the lower issue number, positive when `b` does.
 */
const order = (a, b) => Number(a.replace('EVE-', '')) - Number(b.replace('EVE-', ''));
/**
 * Compare strings by code unit, independent of locale.
 *
 * @param {string} a - The first string.
 * @param {string} b - The second string.
 * @returns {number} Minus one, one or zero as `a` sorts before, after or equal to `b`.
 */
const lexical = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
/**
 * Copy identifiers into numeric issue order without mutating the input.
 *
 * @param {string[]} ids - EVE identifiers in any order.
 * @returns {string[]} A new array sorted by issue number.
 */
const sortedIds = (ids) => [...ids].sort(order);
/**
 * Exclude EVE-10, which belongs to a different repository, from the mirror.
 *
 * @param {string} id - An EVE identifier.
 * @returns {boolean} Whether the issue is mirrored here.
 */
const includedIssue = (id) => id !== 'EVE-10';
/**
 * Fingerprint an identifier set independent of its order.
 *
 * @param {string[]} ids - EVE identifiers in any order.
 * @returns {string} The hex SHA-256 of the numerically sorted identifiers joined by newlines.
 */
const digest = (ids) => createHash('sha256').update(sortedIds(ids).join('\n')).digest('hex');
/**
 * Make a value safe for one Markdown table cell or line: no newlines, HTML, pipes or link brackets.
 *
 * @param {unknown} value - Any value; it is converted with `String`.
 * @returns {string} The single-line text with `&`, `<`, `>`, `|`, `[` and `]` escaped as entities.
 */
const safeText = (value) =>
    String(value)
        .replace(/[\r\n]/g, ' ')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\|/g, '&#124;')
        .replace(/\[/g, '&#91;')
        .replace(/\]/g, '&#93;');
/**
 * Link an issue to its mirrored page in the same directory.
 *
 * @param {string} id - An EVE identifier.
 * @returns {string} A Markdown link such as `[EVE-13](EVE-13.md)`.
 */
/**
 * Read an issue's identifier.
 *
 * @param {{ id: string }} issue - One mirrored issue.
 * @returns {string} Its identifier.
 */
const issueId = (issue) => issue.id;
/**
 * Add an issue's comment count to a running total.
 *
 * @param {number} sum - The comments counted so far.
 * @param {{ comments: object[] }} issue - One mirrored issue.
 * @returns {number} The total including this issue's comments.
 */
const addComments = (sum, issue) => sum + issue.comments.length;
/**
 * Order `[key, value]` entries by key, independent of locale.
 *
 * @param {[string, unknown]} left - The first entry.
 * @param {[string, unknown]} right - The second entry.
 * @returns {number} The key comparison result.
 */
const byEntryKey = (left, right) => lexical(left[0], right[0]);
/**
 * Render one issue identifier as a link to its mirrored page.
 *
 * @param {string} id - An EVE identifier, such as `EVE-9`.
 * @returns {string} A Markdown link to the issue's page.
 */
const link = (id) => `[${id}](${id}.md)`;
/**
 * Render a list of issues as comma-separated page links.
 *
 * @param {string[]} values - EVE identifiers.
 * @returns {string} The joined links, or `None recorded` for an empty list.
 */
const ids = (values) => values.map(link).join(', ') || 'None recorded';
/**
 * Require a well-formed EVE identifier; any other value throws.
 *
 * @param {unknown} value - The value to validate.
 * @returns {string} The value unchanged.
 */
const id = (value) => {
    if (!/^EVE-\d+$/.test(value)) throw new Error('Invalid EVE identifier');
    return value;
};
/**
 * Require a string field; any other value throws.
 *
 * @param {unknown} value - The value to validate.
 * @returns {string} The value unchanged.
 */
const text = (value) => {
    if (typeof value !== 'string') throw new Error('Missing text field');
    return value;
};
/**
 * Require a string field that may be null; any other value throws.
 *
 * @param {unknown} value - The value to validate.
 * @returns {string | null} The value unchanged.
 */
const nullableText = (value) => (value === null ? null : text(value));
/**
 * Refuse text that looks like a Linear, GitHub or OpenAI credential before it can be published.
 *
 * @param {unknown} value - A description, comment body or quote, or null.
 * @returns {string | null} The value unchanged when it is safe to publish; otherwise it throws.
 */
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
/**
 * Escape the reserved generation markers so verbatim Linear prose cannot open or close a generated region.
 *
 * @param {string} value - Source prose from Linear.
 * @returns {string} The prose with every `<!-- linear:generated:` opener HTML-escaped.
 */
const sourceProse = (value) => value.replaceAll('<!-- linear:generated:', '&lt;!-- linear:generated:');
/**
 * Require a plain object with exactly the given keys; extra or missing fields throw.
 *
 * @param {unknown} object - The value to check.
 * @param {string[]} keys - Every key the object must have and the only keys it may have.
 */
const exactKeys = (object, keys) => {
    if (
        !object ||
        typeof object !== 'object' ||
        Array.isArray(object) ||
        Object.keys(object).some(
            /**
             * Detect a field outside the allowed set.
             *
             * @param {string} key - One key of the object.
             * @returns {boolean} Whether the key is not allowed.
             */
            (key) => !keys.includes(key)
        ) ||
        keys.some(
            /**
             * Detect a required field the object lacks.
             *
             * @param {string} key - One required key.
             * @returns {boolean} Whether the object is missing it.
             */
            (key) => !(key in object)
        )
    )
        throw new Error('Unexpected or missing snapshot fields');
};

/**
 * Validate the owner-authorized issue mirror; unrelated raw fields and credential-shaped values fail closed.
 *
 * Throws on an unsupported policy, incomplete or mismatched enumeration, unexpected fields, unsafe URLs or credential-shaped text.
 *
 * @since 0.0.1
 * @param {object} snapshot - A parsed `linear-snapshot.json` value.
 * @returns {object} The same snapshot, once every check passes.
 * @example
 * const snapshot = validateSnapshot(JSON.parse(readFileSync('tools/documentation/linear-snapshot.json', 'utf8')));
 */
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
    const mirrored = snapshot.issues.map(
        /**
         * Read a mirrored issue's identifier.
         *
         * @param {{ id: string }} issue - One mirrored issue.
         * @returns {string} Its identifier.
         */
        (issue) => issue.id
    );
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

/**
 * Strip private fields at acquisition, and cross-check independently paginated accessible issue sets.
 *
 * Throws on duplicate details, missing terminal enumeration evidence or incomplete comment pagination.
 *
 * @since 0.0.1
 * @param {object[]} records - Acquisition records: issue pages, the enumeration, the independent count, details, refreshes and comment pages.
 * @param {string} capturedOn - The capture date, `YYYY-MM-DD`.
 * @returns {object} The validated, deterministically ordered snapshot.
 * @example
 * const snapshot = normalizeAcquisition(records, '2026-11-21');
 */
export const normalizeAcquisition = (records, capturedOn) => {
    const enumeration = records
        .filter(
            /**
             * Keep issue-enumeration records.
             *
             * @param {{ kind: string }} record - One acquisition record.
             * @returns {boolean} Whether it is an `issue-enumeration` record.
             */
            (record) => record.kind === 'issue-enumeration'
        )
        .at(-1);
    const pages =
        enumeration?.pages ??
        records
            .filter(
                /**
                 * Keep issue-page records.
                 *
                 * @param {{ kind: string }} record - One acquisition record.
                 * @returns {boolean} Whether it is an `issue-page` record.
                 */
                (record) => record.kind === 'issue-page'
            )
            .map(
                /**
                 * Extract an issue-page record's page.
                 *
                 * @param {{ page: object }} record - One `issue-page` record.
                 * @returns {object} Its page.
                 */
                (record) => record.page
            );
    const originalDetails = records.flatMap(
        /**
         * Expand detail batches and single details into one list of detail records.
         *
         * @param {{ kind: string, items?: object[] }} record - One acquisition record.
         * @returns {object[]} The batch items, the detail itself, or nothing for other kinds.
         */
        (record) => (record.kind === 'detail-batch' ? record.items : record.kind === 'issue-detail' ? [record] : [])
    );
    const detailMap = new Map(
        originalDetails.map(
            /**
             * Key a detail record by its issue identifier.
             *
             * @param {{ issue: { id: string } }} record - One detail record.
             * @returns {[string, object]} The identifier and the record.
             */
            (record) => [record.issue.id, record]
        )
    );
    if (detailMap.size !== originalDetails.length)
        throw new Error('Duplicate acquired detail; use an explicit issue-refresh record');
    for (const record of records.filter(
        /**
         * Keep issue-refresh records, which replace an earlier detail.
         *
         * @param {{ kind: string }} record - One acquisition record.
         * @returns {boolean} Whether it is an `issue-refresh` record.
         */
        (record) => record.kind === 'issue-refresh'
    ))
        detailMap.set(record.issue.id, record);
    const details = [...detailMap.values()];
    const independent = records
        .filter(
            /**
             * Keep independent-count records.
             *
             * @param {{ kind: string }} record - One acquisition record.
             * @returns {boolean} Whether it is an `independent-count` record.
             */
            (record) => record.kind === 'independent-count'
        )
        .at(-1);
    if (
        !independent ||
        independent.terminal !== true ||
        independent.includeArchived !== true ||
        independent.count !== independent.ids.length ||
        !pages.length ||
        pages.slice(0, -1).some(
            /**
             * Detect a non-final page that does not continue with a cursor.
             *
             * @param {{ hasNextPage: boolean, cursor?: string | null }} page - One enumeration page before the last.
             * @returns {boolean} Whether the page breaks the pagination chain.
             */
            (page) => page.hasNextPage !== true || !page.cursor
        ) ||
        pages.at(-1).hasNextPage !== false
    )
        throw new Error('Missing terminal enumeration evidence');
    const commentPages = records.flatMap(
        /**
         * Expand comment batches and single comment pages into one list of comment-page records.
         *
         * @param {{ kind: string, items?: object[] }} record - One acquisition record.
         * @returns {object[]} The batch items, the page record itself, or nothing for other kinds.
         */
        (record) => (record.kind === 'comment-batch' ? record.items : record.kind === 'comment-page' ? [record] : [])
    );
    const issues = details
        .filter(
            /**
             * Drop detail records for issues the mirror excludes.
             *
             * @param {{ issue: { id: string } }} detail - One detail record.
             * @returns {boolean} Whether the issue is mirrored.
             */
            (detail) => includedIssue(detail.issue.id)
        )
        .map(
            /**
             * Reduce a detail record to the published issue fields, sorted labels, complete comments and sorted relations.
             *
             * @param {{ issue: object }} detail - One detail or refresh record.
             * @returns {object} The normalized issue.
             */
            (detail) => {
                const issue = detail.issue;
                return {
                    ...Object.fromEntries(
                        issueKeys
                            .filter(
                                /**
                                 * Keep scalar fields, which are copied as they are.
                                 *
                                 * @param {string} key - One published issue key.
                                 * @returns {boolean} Whether the key is neither `relations` nor `comments`.
                                 */
                                (key) => !['relations', 'comments'].includes(key)
                            )
                            .map(
                                /**
                                 * Copy one scalar field from the acquired issue.
                                 *
                                 * @param {string} key - One scalar issue key.
                                 * @returns {[string, unknown]} The key and the acquired value.
                                 */
                                (key) => [key, issue[key]]
                            )
                    ),
                    labels: [...issue.labels].sort(),
                    comments: (
                        /**
                         * Collect the issue's comments from its latest refresh or its comment pages, requiring terminal pagination.
                         *
                         * @returns {object[]} The published comment records, oldest first.
                         */
                        () => {
                            const refresh = records
                                .filter(
                                    /**
                                     * Keep refresh records for this issue.
                                     *
                                     * @param {{ kind: string, issue?: { id: string } }} record - One acquisition record.
                                     * @returns {boolean} Whether it refreshes the current issue.
                                     */
                                    (record) => record.kind === 'issue-refresh' && record.issue.id === issue.id
                                )
                                .at(-1);
                            const pages =
                                refresh?.commentPages ??
                                commentPages
                                    .filter(
                                        /**
                                         * Keep comment pages for this issue.
                                         *
                                         * @param {{ issueId: string }} record - One comment-page record.
                                         * @returns {boolean} Whether it belongs to the current issue.
                                         */
                                        (record) => record.issueId === issue.id
                                    )
                                    .map(
                                        /**
                                         * Extract a comment-page record's page.
                                         *
                                         * @param {{ page: object }} record - One comment-page record.
                                         * @returns {object} Its page.
                                         */
                                        (record) => record.page
                                    );
                            if (
                                !pages.length ||
                                pages.at(-1).hasNextPage !== false ||
                                pages.slice(0, -1).some(
                                    /**
                                     * Detect a non-final comment page that does not continue with a cursor.
                                     *
                                     * @param {{ hasNextPage: boolean, cursor?: string | null }} page - One comment page before the last.
                                     * @returns {boolean} Whether the page breaks the pagination chain.
                                     */
                                    (page) => page.hasNextPage !== true || !page.cursor
                                )
                            )
                                throw new Error(`Incomplete comment pagination: ${issue.id}`);
                            return pages
                                .flatMap(
                                    /**
                                     * Read the comments held by one page.
                                     *
                                     * @param {{ comments: object[] }} page - One comment page.
                                     * @returns {object[]} Its comments.
                                     */
                                    (page) => page.comments
                                )
                                .map(
                                    /**
                                     * Keep only the published comment fields, with author names and attachment titles.
                                     *
                                     * @param {object} comment - One acquired comment.
                                     * @returns {object} The published comment record.
                                     */
                                    (comment) => ({
                                        id: comment.id,
                                        body: comment.body,
                                        author: comment.author?.name ?? null,
                                        onBehalfOf: comment.onBehalfOf?.name ?? null,
                                        createdAt: comment.createdAt,
                                        updatedAt: comment.updatedAt,
                                        parentId: comment.parentId,
                                        quotedText: comment.quotedText,
                                        resolvedAt: comment.resolvedAt,
                                        attachments: comment.attachments.map(
                                            /**
                                             * Publish an attachment by title only, never its signed URL or content.
                                             *
                                             * @param {{ title?: string }} attachment - One acquired attachment.
                                             * @returns {string} Its title, or `Untitled attachment`.
                                             */
                                            (attachment) => attachment.title ?? 'Untitled attachment'
                                        ),
                                    })
                                )
                                .sort(
                                    /**
                                     * Order comments by creation time, then by id for a stable tie-break.
                                     *
                                     * @param {{ createdAt: string, id: string }} a - The first comment.
                                     * @param {{ createdAt: string, id: string }} b - The second comment.
                                     * @returns {number} The comparison result.
                                     */
                                    (a, b) => lexical(a.createdAt, b.createdAt) || lexical(a.id, b.id)
                                );
                        }
                    )(),
                    relations: Object.fromEntries(
                        relationKeys.map(
                            /**
                             * Normalize one relation kind to an identifier, null or a sorted identifier list.
                             *
                             * @param {string} key - One relation key.
                             * @returns {[string, string | null | string[]]} The key and its normalized value.
                             */
                            (key) => [
                                key,
                                key === 'duplicateOf'
                                    ? (issue.relations[key]?.id ?? null)
                                    : sortedIds(
                                          issue.relations[key].map(
                                              /**
                                               * Read a related issue's identifier.
                                               *
                                               * @param {{ id: string }} item - One related issue reference.
                                               * @returns {string} Its identifier.
                                               */
                                              (item) => item.id
                                          )
                                      ),
                            ]
                        )
                    ),
                };
            }
        )
        .sort(
            /**
             * Order issues by issue number.
             *
             * @param {{ id: string }} a - The first issue.
             * @param {{ id: string }} b - The second issue.
             * @returns {number} The comparison result.
             */
            (a, b) => order(a.id, b.id)
        );
    return validateSnapshot({
        version: 2,
        team: 'EVE',
        capturedOn,
        enumeratedAt: enumeration?.acquiredAt ?? null,
        publication: 'descriptions-and-comments',
        enumeration: {
            includeArchived: true,
            firstIds: sortedIds(
                pages.flatMap(
                    /**
                     * Read the identifiers listed on one enumeration page.
                     *
                     * @param {{ issues: Array<{ id: string }> }} page - One enumeration page.
                     * @returns {string[]} Its identifiers.
                     */
                    (page) => page.issues.map(issueId)
                )
            ),
            independentIds: sortedIds(independent.ids),
            firstTerminal: true,
            independentTerminal: true,
        },
        issues,
    });
};

/**
 * Replace one generated region only; malformed markers fail closed rather than overwriting human context.
 *
 * Throws when the page has missing, repeated or reversed markers.
 *
 * @since 0.0.1
 * @param {string | null} current - The page's current content, or null when it does not exist yet.
 * @param {string} generated - The freshly rendered region content.
 * @param {string} [initialContext] - The human-maintained section appended to a new page.
 * @returns {string} The page with only the generated region replaced.
 * @example
 * const page = mergeGenerated(existsSync(path) ? readFileSync(path, 'utf8') : null, rendered);
 */
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

/**
 * Render all accessible issues deterministically without inferring approvals or extracting prose decisions.
 *
 * @since 0.0.1
 * @param {object} input - The snapshot to validate and render.
 * @returns {Map<string, string>} Generated region content for each `EVE-<n>.md` page and the `README.md` index.
 * @example
 * const files = renderSnapshot(snapshot);
 */
export const renderSnapshot = (input) => {
    const snapshot = validateSnapshot(input);
    const issues = [...snapshot.issues].sort(
        /**
         * Order issues by issue number.
         *
         * @param {{ id: string }} a - The first issue.
         * @param {{ id: string }} b - The second issue.
         * @returns {number} The comparison result.
         */
        (a, b) => order(a.id, b.id)
    );
    const files = new Map();
    const omissions =
        `Enumerated visible EVE set: ${snapshot.enumeration.firstIds.length}; mirrored: ${issues.length}. Enumeration timestamp: ${snapshot.enumeratedAt ?? 'not recorded by acquisition adapter'}. EVE-10 is deliberately excluded under Jonathan's 2026-11-17 instruction because it belongs to a different repository; its Linear/GitHub records are not deleted by this tool. The identifier hash above, when shown, covers mirrored issues only.\n\n` +
        'Descriptions and all returned comment pages are synchronized verbatim, except reserved generation-marker escaping. Acceptance criteria, prose blockers and decisions stay in their source context below; no approval is inferred from a label, status, author name or automated summary. The latest binding owner comment governs until the human timeline/decision index is updated. Missing authors are marked unavailable; no comments means a successfully enumerated empty connection. Attachment titles are retained when supplied by the acquisition service, but binary content and short-lived signed download URLs are not mirrored. Follow the live source to download attachments; linked external documents and deleted/inaccessible comments are not proven captured.';
    for (const issue of issues) {
        const children = issues
            .filter(
                /**
                 * Keep the issues whose parent is the current issue.
                 *
                 * @param {{ parentId: string | null }} child - One mirrored issue.
                 * @returns {boolean} Whether it is a child of the current issue.
                 */
                (child) => child.parentId === issue.id
            )
            .map(issueId);
        const discussion = issue.comments
            .map(
                /**
                 * Render one comment with its attribution, timestamps, thread position, quote, body and attachment titles.
                 *
                 * @param {object} comment - One published comment.
                 * @returns {string} The comment's Markdown section.
                 */
                (comment) =>
                    `### Comment ${comment.id}\n\nAuthor: ${comment.author === null ? 'Unavailable' : safeText(comment.author)}${comment.onBehalfOf === null ? '' : `; on behalf of ${safeText(comment.onBehalfOf)}`}. Created: ${safeText(comment.createdAt)}; updated: ${safeText(comment.updatedAt)}. [Live discussion source](${issue.url}) (comment ID above). Parent: ${comment.parentId === null ? 'None' : safeText(comment.parentId)}. Resolved: ${comment.resolvedAt === null ? 'Not recorded' : safeText(comment.resolvedAt)}.\n\n${comment.quotedText === null ? '' : `Quoted description text:\n\n${sourceProse(comment.quotedText)}\n\n`}${sourceProse(comment.body ?? '')}\n\n${comment.attachments.length ? `Attachment bodies omitted; titles: ${comment.attachments.map(safeText).join(', ')}.\n` : ''}`
            )
            .join('\n');
        files.set(
            `${issue.id}.md`,
            `# ${issue.id}: ${safeText(issue.title)}\n\n[Live Linear source](${issue.url}) | [Issue index](README.md) | [Maintained timeline](../timeline.md)\n\nSnapshot: ${snapshot.capturedOn}; Linear updated: ${safeText(issue.updatedAt)}. Generated source mirror; edit Linear and refresh, not this region.\n\n| Field | Value |\n| --- | --- |\n| Status | ${safeText(issue.status)} (${safeText(issue.statusType)}) |\n| Priority | ${issue.priority.value}: ${safeText(issue.priority.name)} |\n| Labels | ${issue.labels.map(safeText).join(', ') || 'None recorded'} |\n| Project | ${issue.project === null ? 'None recorded' : safeText(issue.project)} |\n| Archived | ${issue.archivedAt === null ? 'No' : safeText(issue.archivedAt)} |\n| Parent | ${issue.parentId === null ? 'None recorded' : link(issue.parentId)} |\n| Children | ${ids(children)} |\n| Blocked by | ${ids(issue.relations.blockedBy)} |\n| Blocks | ${ids(issue.relations.blocks)} |\n| Related to | ${ids(issue.relations.relatedTo)} |\n| Duplicate of | ${issue.relations.duplicateOf === null ? 'None recorded' : link(issue.relations.duplicateOf)} |\n\n## Publication omissions and authority\n\n${omissions}\n\n## Linear description\n\n${issue.description === null ? 'No description returned (null).' : sourceProse(issue.description)}\n\n## Linear comments (${issue.comments.length})\n\n${discussion || 'No comments returned after complete pagination.'}\n`
        );
    }
    /**
     * Group issues by project, collecting unassigned issues under `No project`.
     *
     * @param {{ project: string | null }} issue - One mirrored issue.
     * @returns {string} The project name.
     */
    const projectOf = (issue) => issue.project ?? 'No project';
    /**
     * Group issues by their Linear status name.
     *
     * @param {{ status: string }} issue - One mirrored issue.
     * @returns {string} The status name.
     */
    const statusOf = (issue) => issue.status;
    const groups = Object.groupBy(issues, projectOf);
    const statuses = Object.entries(Object.groupBy(issues, statusOf)).sort(byEntryKey);
    const roadmap = ['flowchart LR'];
    for (const [phase, label, types] of [
        ['completed', 'Completed', ['completed']],
        ['current', 'Current', ['started']],
        ['upcoming', 'Upcoming', ['backlog', 'unstarted', 'triage']],
        ['other', 'Other recorded states', ['canceled', 'duplicate']],
    ]) {
        roadmap.push(`    subgraph ${phase}[${label}]`);
        for (const issue of issues.filter(
            /**
             * Keep the issues whose state type belongs to the current roadmap column.
             *
             * @param {{ statusType: string }} item - One mirrored issue.
             * @returns {boolean} Whether it belongs in the column.
             */
            (item) => types.includes(item.statusType)
        ))
            roadmap.push(`        E${issue.id.slice(4)}["${issue.id}"]`);
        roadmap.push('    end');
    }
    for (const issue of issues)
        for (const blocked of issue.relations.blocks)
            roadmap.push(`    E${issue.id.slice(4)} --> E${blocked.slice(4)}`);
    for (const issue of issues)
        roadmap.push(`    click E${issue.id.slice(4)} "https://linear.app/resnovas/issue/${issue.id}"`);
    /**
     * Render one delivery-status bullet.
     *
     * @param {[string, object[]]} entry - A status name and the issues in it.
     * @returns {string} A list item with the status and its issue count.
     */
    const statusLine = (entry) => `- ${safeText(entry[0])}: ${entry[1].length}`;
    /**
     * Render one issue as a row of its project table.
     *
     * @param {object} issue - One mirrored issue.
     * @returns {string} The table row with link, title, status, priority and blockers.
     */
    const issueRow = (issue) =>
        `| ${link(issue.id)} | ${safeText(issue.title)} | ${safeText(issue.status)} | ${issue.priority.value} | ${ids(issue.relations.blockedBy)} |`;
    /**
     * Render one project's heading and issue table.
     *
     * @param {[string, object[]]} entry - A project name and its issues.
     * @returns {string} The project's Markdown section.
     */
    const projectSection = (entry) =>
        `## ${safeText(entry[0])}\n\n| Issue | Title | Status | Priority | Blocked by |\n| --- | --- | --- | --- | --- |\n${entry[1].map(issueRow).join('\n')}`;
    files.set(
        'README.md',
        `# EVE issue mirror\n\n[Planning authority and refresh rules](../README.md) | [Human-maintained timeline and Mermaid roadmap](../timeline.md)\n\nGenerated from the owner-authorized normalized snapshot in \`tools/documentation/linear-snapshot.json\`. Linear is the live issue/status source. Repository Markdown is a durable implementation mirror, not independent approval.\n\n## Completeness\n\nCaptured ${snapshot.capturedOn}. ${issues.length} unique EVE issues including archived items, ${files.size} per-issue pages, ${issues.reduce(addComments, 0)} comments. Full pagination (250/page, creation order) and an independent enumeration (100/page, update order) reached terminal pages and returned identical ID sets. SHA-256 of numerically ordered IDs: \`${digest(issues.map(issueId))}\`. This proves completeness for the connected key's visible EVE set, not administrator-only/deleted issues the service cannot expose.\n\nMetadata/relations unavailable: none in this snapshot. Descriptions and comments are mirrored under Jonathan's explicit publication instruction on 2026-11-17. There is no independent server total endpoint in the connected MCP schema; two full enumerations provide the count cross-check. Live changes during acquisition can require a retry; this is not an atomic Linear snapshot.\n\n${omissions}\n\n## Delivery status\n\n${statuses.map(statusLine).join('\n')}\n\nDone means Linear's recorded state, not renewed release approval. In Progress/started issues are current; Backlog/unstarted issues are upcoming; canceled/duplicate records remain visible rather than being silently dropped.\n\n${Object.entries(
            groups
        )
            .sort(byEntryKey)
            .map(projectSection)
            .join(
                '\n\n'
            )}\n\n## Complete recorded dependency roadmap\n\nAll ${issues.length} issues are grouped by Linear state type; arrows are recorded \`blocks\` relations only, never inferred approvals or new sequencing decisions. The tables above and each issue's relations provide the text equivalent. The curated platform sequence remains in the human-maintained timeline.\n\n<details>\n<summary>Expand the full Mermaid dependency graph</summary>\n\n\`\`\`mermaid\n${roadmap.join('\n')}\n\`\`\`\n\n</details>\n`
    );
    return files;
};

/**
 * Audit or update generated regions, retaining all human-authored context and refusing stale issue deletion.
 *
 * Throws when a committed issue page has no issue in the snapshot, rather than deleting it.
 *
 * @since 0.0.1
 * @param {string} root - The repository root holding `docs/planning/issues`.
 * @param {object} snapshot - The snapshot to render.
 * @param {boolean} [check] - Report stale pages without writing; defaults to false.
 * @returns {string[]} The page file names whose content differs from the rendering, and were rewritten unless checking.
 * @example
 * const stale = synchronize(process.cwd(), snapshot, true);
 */
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
        `Linear mirror: ${snapshot.issues.length} issues; ${snapshot.issues.reduce(addComments, 0)} comments; ${stale.length} ${check ? 'stale' : 'updated'} pages.`
    );
    process.exitCode = check && stale.length ? 1 : 0;
}
