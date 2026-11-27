/**
 * @file tools/documentation/sync-linear.test.mjs
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

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { acquire, graphqlRequest, paginate, preserveAttachmentContext } from './sync-linear.mjs';

/**
 * Build one GraphQL connection page in Linear's shape.
 *
 * @param {object[]} nodes - The records on this page.
 * @param {string | null} [next] - The cursor of the following page, or null when this page is the last.
 * @returns {{ nodes: object[], pageInfo: { hasNextPage: boolean, endCursor: string | null } }} The connection page.
 */
const page = (nodes, next = null) => ({ nodes, pageInfo: { hasNextPage: next !== null, endCursor: next } });
/**
 * Build a Linear comment node whose body and identifier are traceable in assertions.
 *
 * @param {string} id - The comment identifier, also embedded in its body.
 * @param {string | null} [parentId] - The comment it replies to, or null for a thread root.
 * @returns {object} A comment node as the Linear API returns it.
 */
const comment = (id, parentId = null) => ({
    id,
    body: `Exact discussion ${id}`,
    createdAt: '2026-11-17T00:00:00Z',
    updatedAt: '2026-11-17T00:00:00Z',
    parentId,
    quotedText: null,
    resolvedAt: null,
    user: { name: 'Owner' },
    onBehalfOf: null,
});
/**
 * Build a fake read-only Linear GraphQL service that answers every mirror query with two linked issues.
 *
 * @param {object} [options] - Which failure, if any, the fake service should simulate.
 * @param {boolean} [options.failCount] - Return only EVE-2 from the independent count so the identifier sets disagree.
 * @param {string} [options.relationType] - The relation type reported between EVE-2 and EVE-3; defaults to `blocks`.
 * @returns {(query: string, vars: object) => Promise<object>} A request function that checks each query is read-only and returns its data.
 */
const service =
    ({ failCount = false, relationType = 'blocks' } = {}) =>
    /**
     * Answer one query by its operation name and the connection field it requests.
     *
     * @param {string} query - The GraphQL document; it must be a query, never a mutation.
     * @param {object} vars - The query variables, such as `id` and the pagination cursor `after`.
     * @returns {Promise<object>} The response data for that query.
     */
    async (query, vars) => {
        assert.match(query, /^query /);
        assert.doesNotMatch(query, /mutation\s/);
        if (query.includes('MirrorIssues')) {
            if (query.includes('orderBy: updatedAt'))
                return {
                    issues: page(
                        failCount ? [{ identifier: 'EVE-2' }] : [{ identifier: 'EVE-3' }, { identifier: 'EVE-2' }]
                    ),
                };
            return {
                issues: vars.after === null ? page([{ identifier: 'EVE-2' }], 'next') : page([{ identifier: 'EVE-3' }]),
            };
        }
        if (query.includes('MirrorIssue('))
            return {
                issue: {
                    identifier: vars.id,
                    title: `Exact ${vars.id}`,
                    description: 'Acceptance: preserve exact failure boundaries.',
                    url: `https://linear.app/resnovas/issue/${vars.id}/source`,
                    updatedAt: '2026-11-17T00:00:00Z',
                    archivedAt: null,
                    priority: 1,
                    priorityLabel: 'Urgent',
                    state: { name: 'In Progress', type: 'started' },
                    project: { name: 'Platform' },
                    parent: null,
                },
            };
        const field = ['labels', 'comments', 'inverseRelations', 'relations'].find(
            /**
             * Detect whether the query requests this connection field.
             *
             * @param {string} field - A connection field name.
             * @returns {boolean} Whether the query calls that field.
             */
            (field) => query.includes(`${field}(`)
        );
        if (field === 'labels') return { issue: { labels: page([{ name: 'Code' }]) } };
        if (field === 'comments')
            return {
                issue: {
                    comments:
                        vars.after === null
                            ? page([comment(`${vars.id}-first`)], 'reply')
                            : page([comment(`${vars.id}-reply`, `${vars.id}-first`)]),
                },
            };
        const edge = { type: relationType, issue: { identifier: 'EVE-2' }, relatedIssue: { identifier: 'EVE-3' } };
        return {
            issue: {
                [field]: page(
                    (field === 'relations' && vars.id === 'EVE-2') ||
                        (field === 'inverseRelations' && vars.id === 'EVE-3')
                        ? [edge]
                        : []
                ),
            },
        };
    };

test('acquisition paginates issues/comments, preserves source bodies and blocking direction', /** Acquire both issues from the fake service and inspect the published record. */ async () => {
    const result = await acquire(service(), '2026-11-17');
    assert.deepEqual(
        result.issues.map(
            /**
             * Read the published identifier of an acquired issue.
             *
             * @param {object} issue - One acquired issue record.
             * @returns {string} Its EVE identifier.
             */
            (issue) => issue.id
        ),
        ['EVE-2', 'EVE-3']
    );
    assert.equal(result.issues[0].description, 'Acceptance: preserve exact failure boundaries.');
    assert.deepEqual(result.issues[0].relations.blocks, ['EVE-3']);
    assert.deepEqual(result.issues[1].relations.blockedBy, ['EVE-2']);
    assert.equal(result.issues[0].comments.length, 2);
    assert.equal(result.issues[0].comments[1].parentId, 'EVE-2-first');
    assert.equal(result.issues[0].comments[0].author, 'Owner');
});

test('incomplete visible sets and new relation semantics fail before publication', /** Acquire from services that disagree on the count or report an unmapped relation. */ async () => {
    await assert.rejects(acquire(service({ failCount: true }), '2026-11-17'), /count or identifier set/);
    await assert.rejects(acquire(service({ relationType: 'unreviewed' }), '2026-11-17'), /Unmapped Linear relation/);
});

test('GraphQL refresh retains unchanged MCP attachment titles, but cannot silently reuse edited context', /** Compare a live acquisition with a captured copy that carries attachment titles. */ async () => {
    const live = await acquire(service(), '2026-11-17');
    const captured = structuredClone(live);
    captured.issues[0].comments[0].attachments = [' ', 'Architecture.pdf'];
    assert.deepEqual(preserveAttachmentContext(live, captured), captured);
    assert.deepEqual(live.issues[0].comments[0].attachments, []);
    for (const field of ['body', 'updatedAt']) {
        const changed = structuredClone(live);
        changed.issues[0].comments[0][field] += 'edited';
        assert.throws(
            /** Preserve attachments onto a comment whose source changed. */ () => {
                preserveAttachmentContext(changed, captured);
            },
            /needs MCP reacquisition/
        );
    }
    const unrelated = structuredClone(live);
    unrelated.issues[0].comments[0].id = 'different-comment';
    assert.deepEqual(preserveAttachmentContext(unrelated, captured), unrelated);
});

test('pagination rejects missing cursors, loops and malformed terminal responses', /** Paginate over each broken page source and expect a rejection. */ async () => {
    for (const request of [
        /**
         * Claim another page without giving a cursor.
         *
         * @returns {Promise<object>} A page that has a next page but no end cursor.
         */
        async () => ({ nodes: [], pageInfo: { hasNextPage: true, endCursor: null } }),
        /**
         * Return the same cursor on every call, so pagination would loop forever.
         *
         * @returns {Promise<object>} An empty page that always points at the cursor `loop`.
         */
        async () => page([], 'loop'),
        /**
         * Omit the page information entirely.
         *
         * @returns {Promise<object>} A malformed page with nodes and no `pageInfo`.
         */
        async () => ({ nodes: [] }),
    ])
        await assert.rejects(paginate(request), /pagination|Malformed/);
});

test('GraphQL transport is read-only, fixed-origin, timeout bounded and never logs returned errors/secrets', /** Send a query through a checking fake fetch, then through fetches that fail with secrets. */ async () => {
    /**
     * Check the transport's request options and answer with an empty issue list.
     *
     * @param {string} url - The endpoint the transport calls.
     * @param {RequestInit} options - The fetch options, which must refuse redirects, carry the key and a timeout signal.
     * @returns {Promise<object>} A successful response whose JSON holds the data.
     */
    const checkingFetch = async (url, options) => {
        assert.equal(url, 'https://api.linear.app/graphql');
        assert.equal(options.redirect, 'error');
        assert.equal(options.headers.authorization, 'fake-fixture-secret');
        assert.ok(options.signal instanceof AbortSignal);
        return {
            ok: true,
            /**
             * Return the response body.
             *
             * @returns {Promise<object>} A GraphQL body with an empty issue list.
             */
            json: async () => ({ data: { issues: [] } }),
        };
    };
    const request = graphqlRequest('fake-fixture-secret', checkingFetch);
    assert.deepEqual(await request('query { issues { nodes { id } } }', {}), { issues: [] });
    for (const fetcher of [
        /**
         * Answer with a rate-limit status.
         *
         * @returns {Promise<object>} A failed response with status 429.
         */
        async () => ({ ok: false, status: 429 }),
        /**
         * Answer successfully with GraphQL errors that quote the secret.
         *
         * @returns {Promise<object>} A response whose body carries errors.
         */
        async () => ({
            ok: true,
            /**
             * Return the error-bearing response body.
             *
             * @returns {Promise<object>} A GraphQL body whose error message includes the secret.
             */
            json: async () => ({ errors: [{ message: 'private response body fake-fixture-secret' }] }),
        }),
        /** Fail the network call with an error whose message is the secret. */
        async () => {
            throw new Error('fake-fixture-secret');
        },
    ]) {
        await assert.rejects(
            graphqlRequest('fake-fixture-secret', fetcher)('query {}', {}),
            /**
             * Check the rejection does not leak the secret or the response body.
             *
             * @param {Error} error - The rejection from the transport.
             * @returns {boolean} Whether the message is free of the secret and the private response text.
             */
            (error) => !error.message.includes('fake-fixture-secret') && !error.message.includes('private response')
        );
    }
});
