/**
 * @file tools/storage/guard.mjs
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
import { lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const help = `Usage: node tools/storage/guard.mjs [--root DIR]
  [--migrations DIR --applied FILE] [--command COMMAND ...]

Dependency-free EVE-42 forward-only migration policy check. Never executes SQL
or commands, connects to a database, or writes a checksum ledger.

--root DIR        Repository to scan for package.json scripts (default: cwd).
                  Skips hidden, archived examples, vendored and build directories.
--migrations DIR  Recursively check every .sql file, relative to --root.
--applied FILE    Required with --migrations: trusted JSON object mapping applied
                  relative SQL paths to lowercase SHA-256 hashes of exact bytes.
                  Example: {"postgres/0001.sql":"<64 lowercase hex digits>"}
                  Supply from the deployment ledger or a protected baseline,
                  not a ledger editable alongside the candidate migrations.
--command TEXT    Also check a proposed command; repeatable. Does not execute it.
--help            Show this help and exit.

Examples:
  node tools/storage/guard.mjs
  node tools/storage/guard.mjs --migrations db/migrations --applied /trusted/applied.json
  node tools/storage/guard.mjs --command 'pnpm exec drizzle-kit push'
  node --test tools/storage/guard.test.mjs

Schema push via Drizzle/Prisma commands in scripts or --command is forbidden.
Every applied migration must still exist with its original checksum. New forward
migrations need no down step. No tenant-predicate checks are performed.

Before EACH destructive statement, add this line comment with a nonempty reason:
  -- migration-policy: allow-destructive compatibility window closed; restore tested
  ALTER TABLE events DROP COLUMN legacy_title;

Checks DROP, TRUNCATE, DELETE, REPLACE, INSERT OR REPLACE and ALTER TABLE/COLUMN
DROP, RENAME, TYPE, SET DATA TYPE or SET NOT NULL (including WITH-prefixed DML).
Opaque executable DO, function, procedure and trigger definitions also require
annotation because their bodies cannot be proven safe by this lexical check.
Comments, strings and quoted identifiers are not SQL keywords. An annotation
must precede the statement, not occur inside a string or a previous statement.

This is a static policy check, not a SQL parser, shell sandbox or proof of safe
recovery. Dynamic SQL, stored bodies and indirect shell wrappers require review.
Annotations record intent; compatibility, backfills and restore tests remain
deployment responsibilities. Root-check/CI wiring is a separate integration.
Without --migrations/--applied only command policy is checked; counts say so.
Exit 0: checked inputs pass. Exit 1: policy violation or invalid/unreadable input.
`;

const ignored = new Set([
    'examples',
    'externals',
    'node_modules',
    'dist',
    'coverage',
    'out-tsc',
    'test-output',
    'test-results',
    'playwright-report',
    'graphify-out',
    'tmp',
    'release',
]);

function packageFiles(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        if (entry.name.startsWith('.') || ignored.has(entry.name)) return [];
        const path = join(directory, entry.name);
        if (entry.isDirectory()) return packageFiles(path);
        return entry.isFile() && entry.name === 'package.json' ? [path] : [];
    });
}

function sqlFiles(directory, prefix = '') {
    if (!lstatSync(directory).isDirectory()) throw new Error(`Not a migration directory: ${directory}`);
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        const name = prefix + entry.name;
        if (entry.isSymbolicLink()) throw new Error(`Migration symlinks are not allowed: ${name}`);
        if (entry.isDirectory()) return sqlFiles(path, `${name}/`);
        return entry.isFile() && /\.sql$/i.test(name) ? [[name, readFileSync(path)]] : [];
    });
}

function statements(sql) {
    const result = [];
    let words = [];
    let annotated = false;
    let line = 1;
    let startLine = 1;
    let i = 0;
    const consume = (end) => {
        line += (sql.slice(i, end).match(/\n/g) ?? []).length;
        i = end;
    };
    const finish = () => {
        if (words.length) result.push({ words, annotated, line: startLine });
        words = [];
        annotated = false;
    };
    while (i < sql.length) {
        const rest = sql.slice(i);
        if (/^\s/.test(rest)) {
            consume(i + /^\s+/.exec(rest)[0].length);
        } else if (rest.startsWith('--')) {
            const end = sql.indexOf('\n', i);
            const comment = sql.slice(i, end === -1 ? sql.length : end).trimEnd();
            if (!words.length && /^--\s*migration-policy: allow-destructive\s+\S[^\r\n]*$/.test(comment)) {
                annotated = true;
            }
            consume(end === -1 ? sql.length : end);
        } else if (rest.startsWith('/*')) {
            let depth = 1;
            let end = i + 2;
            while (end < sql.length && depth) {
                if (sql.startsWith('/*', end)) {
                    depth++;
                    end += 2;
                } else if (sql.startsWith('*/', end)) {
                    depth--;
                    end += 2;
                } else end++;
            }
            if (depth) throw new Error(`Unterminated SQL comment at line ${line}`);
            consume(end);
        } else if (rest[0] === ';') {
            finish();
            consume(i + 1);
        } else {
            if (!words.length) startLine = line;
            const dollar = /^\$(?:[A-Za-z_][\w]*)?\$/.exec(rest)?.[0];
            if (dollar) {
                const end = sql.indexOf(dollar, i + dollar.length);
                if (end === -1) throw new Error(`Unterminated SQL dollar quote at line ${line}`);
                words.push('<quoted>');
                consume(end + dollar.length);
            } else if (["'", '"', '`', '['].includes(rest[0])) {
                const close = rest[0] === '[' ? ']' : rest[0];
                const escaped = rest[0] === "'" && words.at(-1) === 'E' && /[eE]$/.test(sql.slice(0, i));
                let end = i + 1;
                let closed = false;
                while (end < sql.length) {
                    if (escaped && sql[end] === '\\') end += 2;
                    else if (sql[end] === close) {
                        end++;
                        if (close !== ']' && sql[end] === close) end++;
                        else {
                            closed = true;
                            break;
                        }
                    } else end++;
                }
                if (!closed) throw new Error(`Unterminated SQL quote at line ${line}`);
                words.push('<quoted>');
                consume(end);
            } else {
                const word = /^[A-Za-z_][\w$]*/.exec(rest)?.[0];
                words.push(word ? word.toUpperCase() : rest[0]);
                consume(i + (word?.length ?? 1));
            }
        }
    }
    finish();
    return result;
}

function destructive(words) {
    const text = words.join(' ');
    if (words.some((word) => word === 'DROP' || word === 'TRUNCATE')) return true;
    if (words[0] === 'DELETE' || words[0] === 'REPLACE') return true;
    if (['WITH', 'EXPLAIN'].includes(words[0]) && words.includes('DELETE')) return true;
    if (/\bINSERT OR REPLACE\b/.test(text)) return true;
    if (words[0] === 'DO') return true;
    if (
        /^(?:CREATE (?:OR REPLACE )?(?:(?:TEMP|TEMPORARY|CONSTRAINT) )?|ALTER )(?:FUNCTION|PROCEDURE|TRIGGER)\b/.test(
            text
        )
    )
        return true;
    return (
        words[0] === 'ALTER' &&
        words[1] === 'TABLE' &&
        (/\bRENAME\b/.test(text) ||
            /\bALTER (?:COLUMN )?(?:[\w$]+|<quoted>) (?:TYPE|SET DATA TYPE|SET NOT NULL)\b/.test(text))
    );
}

function main() {
    const { values } = parseArgs({
        options: {
            root: { type: 'string', default: process.cwd() },
            migrations: { type: 'string' },
            applied: { type: 'string' },
            command: { type: 'string', multiple: true, default: [] },
            help: { type: 'boolean', default: false },
        },
    });
    if (values.help) {
        console.log(help);
        return;
    }
    if (Boolean(values.migrations) !== Boolean(values.applied)) {
        throw new Error('--migrations and --applied must be supplied together');
    }
    const root = resolve(values.root);
    const problems = [];
    const commands = values.command.map((command) => ['--command', command]);
    let packages = 0;
    for (const path of packageFiles(root)) {
        const manifest = JSON.parse(readFileSync(path, 'utf8'));
        if (
            manifest.scripts !== undefined &&
            (!manifest.scripts || typeof manifest.scripts !== 'object' || Array.isArray(manifest.scripts))
        ) {
            throw new Error(`Invalid scripts in ${relative(root, path)}`);
        }
        for (const [name, command] of Object.entries(manifest.scripts ?? {})) {
            if (typeof command !== 'string') throw new Error(`Invalid script ${name} in ${relative(root, path)}`);
            commands.push([`${relative(root, path)}#scripts.${name}`, command]);
        }
        packages++;
    }
    for (const [source, command] of commands) {
        const normalized = command.replace(/\\\r?\n/g, ' ').replace(/["'`]/g, '');
        if (
            /\b(?:drizzle(?:-kit)?|prisma)(?:@[\w.^~/-]+)?\s+(?:[^\s;&|]+\s+)*?push(?::(?:pg|mysql|sqlite))?\b/i.test(
                normalized
            )
        ) {
            problems.push(`${source}: schema push is prohibited; use forward-only checksummed migrations`);
        }
    }
    let migrations = new Map();
    let applied = {};
    if (values.migrations) {
        const directory = resolve(root, values.migrations);
        if (lstatSync(directory).isSymbolicLink()) throw new Error('Migration directory must not be a symlink');
        migrations = new Map(sqlFiles(directory));
        applied = JSON.parse(readFileSync(resolve(root, values.applied), 'utf8'));
        if (!applied || typeof applied !== 'object' || Array.isArray(applied)) {
            throw new Error('Applied ledger must be a JSON object of SQL paths to SHA-256 checksums');
        }
        for (const [name, hash] of Object.entries(applied)) {
            if (
                !/^(?!\/)(?!.*\\)(?!.*(?:^|\/)\.{1,2}(?:\/|$))[^\r\n]+\.sql$/i.test(name) ||
                typeof hash !== 'string' ||
                !/^[a-f0-9]{64}$/.test(hash)
            ) {
                throw new Error(`Invalid applied migration entry: ${name}`);
            }
            const bytes = migrations.get(name);
            if (!bytes) problems.push(`${name}: applied migration is missing (deleted or renamed)`);
            else if (createHash('sha256').update(bytes).digest('hex') !== hash) {
                problems.push(`${name}: applied migration checksum changed; add a forward migration instead`);
            }
        }
        for (const [name, bytes] of migrations) {
            for (const statement of statements(bytes.toString('utf8'))) {
                if (destructive(statement.words) && !statement.annotated) {
                    problems.push(
                        `${name}:${statement.line}: destructive statement requires -- migration-policy: allow-destructive <reason>`
                    );
                }
            }
        }
    }
    if (problems.length) throw new Error(problems.join('\n'));
    console.log(
        `Migration policy passed: ${packages} package manifests, ${commands.length} commands, ${migrations.size} SQL migrations, ${Object.keys(applied).length} applied checksums.`
    );
}

try {
    main();
} catch (error) {
    console.error(`Migration policy failed: ${error.message}`);
    process.exitCode = 1;
}
