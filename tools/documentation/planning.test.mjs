/**
 * @file tools/documentation/planning.test.mjs
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
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import test from 'node:test';
import {
    authoredArtifact,
    buildGraph,
    decisionSources,
    fingerprint,
    mergePlanning,
    renderPlanning,
    synchronizePlanning,
    validatePlanning,
} from './planning.mjs';

const issue = (id, type, blockedBy = [], blocks = []) => ({
    id,
    title: `${id} <safe & useful>`,
    status: type === 'started' ? 'In Progress' : type === 'completed' ? 'Done' : 'Backlog',
    statusType: type,
    labels: [],
    priority: { value: 0, name: 'No priority' },
    project: null,
    parentId: null,
    updatedAt: '2026-11-17T00:00:00Z',
    archivedAt: null,
    url: `https://linear.app/resnovas/issue/${id}`,
    relations: { blockedBy, blocks, relatedTo: [], duplicateOf: null },
    description: 'Private specification, never copy into roadmap output.',
    comments: [],
});
const fixture = () => {
    const snapshot = {
        version: 2,
        team: 'EVE',
        capturedOn: '2026-11-17',
        enumeratedAt: '2026-11-17T00:00:00Z',
        publication: 'descriptions-and-comments',
        enumeration: {
            includeArchived: true,
            firstIds: ['EVE-1', 'EVE-2', 'EVE-3'],
            independentIds: ['EVE-3', 'EVE-1', 'EVE-2'],
            firstTerminal: true,
            independentTerminal: true,
        },
        issues: [
            issue('EVE-1', 'completed', [], ['EVE-2']),
            issue('EVE-2', 'started', ['EVE-1'], ['EVE-3']),
            issue('EVE-3', 'backlog', ['EVE-2']),
        ],
    };
    const artifacts = { 'docs/architecture/example.md': '# Approved artifact\n' };
    const data = {
        version: 1,
        artifacts: Object.keys(artifacts),
        snapshotHash: fingerprint(JSON.stringify(snapshot)),
        decisions: [],
        sources: decisionSources(snapshot, artifacts).map(({ id, hash }) => ({
            id,
            hash,
            disposition: 'pending-review',
            reason: 'Not yet semantically reviewed; no authority inferred.',
        })),
    };
    return { snapshot, artifacts, data };
};
const decision = () => ({
    id: 'example-direction',
    authority: 'unknown',
    summary: 'A curated public-safe policy summary.',
    timestamp: null,
    scope: ['EVE-1'],
    sources: ['EVE-1/description'],
    implementation: 'Not independently verified.',
    parameters: 'Owner authority requires review.',
    supersededBy: [],
    supersessionNote: 'No supersession established.',
});

test('asymmetric prerequisite graph derives true layers, blockers and unlocks without confusing completion with dependencies', () => {
    const { snapshot } = fixture();
    const graph = buildGraph(snapshot);
    assert.deepEqual(
        graph.nodes.map((node) => [node.id, node.layer, node.state, node.blocked]),
        [
            ['EVE-1', 0, 'COMPLETED', false],
            ['EVE-2', 1, 'CURRENT', false],
            ['EVE-3', 2, 'UPCOMING', true],
        ]
    );
    assert.deepEqual(graph.nodes[1].unlocks, ['EVE-3']);
    assert.deepEqual(graph.nodes[2].blockers, ['EVE-2']);
    snapshot.issues[1].relations.blockedBy = [];
    assert.equal(buildGraph(snapshot).edges.length, 2);
    assert.deepEqual(buildGraph(snapshot).warnings, ['Asymmetric recorded relation: EVE-1 -> EVE-2']);
});

test('rejects dangling and cyclic prerequisites rather than fabricating order', () => {
    const { snapshot } = fixture();
    snapshot.issues[0].relations.blocks.push('EVE-99');
    assert.throws(() => buildGraph(snapshot), /Dangling blocks/);
    snapshot.issues[0].relations.blocks.pop();
    snapshot.issues[2].relations.blocks.push('EVE-1');
    assert.throws(() => buildGraph(snapshot), /Blocking cycle/);
});

test('duplicate closure is not completed implementation and parents do not create prerequisite edges', () => {
    const { snapshot } = fixture();
    snapshot.issues[1].statusType = 'duplicate';
    snapshot.issues[1].relations.duplicateOf = 'EVE-1';
    snapshot.issues[0].parentId = 'EVE-3';
    const graph = buildGraph(snapshot);
    assert.equal(graph.nodes[1].state, 'CLOSED');
    assert.equal(graph.nodes[2].blocked, true);
    assert.deepEqual(graph.nodes[2].blockers, ['EVE-2']);
    assert.equal(graph.edges.length, 2);
});

test('Blocked labels coexist with current status and are not discarded when prerequisites are complete', () => {
    const { snapshot } = fixture();
    snapshot.issues[1].labels = ['Handoff: Blocked'];
    const node = buildGraph(snapshot).nodes[1];
    assert.equal(node.state, 'CURRENT');
    assert.equal(node.blocked, true);
    assert.deepEqual(node.blockers, []);
});

test('curated blockers remove candidates and later status evidence changes planning without rewriting the capture', () => {
    const { snapshot, data, artifacts } = fixture();
    const before = JSON.stringify(snapshot);
    data.annotations = [
        {
            issue: 'EVE-2',
            kind: 'blocker',
            date: '2026-11-17',
            summary: 'Adoption remains blocked pending independently verified component evidence.',
            sources: ['https://linear.app/resnovas/issue/EVE-2#comment-evidence'],
        },
    ];
    let result = renderPlanning(snapshot, data, artifacts);
    assert.equal(result.graph.nodes[1].blocked, true);
    assert.equal(result.graph.nodes[1].state, 'CURRENT');
    assert.match(result.files.get('docs/planning/roadmap/layer-01-01.md'), /CURRENT \/ BLOCKED/);
    assert.doesNotMatch(
        result.files
            .get('docs/planning/roadmap/README.md')
            .split('## Next-step discovery')[1]
            .split('## Navigable layers')[0],
        /EVE-2/
    );
    data.annotations = [
        {
            issue: 'EVE-2',
            kind: 'later-status',
            date: '2026-11-17',
            status: 'Done',
            statusType: 'completed',
            summary: 'Coordinator separately reports verified live completion after snapshot capture.',
            sources: ['https://ampcode.com/threads/T-evidence'],
        },
    ];
    result = renderPlanning(snapshot, data, artifacts);
    assert.equal(result.graph.nodes[1].status, 'In Progress');
    assert.equal(result.graph.nodes[1].state, 'COMPLETED');
    assert.equal(result.graph.nodes[2].blocked, false);
    assert.match(
        result.files.get('docs/planning/roadmap/layer-01-01.md'),
        /captured Linear: In Progress; later-status 2026-11-17/
    );
    assert.equal(JSON.stringify(snapshot), before);
    data.annotations[0].date = '2026-11-16';
    assert.throws(() => renderPlanning(snapshot, data, artifacts), /later-status evidence/);
    data.annotations[0].date = '2026-11-17';
    data.annotations.push(data.annotations[0]);
    assert.throws(() => renderPlanning(snapshot, data, artifacts), /duplicate curated annotation/);
    data.annotations.pop();
    data.annotations[0].sources = [];
    assert.throws(() => renderPlanning(snapshot, data, artifacts), /curated annotation/);
});

test('SVG legend matches hatch, dash and double semantics; unbroken wide titles are bounded without losing accessible titles', () => {
    const { snapshot, data, artifacts } = fixture();
    const title = 'W'.repeat(90);
    snapshot.issues[0].title = title;
    snapshot.issues[1].title = '\u{1f680} Current \u2014 display';
    data.snapshotHash = fingerprint(JSON.stringify(snapshot));
    const { files } = renderPlanning(snapshot, data, artifacts);
    const svg = files.get('docs/planning/roadmap.svg');
    assert.match(svg, /aria-label="BLOCKED: hatched"><rect[^>]+\/><rect[^>]+fill="url\(#blocked-pattern\)"/);
    assert.match(svg, /aria-label="UPCOMING: dashed"><rect[^>]+stroke-dasharray="5 3"/);
    assert.match(svg, /aria-label="CURRENT: double"><rect[^>]+\/><rect[^>]+fill="none"/);
    const node = svg.split('<a id="EVE-1"')[1].split('</a>')[0];
    assert.ok(node.includes(title));
    const titleLines = [...node.matchAll(/font-size="12">([^<]+)<\/text>/g)].map((match) => match[1]);
    assert.ok(titleLines.length === 2 && titleLines.every((line) => line.length <= 23));
    assert.match([...files.values()].join('\n'), /Current - display/);
    assert.doesNotMatch([...files.values()].join('\n'), /[\p{Extended_Pictographic}\u2013\u2014]/u);
    assert.equal(snapshot.issues[1].title, '\u{1f680} Current \u2014 display');
});

test('all-issue views retain full metadata links, stable accessible SVG nodes and safe escaping without source prose', () => {
    const { snapshot, artifacts, data } = fixture();
    const { files } = renderPlanning(snapshot, data, artifacts);
    const svg = files.get('docs/planning/roadmap.svg');
    assert.match(svg, /id="EVE-1"/);
    assert.match(svg, /id="edge-EVE-2-EVE-3"/);
    assert.match(svg, /<svg[^>]+role="group" aria-labelledby="roadmap-title roadmap-desc"/);
    assert.match(svg, /<g role="img" aria-label="BLOCKED: hatched"/);
    assert.match(svg, /<a id="EVE-1"[^>]+tabindex="0" aria-label=/);
    assert.doesNotMatch(svg, /opacity="0\.5"/);
    assert.match(svg, /aria-labelledby="roadmap-title roadmap-desc"/);
    assert.match(svg, /UPCOMING \/ BLOCKED/);
    assert.match(svg, /&lt;safe &amp; useful&gt;/);
    assert.match(svg, /href="https:\/\/linear.app\/resnovas\/issue\/EVE-3"/);
    const all = [...files.values()].join('\n');
    assert.doesNotMatch(all, /Private specification/);
    assert.match(files.get('docs/planning/roadmap/layer-02-01.md'), /EVE-2\.md/);
    assert.match(files.get('docs/planning/roadmap/graph.mmd'), /EVE_2 --> EVE_3/);
    assert.deepEqual([...renderPlanning(snapshot, data, artifacts).files], [...files]);
});

test('rejects incomplete issue enumeration, snapshot status drift and relation drift', () => {
    const { snapshot, data, artifacts } = fixture();
    snapshot.issues[1].status = 'Done';
    assert.throws(() => renderPlanning(snapshot, data, artifacts), /Snapshot changed/);
    data.snapshotHash = fingerprint(JSON.stringify(snapshot));
    snapshot.enumeration.firstIds.push('EVE-4');
    data.snapshotHash = fingerprint(JSON.stringify(snapshot));
    assert.throws(() => renderPlanning(snapshot, data, artifacts), /count or identifier set/);
});

test('every source needs exact review coverage, including new comments and changed governed artifacts', () => {
    const { snapshot, data, artifacts } = fixture();
    data.sources.pop();
    assert.throws(() => validatePlanning(snapshot, data, artifacts), /source omission/);
    data.sources = decisionSources(snapshot, artifacts).map(({ id, hash }) => ({
        id,
        hash,
        disposition: 'pending-review',
        reason: 'Still pending full semantic review.',
    }));
    artifacts['docs/architecture/example.md'] += 'New owner direction.';
    assert.throws(() => validatePlanning(snapshot, data, artifacts), /source drift/);
});

test('source record labeled a decision cannot omit its curated record; invalid authority and invented times fail', () => {
    const { snapshot, data, artifacts } = fixture();
    data.sources.find((source) => source.id === 'EVE-1/description').disposition = 'decision';
    assert.throws(() => validatePlanning(snapshot, data, artifacts), /Decision omission/);
    data.decisions.push(decision());
    validatePlanning(snapshot, data, artifacts);
    data.decisions[0].timestamp = '2026-11-16T00:00:00Z';
    assert.throws(() => validatePlanning(snapshot, data, artifacts), /Invented decision timestamp/);
    data.decisions[0].timestamp = null;
    data.decisions[0].authority = 'auto-approved';
    assert.throws(() => validatePlanning(snapshot, data, artifacts), /authority/);
});

test('unreviewed work differs from genuinely ambiguous evidence and remains visible in the strict queue', () => {
    const { snapshot, data, artifacts } = fixture();
    data.sources[0].disposition = 'ambiguous';
    data.sources[0].reason = 'Conflicting instructions need an owner resolution.';
    const result = renderPlanning(snapshot, data, artifacts);
    assert.equal(result.unresolved, 4);
    assert.match(result.files.get('docs/planning/roadmap/decision-sources.md'), /ambiguous/);
    assert.match(result.files.get('docs/planning/roadmap/decision-sources.md'), /pending-review/);
    assert.match(result.files.get('docs/planning/decisions.md'), /NOT a claim/);
});

test('authored evidence excludes generated content but never ignores changed authored context', () => {
    const a = 'Owner record\n<!-- planning:generated:start -->\nold\n<!-- planning:generated:end -->\nContext';
    assert.equal(authoredArtifact(a), authoredArtifact(a.replace('old', 'new')));
    assert.notEqual(authoredArtifact(a), authoredArtifact(a.replace('Context', 'New context')));
    assert.throws(() => authoredArtifact('<!-- planning:generated:start -->only'), /Malformed/);
});

test('generated updates preserve delivered human checkpoint and later repository context exactly', () => {
    const before = '# Delivered human checkpoint\n\nExact command evidence.  \n\n\n';
    const first = mergePlanning(before, 'Generated v1');
    const withContext = `${first}\n## Human context\nKeep verbatim.\n`;
    const next = mergePlanning(withContext, 'Generated v2');
    assert.ok(next.startsWith(before));
    assert.ok(next.endsWith('\n## Human context\nKeep verbatim.\n'));
    assert.doesNotMatch(next, /Generated v1/);
    assert.throws(() => mergePlanning('<!-- planning:generated:end -->', 'new'), /Malformed/);
});

test('filesystem check is read-only, detects SVG drift and strict review blocks incomplete decision acceptance', () => {
    const { snapshot, data, artifacts } = fixture();
    const scratch = resolve('.amp/in/orb-backup');
    mkdirSync(scratch, { recursive: true });
    const root = mkdtempSync(join(scratch, 'planning-test-'));
    mkdirSync(join(root, 'tools/documentation'), { recursive: true });
    mkdirSync(join(root, 'docs/architecture'), { recursive: true });
    writeFileSync(join(root, 'tools/documentation/linear-snapshot.json'), JSON.stringify(snapshot));
    writeFileSync(join(root, 'tools/documentation/planning-data.json'), JSON.stringify(data));
    for (const [path, text] of Object.entries(artifacts)) writeFileSync(join(root, path), text);
    synchronizePlanning(root);
    assert.deepEqual(synchronizePlanning(root, true).stale, []);
    assert.throws(() => synchronizePlanning(root, true, true), /Decision review incomplete/);
    const svg = join(root, 'docs/planning/roadmap.svg');
    writeFileSync(svg, 'bad SVG');
    assert.deepEqual(synchronizePlanning(root, true).stale, ['docs/planning/roadmap.svg']);
    assert.equal(readFileSync(svg, 'utf8'), 'bad SVG');
});
