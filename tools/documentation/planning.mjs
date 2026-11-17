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
const order = (a, b) => Number(a.replace('EVE-', '')) - Number(b.replace('EVE-', ''));
const lexical = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const sorted = (values) => [...new Set(values)].sort(order);
const xml = (value) =>
    String(value).replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]
    );
const md = (value) =>
    xml(value)
        .replace(/[\r\n]/g, ' ')
        .replace(/\|/g, '&#124;')
        .replace(/\[/g, '&#91;')
        .replace(/\]/g, '&#93;');
const link = (id, prefix = '../issues/') => `[${id}](${prefix}${id}.md)`;
const links = (values, prefix) => values.map((id) => link(id, prefix)).join(', ') || 'None recorded';
const terminal = (issue) =>
    ['completed', 'canceled', 'cancelled', 'duplicate'].includes(issue.effectiveStatusType ?? issue.statusType);

/** Normalize decorative source punctuation only in authored displays; the authorized mirror retains the exact title. */
const displayText = (value) =>
    value
        .replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}|\u200d|\ufe0f|\u20e3/gu, '')
        .replace(/[\u2013\u2014]/g, '-');

/** Hash exact source bytes; normalization would hide edited decision evidence. */
export const fingerprint = (value) => createHash('sha256').update(value).digest('hex');

/** Ignore only well-formed generated planning regions when fingerprinting repository evidence, preventing self-invalidating output. */
export const authoredArtifact = (value) => {
    const starts = value.split(start).length - 1;
    const ends = value.split(end).length - 1;
    if (!starts && !ends) return value;
    if (starts !== 1 || ends !== 1 || value.indexOf(start) > value.indexOf(end))
        throw new Error('Malformed evidence markers');
    return value.slice(0, value.indexOf(start)) + value.slice(value.indexOf(end) + end.length);
};

/** Inventory every mirrored description/comment and each explicitly governed repository artifact, not keyword-selected candidates. */
export const decisionSources = (snapshot, artifacts) => {
    const sources = snapshot.issues.flatMap((issue) => [
        {
            id: `${issue.id}/description`,
            issue: issue.id,
            timestamp: null,
            author: 'Unavailable in snapshot',
            url: issue.url,
            hash: fingerprint(issue.description ?? ''),
        },
        ...issue.comments.map((comment) => ({
            id: `${issue.id}/${comment.id}`,
            issue: issue.id,
            timestamp: comment.createdAt,
            author: comment.author ?? 'Unavailable',
            url: `${issue.url}#comment-${comment.id}`,
            hash: fingerprint(JSON.stringify(comment)),
        })),
    ]);
    for (const [path, text] of Object.entries(artifacts))
        sources.push({
            id: path,
            issue: null,
            timestamp: null,
            author: 'Repository artifact',
            url: `../../${path}`,
            hash: fingerprint(authoredArtifact(text)),
        });
    return sources.sort((a, b) => lexical(a.id, b.id));
};

/** Derive one acyclic prerequisite graph from both relation directions; relation asymmetry is retained as a warning, never dropped. */
export const buildGraph = (snapshot, annotations = []) => {
    validateSnapshot(snapshot);
    const nodes = new Map(snapshot.issues.map((issue) => [issue.id, { ...issue, prerequisites: [], unlocks: [] }]));
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
            annotation.sources.some((source) => !/^https:\/\/(?:linear\.app|ampcode\.com|github\.com)\//.test(source))
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
            // Later reported verification changes planning readiness, never the captured service fields.
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
        // Closing duplicate/canceled work does not deliver its recorded prerequisite contract.
        node.blockers = node.prerequisites.filter((id) => {
            const prerequisite = nodes.get(id);
            return (prerequisite.effectiveStatusType ?? prerequisite.statusType) !== 'completed';
        });
        node.labelBlocked = node.labels.some((label) => /\bblocked\b/i.test(label));
        node.state = terminal(node)
            ? (node.effectiveStatusType ?? node.statusType) === 'completed'
                ? 'COMPLETED'
                : 'CLOSED'
            : (node.effectiveStatusType ?? node.statusType) === 'started'
              ? 'CURRENT'
              : 'UPCOMING';
        node.blocked =
            !terminal(node) &&
            !!(
                node.blockers.length > 0 ||
                node.labelBlocked ||
                node.annotations?.some((entry) => entry.kind === 'blocker')
            );
        node.phase = node.title.match(/^(P\d+(?:\.\d+)?|F\d+(?:\.\d+)?)/)?.[1] ?? 'No numbered phase recorded';
    }
    return {
        nodes: [...nodes.values()].sort((a, b) => a.layer - b.layer || order(a.id, b.id)),
        edges: [...edges.values()].sort((a, b) => order(a[0], b[0]) || order(a[1], b[1])),
        warnings,
    };
};

/** Reject silent evidence changes and invented source/decision identifiers; unresolved review is explicit and separately strict-gated. */
export const validatePlanning = (snapshot, data, artifacts) => {
    if (data.version !== 1 || !Array.isArray(data.decisions) || !Array.isArray(data.sources))
        throw new Error('Unsupported planning data');
    if (data.snapshotHash !== fingerprint(JSON.stringify(snapshot)))
        throw new Error('Snapshot changed: reconcile planning source review before regeneration');
    const sources = decisionSources(snapshot, artifacts);
    const expected = new Map(sources.map((source) => [source.id, source]));
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
        if (!decision.sources.length || decision.sources.some((id) => !expected.has(id)))
            throw new Error(`Missing decision evidence: ${decision.id}`);
        if (!decision.scope.length || decision.scope.some((id) => !snapshot.issues.some((issue) => issue.id === id)))
            throw new Error(`Unknown decision scope: ${decision.id}`);
        for (const key of ['summary', 'implementation', 'parameters', 'supersessionNote'])
            if (typeof decision[key] !== 'string' || !decision[key].trim())
                throw new Error(`Missing ${key}: ${decision.id}`);
        if (!Array.isArray(decision.supersededBy)) throw new Error(`Missing supersession state: ${decision.id}`);
        const times = decision.sources.map((id) => expected.get(id).timestamp).filter(Boolean);
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
            !data.decisions.some((decision) => decision.sources.includes(source.id))
        )
            throw new Error(`Decision omission: ${source.id}`);
    return {
        sources,
        unresolved: data.sources.filter((source) => ['pending-review', 'ambiguous'].includes(source.disposition)),
    };
};

/** Preserve repository-authored context outside a single generated region; malformed markers cannot consume prose. */
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
const stateText = (node) => `${node.state}${node.blocked ? ' / BLOCKED' : ''}`;
const partName = (layer, part) => `layer-${String(layer).padStart(2, '0')}-${String(part + 1).padStart(2, '0')}`;

/** Render dependency columns without a layout service, unstable font metrics or external resources. Labels and patterns duplicate color meaning. */
export const renderSvg = (graph, title, compact = false) => {
    const rowHeight = 106;
    const columnWidth = 356;
    const columns = [...new Set(graph.nodes.map((node) => node.layer))];
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
        // A conservative character bound also covers unbroken identifiers and wide glyphs without browser font metrics.
        const words = displayText(node.title)
            .split(/\s+/)
            .flatMap((word) => word.match(/.{1,23}/gu) ?? []);
        const lines = [''];
        for (const word of words) {
            if ((lines.at(-1) + word).length > 23 && lines.at(-1)) lines.push('');
            lines[lines.length - 1] += `${word} `;
        }
        const evidence = (node.annotations ?? [])
            .map((entry) => `${entry.date}: ${entry.kind}: ${entry.summary} Sources: ${entry.sources.join(', ')}.`)
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

/** Generate every presentation from the validated snapshot plus curated review model; raw comment/description text is never copied. */
export const renderPlanning = (snapshot, data, artifacts) => {
    const review = validatePlanning(snapshot, data, artifacts);
    const graph = buildGraph(snapshot, data.annotations);
    const files = new Map();
    const pages = [];
    for (const layer of [...new Set(graph.nodes.map((node) => node.layer))]) {
        const nodes = graph.nodes.filter((node) => node.layer === layer);
        for (let offset = 0; offset < nodes.length; offset += 12) {
            const group = nodes.slice(offset, offset + 12);
            const name = partName(layer, offset / 12);
            pages.push({ name, layer, nodes: group });
            const rows = group
                .map(
                    (node) =>
                        `| ${link(node.id)} ${md(node.title)} | **${stateText(node)}**; captured Linear: ${md(node.status)}${(node.annotations ?? []).map((entry) => `; ${entry.kind} ${entry.date}: ${md(entry.summary)} ${entry.sources.map((url) => `[evidence](${url})`).join(', ')}`).join('')} | ${md(node.phase)}; ${md(node.project ?? 'No project')} | ${links(node.prerequisites)} | ${links(node.blockers)}${node.labelBlocked ? '; Blocked label recorded' : ''}${node.annotations?.some((entry) => entry.kind === 'blocker') ? '; Curated adoption blocker: see cited state evidence' : ''} | ${links(node.unlocks)} | ${node.parentId ? link(node.parentId) : 'None recorded'} |`
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
        Object.keys(palette).map((state) => [
            state,
            graph.nodes.filter((node) => (state === 'BLOCKED' ? node.blocked : node.state === state)).length,
        ])
    );
    const annotationNotes = (data.annotations ?? [])
        .map(
            (entry) =>
                `- ${entry.issue}, ${entry.date}, ${entry.kind}: ${entry.summary} ${entry.sources.map((url) => `[evidence](${url})`).join(', ')}.`
        )
        .join('\n');
    const intro = `Snapshot enumeration: ${snapshot.enumeratedAt ?? 'unavailable'}; ${graph.nodes.length} issues, ${graph.edges.length} prerequisite edges. Planning counts after explicitly cited annotations: completed ${counts.COMPLETED}; current ${counts.CURRENT}; upcoming ${counts.UPCOMING}; closed without implementation ${counts.CLOSED}; additionally blocked ${counts.BLOCKED}. Captured Linear status is retained in every detail table and accessible SVG node; later evidence is never a silent source refresh.\n\nLayers use longest prerequisite distance, not a newly approved delivery order, deadline or priority. P/F prefixes are preserved as recorded phase labels; unnumbered work is not assigned an invented phase. Only completed prerequisites satisfy recorded edges; canceled/duplicate closure alone does not. Completed status is not independent acceptance proof. No structured blocker does not establish readiness: prose/security/native/device gates still apply. See each complete issue's acceptance criteria and comments before choosing work.\n\nLegend: COMPLETED solid green; CURRENT double blue; UPCOMING dashed slate; CLOSED dashed violet; BLOCKED hatched amber, always labeled in text. Blocked overrides base fill/border except the current double outline. Arrows point prerequisite -> dependent. A blocked current issue stays CURRENT / BLOCKED.\n\n### Curated evidence separate from capture\n\n${annotationNotes || 'No curated annotations recorded.'}\n`;
    const directory = pages
        .map(
            (page) =>
                `| [Layer ${page.layer}, group ${page.name.slice(-2)}](${page.name}.md) | ${page.nodes.map((node) => link(node.id)).join(', ')} |`
        )
        .join('\n');
    const ready =
        graph.nodes
            .filter((node) => !terminal(node) && !node.blocked)
            .map((node) => `${link(node.id)} (${node.state}, L${node.layer})`)
            .join(', ') || 'None';
    files.set(
        'docs/planning/roadmap/README.md',
        `# Complete EVE roadmap\n\n${intro}\n[Human checkpoint](../timeline.md) | [Decision/source review](../decisions.md) | [Full SVG export](../roadmap.svg) | [Full Mermaid export](graph.mmd)\n\n## Next-step discovery\n\nNo recorded open structured prerequisite: ${ready}. This is a candidate list, not authorization to start or accept work. Read priorities, path reservations and prose gates in the linked issue.\n\n## Navigable layers\n\nSmall groups contain at most 12 issues. Each issue appears once; the table gives its complete prerequisites and unlocks, including edges outside its group. Use the full exports in external tools rather than fitting 258 nodes into a document viewport.\n\n| Detail | Issues |\n| --- | --- |\n${directory}\n\n## Source relation diagnostics\n\n${graph.warnings.length ? graph.warnings.join('\n\n') : 'Both blocking directions reconcile; no dangling references or blocking cycles.'}\n`
    );
    const mermaid = ['flowchart LR'];
    for (const layer of [...new Set(graph.nodes.map((node) => node.layer))]) {
        mermaid.push(`    subgraph layer_${layer}["Dependency layer ${layer}"]`);
        for (const node of graph.nodes.filter((value) => value.layer === layer))
            mermaid.push(
                `        ${node.id.replace('-', '_')}["${node.id}: ${node.title.replace(/["<>[\]{}|\\]/g, ' ')} | ${stateText(node)} | captured: ${node.status}${(node.annotations ?? []).map((entry) => ` | ${entry.kind} ${entry.date}`).join('')}"]`
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
    const sourceMap = new Map(review.sources.map((source) => [source.id, source]));
    const decisionRows = data.decisions
        .map(
            (decision) =>
                `| [${decision.id}](#${decision.id}) | ${md(decision.summary)} | ${decision.timestamp ?? 'Unknown'} | ${decision.authority} |`
        )
        .join('\n');
    const details = data.decisions
        .map(
            (decision) =>
                `### ${decision.id}\n\n${decision.summary}\n\n- Authority: **${decision.authority}**. This records evidence, not a new approval.\n- Source timestamp: ${decision.timestamp ?? 'Unknown; no owner decision time available'}. Comment creation time is evidence time, not necessarily the time of the owner's instruction.\n- Scope: ${links(decision.scope, 'issues/')}.\n- Evidence: ${decision.sources.map((id) => `[${md(id)}](${sourceMap.get(id).url})`).join(', ')}.\n- Implementation: ${decision.implementation}\n- Concrete outstanding parameters: ${decision.parameters}\n- Superseded by: ${decision.supersededBy.length ? decision.supersededBy.map((id) => `[${id}](#${id})`).join(', ') : 'None explicitly established in this record'}. ${decision.supersessionNote}\n`
        )
        .join('\n');
    files.set(
        'docs/planning/decisions.md',
        `## Generated decision and evidence inventory\n\n${data.decisions.length} curated public-safe decision records; ${review.sources.length} source records covered; **${review.unresolved.length} sources still require semantic decision review**. This is exhaustive source inventory, NOT a claim that all recoverable decisions have been extracted. Strict decision-review acceptance remains blocked until that queue is cleared. Account identity, an APPROVED keyword, issue Done status and agent reports cannot themselves establish owner approval. Unknown dates and unproven supersession remain explicit.\n\n[Every source and review disposition](roadmap/decision-sources.md). Source changes invalidate exact digests. New decision summaries never copy raw private source bodies/comments. Existing owner-authorized issue pages retain their separate publication policy.\n\n| Record | Public-safe summary | Evidence timestamp | Authority |\n| --- | --- | --- | --- |\n${decisionRows}\n\n${details}`
    );
    const sourceRows = review.sources
        .map((source) => {
            const disposition = data.sources.find((entry) => entry.id === source.id);
            return `| [${md(source.id)}](${source.url.startsWith('../../') ? `../${source.url}` : source.url}) | ${source.timestamp ?? 'Unknown'} | ${md(source.author)} | ${disposition.disposition} | ${md(disposition.reason)} |`;
        })
        .join('\n');
    files.set(
        'docs/planning/roadmap/decision-sources.md',
        `# Decision evidence review queue\n\n${review.sources.length} exact sources inventoried, ${review.unresolved.length} unresolved. Every mirrored description and comment is included regardless of author or keywords, plus the governed repository artifacts declared in planning-data.json. Raw text stays in the separately authorized mirror, not this summary. A source may contain multiple decisions: a source-to-record link is not proof that every clause was semantically extracted.\n\nRun strict acceptance with \`node tools/documentation/planning.mjs --check --require-reviewed\`; it fails while unresolved sources remain. Do not relabel sources to make it pass. Review the full source, extract independently scoped decisions with explicit provenance, and resolve conflicting or missing authority openly. Agent evidence and historical imported discussion may contain reported owner directions and are not silently excluded.\n\n| Source | Evidence timestamp | Recorded author | Review disposition | Reason / remaining work |\n| --- | --- | --- | --- | --- |\n${sourceRows}\n`
    );
    // Only public-safe presentations are normalized; the snapshot and issue mirror remain byte-faithful evidence.
    return {
        files: new Map([...files].map(([path, text]) => [path, displayText(text)])),
        graph,
        unresolved: review.unresolved.length,
    };
};

/** Check without writes, or refresh only generated regions; unmanaged content survives and stale generated files are never silently deleted. */
export const synchronizePlanning = (root, check = false, requireReviewed = false) => {
    const data = JSON.parse(readFileSync(join(root, 'tools/documentation/planning-data.json'), 'utf8'));
    const snapshot = JSON.parse(readFileSync(join(root, 'tools/documentation/linear-snapshot.json'), 'utf8'));
    const artifacts = Object.fromEntries(
        data.artifacts.map((path) => {
            if (!/^docs\/architecture\/[a-z0-9-]+\.md$/.test(path)) throw new Error('Unsafe artifact path');
            return [path, readFileSync(join(root, path), 'utf8')];
        })
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
