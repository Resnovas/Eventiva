/**
 * @file tools/references/check.mjs
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
import { lstatSync, readFileSync, readlinkSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const objectHash = (kind, data) => createHash('sha1').update(`${kind} ${data.length}\0`).update(data).digest();

/** Reconstruct upstream Git tree/blob identities from the working bytes, modes and symlinks. */
export const sourceIdentity = (path, root = path) => {
    const stat = lstatSync(path);
    if (!stat.isDirectory()) {
        const link = stat.isSymbolicLink();
        if (!link && !stat.isFile()) throw new Error(`Not source data: ${path}`);
        const data = link ? Buffer.from(readlinkSync(path)) : readFileSync(path);
        if (link) {
            const target = relative(resolve(root), resolve(dirname(path), data.toString()));
            if (target === '..' || target.startsWith(`..${sep}`) || isAbsolute(target))
                throw new Error(`Reference symlink escapes its source tree: ${path}`);
        }
        return {
            hash: objectHash('blob', data),
            mode: link ? '120000' : stat.mode & 0o111 ? '100755' : '100644',
            bytes: data.length,
            files: 1,
        };
    }
    const entries = readdirSync(path).map((name) => ({ name, ...sourceIdentity(join(path, name), root) }));
    entries.sort((a, b) =>
        Buffer.compare(
            Buffer.from(a.name + (a.mode === '40000' ? '/' : '')),
            Buffer.from(b.name + (b.mode === '40000' ? '/' : ''))
        )
    );
    const data = Buffer.concat(
        entries.map((entry) => Buffer.concat([Buffer.from(`${entry.mode} ${entry.name}\0`), entry.hash]))
    );
    return {
        hash: objectHash('tree', data),
        mode: '40000',
        bytes: entries.reduce((n, e) => n + e.bytes, 0),
        files: entries.reduce((n, e) => n + e.files, 0),
    };
};

export const checkReferences = (root) => {
    const catalog = JSON.parse(readFileSync(join(root, 'tools/references/catalog.json'), 'utf8'));
    const bundle = join(root, 'externals/upstream');
    const sources = JSON.parse(readFileSync(join(bundle, 'sources.json'), 'utf8'));
    if (sources.length !== catalog.length || new Set(sources.map((entry) => entry.id)).size !== sources.length)
        throw new Error('Reference catalog and source inventory differ');
    if (readdirSync(bundle).some((name) => name !== 'sources.json' && !catalog.some((entry) => entry.id === name)))
        throw new Error('Uncatalogued reference tree');
    let bytes = 0;
    let files = 0;
    for (const requested of catalog) {
        const entry = sources.find((source) => source.id === requested.id);
        for (const key of ['upstream', 'commit', 'ref', 'license', 'packages'])
            if (JSON.stringify(entry?.[key]) !== JSON.stringify(requested[key]))
                throw new Error(`Reference pin drift: ${requested.id}/${key}`);
        if (!/^[a-z0-9-]+$/.test(entry.id) || !/^[a-f0-9]{40}$/.test(entry.commit))
            throw new Error('Invalid source identity');
        const base = join(bundle, entry.id);
        const total = sourceIdentity(base);
        bytes += total.bytes;
        files += total.files;
        if (!entry.notices.length) throw new Error(`No upstream notices: ${entry.id}`);
        for (const path of [...requested.paths, ...entry.notices]) {
            if (path !== '.' && (path.startsWith('/') || path.split('/').includes('..')))
                throw new Error('Unsafe source path');
            const actual = sourceIdentity(join(base, path), base).hash.toString('hex');
            if (actual !== entry.trees[path])
                throw new Error(`Upstream source changed or incomplete: ${entry.id}/${path}`);
        }
        for (const [path, expected] of Object.entries(entry.trees))
            if (sourceIdentity(join(base, path), base).hash.toString('hex') !== expected)
                throw new Error(`Upstream metadata changed: ${entry.id}/${path}`);
        const scopes = Object.keys(entry.trees);
        const scopedFiles = (directory, prefix = '') => {
            for (const item of readdirSync(directory, { withFileTypes: true })) {
                const path = prefix + item.name;
                if (scopes.some((scope) => scope === '.' || path === scope || path.startsWith(scope + '/'))) continue;
                if (item.isDirectory() && scopes.some((scope) => scope.startsWith(path + '/')))
                    scopedFiles(join(directory, item.name), path + '/');
                else throw new Error(`Uncatalogued reference file: ${entry.id}/${path}`);
            }
        };
        scopedFiles(base);
    }
    if (bytes > 350 * 1024 * 1024) throw new Error('Reference source exceeds the reviewed 350 MiB budget');
    const rootManifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const manifests = [rootManifest];
    const walk = (path) => {
        for (const entry of readdirSync(path, { withFileTypes: true })) {
            if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
            const file = join(path, entry.name);
            if (entry.isDirectory()) walk(file);
            else if (entry.name === 'package.json') manifests.push(JSON.parse(readFileSync(file, 'utf8')));
        }
    };
    for (const path of ['apps', 'packages', 'tests', 'ai-docs']) walk(join(root, path));
    const pins = new Map(catalog.flatMap((entry) => entry.packages.map((pin) => [pin.name, pin.version])));
    for (const manifest of manifests)
        for (const [name, version] of Object.entries({
            ...manifest.dependencies,
            ...manifest.devDependencies,
            ...manifest.peerDependencies,
        })) {
            if (/externals(?:\/|\\)/.test(version)) throw new Error(`Reference used as a package dependency: ${name}`);
            if (pins.has(name) && version !== pins.get(name) && version !== 'catalog:')
                throw new Error(`Reference version drift: ${name}@${version}`);
        }
    const workspace = readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8');
    if (
        !workspace.includes("'!externals/**'") ||
        !readFileSync(join(root, '.nxignore'), 'utf8').includes('externals/**')
    )
        throw new Error('Reference workspace exclusions are missing');
    if (!/^\s+- externals\/\*\*\s*$/m.test(readFileSync(join(root, '.github/codeql/codeql-config.yml'), 'utf8')))
        throw new Error('CodeQL reference exclusion is missing');
    if (!workspace.includes(`effect: ${pins.get('effect')}`)) throw new Error('Effect catalog/reference drift');
    return { sources: sources.length, files, bytes };
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const result = checkReferences(resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
    console.log(
        `Upstream references: ${result.sources} pinned trees, ${result.files} files, ${result.bytes} bytes; exact source identities and workspace isolation pass`
    );
}
