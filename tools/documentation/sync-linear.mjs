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

/** Follow every connection to a terminal page and reject loops or missing cursor evidence. */
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

/** Acquire only read queries, with independent issue enumeration and complete nested connection pagination. */
export const acquire = async (query, capturedOn) => {
    const enumerate = async (order, first) =>
        paginate(
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
    const records = first.pages.map((page) => ({
        kind: 'issue-page',
        page: {
            issues: page.nodes.map((node) => ({ id: node.identifier })),
            hasNextPage: page.pageInfo.hasNextPage,
            cursor: page.pageInfo.endCursor,
        },
    }));
    records.push({
        kind: 'issue-enumeration',
        pages: records.map((record) => record.page),
        acquiredAt: new Date().toISOString(),
    });
    records.push({
        kind: 'independent-count',
        ids: independent.nodes.map((node) => node.identifier),
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
        const connection = async (field, selection) =>
            paginate(
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
            relations[key] = [...new Map(relations[key].map((entry) => [entry.id, entry])).values()];
        records.push({
            kind: 'issue-detail',
            issue: {
                id: value.identifier,
                title: value.title,
                description: value.description,
                status: value.state.name,
                statusType: value.state.type,
                priority: { value: value.priority, name: value.priorityLabel },
                labels: labels.nodes.map((label) => label.name),
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
                comments: comments.nodes.map((comment) => ({
                    ...comment,
                    author: comment.user ?? comment.externalUser,
                    attachments: [],
                })),
            },
        });
    }
    return normalizeAcquisition(records, capturedOn);
};

/** Retain MCP-only attachment context without pretending the GraphQL schema can revalidate it. */
export const preserveAttachmentContext = (snapshot, prior) => ({
    ...snapshot,
    issues: snapshot.issues.map((issue) => {
        const previous = prior.issues.find((candidate) => candidate.id === issue.id);
        return {
            ...issue,
            comments: issue.comments.map((comment) => {
                const captured = previous?.comments.find((candidate) => candidate.id === comment.id);
                if (!captured?.attachments.length) return comment;
                // An edited source cannot inherit enrichment whose current accuracy is inaccessible here.
                if (captured.body !== comment.body || captured.updatedAt !== comment.updatedAt)
                    throw new Error(
                        `Attachment context needs MCP reacquisition for ${issue.id} comment ${comment.id}; no files changed`
                    );
                return { ...comment, attachments: [...captured.attachments] };
            }),
        };
    }),
});

/** Never expose response bodies, GraphQL errors or credentials in logs on an acquisition failure. */
export const graphqlRequest =
    (authorization, fetcher = fetch) =>
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
    // Preflight generated markers/removals before changing the normalized snapshot or any page.
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
