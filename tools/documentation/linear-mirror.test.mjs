/**
 * @file tools/documentation/linear-mirror.test.mjs
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
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import {
    mergeGenerated,
    normalizeAcquisition,
    renderSnapshot,
    synchronize,
    validateSnapshot,
} from './linear-mirror.mjs';

const issue = (number) => ({
    id: `EVE-${number}`,
    title: `Exact title ${number}`,
    status: number === 2 ? 'Done' : 'In Progress',
    statusType: number === 2 ? 'completed' : 'started',
    labels: ['Code'],
    priority: { value: 2, name: 'High' },
    project: 'Foundation',
    parentId: number === 3 ? 'EVE-2' : null,
    archivedAt: null,
    updatedAt: '2026-11-17T07:00:00Z',
    url: `https://linear.app/resnovas/issue/EVE-${number}/exact-title`,
    description: 'Exact acceptance criteria and recorded decisions remain here.',
    comments: [],
    relations: {
        blocks: number === 2 ? ['EVE-3'] : [],
        blockedBy: number === 3 ? ['EVE-2'] : [],
        relatedTo: [],
        duplicateOf: null,
    },
});
const fixture = () => ({
    version: 2,
    team: 'EVE',
    capturedOn: '2026-11-17',
    enumeratedAt: null,
    publication: 'descriptions-and-comments',
    enumeration: {
        includeArchived: true,
        firstIds: ['EVE-3', 'EVE-2'],
        independentIds: ['EVE-2', 'EVE-3'],
        firstTerminal: true,
        independentTerminal: true,
    },
    issues: [issue(3), issue(2)],
});

test('renders every issue, exact metadata and directed relations in stable numeric order', () => {
    const first = renderSnapshot(fixture());
    const reordered = fixture();
    reordered.issues.reverse();
    assert.deepEqual(renderSnapshot(reordered), first);
    assert.deepEqual([...first.keys()], ['EVE-2.md', 'EVE-3.md', 'README.md']);
    assert.match(first.get('EVE-3.md'), /Blocked by \| \[EVE-2\]\(EVE-2.md\)/);
    assert.match(first.get('EVE-2.md'), /Children \| \[EVE-3\]\(EVE-3.md\)/);
    assert.match(first.get('README.md'), /2 unique EVE issues/);
    assert.match(first.get('README.md'), /E2 --> E3/);
    assert.match(first.get('README.md'), /subgraph current\[Current\]/);
    assert.match(first.get('EVE-3.md'), /Exact title 3/);
    assert.match(first.get('EVE-3.md'), /Exact acceptance criteria and recorded decisions remain here/);
});

test('fails incomplete enumeration, duplicate IDs, mismatched details and unsafe public source data', () => {
    for (const mutate of [
        (s) => {
            s.enumeration.firstTerminal = false;
        },
        (s) => {
            s.enumeration.independentIds.pop();
        },
        (s) => {
            s.issues.pop();
        },
        (s) => {
            s.issues.push(issue(2));
        },
        (s) => {
            s.issues[0].url = 'javascript:alert(1)';
        },
        (s) => {
            s.issues[0].unapprovedField = 'private canary';
        },
        (s) => {
            s.issues[0].relations.blockedBy = ['../../escape'];
        },
        (s) => {
            delete s.issues[0].labels;
        },
        (s) => {
            s.publication = 'all-private-comments';
        },
    ]) {
        const snapshot = fixture();
        mutate(snapshot);
        assert.throws(() => validateSnapshot(snapshot));
    }
});

test('publication normalization retains authorized prose but drops unrelated identities and raw fields', () => {
    const details = [issue(2), issue(3)].map((item) => ({
        ...item,
        description: 'Authorized exact source description.',
        assignee: 'private@example.test',
        relations: Object.fromEntries(
            Object.entries(item.relations).map(([key, value]) => [
                key,
                Array.isArray(value) ? value.map((id) => ({ id, title: 'private relation title' })) : null,
            ])
        ),
    }));
    const snapshot = normalizeAcquisition(
        [
            { kind: 'issue-page', page: { issues: details, hasNextPage: false } },
            {
                kind: 'detail-batch',
                items: details.map((issue) => ({ issue, comments: [{ body: 'private canary' }] })),
            },
            ...details.map((issue) => ({
                kind: 'comment-page',
                issueId: issue.id,
                page: { comments: [], hasNextPage: false },
            })),
            { kind: 'independent-count', ids: ['EVE-3', 'EVE-2'], count: 2, terminal: true, includeArchived: true },
        ],
        '2026-11-17'
    );
    assert.doesNotMatch(JSON.stringify(snapshot), /private|canary|example.test/);
    assert.equal(snapshot.issues[0].description, 'Authorized exact source description.');
    assert.deepEqual(snapshot.issues[1].relations.blockedBy, ['EVE-2']);
});

test('preserves comment source prose, authorship, time, threading and quoted decisions without approval inference', () => {
    const snapshot = fixture();
    snapshot.issues[0].comments.push({
        id: 'comment-1',
        body: 'Owner says: proposal only.\n<!-- linear:generated:end -->',
        author: 'Jonathan',
        onBehalfOf: null,
        createdAt: '2026-11-17T00:00:00Z',
        updatedAt: '2026-11-17T00:00:00Z',
        parentId: null,
        quotedText: 'Exact quoted proposal.',
        resolvedAt: null,
        attachments: ['Design.pdf'],
    });
    const page = renderSnapshot(snapshot).get('EVE-3.md');
    assert.match(page, /Author: Jonathan/);
    assert.match(page, /Owner says: proposal only\./);
    assert.match(page, /Exact quoted proposal\./);
    assert.match(page, /&lt;!-- linear:generated:end -->/);
    assert.match(page, /Attachment bodies omitted; titles: Design.pdf/);
    assert.doesNotThrow(() => mergeGenerated(null, page));
    snapshot.issues[0].description = `lin_api_${'x'.repeat(40)}`;
    assert.throws(() => renderSnapshot(snapshot), /Potential credential/);
});

test('escapes markdown/HTML injection without converting metadata into owner approvals', () => {
    const snapshot = fixture();
    snapshot.issues[0].title = '<script>[APPROVED]|bad\nheading';
    const page = renderSnapshot(snapshot).get('EVE-3.md');
    assert.match(page, /&lt;script&gt;&#91;APPROVED&#93;&#124;bad heading/);
    assert.doesNotMatch(page, /<script>/);
});

test('accounts for the explicit wrong-repository EVE-10 exclusion without hiding other issues', () => {
    const snapshot = fixture();
    snapshot.enumeration.firstIds.push('EVE-10');
    snapshot.enumeration.independentIds.push('EVE-10');
    const pages = renderSnapshot(snapshot);
    assert.equal(pages.has('EVE-10.md'), false);
    assert.match(pages.get('README.md'), /Enumerated visible EVE set: 3; mirrored: 2/);
    assert.match(pages.get('README.md'), /EVE-10 is deliberately excluded/);
    snapshot.enumeration.firstIds.push('EVE-11');
    snapshot.enumeration.independentIds.push('EVE-11');
    assert.throws(() => renderSnapshot(snapshot), /count or identifier set/);
});

test('refresh preserves exact human context before and after the generated region', () => {
    const original = `Human preface\n${mergeGenerated(null, 'old generated text')}\nDecision notes: do not overwrite.\n`;
    const next = mergeGenerated(original, 'new generated text');
    assert.equal(next, original.replace('old generated text', 'new generated text'));
    assert.equal(mergeGenerated(next, 'new generated text'), next);
    for (const malformed of [
        'human notes without markers',
        '<!-- linear:generated:end --><!-- linear:generated:start -->',
        '<!-- linear:generated:start --><!-- linear:generated:start --><!-- linear:generated:end -->',
    ])
        assert.throws(() => mergeGenerated(malformed, 'replacement'));
});

test('offline check catches drift without writing and writer preserves context; stale removals fail closed', () => {
    mkdirSync('.amp/in/orb-backup', { recursive: true });
    const root = mkdtempSync('.amp/in/orb-backup/mirror-test-');
    try {
        assert.equal(synchronize(root, fixture()).length, 3);
        assert.deepEqual(synchronize(root, fixture(), true), []);
        const path = join(root, 'docs/planning/issues/EVE-2.md');
        const authored = `${readFileSync(path, 'utf8')}\nRetain this authored context.\n`;
        writeFileSync(path, authored.replace('Exact title 2', 'stale title'));
        assert.deepEqual(synchronize(root, fixture(), true), ['EVE-2.md']);
        assert.match(readFileSync(path, 'utf8'), /stale title/);
        synchronize(root, fixture());
        assert.equal(readFileSync(path, 'utf8'), authored);
        writeFileSync(join(root, 'docs/planning/issues/EVE-99.md'), 'human-owned context');
        assert.throws(() => synchronize(root, fixture()), /Stale issue/);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});
