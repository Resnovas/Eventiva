/**
 * @file tools/resources/boundaries.mjs
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
import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const forbidden =
    /^(?:@effect\/sql(?:-|\/|$)|@eventiva\/integrations\.sql(?:\/|$)|@neondatabase\/|pg(?:-|\/|$)|postgres(?:\/|$)|mysql2?(?:\/|$)|mariadb(?:\/|$)|better-sqlite3(?:\/|$)|sqlite3?(?:\/|$)|expo-sqlite(?:\/|$)|(?:node:|bun:)?sqlite$|(?:node:)?(?:net|tls|dgram|http|https)$|drizzle-orm(?:\/|$)|knex(?:\/|$)|kysely(?:\/|$)|@prisma\/|sequelize(?:\/|$)|mssql(?:\/|$))/;
const privileged = new Set(['ResourceDriver', 'ResourceProvider']);
const ignored = new Set([
    'node_modules',
    'dist',
    'out-tsc',
    'test-output',
    'test-results',
    'playwright-report',
    '.expo',
    '.git',
    '.nx',
    'examples',
]);
const source = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const files = (directory) =>
    existsSync(directory)
        ? readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
              if (ignored.has(entry.name)) return [];
              const path = join(directory, entry.name);
              return entry.isDirectory() ? files(path) : [path];
          })
        : [];

const references = (ast, dependency) => {
    const walk = (node) => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier)
            dependency(node.moduleSpecifier, node);
        else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument))
            dependency(node.argument.literal, node);
        else if (
            ts.isImportEqualsDeclaration(node) &&
            ts.isExternalModuleReference(node.moduleReference) &&
            node.moduleReference.expression
        )
            dependency(node.moduleReference.expression, node);
        else if (
            ts.isCallExpression(node) &&
            (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
                (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
        ) {
            if (node.arguments[0]) dependency(node.arguments[0], node);
        }
        ts.forEachChild(node, walk);
    };
    walk(ast);
};
const optionsFor = (root, path, overrides) => {
    if (overrides) return overrides;
    const config =
        ts.findConfigFile(dirname(path), ts.sys.fileExists, 'tsconfig.json') ??
        ts.findConfigFile(root, ts.sys.fileExists, 'tsconfig.base.json');
    return config
        ? ts.parseJsonConfigFileContent(ts.readConfigFile(config, ts.sys.readFile).config, ts.sys, dirname(config))
              .options
        : {};
};

const declarationEntries = (root) =>
    files(join(root, 'packages'))
        .filter((path) => path.endsWith('/package.json'))
        .flatMap((path) => {
            const manifest = JSON.parse(readFileSync(path, 'utf8'));
            return Object.values(manifest.exports ?? {}).flatMap((target) =>
                typeof target === 'object' && target.types ? [resolve(dirname(path), target.types)] : []
            );
        });

/** Resource-rooted resolved graph audit, not a replacement for the coordinator's complete Nx/TS graph gate. */
export const checkResourceGraph = (
    root,
    {
        entries = [
            'packages/contracts/src/resource.ts',
            'packages/runtime/src/resource.ts',
            'packages/integrations/sql/src/resource.ts',
        ],
        compilerOptions,
        declarations = false,
        permitted = {
            contracts: ['contracts'],
            runtime: ['contracts', 'runtime'],
            'integrations/sql': ['contracts', 'integrations/sql'],
        },
    } = {}
) => {
    const findings = [];
    const seen = new Set();
    const active = new Set();
    const edges = [];
    const packageOf = (path) => relative(root, path).match(/^packages\/(integrations\/[^/]+|[^/]+)\//)?.[1];
    const visit = (path, chain) => {
        path = resolve(path);
        if (active.has(path)) {
            findings.push({
                path: relative(root, path),
                reason: 'Resolved dependency cycle',
                chain: chain.slice(chain.indexOf(relative(root, path))),
            });
            return;
        }
        if (seen.has(path)) return;
        seen.add(path);
        if (declarations && !existsSync(path)) {
            findings.push({ path: relative(root, path), reason: 'Missing emitted public declaration', chain });
            return;
        }
        active.add(path);
        const ast = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
        const options = optionsFor(root, path, compilerOptions);
        references(ast, (specifier) => {
            if (!ts.isStringLiteralLike(specifier)) {
                findings.push({ path: relative(root, path), reason: 'Nonliteral dependency', chain });
                return;
            }
            const name = specifier.text;
            const resolved = ts.resolveModuleName(
                name,
                path,
                declarations
                    ? {
                          ...options,
                          customConditions: (options.customConditions ?? []).filter(
                              (condition) => condition !== '@eventiva/source'
                          ),
                      }
                    : options,
                ts.sys
            ).resolvedModule;
            if (!resolved) {
                if (name.startsWith('.') || name.startsWith('@eventiva/') || isAbsolute(name))
                    findings.push({
                        path: relative(root, path),
                        reason: `Unresolved workspace dependency: ${name}`,
                        chain,
                    });
                return;
            }
            const target = resolve(resolved.resolvedFileName);
            const owner = packageOf(path);
            const destination = packageOf(target);
            const next = [...chain, relative(root, target)];
            if (relative(root, target).split(/[\\/]/)[0] === 'externals') {
                findings.push({
                    path: relative(root, path),
                    reason: 'Executable/type dependency reaches reference-only upstream source',
                    chain: next,
                });
                return;
            }
            if (destination && permitted[owner] && !permitted[owner].includes(destination))
                findings.push({
                    path: relative(root, path),
                    reason: `Reverse package edge: ${owner} -> ${destination}`,
                    chain: next,
                });
            if (target.includes('/node_modules/')) return;
            if (declarations && !/\.d\.[cm]?ts$/.test(target)) {
                findings.push({
                    path: relative(root, path),
                    reason: 'Emitted declaration dependency resolves to non-declaration source',
                    chain: next,
                });
                return;
            }
            edges.push([relative(root, path), relative(root, target)]);
            visit(target, next);
        });
        active.delete(path);
    };
    for (const path of entries) visit(resolve(root, path), [relative(root, resolve(root, path))]);
    return { scanned: seen.size, edges, findings };
};

/** Closed paths include type-only and manifest edges; a shared dependency is not a cycle. */
export const dependencyCycles = (edges) => {
    const adjacency = new Map();
    for (const [from, to] of edges) {
        if (!adjacency.has(from)) adjacency.set(from, new Set());
        adjacency.get(from).add(to);
    }
    const done = new Set();
    const active = new Set();
    const cycles = [];
    const visit = (node, path) => {
        if (active.has(node)) {
            cycles.push([...path.slice(path.indexOf(node)), node]);
            return;
        }
        if (done.has(node)) return;
        active.add(node);
        for (const next of adjacency.get(node) ?? []) visit(next, [...path, node]);
        active.delete(node);
        done.add(node);
    };
    for (const node of adjacency.keys()) visit(node, []);
    return cycles;
};

/**
 * EVE-263 owner-approved AST fingerprint of the private reflection ingress and its recursive validator.
 * It pins the validator, descriptor guard, recursion, failure propagation and every local use, not just names.
 * Never regenerate it automatically on failure: a structural change needs owner review.
 */
const approvedCanonicalJson = 'cf74c13f411ebc48645c639b78988c97caf0d26975a7768f2b2644b9be9275cc';
const astShape = (node, ast) => {
    const children = [];
    ts.forEachChild(node, (child) => {
        children.push(astShape(child, ast));
    });
    return [node.kind, node.flags, children.length ? children : node.getText(ast)];
};
const approvedReflectionIngress = (node, ast, path, declarations) => {
    if (declarations || path !== 'packages/runtime/src/invocation.ts' || ast.parseDiagnostics.length) return false;
    const binding = node.parent;
    if (
        !ts.isVariableDeclaration(binding) ||
        binding.type !== node ||
        !ts.isIdentifier(binding.name) ||
        binding.name.text !== 'child' ||
        !binding.initializer ||
        !ts.isPropertyAccessExpression(binding.initializer) ||
        binding.initializer.getText(ast) !== 'descriptor.value'
    )
        return false;
    let statement = binding;
    while (statement.parent && statement.parent !== ast) statement = statement.parent;
    if (!ts.isVariableStatement(statement)) return false;
    const canonical = statement.declarationList.declarations;
    if (canonical.length !== 1 || canonical[0].name.getText(ast) !== 'canonicalJson') return false;
    return (
        createHash('sha256')
            .update(JSON.stringify(astShape(statement, ast)))
            .digest('hex') === approvedCanonicalJson
    );
};

/** Audit owned syntax escapes, following first-party declaration closure but never policing dependency internals. */
export const checkTypeEscapes = (root, { entries, declarations = false } = {}) => {
    const repository = realpathSync(root);
    /** Canonical paths keep workspace symlinks owned and dependency symlinks outside the audit. */
    const ownedDeclaration = (path) => {
        const location = relative(repository, existsSync(path) ? realpathSync(path) : resolve(path));
        const segments = location.split(/[\\/]/);
        return (
            !isAbsolute(location) &&
            segments[0] !== '..' &&
            segments[0] !== 'externals' &&
            !segments.includes('node_modules')
        );
    };
    const starts =
        entries?.map((path) => resolve(root, path)) ??
        (declarations
            ? declarationEntries(root)
            : ['packages', 'apps']
                  .flatMap((top) => files(join(root, top)))
                  .filter((path) => /\/src\/.*\.[cm]?tsx?$/.test(path) && !/\/(?:tests|fixtures)\//.test(path)));
    const paths = new Set(declarations ? starts.filter(ownedDeclaration) : starts);
    const findings = [];
    for (const path of paths) {
        if (!existsSync(path)) {
            findings.push({ path: relative(root, path), reason: 'Missing emitted public declaration' });
            continue;
        }
        const text = readFileSync(path, 'utf8');
        const ast = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
        if (declarations) {
            const options = optionsFor(root, path);
            references(ast, (specifier) => {
                if (!ts.isStringLiteralLike(specifier)) return;
                const target = ts.resolveModuleName(
                    specifier.text,
                    path,
                    {
                        ...options,
                        customConditions: (options.customConditions ?? []).filter(
                            (condition) => condition !== '@eventiva/source'
                        ),
                    },
                    ts.sys
                ).resolvedModule?.resolvedFileName;
                if (target && /\.d\.[cm]?ts$/.test(target) && ownedDeclaration(target)) paths.add(realpathSync(target));
            });
        }
        const reflectionApprovals = new Set();
        const reviewReflection = (node) => {
            if (
                node.kind === ts.SyntaxKind.UnknownKeyword &&
                approvedReflectionIngress(node, ast, relative(root, path), declarations)
            )
                reflectionApprovals.add(node);
            ts.forEachChild(node, reviewReflection);
        };
        reviewReflection(ast);
        const options = { noResolve: true, noLib: true, target: ts.ScriptTarget.Latest };
        const host = ts.createCompilerHost(options);
        host.getSourceFile = (name) => (name === path ? ast : undefined);
        const checker = ts.createProgram([path], options, host).getTypeChecker();
        const moduleOrigin = (name) => (name === 'effect' ? 'effect' : name === 'effect/Schema' ? 'schema' : 'other');
        const memberOrigin = (origin, name) => {
            if ((origin === 'effect' || origin === 'schema') && name === 'Schema') return 'schema';
            if (origin === 'schema' && ['Unknown', 'Any', 'AnyNoContext'].includes(name)) return 'erased';
            return undefined;
        };
        const symbolOrigin = (symbol) => {
            for (const binding of symbol?.declarations ?? []) {
                if (!ts.isImportSpecifier(binding) && !ts.isNamespaceImport(binding)) continue;
                let declaration = binding.parent;
                while (declaration && !ts.isImportDeclaration(declaration)) declaration = declaration.parent;
                if (!declaration || !ts.isStringLiteralLike(declaration.moduleSpecifier)) continue;
                const origin = moduleOrigin(declaration.moduleSpecifier.text);
                return ts.isNamespaceImport(binding)
                    ? origin
                    : memberOrigin(origin, (binding.propertyName ?? binding.name).text);
            }
            return undefined;
        };
        const schemaOrigin = (node, origin) => {
            if (ts.isIdentifier(node)) {
                if (origin) return memberOrigin(origin, node.text);
                const symbol = checker.getSymbolAtLocation(node);
                return symbolOrigin(symbol) ?? (!symbol?.declarations && node.text === 'Schema' ? 'schema' : undefined);
            }
            if (ts.isPropertyAccessExpression(node) || ts.isQualifiedName(node))
                return memberOrigin(
                    schemaOrigin(ts.isQualifiedName(node) ? node.left : node.expression, origin),
                    (ts.isQualifiedName(node) ? node.right : node.name).text
                );
            return undefined;
        };
        const report = (node, reason) =>
            findings.push({
                path: relative(root, path),
                line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
                reason,
            });
        const visit = (node) => {
            if (ts.isImportDeclaration(node)) return;
            if (ts.isExportSpecifier(node)) {
                const declaration = node.parent.parent;
                const origin = declaration.moduleSpecifier
                    ? memberOrigin(
                          moduleOrigin(declaration.moduleSpecifier.text),
                          (node.propertyName ?? node.name).text
                      )
                    : symbolOrigin(checker.getExportSpecifierLocalTargetSymbol(node));
                if (origin === 'erased') report(node, 'Erased schema contract');
                return;
            }
            if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && node.qualifier) {
                if (schemaOrigin(node.qualifier, moduleOrigin(node.argument.literal.text)) === 'erased')
                    report(node, 'Erased schema contract');
                for (const argument of node.typeArguments ?? []) visit(argument);
                return;
            }
            if (
                node.kind === ts.SyntaxKind.AnyKeyword ||
                (node.kind === ts.SyntaxKind.UnknownKeyword && !reflectionApprovals.has(node))
            )
                report(node, 'Erased any/unknown type');
            if ((ts.isAsExpression(node) && node.type.getText(ast) !== 'const') || ts.isTypeAssertionExpression(node))
                report(node, 'Unchecked type assertion');
            if (ts.isNonNullExpression(node)) report(node, 'Unchecked non-null assertion');
            if (
                (ts.isPropertyAccessExpression(node) || ts.isQualifiedName(node) || ts.isIdentifier(node)) &&
                schemaOrigin(node) === 'erased'
            )
                report(node, 'Erased schema contract');
            ts.forEachChild(node, visit);
        };
        visit(ast);
        if (/@ts-(?:ignore|expect-error|nocheck)|@effect-diagnostics[^\n]*:off|eslint-disable/.test(text))
            findings.push({ path: relative(root, path), reason: 'Suppressed type or lint diagnostic' });
    }
    return { scanned: paths.size, findings };
};

/** Audit every active source and the declared package graph, including packages with no incoming imports. */
export const checkWorkspaceGraph = (root, { declarations = false } = {}) => {
    const all = ['packages', 'apps', 'tests', 'ai-docs'].flatMap((top) => files(join(root, top)));
    const entries = declarations
        ? declarationEntries(root)
        : all.filter((path) => source.test(path) && !path.includes('/fixtures/'));
    const result = checkResourceGraph(root, { entries, permitted: {}, declarations });
    const manifests = all
        .filter((path) => path.endsWith('/package.json'))
        .map((path) => ({
            directory: dirname(path),
            manifest: JSON.parse(readFileSync(path, 'utf8')),
        }));
    const names = new Set(manifests.map(({ manifest }) => manifest.name));
    const owner = (path) =>
        manifests
            .filter(({ directory }) => resolve(root, path).startsWith(directory + '/'))
            .sort((a, b) => b.directory.length - a.directory.length)[0]?.manifest.name;
    const edges = manifests.flatMap(({ manifest }) =>
        Object.keys({
            ...manifest.dependencies,
            ...manifest.devDependencies,
            ...manifest.peerDependencies,
        })
            .filter((name) => names.has(name))
            .map((name) => [manifest.name, name])
    );
    for (const [from, to] of result.edges) {
        const a = owner(from);
        const b = owner(to);
        if (a && b && a !== b) edges.push([a, b]);
    }
    const cycles = dependencyCycles(edges);
    return { ...result, packages: manifests.length, packageEdges: edges, packageCycles: cycles };
};

/** Audit feature dependency closure in source or exported declarations using TypeScript resolution, not import-text matching. */
export const checkResourceBoundaries = (root, { entries, compilerOptions, declarations = false } = {}) => {
    const all = ['packages', 'apps'].flatMap((top) => files(join(root, top)));
    const roots = all
        .filter((path) => path.endsWith('/project.json'))
        .flatMap((path) => {
            const project = JSON.parse(readFileSync(path, 'utf8'));
            return project.tags?.some((tag) => ['type:extension', 'type:feature'].includes(tag)) ? [dirname(path)] : [];
        });
    const starts =
        entries?.map((path) => resolve(root, path)) ??
        (declarations ? declarationEntries(root) : all).filter(
            (path) =>
                source.test(path) &&
                (roots.some((dir) => path.startsWith(dir + '/')) || /\/(?:features|extensions)\//.test(path))
        );
    const findings = [];
    const seen = new Set();
    const visit = (path, chain) => {
        path = resolve(path);
        if (seen.has(path)) return;
        seen.add(path);
        if (declarations && !existsSync(path)) {
            findings.push({ path: relative(root, path), reason: 'Missing emitted public declaration', chain });
            return;
        }
        if (/\/packages\/integrations\/sql\//.test(path)) {
            findings.push({
                path: relative(root, path),
                reason: 'Feature reaches privileged SQL implementation',
                chain,
            });
            return;
        }
        const text = readFileSync(path, 'utf8');
        const ast = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
        const dependency = (specifier, node) => {
            if (!ts.isStringLiteralLike(specifier)) {
                findings.push({
                    path: relative(root, path),
                    reason: 'Nonliteral module loading hides the feature dependency graph',
                    chain,
                });
                return;
            }
            const name = specifier.text;
            const next = [...chain, name];
            const options = optionsFor(root, path, compilerOptions);
            const resolved = ts.resolveModuleName(
                name,
                path,
                declarations
                    ? {
                          ...options,
                          customConditions: (options.customConditions ?? []).filter(
                              (condition) => condition !== '@eventiva/source'
                          ),
                      }
                    : options,
                ts.sys
            ).resolvedModule;
            const target = resolved?.resolvedFileName ?? '';
            const isPort =
                name === '@eventiva/contracts/resource' ||
                /\/packages\/contracts\/(?:src|dist)\/resource(?:\.d)?\.[cm]?[jt]s$/.test(target);
            const bindings = node.importClause?.namedBindings ?? node.exportClause;
            const qualifier = ts.isImportTypeNode(node) ? node.qualifier?.getText(ast).split('.')[0] : undefined;
            const hiddenPort =
                isPort &&
                (bindings?.elements?.some((element) => privileged.has((element.propertyName ?? element.name).text)) ||
                    (qualifier && privileged.has(qualifier)) ||
                    (!bindings && !qualifier) ||
                    (bindings && ts.isNamespaceImport(bindings)));
            const vendor = target.split('/node_modules/').at(-1) ?? '';
            if (forbidden.test(name) || forbidden.test(vendor) || hiddenPort) {
                findings.push({
                    path: relative(root, path),
                    reason: `Feature reaches privileged dependency: ${name}`,
                    chain: next,
                });
                return;
            }
            if (resolved && !target.includes('/node_modules/')) {
                if (declarations && !/\.d\.[cm]?ts$/.test(target)) {
                    findings.push({
                        path: relative(root, path),
                        reason: 'Emitted declaration dependency resolves to non-declaration source',
                        chain: next,
                    });
                    return;
                }
                visit(target, next);
            } else if (!resolved && (name.startsWith('.') || name.startsWith('@eventiva/') || isAbsolute(name)))
                findings.push({
                    path: relative(root, path),
                    reason: `Unresolved workspace dependency: ${name}`,
                    chain: next,
                });
        };
        references(ast, dependency);
    };
    for (const path of starts) visit(path, [relative(root, path)]);
    return { scanned: starts.length, findings };
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
    const result = checkResourceBoundaries(root);
    const graph = checkResourceGraph(root);
    const workspace = checkWorkspaceGraph(root);
    const types = checkTypeEscapes(root, { declarations: process.argv.includes('--declarations') });
    const emitted = process.argv.includes('--declarations')
        ? checkWorkspaceGraph(root, { declarations: true })
        : undefined;
    const emittedResources = process.argv.includes('--declarations')
        ? checkResourceBoundaries(root, { declarations: true })
        : undefined;
    for (const finding of result.findings)
        console.error(`${finding.path}: ${finding.reason}\n  ${finding.chain.join(' -> ')}`);
    for (const finding of graph.findings)
        console.error(`${finding.path}: ${finding.reason}\n  ${finding.chain.join(' -> ')}`);
    for (const finding of workspace.findings)
        console.error(`${finding.path}: ${finding.reason}\n  ${finding.chain.join(' -> ')}`);
    for (const cycle of workspace.packageCycles) console.error(`Package cycle: ${cycle.join(' -> ')}`);
    for (const finding of types.findings) console.error(`${finding.path}:${finding.line ?? 1}: ${finding.reason}`);
    for (const finding of emitted?.findings ?? [])
        console.error(`${finding.path}: ${finding.reason}\n  ${finding.chain.join(' -> ')}`);
    for (const finding of emittedResources?.findings ?? [])
        console.error(`${finding.path}: ${finding.reason}\n  ${finding.chain.join(' -> ')}`);
    for (const cycle of emitted?.packageCycles ?? []) console.error(`Emitted package cycle: ${cycle.join(' -> ')}`);
    console.log(`Type boundaries: ${types.scanned} files, ${types.findings.length} violations`);
    console.log(`Resource boundaries: ${result.scanned} feature files, ${result.findings.length} violations`);
    if (emittedResources)
        console.log(
            `Emitted resource boundaries: ${emittedResources.scanned} feature declarations, ` +
                `${emittedResources.findings.length} violations`
        );
    console.log(
        `Resource-rooted graph: ${graph.scanned} files, ${graph.edges.length} edges, ${graph.findings.length} violations`
    );
    console.log(
        `Workspace graph: ${workspace.scanned} files, ${workspace.edges.length} source edges, ` +
            `${workspace.packages} packages, ${workspace.findings.length} source violations, ` +
            `${workspace.packageCycles.length} package cycles`
    );
    if (emitted)
        console.log(
            `Emitted graph: ${emitted.scanned} files, ${emitted.edges.length} declaration edges, ` +
                `${emitted.findings.length} violations, ${emitted.packageCycles.length} package cycles`
        );
    process.exitCode =
        result.findings.length ||
        graph.findings.length ||
        workspace.findings.length ||
        workspace.packageCycles.length ||
        types.findings.length ||
        emittedResources?.findings.length ||
        emitted?.findings.length ||
        emitted?.packageCycles.length
            ? 1
            : 0;
}
