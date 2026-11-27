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

/**
 * Hash data the way Git hashes an object, so working bytes can be compared with upstream tree and blob identities.
 *
 * @param {'blob' | 'tree'} kind - The Git object type.
 * @param {Buffer} data - The object's content.
 * @returns {Buffer} The SHA-1 object identity.
 */
const objectHash = (kind, data) => createHash('sha1').update(`${kind} ${data.length}\0`).update(data).digest();

/**
 * Sort key for tree entries in Git's order, where a directory sorts as if its name ended with a slash.
 *
 * @param {{ name: string, mode: string }} entry - One tree entry.
 * @returns {Buffer} The bytes Git compares.
 */
const treeOrder = (entry) => Buffer.from(entry.name + (entry.mode === '40000' ? '/' : ''));

/**
 * Reconstruct upstream Git tree/blob identities from the working bytes, modes and symlinks. A symlink that escapes
 * the source tree, or anything that is not a file, directory or symlink, is rejected.
 *
 * @since 0.0.1
 * @param {string} path - The file or directory to identify.
 * @param {string} [root] - The source tree's root, used to keep symlinks inside it; defaults to `path`.
 * @returns {{ hash: Buffer, mode: string, bytes: number, files: number }} The Git object identity, Git file mode, total bytes and file count.
 * @example
 * const identity = sourceIdentity('externals/upstream/effect-stable').hash.toString('hex');
 */
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
    const entries = readdirSync(path).map(
        /**
         * Identify one directory entry.
         *
         * @param {string} name - The entry's file name.
         * @returns {object} The entry's name with its identity.
         */
        (name) => ({ name, ...sourceIdentity(join(path, name), root) })
    );
    entries.sort(
        /**
         * Order entries as Git does.
         *
         * @param {{ name: string, mode: string }} a - One entry.
         * @param {{ name: string, mode: string }} b - Another entry.
         * @returns {number} The Git comparison result.
         */
        (a, b) => Buffer.compare(treeOrder(a), treeOrder(b))
    );
    const data = Buffer.concat(
        entries.map(
            /**
             * Encode one tree entry in Git's binary tree format.
             *
             * @param {{ name: string, mode: string, hash: Buffer }} entry - One identified entry.
             * @returns {Buffer} Its mode, name and identity.
             */
            (entry) => Buffer.concat([Buffer.from(`${entry.mode} ${entry.name}\0`), entry.hash])
        )
    );
    return {
        hash: objectHash('tree', data),
        mode: '40000',
        bytes: entries.reduce(
            /**
             * Sum entry sizes.
             *
             * @param {number} n - The running total.
             * @param {{ bytes: number }} e - One entry.
             * @returns {number} The total including this entry.
             */
            (n, e) => n + e.bytes,
            0
        ),
        files: entries.reduce(
            /**
             * Sum entry file counts.
             *
             * @param {number} n - The running total.
             * @param {{ files: number }} e - One entry.
             * @returns {number} The total including this entry.
             */
            (n, e) => n + e.files,
            0
        ),
    };
};

/**
 * Prove the vendored upstream references under `externals/upstream` match their catalogue exactly. It checks pins,
 * source and notice trees, that no uncatalogued file is present, the 350 MiB budget, that no package depends on a
 * reference or drifts from its pinned version, and that pnpm, Nx and CodeQL all exclude `externals/`.
 *
 * @since 0.0.1
 * @param {string} root - The repository root.
 * @returns {{ sources: number, files: number, bytes: number }} The number of pinned trees and their total files and bytes.
 * @example
 * const { sources } = checkReferences(process.cwd());
 */
export const checkReferences = (root) => {
    const catalog = JSON.parse(readFileSync(join(root, 'tools/references/catalog.json'), 'utf8'));
    const bundle = join(root, 'externals/upstream');
    const sources = JSON.parse(readFileSync(join(bundle, 'sources.json'), 'utf8'));
    if (
        sources.length !== catalog.length ||
        new Set(
            sources.map(
                /**
                 * Select a source's identifier.
                 *
                 * @param {{ id: string }} entry - One source inventory entry.
                 * @returns {string} Its identifier.
                 */
                (entry) => entry.id
            )
        ).size !== sources.length
    )
        throw new Error('Reference catalog and source inventory differ');
    if (
        readdirSync(bundle).some(
            /**
             * Detect a reference directory the catalogue does not list.
             *
             * @param {string} name - One entry in `externals/upstream`.
             * @returns {boolean} Whether it is neither the inventory nor a catalogued tree.
             */
            (name) =>
                name !== 'sources.json' &&
                !catalog.some(
                    /**
                     * Match the directory to a catalogue entry.
                     *
                     * @param {{ id: string }} entry - One catalogue entry.
                     * @returns {boolean} Whether it names this directory.
                     */
                    (entry) => entry.id === name
                )
        )
    )
        throw new Error('Uncatalogued reference tree');
    let bytes = 0;
    let files = 0;
    for (const requested of catalog) {
        const entry = sources.find(
            /**
             * Find the inventory entry for this catalogue pin.
             *
             * @param {{ id: string }} source - One source inventory entry.
             * @returns {boolean} Whether it has the requested identifier.
             */
            (source) => source.id === requested.id
        );
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
        /**
         * Reject any file in the reference tree that no pinned scope covers.
         *
         * @param {string} directory - The directory to scan.
         * @param {string} [prefix] - The directory's path relative to the reference root.
         */
        const scopedFiles = (directory, prefix = '') => {
            for (const item of readdirSync(directory, { withFileTypes: true })) {
                const path = prefix + item.name;
                if (
                    scopes.some(
                        /**
                         * Check whether a pinned scope covers this path.
                         *
                         * @param {string} scope - One pinned tree path.
                         * @returns {boolean} Whether the scope is the whole tree, this path, or an ancestor of it.
                         */
                        (scope) => scope === '.' || path === scope || path.startsWith(scope + '/')
                    )
                )
                    continue;
                if (
                    item.isDirectory() &&
                    scopes.some(
                        /**
                         * Check whether a pinned scope lies inside this directory.
                         *
                         * @param {string} scope - One pinned tree path.
                         * @returns {boolean} Whether the scope is a descendant of this directory.
                         */
                        (scope) => scope.startsWith(path + '/')
                    )
                )
                    scopedFiles(join(directory, item.name), path + '/');
                else throw new Error(`Uncatalogued reference file: ${entry.id}/${path}`);
            }
        };
        scopedFiles(base);
    }
    if (bytes > 350 * 1024 * 1024) throw new Error('Reference source exceeds the reviewed 350 MiB budget');
    const rootManifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const manifests = [rootManifest];
    /**
     * Collect every workspace package manifest below a directory, skipping dependencies, output and dot directories.
     *
     * @param {string} path - The directory to walk.
     */
    const walk = (path) => {
        for (const entry of readdirSync(path, { withFileTypes: true })) {
            if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
            const file = join(path, entry.name);
            if (entry.isDirectory()) walk(file);
            else if (entry.name === 'package.json') manifests.push(JSON.parse(readFileSync(file, 'utf8')));
        }
    };
    for (const path of ['apps', 'packages', 'tests', 'ai-docs']) walk(join(root, path));
    const pins = new Map(
        catalog.flatMap(
            /**
             * List a catalogue entry's pinned packages.
             *
             * @param {{ packages: Array<{ name: string, version: string }> }} entry - One catalogue entry.
             * @returns {Array<[string, string]>} Each package name with its pinned version.
             */
            (entry) =>
                entry.packages.map(
                    /**
                     * Pair a package with its pinned version.
                     *
                     * @param {{ name: string, version: string }} pin - One pinned package.
                     * @returns {[string, string]} The name and version.
                     */
                    (pin) => [pin.name, pin.version]
                )
        )
    );
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
