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

const page = (nodes, next = null) => ({ nodes, pageInfo: { hasNextPage: next !== null, endCursor: next } });
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
const service =
    ({ failCount = false, relationType = 'blocks' } = {}) =>
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
        const field = ['labels', 'comments', 'inverseRelations', 'relations'].find((field) =>
            query.includes(`${field}(`)
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

test('acquisition paginates issues/comments, preserves source bodies and blocking direction', async () => {
    const result = await acquire(service(), '2026-11-17');
    assert.deepEqual(
        result.issues.map((issue) => issue.id),
        ['EVE-2', 'EVE-3']
    );
    assert.equal(result.issues[0].description, 'Acceptance: preserve exact failure boundaries.');
    assert.deepEqual(result.issues[0].relations.blocks, ['EVE-3']);
    assert.deepEqual(result.issues[1].relations.blockedBy, ['EVE-2']);
    assert.equal(result.issues[0].comments.length, 2);
    assert.equal(result.issues[0].comments[1].parentId, 'EVE-2-first');
    assert.equal(result.issues[0].comments[0].author, 'Owner');
});

test('incomplete visible sets and new relation semantics fail before publication', async () => {
    await assert.rejects(acquire(service({ failCount: true }), '2026-11-17'), /count or identifier set/);
    await assert.rejects(acquire(service({ relationType: 'unreviewed' }), '2026-11-17'), /Unmapped Linear relation/);
});

test('GraphQL refresh retains unchanged MCP attachment titles, but cannot silently reuse edited context', async () => {
    const live = await acquire(service(), '2026-11-17');
    const captured = structuredClone(live);
    captured.issues[0].comments[0].attachments = [' ', 'Architecture.pdf'];
    assert.deepEqual(preserveAttachmentContext(live, captured), captured);
    assert.deepEqual(live.issues[0].comments[0].attachments, []);
    for (const field of ['body', 'updatedAt']) {
        const changed = structuredClone(live);
        changed.issues[0].comments[0][field] += 'edited';
        assert.throws(() => preserveAttachmentContext(changed, captured), /needs MCP reacquisition/);
    }
    const unrelated = structuredClone(live);
    unrelated.issues[0].comments[0].id = 'different-comment';
    assert.deepEqual(preserveAttachmentContext(unrelated, captured), unrelated);
});

test('pagination rejects missing cursors, loops and malformed terminal responses', async () => {
    for (const request of [
        async () => ({ nodes: [], pageInfo: { hasNextPage: true, endCursor: null } }),
        async () => page([], 'loop'),
        async () => ({ nodes: [] }),
    ])
        await assert.rejects(paginate(request), /pagination|Malformed/);
});

test('GraphQL transport is read-only, fixed-origin, timeout bounded and never logs returned errors/secrets', async () => {
    const request = graphqlRequest('fake-fixture-secret', async (url, options) => {
        assert.equal(url, 'https://api.linear.app/graphql');
        assert.equal(options.redirect, 'error');
        assert.equal(options.headers.authorization, 'fake-fixture-secret');
        assert.ok(options.signal instanceof AbortSignal);
        return { ok: true, json: async () => ({ data: { issues: [] } }) };
    });
    assert.deepEqual(await request('query { issues { nodes { id } } }', {}), { issues: [] });
    for (const fetcher of [
        async () => ({ ok: false, status: 429 }),
        async () => ({
            ok: true,
            json: async () => ({ errors: [{ message: 'private response body fake-fixture-secret' }] }),
        }),
        async () => {
            throw new Error('fake-fixture-secret');
        },
    ]) {
        await assert.rejects(
            graphqlRequest('fake-fixture-secret', fetcher)('query {}', {}),
            (error) => !error.message.includes('fake-fixture-secret') && !error.message.includes('private response')
        );
    }
});
