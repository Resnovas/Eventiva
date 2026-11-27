/**
 * @file tools/documentation/planning.mjs
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
import { validateSnapshot } from './linear-mirror.mjs';

const start = '<!-- planning:generated:start -->';
const end = '<!-- planning:generated:end -->';
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
 * Deduplicate identifiers and copy them into numeric issue order.
 *
 * @param {string[]} values - EVE identifiers, possibly repeated.
 * @returns {string[]} A new array of distinct identifiers sorted by issue number.
 */
const sorted = (values) => [...new Set(values)].sort(order);
/**
 * Map one XML-reserved character to its entity.
 *
 * @param {string} c - One of `&`, `<`, `>`, `"` or `'`.
 * @returns {string} The matching XML entity.
 */
const xmlEntity = (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c];
/**
 * Escape a value for XML text and attribute content.
 *
 * @param {unknown} value - The value to escape; it is converted to a string first.
 * @returns {string} The value with XML-reserved characters replaced by entities.
 */
const xml = (value) => String(value).replace(/[&<>"']/g, xmlEntity);
/**
 * Escape a value for one Markdown table cell, flattening line breaks and neutralizing pipes and link brackets.
 *
 * @param {unknown} value - The value to escape.
 * @returns {string} Single-line text that cannot break the table or form a link.
 */
const md = (value) =>
    xml(value)
        .replace(/[\r\n]/g, ' ')
        .replace(/\|/g, '&#124;')
        .replace(/\[/g, '&#91;')
        .replace(/\]/g, '&#93;');
/**
 * Render one issue identifier as a link to its mirrored page.
 *
 * @param {string} id - An EVE identifier, such as `EVE-9`.
 * @param {string} [prefix] - The relative path to the issue pages; defaults to `../issues/`.
 * @returns {string} A Markdown link to the issue's page.
 */
const link = (id, prefix = '../issues/') => `[${id}](${prefix}${id}.md)`;
/**
 * Render a list of issues as comma-separated page links.
 *
 * @param {string[]} values - EVE identifiers.
 * @param {string} [prefix] - The relative path to the issue pages; the default of `link` applies when omitted.
 * @returns {string} The joined links, or `None recorded` for an empty list.
 */
const links = (values, prefix) =>
    values
        .map(
            /**
             * Link one issue with the shared prefix.
             *
             * @param {string} id - An EVE identifier.
             * @returns {string} Its Markdown link.
             */
            (id) => link(id, prefix)
        )
        .join(', ') || 'None recorded';
/**
 * Decide whether an issue is closed, preferring a curated later status over the captured one.
 *
 * @param {{ statusType: string, effectiveStatusType?: string }} issue - One mirrored or graph issue.
 * @returns {boolean} Whether the issue is completed, canceled or a duplicate.
 */
const terminal = (issue) =>
    ['completed', 'canceled', 'cancelled', 'duplicate'].includes(issue.effectiveStatusType ?? issue.statusType);

/**
 * Render one evidence URL as a Markdown link.
 *
 * @param {string} url - A cited source URL.
 * @returns {string} An `[evidence](url)` link.
 */
const evidenceLink = (url) => `[evidence](${url})`;
/**
 * Detect a curated adoption-blocker annotation.
 *
 * @param {{ kind: string }} entry - One curated annotation.
 * @returns {boolean} Whether the annotation is a blocker.
 */
const isBlocker = (entry) => entry.kind === 'blocker';
/**
 * Render one curated annotation as a suffix of a roadmap table cell.
 *
 * @param {{ kind: string, date: string, summary: string, sources: string[] }} entry - One curated annotation.
 * @returns {string} The kind, date, escaped summary and evidence links.
 */
const annotationCell = (entry) =>
    `; ${entry.kind} ${entry.date}: ${md(entry.summary)} ${entry.sources.map(evidenceLink).join(', ')}`;
/**
 * Link a graph node to its mirrored issue page.
 *
 * @param {{ id: string }} node - One graph node.
 * @returns {string} The node's Markdown issue link.
 */
const nodeLink = (node) => link(node.id);
/**
 * Render one curated annotation as a suffix of a Mermaid node label.
 *
 * @param {{ kind: string, date: string }} entry - One curated annotation.
 * @returns {string} The annotation kind and date.
 */
const mermaidAnnotation = (entry) => ` | ${entry.kind} ${entry.date}`;
/**
 * Link a decision identifier to its heading on the same page.
 *
 * @param {string} id - A decision record identifier.
 * @returns {string} A Markdown anchor link.
 */
const anchorLink = (id) => `[${id}](#${id})`;

/**
 * Normalize decorative source punctuation only in authored displays; the authorized mirror retains the exact title.
 *
 * @param {string} value - Generated display text.
 * @returns {string} The text without emoji or variation selectors and with en and em dashes replaced by hyphens.
 */
const displayText = (value) =>
    value
        .replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}|\u200d|\ufe0f|\u20e3/gu, '')
        .replace(/[\u2013\u2014]/g, '-');

/**
 * Hash exact source bytes; normalization would hide edited decision evidence.
 *
 * @param {string} value - The exact source text.
 * @returns {string} The lower-case hexadecimal SHA-256 digest.
 * @since 0.0.1
 * @example
 * const hash = fingerprint(issue.description ?? '');
 */
export const fingerprint = (value) => createHash('sha256').update(value).digest('hex');

/**
 * Ignore only well-formed generated planning regions when fingerprinting repository evidence, preventing self-invalidating output.
 * Unbalanced or misordered markers raise an error.
 *
 * @param {string} value - A repository artifact's text.
 * @returns {string} The text with its single generated region removed, or unchanged when it has none.
 * @since 0.0.1
 * @example
 * const authored = authoredArtifact(readFileSync('docs/planning/timeline.md', 'utf8'));
 */
export const authoredArtifact = (value) => {
    const starts = value.split(start).length - 1;
    const ends = value.split(end).length - 1;
    if (!starts && !ends) return value;
    if (starts !== 1 || ends !== 1 || value.indexOf(start) > value.indexOf(end))
        throw new Error('Malformed evidence markers');
    return value.slice(0, value.indexOf(start)) + value.slice(value.indexOf(end) + end.length);
};

/**
 * Inventory every mirrored description/comment and each explicitly governed repository artifact, not keyword-selected candidates.
 *
 * @param {{ issues: object[] }} snapshot - The validated Linear snapshot.
 * @param {Record<string, string>} artifacts - Governed repository artifact text keyed by repository-relative path.
 * @returns {{ id: string, issue: string | null, timestamp: string | null, author: string, url: string, hash: string }[]} One source record per description, comment and artifact, sorted by identifier.
 * @since 0.0.1
 * @example
 * const sources = decisionSources(snapshot, { 'docs/architecture/overview.md': text });
 */
export const decisionSources = (snapshot, artifacts) => {
    const sources = snapshot.issues.flatMap(
        /**
         * Describe one issue's description and comments as source records.
         *
         * @param {{ id: string, url: string, description?: string, comments: object[] }} issue - One mirrored issue.
         * @returns {object[]} The description record followed by one record per comment.
         */
        (issue) => [
            {
                id: `${issue.id}/description`,
                issue: issue.id,
                timestamp: null,
                author: 'Unavailable in snapshot',
                url: issue.url,
                hash: fingerprint(issue.description ?? ''),
            },
            ...issue.comments.map(
                /**
                 * Describe one comment as a source record.
                 *
                 * @param {{ id: string, createdAt: string, author?: string }} comment - One mirrored comment.
                 * @returns {object} The comment's source record, hashed over its full JSON.
                 */
                (comment) => ({
                    id: `${issue.id}/${comment.id}`,
                    issue: issue.id,
                    timestamp: comment.createdAt,
                    author: comment.author ?? 'Unavailable',
                    url: `${issue.url}#comment-${comment.id}`,
                    hash: fingerprint(JSON.stringify(comment)),
                })
            ),
        ]
    );
    for (const [path, text] of Object.entries(artifacts))
        sources.push({
            id: path,
            issue: null,
            timestamp: null,
            author: 'Repository artifact',
            url: `../../${path}`,
            hash: fingerprint(authoredArtifact(text)),
        });
    return sources.sort(
        /**
         * Order source records by identifier, independent of locale.
         *
         * @param {{ id: string }} a - The first source record.
         * @param {{ id: string }} b - The second source record.
         * @returns {number} The identifier comparison result.
         */
        (a, b) => lexical(a.id, b.id)
    );
};

/**
 * Derive one acyclic prerequisite graph from both relation directions; relation asymmetry is retained as a warning, never dropped.
 * Invalid annotations, dangling or self relations and blocking cycles raise an error.
 *
 * @param {{ issues: object[], enumeratedAt?: string, capturedOn: string }} snapshot - The Linear snapshot; it is validated first.
 * @param {object[]} [annotations] - Curated blocker and later-status annotations; defaults to none.
 * @returns {{ nodes: object[], edges: [string, string][], warnings: string[] }} Nodes in layer order with planning state, prerequisite edges, and relation warnings.
 * @since 0.0.1
 * @example
 * const { nodes, edges, warnings } = buildGraph(snapshot, data.annotations);
 */
export const buildGraph = (snapshot, annotations = []) => {
    validateSnapshot(snapshot);
    const nodes = new Map(
        snapshot.issues.map(
            /**
             * Copy an issue into a graph node with empty edge lists.
             *
             * @param {{ id: string }} issue - One mirrored issue.
             * @returns {[string, object]} The issue identifier and its new node.
             */
            (issue) => [issue.id, { ...issue, prerequisites: [], unlocks: [] }]
        )
    );
    const seen = new Set();
    for (const annotation of annotations) {
        const node = nodes.get(annotation.issue);
        const key = `${annotation.issue}/${annotation.kind}`;
        if (
            !node ||
            seen.has(key) ||
            !['blocker', 'later-status'].includes(annotation.kind) ||
            !/^\d{4}-\d{2}-\d{2}(?:T.*Z)?$/.test(annotation.date) ||
            !Number.isFinite(Date.parse(annotation.date)) ||
            typeof annotation.summary !== 'string' ||
            annotation.summary.trim().length < 20 ||
            !Array.isArray(annotation.sources) ||
            !annotation.sources.length ||
            annotation.sources.some(
                /**
                 * Reject a source outside the accepted evidence hosts.
                 *
                 * @param {string} source - One cited source URL.
                 * @returns {boolean} Whether the URL is not on Linear, Amp or GitHub.
                 */
                (source) => !/^https:\/\/(?:linear\.app|ampcode\.com|github\.com)\//.test(source)
            )
        )
            throw new Error(`Invalid or duplicate curated annotation: ${key}`);
        if (annotation.kind === 'later-status') {
            if (
                !['completed', 'started', 'backlog', 'unstarted', 'canceled', 'cancelled', 'duplicate'].includes(
                    annotation.statusType
                ) ||
                typeof annotation.status !== 'string' ||
                !annotation.status.trim() ||
                annotation.date.slice(0, 10) < (snapshot.enumeratedAt ?? snapshot.capturedOn).slice(0, 10)
            )
                throw new Error(`Invalid later-status evidence: ${key}`);
            node.effectiveStatusType = annotation.statusType;
        }
        node.annotations ??= [];
        node.annotations.push(annotation);
        seen.add(key);
    }
    const edges = new Map();
    const warnings = [];
    for (const issue of nodes.values()) {
        for (const [kind, values] of Object.entries(issue.relations)) {
            for (const id of kind === 'duplicateOf' ? (values ? [values] : []) : values) {
                if (!nodes.has(id)) throw new Error(`Dangling ${kind}: ${issue.id} -> ${id}`);
                if (id === issue.id) throw new Error(`Self relation: ${id}`);
            }
        }
        if (issue.parentId && !nodes.has(issue.parentId)) throw new Error(`Dangling parent: ${issue.id}`);
        for (const id of issue.relations.blocks) edges.set(`${issue.id}:${id}`, [issue.id, id]);
        for (const id of issue.relations.blockedBy) edges.set(`${id}:${issue.id}`, [id, issue.id]);
    }
    for (const [from, to] of edges.values()) {
        nodes.get(from).unlocks.push(to);
        nodes.get(to).prerequisites.push(from);
        if (!nodes.get(from).relations.blocks.includes(to) || !nodes.get(to).relations.blockedBy.includes(from))
            warnings.push(`Asymmetric recorded relation: ${from} -> ${to}`);
    }
    const visiting = [];
    /**
     * Compute an issue's dependency layer as its longest prerequisite distance, memoized on the node.
     * A prerequisite cycle raises an error naming the cycle.
     *
     * @param {string} id - An EVE identifier in the graph.
     * @returns {number} Zero for an issue without prerequisites, otherwise one more than its deepest prerequisite.
     */
    const layer = (id) => {
        const node = nodes.get(id);
        if (node.layer !== undefined) return node.layer;
        if (visiting.includes(id)) throw new Error(`Blocking cycle: ${[...visiting, id].join(' -> ')}`);
        visiting.push(id);
        node.layer = Math.max(-1, ...node.prerequisites.map(layer)) + 1;
        visiting.pop();
        return node.layer;
    };
    for (const node of nodes.values()) {
        layer(node.id);
        node.prerequisites = sorted(node.prerequisites);
        node.unlocks = sorted(node.unlocks);
        node.blockers = node.prerequisites.filter(
            /**
             * Keep prerequisites that are not yet completed.
             *
             * @param {string} id - One prerequisite identifier.
             * @returns {boolean} Whether the prerequisite still blocks the node.
             */
            (id) => {
                const prerequisite = nodes.get(id);
                return (prerequisite.effectiveStatusType ?? prerequisite.statusType) !== 'completed';
            }
        );
        node.labelBlocked = node.labels.some(
            /**
             * Detect a label that marks the issue as blocked.
             *
             * @param {string} label - One Linear label name.
             * @returns {boolean} Whether the label contains the word blocked.
             */
            (label) => /\bblocked\b/i.test(label)
        );
        node.state = terminal(node)
            ? (node.effectiveStatusType ?? node.statusType) === 'completed'
                ? 'COMPLETED'
                : 'CLOSED'
            : (node.effectiveStatusType ?? node.statusType) === 'started'
              ? 'CURRENT'
              : 'UPCOMING';
        node.blocked =
            !terminal(node) && !!(node.blockers.length > 0 || node.labelBlocked || node.annotations?.some(isBlocker));
        node.phase = node.title.match(/^(P\d+(?:\.\d+)?|F\d+(?:\.\d+)?)/)?.[1] ?? 'No numbered phase recorded';
    }
    return {
        nodes: [...nodes.values()].sort(
            /**
             * Order nodes by layer, then by issue number.
             *
             * @param {{ layer: number, id: string }} a - The first node.
             * @param {{ layer: number, id: string }} b - The second node.
             * @returns {number} The comparison result.
             */
            (a, b) => a.layer - b.layer || order(a.id, b.id)
        ),
        edges: [...edges.values()].sort(
            /**
             * Order edges by prerequisite, then by dependent issue number.
             *
             * @param {[string, string]} a - The first edge.
             * @param {[string, string]} b - The second edge.
             * @returns {number} The comparison result.
             */
            (a, b) => order(a[0], b[0]) || order(a[1], b[1])
        ),
        warnings,
    };
};

/**
 * Reject silent evidence changes and invented source/decision identifiers; unresolved review is explicit and separately strict-gated.
 * Any drift, omission, duplicate or invalid record raises an error naming it.
 *
 * @param {{ issues: object[] }} snapshot - The Linear snapshot the planning data was reviewed against.
 * @param {{ version: number, snapshotHash: string, sources: object[], decisions: object[] }} data - The curated planning review data.
 * @param {Record<string, string>} artifacts - Governed repository artifact text keyed by repository-relative path.
 * @returns {{ sources: object[], unresolved: object[] }} Every inventoried source and the reviews still pending or ambiguous.
 * @since 0.0.1
 * @example
 * const { sources, unresolved } = validatePlanning(snapshot, data, artifacts);
 */
export const validatePlanning = (snapshot, data, artifacts) => {
    if (data.version !== 1 || !Array.isArray(data.decisions) || !Array.isArray(data.sources))
        throw new Error('Unsupported planning data');
    if (data.snapshotHash !== fingerprint(JSON.stringify(snapshot)))
        throw new Error('Snapshot changed: reconcile planning source review before regeneration');
    const sources = decisionSources(snapshot, artifacts);
    const expected = new Map(
        sources.map(
            /**
             * Key a source record by its identifier.
             *
             * @param {{ id: string }} source - One inventoried source record.
             * @returns {[string, object]} The identifier and the record.
             */
            (source) => [source.id, source]
        )
    );
    const reviews = new Map();
    for (const source of data.sources) {
        if (reviews.has(source.id) || !expected.has(source.id))
            throw new Error(`Duplicate or unknown review source: ${source.id}`);
        if (source.hash !== expected.get(source.id).hash) throw new Error(`Decision source drift: ${source.id}`);
        if (
            !['decision', 'evidence', 'pending-review', 'ambiguous'].includes(source.disposition) ||
            typeof source.reason !== 'string' ||
            source.reason.length < 20
        )
            throw new Error(`Missing meaningful source review: ${source.id}`);
        reviews.set(source.id, source);
    }
    if (reviews.size !== expected.size)
        throw new Error(
            'Decision source omission: every description, comment and governed artifact needs a review record'
        );
    const decisions = new Map();
    for (const decision of data.decisions) {
        if (!/^[a-z][a-z0-9-]+$/.test(decision.id) || decisions.has(decision.id))
            throw new Error(`Invalid or duplicate decision: ${decision.id}`);
        if (
            !['recorded-owner-direction', 'proposal', 'settled-requirement', 'conflicting', 'unknown'].includes(
                decision.authority
            )
        )
            throw new Error(`Invalid decision authority: ${decision.id}`);
        if (
            !decision.sources.length ||
            decision.sources.some(
                /**
                 * Detect evidence that is not an inventoried source.
                 *
                 * @param {string} id - One cited source identifier.
                 * @returns {boolean} Whether the source is unknown.
                 */
                (id) => !expected.has(id)
            )
        )
            throw new Error(`Missing decision evidence: ${decision.id}`);
        if (
            !decision.scope.length ||
            decision.scope.some(
                /**
                 * Detect a scoped issue that is not in the snapshot.
                 *
                 * @param {string} id - One scoped EVE identifier.
                 * @returns {boolean} Whether no mirrored issue has that identifier.
                 */
                (id) =>
                    !snapshot.issues.some(
                        /**
                         * Match the mirrored issue with the scoped identifier.
                         *
                         * @param {{ id: string }} issue - One mirrored issue.
                         * @returns {boolean} Whether it is the scoped issue.
                         */
                        (issue) => issue.id === id
                    )
            )
        )
            throw new Error(`Unknown decision scope: ${decision.id}`);
        for (const key of ['summary', 'implementation', 'parameters', 'supersessionNote'])
            if (typeof decision[key] !== 'string' || !decision[key].trim())
                throw new Error(`Missing ${key}: ${decision.id}`);
        if (!Array.isArray(decision.supersededBy)) throw new Error(`Missing supersession state: ${decision.id}`);
        const times = decision.sources
            .map(
                /**
                 * Read a cited source's timestamp.
                 *
                 * @param {string} id - One cited source identifier.
                 * @returns {string | null} The source timestamp, or null when unknown.
                 */
                (id) => expected.get(id).timestamp
            )
            .filter(Boolean);
        if (decision.timestamp !== null && !times.includes(decision.timestamp))
            throw new Error(`Invented decision timestamp: ${decision.id}`);
        decisions.set(decision.id, decision);
    }
    for (const decision of decisions.values())
        for (const id of decision.supersededBy)
            if (!decisions.has(id) || id === decision.id)
                throw new Error(`Invalid supersession: ${decision.id} -> ${id}`);
    for (const source of reviews.values())
        if (
            source.disposition === 'decision' &&
            !data.decisions.some(
                /**
                 * Detect a decision record citing the source.
                 *
                 * @param {{ sources: string[] }} decision - One curated decision record.
                 * @returns {boolean} Whether the record cites the source.
                 */
                (decision) => decision.sources.includes(source.id)
            )
        )
            throw new Error(`Decision omission: ${source.id}`);
    return {
        sources,
        unresolved: data.sources.filter(
            /**
             * Keep reviews that are still pending or ambiguous.
             *
             * @param {{ disposition: string }} source - One source review record.
             * @returns {boolean} Whether the review is unresolved.
             */
            (source) => ['pending-review', 'ambiguous'].includes(source.disposition)
        ),
    };
};

/**
 * Preserve repository-authored context outside a single generated region; malformed markers cannot consume prose.
 * Unbalanced or misordered markers raise an error.
 *
 * @param {string | null} current - The existing document, or null when it does not exist yet.
 * @param {string} generated - The freshly generated content for the region.
 * @returns {string} The document with its generated region replaced, appended or created.
 * @since 0.0.1
 * @example
 * const next = mergePlanning(readFileSync('docs/planning/timeline.md', 'utf8'), generated);
 */
export const mergePlanning = (current, generated) => {
    const region = `${start}\n${generated.trim()}\n${end}`;
    if (current === null) return `${region}\n`;
    const starts = current.split(start).length - 1;
    const ends = current.split(end).length - 1;
    if (starts === 0 && ends === 0) return `${current}${current.endsWith('\n') ? '\n' : '\n\n'}${region}\n`;
    if (starts !== 1 || ends !== 1 || current.indexOf(start) > current.indexOf(end))
        throw new Error('Malformed planning markers');
    return current.slice(0, current.indexOf(start)) + region + current.slice(current.indexOf(end) + end.length);
};

const palette = {
    COMPLETED: ['#d1fae5', '#065f46', 'solid'],
    CURRENT: ['#dbeafe', '#1e40af', 'double'],
    UPCOMING: ['#f1f5f9', '#334155', 'dashed'],
    CLOSED: ['#ede9fe', '#5b21b6', 'dashed'],
    BLOCKED: ['#fef3c7', '#78350f', 'hatched'],
};
/**
 * Render a node's planning state, adding the blocked signal when it applies.
 *
 * @param {{ state: string, blocked: boolean }} node - One graph node.
 * @returns {string} The state, such as `CURRENT / BLOCKED`.
 */
const stateText = (node) => `${node.state}${node.blocked ? ' / BLOCKED' : ''}`;
/**
 * Name one roadmap detail page by its layer and zero-based group.
 *
 * @param {number} layer - The dependency layer.
 * @param {number} part - The zero-based group index within the layer.
 * @returns {string} A zero-padded name such as `layer-03-01`.
 */
const partName = (layer, part) => `layer-${String(layer).padStart(2, '0')}-${String(part + 1).padStart(2, '0')}`;

/**
 * Render dependency columns without a layout service, unstable font metrics or external resources. Labels and patterns duplicate color meaning.
 *
 * @param {{ nodes: object[], edges: [string, string][] }} graph - The nodes to draw and the edges between them; edges to undrawn nodes are skipped.
 * @param {string} title - The accessible SVG title.
 * @param {boolean} [compact] - Draw one column with a two-column legend for a detail page; defaults to false.
 * @returns {string} The complete SVG document, ending with a newline.
 * @since 0.0.1
 * @example
 * const svg = renderSvg(buildGraph(snapshot), 'All mirrored EVE issues and prerequisite edges');
 */
export const renderSvg = (graph, title, compact = false) => {
    const rowHeight = 106;
    const columnWidth = 356;
    const columns = [
        ...new Set(
            graph.nodes.map(
                /**
                 * Read a node's dependency layer.
                 *
                 * @param {{ layer: number }} node - One graph node.
                 * @returns {number} Its layer.
                 */
                (node) => node.layer
            )
        ),
    ];
    const positions = new Map();
    const counts = new Map();
    for (const node of graph.nodes) {
        const column = compact ? 0 : columns.indexOf(node.layer);
        const row = counts.get(column) ?? 0;
        counts.set(column, row + 1);
        positions.set(node.id, { x: 24 + column * columnWidth, y: 156 + row * rowHeight });
    }
    const width = (compact ? 1 : Math.max(1, columns.length)) * columnWidth + 24;
    const height = 180 + Math.max(1, ...counts.values()) * rowHeight;
    const output = [
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="roadmap-title roadmap-desc">`,
        `<title id="roadmap-title">${xml(title)}</title>`,
        `<desc id="roadmap-desc">Prerequisite arrows point toward dependent issues. Layers are derived, not approved dates. Labels and border patterns distinguish completed, current, upcoming, closed and blocked work. Every node links to its live issue; Markdown provides full titles, prerequisites and unlocks.</desc>`,
        '<defs><pattern id="blocked-pattern" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0" stroke="#78350f" stroke-width="1"/></pattern><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#64748b"/></marker></defs>',
        '<style>text{font-family:system-ui,sans-serif;fill:#0f172a}a:focus rect{stroke:#0f172a;stroke-width:5}a:focus{outline:3px solid #0f172a}</style>',
        `<rect width="100%" height="100%" fill="#fff"/><text x="24" y="30" font-size="18" font-weight="700">${xml(compact ? 'Eventiva roadmap detail' : 'Eventiva dependency roadmap')}</text><text x="24" y="54" font-size="12">Derived layers; not deadlines or acceptance.</text>`,
    ];
    const legendY = 78;
    for (const [state, [fill, stroke, pattern]] of Object.entries(palette)) {
        const index = Object.keys(palette).indexOf(state);
        const x = compact ? 24 + (index % 2) * 170 : 24 + index * 260;
        const y = compact ? legendY + Math.floor(index / 2) * 20 : legendY;
        output.push(
            `<g role="img" aria-label="${state}: ${pattern}"><rect x="${x}" y="${y - 11}" width="16" height="12" fill="${fill}" stroke="${stroke}"${pattern === 'dashed' ? ' stroke-dasharray="5 3"' : ''}/>${pattern === 'hatched' ? `<rect x="${x}" y="${y - 11}" width="16" height="12" fill="url(#blocked-pattern)"/>` : ''}${pattern === 'double' ? `<rect x="${x + 3}" y="${y - 8}" width="10" height="6" fill="none" stroke="${stroke}"/>` : ''}<text x="${x + 22}" y="${y}" font-size="11">${state} (${pattern})</text></g>`
        );
    }
    output.push(
        `<text x="24" y="${compact ? 140 : 104}" font-size="10">Blocked overrides fill/border; current keeps double.</text>`
    );
    if (!compact)
        for (const column of columns)
            output.push(
                `<text x="${24 + columns.indexOf(column) * columnWidth}" y="132" font-size="14" font-weight="700">Dependency layer ${column}</text>`
            );
    for (const [from, to] of graph.edges) {
        if (!positions.has(from) || !positions.has(to)) continue;
        const a = positions.get(from),
            b = positions.get(to);
        output.push(
            `<path id="edge-${from}-${to}" d="M${a.x + 320} ${a.y + 43} C${a.x + 344} ${a.y + 43} ${b.x - 20} ${b.y + 43} ${b.x} ${b.y + 43}" fill="none" stroke="#64748b" stroke-width="1" marker-end="url(#arrow)"><title>${from} precedes ${to}</title></path>`
        );
    }
    for (const node of graph.nodes) {
        const { x, y } = positions.get(node.id);
        const [fill, stroke] = palette[node.blocked ? 'BLOCKED' : node.state];
        const words = displayText(node.title)
            .split(/\s+/)
            .flatMap(
                /**
                 * Split an overlong word into chunks that fit one label line.
                 *
                 * @param {string} word - One word of the title.
                 * @returns {string[]} Chunks of at most 23 characters.
                 */
                (word) => word.match(/.{1,23}/gu) ?? []
            );
        const lines = [''];
        for (const word of words) {
            if ((lines.at(-1) + word).length > 23 && lines.at(-1)) lines.push('');
            lines[lines.length - 1] += `${word} `;
        }
        const evidence = (node.annotations ?? [])
            .map(
                /**
                 * Describe one curated annotation for the node's accessible label.
                 *
                 * @param {{ date: string, kind: string, summary: string, sources: string[] }} entry - One curated annotation.
                 * @returns {string} The date, kind, summary and sources as a sentence.
                 */
                (entry) => `${entry.date}: ${entry.kind}: ${entry.summary} Sources: ${entry.sources.join(', ')}.`
            )
            .join(' ');
        const label = `${node.id}: ${displayText(node.title)}. ${stateText(node)}. Captured Linear: ${node.status}. ${evidence} ${node.prerequisites.length} prerequisites; ${node.unlocks.length} unlocks. Layer ${node.layer}.`;
        output.push(
            `<a id="${node.id}" href="${xml(node.url)}" xlink:href="${xml(node.url)}" tabindex="0" aria-label="${xml(label)}"><title>${xml(label)}</title><rect x="${x}" y="${y}" width="320" height="94" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="2"${['UPCOMING', 'CLOSED'].includes(node.state) && !node.blocked ? ' stroke-dasharray="5 3"' : ''}/>`
        );
        if (node.blocked)
            output.push(`<rect x="${x + 308}" y="${y + 1}" width="10" height="92" fill="url(#blocked-pattern)"/>`);
        if (node.state === 'CURRENT')
            output.push(
                `<rect x="${x + 4}" y="${y + 4}" width="300" height="86" rx="3" fill="none" stroke="${stroke}"/>`
            );
        output.push(
            `<text x="${x + 10}" y="${y + 18}" font-size="12" font-weight="700">${node.id} | ${stateText(node)}</text>`
        );
        for (const [index, line] of lines.slice(0, 2).entries())
            output.push(
                `<text x="${x + 10}" y="${y + 37 + index * 16}" font-size="12">${xml(index === 1 && lines.length > 2 ? `${line.trim().slice(0, 20)}...` : line.trim())}</text>`
            );
        output.push(
            `<text x="${x + 10}" y="${y + 75}" font-size="11">Prerequisites ${node.prerequisites.length} | Unlocks ${node.unlocks.length} | L${node.layer}</text></a>`
        );
    }
    output.push('</svg>');
    return `${output.join('\n')}\n`;
};

/**
 * Generate every presentation from the validated snapshot plus curated review model; raw comment/description text is never copied.
 *
 * @param {{ issues: object[], enumeratedAt?: string }} snapshot - The Linear snapshot.
 * @param {{ annotations?: object[], decisions: object[], sources: object[] }} data - The curated planning review data.
 * @param {Record<string, string>} artifacts - Governed repository artifact text keyed by repository-relative path.
 * @returns {{ files: Map<string, string>, graph: object, unresolved: number }} Generated content by repository path, the graph, and the unresolved review count.
 * @since 0.0.1
 * @example
 * const { files, unresolved } = renderPlanning(snapshot, data, artifacts);
 */
export const renderPlanning = (snapshot, data, artifacts) => {
    const review = validatePlanning(snapshot, data, artifacts);
    const graph = buildGraph(snapshot, data.annotations);
    const files = new Map();
    const pages = [];
    for (const layer of [
        ...new Set(
            graph.nodes.map(
                /**
                 * Read a node's dependency layer.
                 *
                 * @param {{ layer: number }} node - One graph node.
                 * @returns {number} Its layer.
                 */
                (node) => node.layer
            )
        ),
    ]) {
        const nodes = graph.nodes.filter(
            /**
             * Keep nodes in the current layer.
             *
             * @param {{ layer: number }} node - One graph node.
             * @returns {boolean} Whether the node is in the layer.
             */
            (node) => node.layer === layer
        );
        for (let offset = 0; offset < nodes.length; offset += 12) {
            const group = nodes.slice(offset, offset + 12);
            const name = partName(layer, offset / 12);
            pages.push({ name, layer, nodes: group });
            const rows = group
                .map(
                    /**
                     * Render one issue as a row of the layer detail table.
                     *
                     * @param {object} node - One graph node in the group.
                     * @returns {string} The Markdown table row.
                     */
                    (node) =>
                        `| ${link(node.id)} ${md(node.title)} | **${stateText(node)}**; captured Linear: ${md(node.status)}${(node.annotations ?? []).map(annotationCell).join('')} | ${md(node.phase)}; ${md(node.project ?? 'No project')} | ${links(node.prerequisites)} | ${links(node.blockers)}${node.labelBlocked ? '; Blocked label recorded' : ''}${node.annotations?.some(isBlocker) ? '; Curated adoption blocker: see cited state evidence' : ''} | ${links(node.unlocks)} | ${node.parentId ? link(node.parentId) : 'None recorded'} |`
                )
                .join('\n');
            files.set(
                `docs/planning/roadmap/${name}.md`,
                `# Layer ${layer}, group ${offset / 12 + 1}\n\n[All layers](README.md) | [Full Mermaid](graph.mmd) | [Full SVG](../roadmap.svg)\n\nEach row links to the complete mirrored specification/discussion. BLOCKED is an additional planning signal, not a replacement Linear status. Closed duplicates are not completed implementation. Related/duplicate relations remain in the issue page. Parent membership is not a dependency.\n\n![Layer ${layer} issue states](${name}.svg)\n\n| Issue / source specification | Planning / Linear state | Recorded phase / project | All prerequisites | Open prerequisite blockers | Unlocks / precedes | Parent |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n${rows}\n`
            );
            files.set(
                `docs/planning/roadmap/${name}.svg`,
                renderSvg(
                    { nodes: group, edges: graph.edges },
                    `Eventiva layer ${layer}, group ${offset / 12 + 1}`,
                    true
                )
            );
        }
    }
    const counts = Object.fromEntries(
        Object.keys(palette).map(
            /**
             * Count the nodes shown in one legend state.
             *
             * @param {string} state - A palette state name.
             * @returns {[string, number]} The state and its node count.
             */
            (state) => [
                state,
                graph.nodes.filter(
                    /**
                     * Match nodes in the state; `BLOCKED` counts blocked nodes in any base state.
                     *
                     * @param {{ state: string, blocked: boolean }} node - One graph node.
                     * @returns {boolean} Whether the node counts toward the state.
                     */
                    (node) => (state === 'BLOCKED' ? node.blocked : node.state === state)
                ).length,
            ]
        )
    );
    const annotationNotes = (data.annotations ?? [])
        .map(
            /**
             * Render one curated annotation as a list item.
             *
             * @param {{ issue: string, date: string, kind: string, summary: string, sources: string[] }} entry - One curated annotation.
             * @returns {string} The Markdown list item with evidence links.
             */
            (entry) =>
                `- ${entry.issue}, ${entry.date}, ${entry.kind}: ${entry.summary} ${entry.sources.map(evidenceLink).join(', ')}.`
        )
        .join('\n');
    const intro = `Snapshot enumeration: ${snapshot.enumeratedAt ?? 'unavailable'}; ${graph.nodes.length} issues, ${graph.edges.length} prerequisite edges. Planning counts after explicitly cited annotations: completed ${counts.COMPLETED}; current ${counts.CURRENT}; upcoming ${counts.UPCOMING}; closed without implementation ${counts.CLOSED}; additionally blocked ${counts.BLOCKED}. Captured Linear status is retained in every detail table and accessible SVG node; later evidence is never a silent source refresh.\n\nLayers use longest prerequisite distance, not a newly approved delivery order, deadline or priority. P/F prefixes are preserved as recorded phase labels; unnumbered work is not assigned an invented phase. Only completed prerequisites satisfy recorded edges; canceled/duplicate closure alone does not. Completed status is not independent acceptance proof. No structured blocker does not establish readiness: prose/security/native/device gates still apply. See each complete issue's acceptance criteria and comments before choosing work.\n\nLegend: COMPLETED solid green; CURRENT double blue; UPCOMING dashed slate; CLOSED dashed violet; BLOCKED hatched amber, always labeled in text. Blocked overrides base fill/border except the current double outline. Arrows point prerequisite -> dependent. A blocked current issue stays CURRENT / BLOCKED.\n\n### Curated evidence separate from capture\n\n${annotationNotes || 'No curated annotations recorded.'}\n`;
    const directory = pages
        .map(
            /**
             * Render one detail page as a row of the directory table.
             *
             * @param {{ name: string, layer: number, nodes: object[] }} page - One layer group page.
             * @returns {string} The Markdown row linking the page and its issues.
             */
            (page) =>
                `| [Layer ${page.layer}, group ${page.name.slice(-2)}](${page.name}.md) | ${page.nodes.map(nodeLink).join(', ')} |`
        )
        .join('\n');
    const ready =
        graph.nodes
            .filter(
                /**
                 * Keep open issues with no recorded blocker.
                 *
                 * @param {object} node - One graph node.
                 * @returns {boolean} Whether the node is open and unblocked.
                 */
                (node) => !terminal(node) && !node.blocked
            )
            .map(
                /**
                 * Describe one candidate issue for next-step discovery.
                 *
                 * @param {{ id: string, state: string, layer: number }} node - One open, unblocked node.
                 * @returns {string} Its link, state and layer.
                 */
                (node) => `${link(node.id)} (${node.state}, L${node.layer})`
            )
            .join(', ') || 'None';
    files.set(
        'docs/planning/roadmap/README.md',
        `# Complete EVE roadmap\n\n${intro}\n[Human checkpoint](../timeline.md) | [Decision/source review](../decisions.md) | [Full SVG export](../roadmap.svg) | [Full Mermaid export](graph.mmd)\n\n## Next-step discovery\n\nNo recorded open structured prerequisite: ${ready}. This is a candidate list, not authorization to start or accept work. Read priorities, path reservations and prose gates in the linked issue.\n\n## Navigable layers\n\nSmall groups contain at most 12 issues. Each issue appears once; the table gives its complete prerequisites and unlocks, including edges outside its group. Use the full exports in external tools rather than fitting 258 nodes into a document viewport.\n\n| Detail | Issues |\n| --- | --- |\n${directory}\n\n## Source relation diagnostics\n\n${graph.warnings.length ? graph.warnings.join('\n\n') : 'Both blocking directions reconcile; no dangling references or blocking cycles.'}\n`
    );
    const mermaid = ['flowchart LR'];
    for (const layer of [
        ...new Set(
            graph.nodes.map(
                /**
                 * Read a node's dependency layer.
                 *
                 * @param {{ layer: number }} node - One graph node.
                 * @returns {number} Its layer.
                 */
                (node) => node.layer
            )
        ),
    ]) {
        mermaid.push(`    subgraph layer_${layer}["Dependency layer ${layer}"]`);
        for (const node of graph.nodes.filter(
            /**
             * Keep nodes in the current layer.
             *
             * @param {{ layer: number }} value - One graph node.
             * @returns {boolean} Whether the node is in the layer.
             */
            (value) => value.layer === layer
        ))
            mermaid.push(
                `        ${node.id.replace('-', '_')}["${node.id}: ${node.title.replace(/["<>[\]{}|\\]/g, ' ')} | ${stateText(node)} | captured: ${node.status}${(node.annotations ?? []).map(mermaidAnnotation).join('')}"]`
            );
        mermaid.push('    end');
    }
    for (const [from, to] of graph.edges) mermaid.push(`    ${from.replace('-', '_')} --> ${to.replace('-', '_')}`);
    for (const node of graph.nodes) {
        mermaid.push(`    click ${node.id.replace('-', '_')} "${node.url}"`);
        const [fill, stroke] = palette[node.blocked ? 'BLOCKED' : node.state];
        mermaid.push(`    style ${node.id.replace('-', '_')} fill:${fill},stroke:${stroke},color:#0f172a`);
    }
    files.set('docs/planning/roadmap/graph.mmd', `${mermaid.join('\n')}\n`);
    files.set('docs/planning/roadmap.svg', renderSvg(graph, 'All mirrored EVE issues and prerequisite edges'));
    files.set(
        'docs/planning/timeline.md',
        `## Generated all-issue planning coverage\n\n${intro}\n[Every issue, blockers and unlocks](roadmap/README.md) | [Layered SVG export](roadmap.svg) | [Mermaid source](roadmap/graph.mmd) | [Decision evidence coverage](roadmap/decision-sources.md)\n\nThis generated view augments, and does not replace or rewrite, the dated delivered human checkpoint above. Every mirrored issue is included exactly once in the linked layer tables. Live freshness requires separate credentialed acquisition; an offline pass proves consistency with the recorded snapshot only.\n`
    );
    const sourceMap = new Map(
        review.sources.map(
            /**
             * Key a source record by its identifier.
             *
             * @param {{ id: string }} source - One inventoried source record.
             * @returns {[string, object]} The identifier and the record.
             */
            (source) => [source.id, source]
        )
    );
    /**
     * Link a cited source identifier to its source URL.
     *
     * @param {string} id - One cited source identifier.
     * @returns {string} A Markdown link with the escaped identifier as text.
     */
    const sourceLink = (id) => `[${md(id)}](${sourceMap.get(id).url})`;
    const decisionRows = data.decisions
        .map(
            /**
             * Render one decision as a row of the summary table.
             *
             * @param {{ id: string, summary: string, timestamp: string | null, authority: string }} decision - One curated decision record.
             * @returns {string} The Markdown table row.
             */
            (decision) =>
                `| [${decision.id}](#${decision.id}) | ${md(decision.summary)} | ${decision.timestamp ?? 'Unknown'} | ${decision.authority} |`
        )
        .join('\n');
    const details = data.decisions
        .map(
            /**
             * Render one decision as a detail section.
             *
             * @param {object} decision - One curated decision record.
             * @returns {string} The Markdown section with authority, scope, evidence and supersession.
             */
            (decision) =>
                `### ${decision.id}\n\n${decision.summary}\n\n- Authority: **${decision.authority}**. This records evidence, not a new approval.\n- Source timestamp: ${decision.timestamp ?? 'Unknown; no owner decision time available'}. Comment creation time is evidence time, not necessarily the time of the owner's instruction.\n- Scope: ${links(decision.scope, 'issues/')}.\n- Evidence: ${decision.sources.map(sourceLink).join(', ')}.\n- Implementation: ${decision.implementation}\n- Concrete outstanding parameters: ${decision.parameters}\n- Superseded by: ${decision.supersededBy.length ? decision.supersededBy.map(anchorLink).join(', ') : 'None explicitly established in this record'}. ${decision.supersessionNote}\n`
        )
        .join('\n');
    files.set(
        'docs/planning/decisions.md',
        `## Generated decision and evidence inventory\n\n${data.decisions.length} curated public-safe decision records; ${review.sources.length} source records covered; **${review.unresolved.length} sources still require semantic decision review**. This is exhaustive source inventory, NOT a claim that all recoverable decisions have been extracted. Strict decision-review acceptance remains blocked until that queue is cleared. Account identity, an APPROVED keyword, issue Done status and agent reports cannot themselves establish owner approval. Unknown dates and unproven supersession remain explicit.\n\n[Every source and review disposition](roadmap/decision-sources.md). Source changes invalidate exact digests. New decision summaries never copy raw private source bodies/comments. Existing owner-authorized issue pages retain their separate publication policy.\n\n| Record | Public-safe summary | Evidence timestamp | Authority |\n| --- | --- | --- | --- |\n${decisionRows}\n\n${details}`
    );
    const sourceRows = review.sources
        .map(
            /**
             * Render one source and its review as a row of the review queue table.
             *
             * @param {{ id: string, url: string, timestamp: string | null, author: string }} source - One inventoried source record.
             * @returns {string} The Markdown table row.
             */
            (source) => {
                const disposition = data.sources.find(
                    /**
                     * Match the review record for the source.
                     *
                     * @param {{ id: string }} entry - One source review record.
                     * @returns {boolean} Whether it reviews the source.
                     */
                    (entry) => entry.id === source.id
                );
                return `| [${md(source.id)}](${source.url.startsWith('../../') ? `../${source.url}` : source.url}) | ${source.timestamp ?? 'Unknown'} | ${md(source.author)} | ${disposition.disposition} | ${md(disposition.reason)} |`;
            }
        )
        .join('\n');
    files.set(
        'docs/planning/roadmap/decision-sources.md',
        `# Decision evidence review queue\n\n${review.sources.length} exact sources inventoried, ${review.unresolved.length} unresolved. Every mirrored description and comment is included regardless of author or keywords, plus the governed repository artifacts declared in planning-data.json. Raw text stays in the separately authorized mirror, not this summary. A source may contain multiple decisions: a source-to-record link is not proof that every clause was semantically extracted.\n\nRun strict acceptance with \`node tools/documentation/planning.mjs --check --require-reviewed\`; it fails while unresolved sources remain. Do not relabel sources to make it pass. Review the full source, extract independently scoped decisions with explicit provenance, and resolve conflicting or missing authority openly. Agent evidence and historical imported discussion may contain reported owner directions and are not silently excluded.\n\n| Source | Evidence timestamp | Recorded author | Review disposition | Reason / remaining work |\n| --- | --- | --- | --- | --- |\n${sourceRows}\n`
    );
    return {
        files: new Map(
            [...files].map(
                /**
                 * Normalize decorative punctuation in one generated file.
                 *
                 * @param {[string, string]} file - The repository path and generated text.
                 * @returns {[string, string]} The path and its display-normalized text.
                 */
                (file) => [file[0], displayText(file[1])]
            )
        ),
        graph,
        unresolved: review.unresolved.length,
    };
};

/**
 * Check without writes, or refresh only generated regions; unmanaged content survives and stale generated files are never silently deleted.
 * Unsafe artifact paths, unexpected roadmap files and, when required, unresolved reviews raise an error.
 *
 * @param {string} root - The repository root.
 * @param {boolean} [check] - Report stale outputs without writing them; defaults to false.
 * @param {boolean} [requireReviewed] - Fail while any decision source review is unresolved; defaults to false.
 * @returns {{ files: Map<string, string>, graph: object, unresolved: number, stale: string[] }} The rendered planning result and the outputs that were stale or updated.
 * @since 0.0.1
 * @example
 * const { stale } = synchronizePlanning(process.cwd(), true);
 */
export const synchronizePlanning = (root, check = false, requireReviewed = false) => {
    const data = JSON.parse(readFileSync(join(root, 'tools/documentation/planning-data.json'), 'utf8'));
    const snapshot = JSON.parse(readFileSync(join(root, 'tools/documentation/linear-snapshot.json'), 'utf8'));
    const artifacts = Object.fromEntries(
        data.artifacts.map(
            /**
             * Read one governed artifact after checking its path is an architecture document.
             * Any other path raises an error.
             *
             * @param {string} path - A repository-relative artifact path from the planning data.
             * @returns {[string, string]} The path and the artifact's text.
             */
            (path) => {
                if (!/^docs\/architecture\/[a-z0-9-]+\.md$/.test(path)) throw new Error('Unsafe artifact path');
                return [path, readFileSync(join(root, path), 'utf8')];
            }
        )
    );
    const result = renderPlanning(snapshot, data, artifacts);
    const stale = [];
    const directory = join(root, 'docs/planning/roadmap');
    if (existsSync(directory))
        for (const file of readdirSync(directory))
            if (!result.files.has(`docs/planning/roadmap/${file}`))
                throw new Error(`Stale roadmap output requires review: ${file}`);
    for (const [file, generated] of result.files) {
        const path = join(root, file);
        const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
        const next = file.endsWith('.md') ? mergePlanning(current, generated) : generated;
        if (next === current) continue;
        stale.push(file);
        if (!check) {
            mkdirSync(dirname(path), { recursive: true });
            writeFileSync(path, next);
        }
    }
    if (requireReviewed && result.unresolved)
        throw new Error(
            `Decision review incomplete: ${result.unresolved} unresolved sources; no exhaustive decision clearance`
        );
    return { ...result, stale };
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const check = process.argv.includes('--check');
        const result = synchronizePlanning(
            resolve(dirname(fileURLToPath(import.meta.url)), '../..'),
            check,
            process.argv.includes('--require-reviewed')
        );
        console.log(
            `Planning: ${result.graph.nodes.length} issues; ${result.graph.edges.length} edges; ${result.unresolved} unresolved decision sources; ${result.stale.length} ${check ? 'stale' : 'updated'} outputs.`
        );
        process.exitCode = check && result.stale.length ? 1 : 0;
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
