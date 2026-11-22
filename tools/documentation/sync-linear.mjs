/**
 * @file tools/documentation/sync-linear.mjs
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

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeAcquisition, synchronize } from './linear-mirror.mjs';

const pageInfo = 'pageInfo { hasNextPage endCursor }';
const fields =
    'identifier title description url updatedAt archivedAt priority priorityLabel state { name type } project { name } parent { identifier }';

/**
 * Follow every connection to a terminal page and reject loops or missing cursor evidence.
 *
 * Rejects with an error when a page is malformed or its end cursor is missing or repeats.
 *
 * @since 0.0.1
 * @param {(after: string | null) => Promise<{ nodes: object[], pageInfo: { hasNextPage: boolean, endCursor: string | null } }>} request - Fetches the page after a cursor, starting from null.
 * @returns {Promise<{ nodes: object[], pages: object[] }>} Every node in page order and every page as received.
 * @example
 * const { nodes } = await paginate((after) => fetchIssuePage(after));
 */
export const paginate = async (request) => {
    const nodes = [];
    const pages = [];
    const seen = new Set();
    let after = null;
    for (;;) {
        const page = await request(after);
        if (!page || !Array.isArray(page.nodes) || typeof page.pageInfo?.hasNextPage !== 'boolean')
            throw new Error('Malformed Linear connection');
        nodes.push(...page.nodes);
        pages.push(page);
        if (!page.pageInfo.hasNextPage) break;
        after = page.pageInfo.endCursor;
        if (!after || seen.has(after)) throw new Error('Linear pagination failed to advance');
        seen.add(after);
    }
    return { nodes, pages };
};

/**
 * Acquire only read queries, with independent issue enumeration and complete nested connection pagination.
 *
 * Rejects with an error when an issue is inaccessible or carries a relation type the mirror does not map.
 *
 * @since 0.0.1
 * @param {(query: string, variables: object) => Promise<object>} query - Runs one GraphQL read query and resolves its `data`.
 * @param {string} capturedOn - The capture date, `YYYY-MM-DD`, stamped on the snapshot.
 * @returns {Promise<object>} The normalized snapshot built by `normalizeAcquisition`.
 * @example
 * const snapshot = await acquire(graphqlRequest(authorization), '2026-11-21');
 */
export const acquire = async (query, capturedOn) => {
    /**
     * List every EVE issue identifier, including archived issues, in one sort order.
     *
     * @param {string} order - The Linear `orderBy` value, `createdAt` or `updatedAt`.
     * @param {number} first - The page size to request.
     * @returns {Promise<{ nodes: object[], pages: object[] }>} Every identifier node and the pages that held them.
     */
    const enumerate = async (order, first) =>
        paginate(
            /**
             * Fetch one page of issue identifiers.
             *
             * @param {string | null} after - The cursor to continue from, or null for the first page.
             * @returns {Promise<object>} The `issues` connection of the response.
             */
            async (after) =>
                (
                    await query(
                        `query MirrorIssues($after: String) { issues(first: ${first}, after: $after, includeArchived: true, orderBy: ${order}, filter: { team: { key: { eq: "EVE" } } }) { nodes { identifier } ${pageInfo} } }`,
                        { after }
                    )
                ).issues
        );
    const first = await enumerate('createdAt', 250);
    const independent = await enumerate('updatedAt', 100);
    const records = first.pages.map(
        /**
         * Record one enumeration page with its identifiers and cursor evidence.
         *
         * @param {{ nodes: Array<{ identifier: string }>, pageInfo: { hasNextPage: boolean, endCursor: string | null } }} page - One page of the creation-order enumeration.
         * @returns {object} An `issue-page` acquisition record.
         */
        (page) => ({
            kind: 'issue-page',
            page: {
                issues: page.nodes.map(
                    /**
                     * Reduce an enumerated node to its identifier record.
                     *
                     * @param {{ identifier: string }} node - One enumerated issue.
                     * @returns {{ id: string }} The issue reference.
                     */
                    (node) => ({ id: node.identifier })
                ),
                hasNextPage: page.pageInfo.hasNextPage,
                cursor: page.pageInfo.endCursor,
            },
        })
    );
    records.push({
        kind: 'issue-enumeration',
        pages: records.map(
            /**
             * Extract the page evidence from an issue-page record.
             *
             * @param {{ page: object }} record - One `issue-page` record.
             * @returns {object} Its page.
             */
            (record) => record.page
        ),
        acquiredAt: new Date().toISOString(),
    });
    records.push({
        kind: 'independent-count',
        ids: independent.nodes.map(
            /**
             * Read an enumerated issue's identifier.
             *
             * @param {{ identifier: string }} node - One issue from the update-order enumeration.
             * @returns {string} Its identifier, such as `EVE-13`.
             */
            (node) => node.identifier
        ),
        count: independent.nodes.length,
        includeArchived: true,
        terminal: true,
    });
    for (const node of first.nodes) {
        const result = await query(`query MirrorIssue($id: String!) { issue(id: $id) { ${fields} } }`, {
            id: node.identifier,
        });
        if (!result.issue) throw new Error(`Inaccessible issue: ${node.identifier}`);
        const value = result.issue;
        /**
         * Read every page of one nested connection of the current issue, archived entries included.
         *
         * @param {string} field - The issue connection to read, such as `labels` or `comments`.
         * @param {string} selection - The GraphQL fields to select on each node.
         * @returns {Promise<{ nodes: object[], pages: object[] }>} Every node of the connection.
         */
        const connection = async (field, selection) =>
            paginate(
                /**
                 * Fetch one page of the nested connection.
                 *
                 * @param {string | null} after - The cursor to continue from, or null for the first page.
                 * @returns {Promise<object>} The connection object of the issue in the response.
                 */
                async (after) =>
                    (
                        await query(
                            `query MirrorConnection($id: String!, $after: String) { issue(id: $id) { ${field}(first: 100, after: $after, includeArchived: true) { nodes { ${selection} } ${pageInfo} } } }`,
                            { id: node.identifier, after }
                        )
                    ).issue[field]
            );
        const labels = await connection('labels', 'name');
        const comments = await connection(
            'comments',
            'id body createdAt updatedAt parentId quotedText resolvedAt user { name } externalUser { name } onBehalfOf { name }'
        );
        const outgoing = await connection('relations', 'type issue { identifier } relatedIssue { identifier }');
        const incoming = await connection('inverseRelations', 'type issue { identifier } relatedIssue { identifier }');
        const relations = { blockedBy: [], blocks: [], relatedTo: [], duplicateOf: null };
        for (const [direction, entries] of [
            ['outgoing', outgoing.nodes],
            ['incoming', incoming.nodes],
        ]) {
            for (const relation of entries) {
                const other = direction === 'outgoing' ? relation.relatedIssue.identifier : relation.issue.identifier;
                if (relation.type === 'blocks')
                    relations[direction === 'outgoing' ? 'blocks' : 'blockedBy'].push({ id: other });
                else if (relation.type === 'related') relations.relatedTo.push({ id: other });
                else if (relation.type === 'duplicate') {
                    if (direction === 'outgoing') relations.duplicateOf = { id: other };
                    else relations.relatedTo.push({ id: other });
                } else
                    throw new Error(
                        `Unmapped Linear relation type for ${node.identifier}; review schema before publishing`
                    );
            }
        }
        for (const key of ['blocks', 'blockedBy', 'relatedTo'])
            relations[key] = [
                ...new Map(
                    relations[key].map(
                        /**
                         * Key a relation entry by issue so duplicates collapse.
                         *
                         * @param {{ id: string }} entry - One related issue reference.
                         * @returns {[string, { id: string }]} The issue id and the entry.
                         */
                        (entry) => [entry.id, entry]
                    )
                ).values(),
            ];
        records.push({
            kind: 'issue-detail',
            issue: {
                id: value.identifier,
                title: value.title,
                description: value.description,
                status: value.state.name,
                statusType: value.state.type,
                priority: { value: value.priority, name: value.priorityLabel },
                labels: labels.nodes.map(
                    /**
                     * Read a label's display name.
                     *
                     * @param {{ name: string }} label - One label node.
                     * @returns {string} The label name.
                     */
                    (label) => label.name
                ),
                project: value.project?.name ?? null,
                parentId: value.parent?.identifier ?? null,
                updatedAt: value.updatedAt,
                archivedAt: value.archivedAt,
                url: value.url,
                relations,
            },
        });
        records.push({
            kind: 'comment-page',
            issueId: node.identifier,
            page: {
                hasNextPage: false,
                comments: comments.nodes.map(
                    /**
                     * Attribute a comment to its user or external author, with no attachments from GraphQL.
                     *
                     * @param {{ user?: object, externalUser?: object }} comment - One comment node as returned.
                     * @returns {object} The comment with `author` and an empty `attachments` list.
                     */
                    (comment) => ({
                        ...comment,
                        author: comment.user ?? comment.externalUser,
                        attachments: [],
                    })
                ),
            },
        });
    }
    return normalizeAcquisition(records, capturedOn);
};

/**
 * Retain MCP-only attachment context without pretending the GraphQL schema can revalidate it.
 *
 * Throws when a comment with captured attachments has changed, because only MCP can reacquire them.
 *
 * @since 0.0.1
 * @param {{ issues: object[] }} snapshot - The freshly acquired snapshot, whose comments carry no attachments.
 * @param {{ issues: object[] }} prior - The committed snapshot holding previously captured attachments.
 * @returns {{ issues: object[] }} The new snapshot with each unchanged comment's prior attachments restored.
 * @example
 * const merged = preserveAttachmentContext(await acquire(query, today), committedSnapshot);
 */
export const preserveAttachmentContext = (snapshot, prior) => ({
    ...snapshot,
    issues: snapshot.issues.map(
        /**
         * Restore the captured attachments of one issue's comments.
         *
         * @param {{ id: string, comments: object[] }} issue - One freshly acquired issue.
         * @returns {object} The issue with attachments carried over.
         */
        (issue) => {
            const previous = prior.issues.find(
                /**
                 * Match the committed issue with the same identifier.
                 *
                 * @param {{ id: string }} candidate - One committed issue.
                 * @returns {boolean} Whether it is the issue being merged.
                 */
                (candidate) => candidate.id === issue.id
            );
            return {
                ...issue,
                comments: issue.comments.map(
                    /**
                     * Carry over a comment's captured attachments when its body and edit time are unchanged.
                     *
                     * @param {{ id: string, body: string, updatedAt: string }} comment - One freshly acquired comment.
                     * @returns {object} The comment, with prior attachments when any were captured.
                     */
                    (comment) => {
                        const captured = previous?.comments.find(
                            /**
                             * Match the committed comment with the same id.
                             *
                             * @param {{ id: string }} candidate - One committed comment.
                             * @returns {boolean} Whether it is the comment being merged.
                             */
                            (candidate) => candidate.id === comment.id
                        );
                        if (!captured?.attachments.length) return comment;
                        if (captured.body !== comment.body || captured.updatedAt !== comment.updatedAt)
                            throw new Error(
                                `Attachment context needs MCP reacquisition for ${issue.id} comment ${comment.id}; no files changed`
                            );
                        return { ...comment, attachments: [...captured.attachments] };
                    }
                ),
            };
        }
    ),
});

/**
 * Never expose response bodies, GraphQL errors or credentials in logs on an acquisition failure.
 *
 * @since 0.0.1
 * @param {string} authorization - The full `authorization` header value, an API key or `Bearer` token.
 * @param {typeof fetch} [fetcher] - The fetch implementation; defaults to the global `fetch`.
 * @returns {(query: string, variables: object) => Promise<object>} A query runner that accepts only read queries.
 * @example
 * const query = graphqlRequest(process.env.LINEAR_API_KEY);
 */
export const graphqlRequest =
    (authorization, fetcher = fetch) =>
    /**
     * Post one read query to Linear and resolve its data.
     *
     * Rejects with a generic error for a mutation, a network failure, a non-2xx status, invalid JSON or GraphQL errors.
     *
     * @param {string} query - A GraphQL document that must start with `query`.
     * @param {object} variables - The query's variables.
     * @returns {Promise<object>} The response's `data` object.
     */
    async (query, variables) => {
        if (!/^query\b/.test(query)) throw new Error('Only explicit GraphQL read queries are permitted');
        let response;
        try {
            response = await fetcher('https://api.linear.app/graphql', {
                method: 'POST',
                headers: { 'content-type': 'application/json', authorization },
                body: JSON.stringify({ query, variables }),
                signal: AbortSignal.timeout(60_000),
                redirect: 'error',
            });
        } catch {
            throw new Error('Linear request failed; inspect connection/credentials securely');
        }
        if (!response.ok) throw new Error(`Linear HTTP ${response.status}; no mirror files changed`);
        let result;
        try {
            result = await response.json();
        } catch {
            throw new Error('Linear returned invalid JSON; no mirror files changed');
        }
        if (result.errors?.length || !result.data)
            throw new Error('Linear GraphQL rejected the read query; no mirror files changed');
        return result.data;
    };

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
    const key = process.env.LINEAR_API_KEY;
    const token = process.env.LINEAR_ACCESS_TOKEN;
    if ((!key && !token) || (key && token))
        throw new Error(
            'Set exactly one secure LINEAR_API_KEY or LINEAR_ACCESS_TOKEN; never pass credentials as arguments'
        );
    const path = join(root, 'tools/documentation/linear-snapshot.json');
    const prior = JSON.parse(readFileSync(path, 'utf8'));
    const snapshot = preserveAttachmentContext(
        await acquire(graphqlRequest(key ?? `Bearer ${token}`), new Date().toISOString().slice(0, 10)),
        prior
    );
    const stale = synchronize(root, snapshot, true);
    const changed =
        JSON.stringify({ ...snapshot, capturedOn: '', enumeratedAt: null }) !==
        JSON.stringify({ ...prior, capturedOn: '', enumeratedAt: null });
    if (process.argv.includes('--check-live')) {
        const offline = synchronize(root, prior, true);
        console.log(
            `Linear live check: ${snapshot.issues.length} issues; ${changed ? 'source changed' : 'source unchanged'}; ${offline.length} stale committed pages.`
        );
        process.exitCode = changed || offline.length ? 1 : 0;
    } else {
        writeFileSync(path, `${JSON.stringify(snapshot, null, 2)}\n`);
        synchronize(root, snapshot);
        console.log(
            `Linear sync: ${snapshot.issues.length} issues; ${stale.length} updated pages. Review and commit snapshot/pages together.`
        );
    }
}
