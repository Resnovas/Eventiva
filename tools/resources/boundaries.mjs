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
/**
 * List every file below a directory, skipping build output, dependencies and archived examples.
 *
 * @param {string} directory - The directory to walk; a missing directory yields no files.
 * @returns {string[]} The joined paths of every file found, depth first.
 */
const files = (directory) =>
    existsSync(directory)
        ? readdirSync(directory, { withFileTypes: true }).flatMap(
              /**
               * Expand one directory entry into the files it holds.
               *
               * @param {import('node:fs').Dirent} entry - One entry of the directory being walked.
               * @returns {string[]} No paths for an ignored name, the subtree for a directory, else the file itself.
               */
              (entry) => {
                  if (ignored.has(entry.name)) return [];
                  const path = join(directory, entry.name);
                  return entry.isDirectory() ? files(path) : [path];
              }
          )
        : [];

/**
 * Report every module specifier a source file loads: imports, re-exports, import types, `import =` and `import()` or `require` calls.
 *
 * @param {ts.SourceFile} ast - The parsed source file to walk.
 * @param {(specifier: ts.Expression, node: ts.Node) => void} dependency - Called with each specifier expression and the node that loads it.
 */
const references = (ast, dependency) => {
    /**
     * Report the specifier this node loads, if any, then descend into its children.
     *
     * @param {ts.Node} node - The syntax node to inspect.
     */
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
/**
 * Choose the compiler options that resolve a file's imports: the caller's overrides, else the nearest tsconfig.
 *
 * @param {string} root - The repository root, where `tsconfig.base.json` is the fallback.
 * @param {string} path - The file whose imports will be resolved.
 * @param {ts.CompilerOptions | undefined} overrides - Options that replace any discovered configuration.
 * @returns {ts.CompilerOptions} The overrides, the parsed nearest configuration, or empty options when none exists.
 */
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

/**
 * Find the emitted declaration file behind every package export, the public surface consumers type against.
 *
 * @param {string} root - The repository root whose `packages` directory holds the manifests.
 * @returns {string[]} The absolute path of each export's `types` target.
 */
const declarationEntries = (root) =>
    files(join(root, 'packages'))
        .filter(
            /**
             * Keep only package manifests.
             *
             * @param {string} path - One file below `packages`.
             * @returns {boolean} Whether it is a `package.json`.
             */
            (path) => path.endsWith('/package.json')
        )
        .flatMap(
            /**
             * Read a manifest's exports and resolve each declared `types` target beside it.
             *
             * @param {string} path - The manifest's path.
             * @returns {string[]} The resolved declaration paths it exports.
             */
            (path) => {
                const manifest = JSON.parse(readFileSync(path, 'utf8'));
                return Object.values(manifest.exports ?? {}).flatMap(
                    /**
                     * Resolve one export condition object's declaration target.
                     *
                     * @param {unknown} target - One value of the manifest's `exports` map.
                     * @returns {string[]} Its resolved `types` path, or nothing for a string or untyped export.
                     */
                    (target) =>
                        typeof target === 'object' && target.types ? [resolve(dirname(path), target.types)] : []
                );
            }
        );

/**
 * Resource-rooted resolved graph audit, not a replacement for the coordinator's complete Nx/TS graph gate.
 *
 * @since 0.0.1
 * @param {string} root - The repository root every reported path is relative to.
 * @param {object} [options] - Which entries to start from and which package edges are allowed.
 * @param {string[]} [options.entries] - Root-relative files to start from; defaults to the three resource modules.
 * @param {ts.CompilerOptions} [options.compilerOptions] - Options that replace each file's discovered tsconfig.
 * @param {boolean} [options.declarations] - Audit emitted `.d.ts` files instead of source, ignoring the source condition.
 * @param {Record<string, string[]>} [options.permitted] - For each package, the packages it may depend on.
 * @returns {{ scanned: number, edges: string[][], findings: object[] }} How many files were visited, the resolved first-party edges and every violation with its import chain.
 * @example
 * const { findings } = checkResourceGraph(process.cwd());
 */
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
    /**
     * Name the workspace package a file belongs to, treating each integration as its own package.
     *
     * @param {string} path - An absolute file path.
     * @returns {string | undefined} A key such as `runtime` or `integrations/sql`, or nothing outside `packages`.
     */
    const packageOf = (path) => relative(root, path).match(/^packages\/(integrations\/[^/]+|[^/]+)\//)?.[1];
    /**
     * Walk one file's resolved dependencies depth first, recording edges, cycles and forbidden package edges.
     *
     * @param {string} path - The file to visit.
     * @param {string[]} chain - The root-relative import chain that reached it, for reporting.
     */
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
        references(
            ast,
            /**
             * Resolve one specifier and either report it or follow it into the first-party graph.
             *
             * @param {ts.Expression} specifier - The expression naming the loaded module.
             */
            (specifier) => {
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
                                  /**
                                   * Drop the source condition so resolution lands on emitted declarations.
                                   *
                                   * @param {string} condition - One configured custom export condition.
                                   * @returns {boolean} Whether it is anything other than `@eventiva/source`.
                                   */
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
            }
        );
        active.delete(path);
    };
    for (const path of entries) visit(resolve(root, path), [relative(root, resolve(root, path))]);
    return { scanned: seen.size, edges, findings };
};

/**
 * Closed paths include type-only and manifest edges; a shared dependency is not a cycle.
 *
 * @since 0.0.1
 * @param {Array<[string, string]>} edges - Directed `[from, to]` pairs, file or package names.
 * @returns {string[][]} Each cycle found, as the node sequence that returns to its first node.
 * @example
 * const cycles = dependencyCycles([['a', 'b'], ['b', 'a']]);
 */
export const dependencyCycles = (edges) => {
    const adjacency = new Map();
    for (const [from, to] of edges) {
        if (!adjacency.has(from)) adjacency.set(from, new Set());
        adjacency.get(from).add(to);
    }
    const done = new Set();
    const active = new Set();
    const cycles = [];
    /**
     * Depth-first search that records a cycle whenever it re-enters a node still on the current path.
     *
     * @param {string} node - The node to explore.
     * @param {string[]} path - The nodes on the current path before this one.
     */
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
/**
 * Serialise a syntax subtree as nested `[kind, flags, children or leaf text]` tuples, ignoring comments and whitespace.
 *
 * @param {ts.Node} node - The subtree root.
 * @param {ts.SourceFile} ast - The source file the node belongs to, for leaf text.
 * @returns {Array<unknown>} The structural shape that `approvedCanonicalJson` hashes.
 */
const astShape = (node, ast) => {
    const children = [];
    ts.forEachChild(
        node,
        /**
         * Append one child's shape in source order.
         *
         * @param {ts.Node} child - A direct child of the node.
         */
        (child) => {
            children.push(astShape(child, ast));
        }
    );
    return [node.kind, node.flags, children.length ? children : node.getText(ast)];
};
/**
 * Approve one `unknown` keyword only when it types the `child` binding inside the owner-approved `canonicalJson` statement of the runtime invocation module.
 *
 * @param {ts.Node} node - The `unknown` keyword under review.
 * @param {ts.SourceFile} ast - The parsed file containing it.
 * @param {string} path - The file's root-relative path.
 * @param {boolean} declarations - Whether emitted declarations are being audited, where no approval applies.
 * @returns {boolean} Whether the enclosing statement's AST fingerprint matches `approvedCanonicalJson`.
 */
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

/**
 * Audit owned syntax escapes, following first-party declaration closure but never policing dependency internals.
 *
 * @since 0.0.1
 * @param {string} root - The repository root every reported path is relative to.
 * @param {object} [options] - Which files to audit.
 * @param {string[]} [options.entries] - Root-relative files to audit; defaults to every source under `packages` and `apps`, or every exported declaration.
 * @param {boolean} [options.declarations] - Audit emitted declarations and the owned declarations they import, instead of source.
 * @returns {{ scanned: number, findings: object[] }} How many files were audited and each `any`, `unknown`, assertion, erased schema or suppression found, with its line.
 * @example
 * const { findings } = checkTypeEscapes(process.cwd(), { declarations: true });
 */
export const checkTypeEscapes = (root, { entries, declarations = false } = {}) => {
    const repository = realpathSync(root);
    /**
     * Canonical paths keep workspace symlinks owned and dependency symlinks outside the audit.
     *
     * @param {string} path - A declaration path, possibly a symlink or not yet emitted.
     * @returns {boolean} Whether its real location is inside the repository, outside `externals` and `node_modules`.
     */
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
        entries?.map(
            /**
             * Anchor a caller-supplied entry at the repository root.
             *
             * @param {string} path - A root-relative or absolute entry.
             * @returns {string} Its absolute path.
             */
            (path) => resolve(root, path)
        ) ??
        (declarations
            ? declarationEntries(root)
            : ['packages', 'apps']
                  .flatMap(
                      /**
                       * List every file under one top-level workspace directory.
                       *
                       * @param {string} top - `packages` or `apps`.
                       * @returns {string[]} The files below it.
                       */
                      (top) => files(join(root, top))
                  )
                  .filter(
                      /**
                       * Keep TypeScript source under `src`, excluding tests and fixtures.
                       *
                       * @param {string} path - One workspace file.
                       * @returns {boolean} Whether it is production TypeScript source.
                       */
                      (path) => /\/src\/.*\.[cm]?tsx?$/.test(path) && !/\/(?:tests|fixtures)\//.test(path)
                  ));
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
            references(
                ast,
                /**
                 * Queue an owned emitted declaration this declaration imports, so the audit covers its closure.
                 *
                 * @param {ts.Expression} specifier - The expression naming the loaded module.
                 */
                (specifier) => {
                    if (!ts.isStringLiteralLike(specifier)) return;
                    const target = ts.resolveModuleName(
                        specifier.text,
                        path,
                        {
                            ...options,
                            customConditions: (options.customConditions ?? []).filter(
                                /**
                                 * Drop the source condition so resolution lands on emitted declarations.
                                 *
                                 * @param {string} condition - One configured custom export condition.
                                 * @returns {boolean} Whether it is anything other than `@eventiva/source`.
                                 */
                                (condition) => condition !== '@eventiva/source'
                            ),
                        },
                        ts.sys
                    ).resolvedModule?.resolvedFileName;
                    if (target && /\.d\.[cm]?ts$/.test(target) && ownedDeclaration(target))
                        paths.add(realpathSync(target));
                }
            );
        }
        const reflectionApprovals = new Set();
        /**
         * Collect every `unknown` keyword in the file that the fingerprinted reflection ingress approves.
         *
         * @param {ts.Node} node - The subtree to search.
         */
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
        /**
         * Serve only the already parsed file, so the checker binds local symbols without reading anything else.
         *
         * @param {string} name - The file the program asks for.
         * @returns {ts.SourceFile | undefined} The parsed file when it is the audited one, else nothing.
         */
        host.getSourceFile = (name) => (name === path ? ast : undefined);
        const checker = ts.createProgram([path], options, host).getTypeChecker();
        /**
         * Classify an import specifier by whether it is Effect's root module or its Schema module.
         *
         * @param {string} name - The module specifier text.
         * @returns {'effect' | 'schema' | 'other'} The origin used to trace Schema members.
         */
        const moduleOrigin = (name) => (name === 'effect' ? 'effect' : name === 'effect/Schema' ? 'schema' : 'other');
        /**
         * Follow one member access from a known origin: `Schema` leads into the Schema module, and its erasing members are flagged.
         *
         * @param {string | undefined} origin - Where the accessed object came from.
         * @param {string} name - The member name being read.
         * @returns {'schema' | 'erased' | undefined} The member's origin, `erased` for `Unknown`, `Any` or `AnyNoContext`, or nothing when untracked.
         */
        const memberOrigin = (origin, name) => {
            if ((origin === 'effect' || origin === 'schema') && name === 'Schema') return 'schema';
            if (origin === 'schema' && ['Unknown', 'Any', 'AnyNoContext'].includes(name)) return 'erased';
            return undefined;
        };
        /**
         * Trace a local symbol back to the import that introduced it, if it came from Effect.
         *
         * @param {ts.Symbol | undefined} symbol - The symbol an identifier binds to.
         * @returns {'effect' | 'schema' | 'erased' | 'other' | undefined} The import's origin, or nothing for a non-import symbol.
         */
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
        /**
         * Resolve where a name or dotted access such as `S.Unknown` or `Schema.Any` comes from.
         *
         * @param {ts.Node} node - An identifier, property access or qualified name.
         * @param {string} [origin] - A known origin for the leftmost name, used inside `import()` types.
         * @returns {string | undefined} `erased` for an erasing Schema member, another origin, or nothing when untracked.
         */
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
        /**
         * Record a finding at the node's one-based line.
         *
         * @param {ts.Node} node - The offending syntax.
         * @param {string} reason - Why it is a type escape.
         * @returns {number} The new findings count, from `Array.prototype.push`.
         */
        const report = (node, reason) =>
            findings.push({
                path: relative(root, path),
                line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
                reason,
            });
        /**
         * Report every unapproved `any` or `unknown`, type or non-null assertion and erased Schema use below a node.
         *
         * @param {ts.Node} node - The subtree to audit; import declarations are skipped.
         */
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

/**
 * Audit every active source and the declared package graph, including packages with no incoming imports.
 *
 * @since 0.0.1
 * @param {string} root - The repository root every reported path is relative to.
 * @param {object} [options] - Whether to audit source or emitted declarations.
 * @param {boolean} [options.declarations] - Start from every exported declaration instead of every source file.
 * @returns {{ scanned: number, edges: string[][], findings: object[], packages: number, packageEdges: string[][], packageCycles: string[][] }} The file graph result plus the manifest and import package edges and any package cycles.
 * @example
 * const { packageCycles } = checkWorkspaceGraph(process.cwd());
 */
export const checkWorkspaceGraph = (root, { declarations = false } = {}) => {
    const all = ['packages', 'apps', 'tests', 'ai-docs'].flatMap(
        /**
         * List every file under one top-level workspace directory.
         *
         * @param {string} top - One of the audited top-level directories.
         * @returns {string[]} The files below it.
         */
        (top) => files(join(root, top))
    );
    const entries = declarations
        ? declarationEntries(root)
        : all.filter(
              /**
               * Keep source files that are not test fixtures.
               *
               * @param {string} path - One workspace file.
               * @returns {boolean} Whether it is source outside a `fixtures` directory.
               */
              (path) => source.test(path) && !path.includes('/fixtures/')
          );
    const result = checkResourceGraph(root, { entries, permitted: {}, declarations });
    const manifests = all
        .filter(
            /**
             * Keep only package manifests.
             *
             * @param {string} path - One workspace file.
             * @returns {boolean} Whether it is a `package.json`.
             */
            (path) => path.endsWith('/package.json')
        )
        .map(
            /**
             * Read a manifest and remember the directory it owns.
             *
             * @param {string} path - The manifest's path.
             * @returns {{ directory: string, manifest: object }} The package directory and its parsed manifest.
             */
            (path) => ({
                directory: dirname(path),
                manifest: JSON.parse(readFileSync(path, 'utf8')),
            })
        );
    const names = new Set(
        manifests.map(
            /**
             * Read a workspace package's name.
             *
             * @param {{ manifest: object }} entry - One read manifest.
             * @returns {string} Its `name` field.
             */
            (entry) => entry.manifest.name
        )
    );
    /**
     * Name the innermost workspace package that contains a file.
     *
     * @param {string} path - A root-relative file path.
     * @returns {string | undefined} The deepest enclosing manifest's name, or nothing outside every package.
     */
    const owner = (path) =>
        manifests
            .filter(
                /**
                 * Keep packages whose directory contains the file.
                 *
                 * @param {{ directory: string }} entry - One read manifest.
                 * @returns {boolean} Whether the file lies below its directory.
                 */
                (entry) => resolve(root, path).startsWith(entry.directory + '/')
            )
            .sort(
                /**
                 * Order enclosing packages deepest first.
                 *
                 * @param {{ directory: string }} a - One enclosing package.
                 * @param {{ directory: string }} b - Another enclosing package.
                 * @returns {number} Positive when `b` is deeper than `a`.
                 */
                (a, b) => b.directory.length - a.directory.length
            )[0]?.manifest.name;
    const edges = manifests.flatMap(
        /**
         * List a package's declared dependencies on other workspace packages.
         *
         * @param {{ manifest: object }} entry - One read manifest.
         * @returns {string[][]} A `[package, dependency]` edge per workspace dependency, of any kind.
         */
        (entry) =>
            Object.keys({
                ...entry.manifest.dependencies,
                ...entry.manifest.devDependencies,
                ...entry.manifest.peerDependencies,
            })
                .filter(
                    /**
                     * Keep only dependencies that are workspace packages.
                     *
                     * @param {string} name - One dependency name.
                     * @returns {boolean} Whether a workspace manifest has that name.
                     */
                    (name) => names.has(name)
                )
                .map(
                    /**
                     * Pair the package with one of its workspace dependencies.
                     *
                     * @param {string} name - The dependency's name.
                     * @returns {string[]} The `[package, dependency]` edge.
                     */
                    (name) => [entry.manifest.name, name]
                )
    );
    for (const [from, to] of result.edges) {
        const a = owner(from);
        const b = owner(to);
        if (a && b && a !== b) edges.push([a, b]);
    }
    const cycles = dependencyCycles(edges);
    return { ...result, packages: manifests.length, packageEdges: edges, packageCycles: cycles };
};

/**
 * Audit feature dependency closure in source or exported declarations using TypeScript resolution, not import-text matching.
 *
 * @since 0.0.1
 * @param {string} root - The repository root every reported path is relative to.
 * @param {object} [options] - Which feature files to start from and how to resolve them.
 * @param {string[]} [options.entries] - Root-relative files to start from; defaults to every source in a `type:feature` or `type:extension` project or a `features` or `extensions` directory.
 * @param {ts.CompilerOptions} [options.compilerOptions] - Options that replace each file's discovered tsconfig.
 * @param {boolean} [options.declarations] - Audit the emitted declarations of feature packages instead of source.
 * @returns {{ scanned: number, findings: object[] }} How many feature entries were audited and each route to SQL, a database or network driver, or a privileged resource port, with its chain.
 * @example
 * const { findings } = checkResourceBoundaries(process.cwd());
 */
export const checkResourceBoundaries = (root, { entries, compilerOptions, declarations = false } = {}) => {
    const all = ['packages', 'apps'].flatMap(
        /**
         * List every file under one top-level workspace directory.
         *
         * @param {string} top - `packages` or `apps`.
         * @returns {string[]} The files below it.
         */
        (top) => files(join(root, top))
    );
    const roots = all
        .filter(
            /**
             * Keep only Nx project files.
             *
             * @param {string} path - One workspace file.
             * @returns {boolean} Whether it is a `project.json`.
             */
            (path) => path.endsWith('/project.json')
        )
        .flatMap(
            /**
             * Keep the directory of a project tagged as a feature or extension.
             *
             * @param {string} path - The project file's path.
             * @returns {string[]} The project directory when tagged, else nothing.
             */
            (path) => {
                const project = JSON.parse(readFileSync(path, 'utf8'));
                return project.tags?.some(
                    /**
                     * Recognise a feature or extension project tag.
                     *
                     * @param {string} tag - One Nx project tag.
                     * @returns {boolean} Whether it is `type:extension` or `type:feature`.
                     */
                    (tag) => ['type:extension', 'type:feature'].includes(tag)
                )
                    ? [dirname(path)]
                    : [];
            }
        );
    const starts =
        entries?.map(
            /**
             * Anchor a caller-supplied entry at the repository root.
             *
             * @param {string} path - A root-relative or absolute entry.
             * @returns {string} Its absolute path.
             */
            (path) => resolve(root, path)
        ) ??
        (declarations ? declarationEntries(root) : all).filter(
            /**
             * Keep source inside a feature or extension project or directory.
             *
             * @param {string} path - One candidate file.
             * @returns {boolean} Whether it is feature source.
             */
            (path) =>
                source.test(path) &&
                (roots.some(
                    /**
                     * Check whether the file sits inside a tagged project.
                     *
                     * @param {string} dir - One feature or extension project directory.
                     * @returns {boolean} Whether the file lies below it.
                     */
                    (dir) => path.startsWith(dir + '/')
                ) ||
                    /\/(?:features|extensions)\//.test(path))
        );
    const findings = [];
    const seen = new Set();
    /**
     * Follow a feature file's dependencies until they leave the workspace or reach something privileged.
     *
     * @param {string} path - The file to visit.
     * @param {string[]} chain - The import chain that reached it, for reporting.
     */
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
        /**
         * Refuse a privileged or unresolved dependency of a feature file, otherwise follow it.
         *
         * @param {ts.Expression} specifier - The expression naming the loaded module.
         * @param {ts.Node} node - The import, export, import type or call that loads it, inspected for privileged bindings.
         */
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
                              /**
                               * Drop the source condition so resolution lands on emitted declarations.
                               *
                               * @param {string} condition - One configured custom export condition.
                               * @returns {boolean} Whether it is anything other than `@eventiva/source`.
                               */
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
                (bindings?.elements?.some(
                    /**
                     * Detect a named binding of a privileged port, by its exported name.
                     *
                     * @param {ts.ImportSpecifier | ts.ExportSpecifier} element - One named import or export.
                     * @returns {boolean} Whether it names `ResourceDriver` or `ResourceProvider`.
                     */
                    (element) => privileged.has((element.propertyName ?? element.name).text)
                ) ||
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
