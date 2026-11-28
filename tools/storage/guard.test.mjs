/**
 * @file tools/storage/guard.test.mjs
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
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const guard = fileURLToPath(new URL('./guard.mjs', import.meta.url));
const annotation = '-- migration-policy: allow-destructive old clients retired; restore rehearsal passed';

/**
 * Isolate the guard from repository manifests, migration files and deployment ledgers.
 *
 * @param t - Test context that owns the temporary tree.
 * @param options - Inputs written before the first CLI invocation.
 * @param options.sql - Initial migration bytes as UTF-8 text.
 * @param options.applied - JSON value substituted for a trusted ledger.
 * @param options.scripts - Package commands to inspect without executing them.
 * @returns The fixture root, writer and CLI invocations for this case.
 */
function fixture(t, { sql = 'CREATE TABLE events (id TEXT PRIMARY KEY);\n', applied = {}, scripts = {} } = {}) {
    const root = mkdtempSync(join(tmpdir(), 'eventiva-migration-policy-'));
    t.after(
        /** Release even a partially written fixture when an assertion fails. */ () => {
            rmSync(root, { recursive: true, force: true });
        }
    );
    /**
     * Replace a single fixture input, creating intermediate package or dialect directories as needed.
     *
     * @param name - Path relative to this test's temporary root.
     * @param value - Exact file content consumed by the child CLI.
     * @returns The path usable for byte comparisons or link creation.
     */
    const put = (name, value) => {
        const path = join(root, name);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, value);
        return path;
    };
    put('package.json', JSON.stringify({ scripts }));
    put('migrations/0001.sql', sql);
    put('applied.json', JSON.stringify(applied));
    /**
     * Invoke the real CLI in a child process so failures can be asserted as exit statuses.
     *
     * @param args - Extra arguments following the fixture root.
     * @returns Exit status and decoded output streams from the invocation.
     */
    const run = (...args) => spawnSync(process.execPath, [guard, '--root', root, ...args], { encoding: 'utf8' });
    /**
     * Inspect the synthetic migration directory against the ledger in the same fixture.
     *
     * @returns The result of running both migration and command policy checks.
     */
    const check = () => run('--migrations', 'migrations', '--applied', 'applied.json');
    return { root, put, run, check };
}

/**
 * Require the success summary as well as a clean exit and error stream.
 *
 * @param result - Captured guard process result.
 */
function passes(result) {
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Migration policy passed:/);
    assert.equal(result.stderr, '');
}

/**
 * Distinguish a policy rejection from a crash or a contradictory success report.
 *
 * @param result - Captured guard process result.
 * @param message - Expected diagnostic pattern on standard error.
 */
function fails(result, message) {
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, message);
    assert.doesNotMatch(result.stdout, /Migration policy passed:/);
}

/**
 * Count SQL files across dialect directories without treating migration metadata as executable SQL.
 *
 * @param t - Owns the synthetic migration and manifest tree.
 */
function forwardMigrations(t) {
    const f = fixture(t, { sql: 'CREATE TABLE events (id TEXT PRIMARY KEY); UPDATE events SET id = lower(id);' });
    f.put(
        'migrations/postgres/0002.sql',
        'ALTER TABLE events ADD COLUMN title TEXT, ADD COLUMN type TEXT, ADD COLUMN function TEXT;'
    );
    f.put('migrations/sqlite/0002.sql', 'CREATE INDEX event_title ON events (title);');
    f.put('migrations/meta/journal.json', '{}');
    f.put('packages/no-scripts/package.json', '{}');
    passes(f.check());
    assert.match(f.check().stdout, /3 SQL migrations, 0 applied checksums/);
}
test('accepts forward-only migrations, backfills and tenant-isolated SQL without down files', forwardMigrations);

/**
 * Distinguish appending a migration from changing even the final newline of an applied one.
 *
 * @param t - Owns the original ledger and candidate files.
 */
function appliedBytes(t) {
    const hash = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
    const f = fixture(t, { sql: 'abc', applied: { '0001.sql': hash } });
    const ledger = readFileSync(join(f.root, 'applied.json'));
    f.put('migrations/postgres/0002.sql', 'CREATE TABLE fresh (id INTEGER);');
    passes(f.check());
    assert.match(f.check().stdout, /2 SQL migrations, 1 applied checksums/);
    f.put('migrations/0001.sql', 'abc\n');
    fails(f.check(), /0001.sql: applied migration checksum changed/);
    assert.deepEqual(readFileSync(join(f.root, 'applied.json')), ledger);
}
test('checks exact applied bytes and permits appended migrations without rewriting the ledger', appliedBytes);

/**
 * Require every nested ledger key to resolve to its original path in the candidate tree.
 *
 * @param t - Owns the ledger with an absent PostgreSQL migration.
 */
function missingMigration(t) {
    const f = fixture(t, { applied: { 'postgres/0000.sql': '0'.repeat(64) } });
    fails(f.check(), /postgres\/0000.sql: applied migration is missing \(deleted or renamed\)/);
}
test('rejects deleted or renamed applied migrations, including nested paths', missingMigration);

/**
 * Keep checksum validation independent of lexical permission to run a destructive statement.
 *
 * @param t - Owns the approved migration and its edited replacement.
 */
function immutableAnnotation(t) {
    const original = `${annotation}\nDROP TABLE obsolete;\n`;
    const hash = createHash('sha256').update(original).digest('hex');
    const f = fixture(t, { sql: original, applied: { '0001.sql': hash } });
    passes(f.check());
    f.put('migrations/0001.sql', original.replace('obsolete', 'events'));
    fails(f.check(), /checksum changed/);
}
test('annotation cannot excuse checksum mutation of an applied destructive migration', immutableAnnotation);

/**
 * Attribute the rejection to the second statement until it receives its own reason.
 *
 * @param t - Owns both versions of the two-statement migration.
 */
function perStatementReason(t) {
    const f = fixture(t, { sql: `${annotation}\nDROP TABLE old;\nTRUNCATE TABLE events;` });
    const result = f.check();
    fails(result, /0001.sql:3: destructive statement requires/);
    assert.doesNotMatch(result.stderr, /0001.sql:2:/);
    f.put('migrations/0001.sql', `${annotation}\nDROP TABLE old;\n${annotation}\nTRUNCATE TABLE events;`);
    passes(f.check());
}
test('requires a separate preceding reason for each destructive statement', perStatementReason);

/**
 * Preserve an annotation across a Windows newline and consume it at end of input.
 *
 * @param t - Owns the migration without a trailing delimiter.
 */
function unterminatedBySemicolon(t) {
    passes(fixture(t, { sql: `${annotation}\r\nDELETE FROM events` }).check());
}
test('accepts CRLF annotations and a final destructive statement without a semicolon', unterminatedBySemicolon);

for (const sql of [
    'DROP TABLE events;',
    'drop index event_title;',
    'TRUNCATE events;',
    'DELETE FROM events WHERE id = 7;',
    'WITH old AS (SELECT id FROM events) DELETE FROM events WHERE id IN (SELECT id FROM old);',
    'WITH gone AS (DELETE FROM events RETURNING *) SELECT * FROM gone;',
    'EXPLAIN ANALYZE DELETE FROM events;',
    'REPLACE INTO events VALUES (7);',
    'INSERT OR REPLACE INTO events VALUES (7);',
    'WITH fresh AS (SELECT 7) INSERT OR REPLACE INTO events SELECT * FROM fresh;',
    'ALTER TABLE events DROP COLUMN title;',
    'ALTER TABLE events RENAME COLUMN title TO label;',
    'ALTER TABLE events ALTER COLUMN title TYPE INTEGER;',
    'ALTER TABLE events ALTER "title" TYPE INTEGER;',
    'ALTER TABLE events ALTER COLUMN title SET DATA TYPE INTEGER;',
    'ALTER TABLE events ALTER COLUMN title SET NOT NULL;',
    'DO $$ BEGIN DELETE FROM events; END $$;',
    'CREATE FUNCTION wipe() RETURNS void AS $$ DELETE FROM events; $$ LANGUAGE sql;',
    'CREATE OR REPLACE PROCEDURE wipe() LANGUAGE sql AS $$ DELETE FROM events; $$;',
    'CREATE TRIGGER wipe AFTER INSERT ON events BEGIN DELETE FROM obsolete; END;',
]) {
    /**
     * Compare the same SQL before and after supplying a reason; the policy never executes it.
     *
     * @param t - Owns the isolated candidate for this statement form.
     */
    function reasonRequired(t) {
        const f = fixture(t, { sql });
        fails(f.check(), /destructive statement requires/);
        f.put('migrations/0001.sql', `${annotation}\n${sql}`);
        passes(f.check());
    }
    test(`requires annotation for ${sql}`, reasonRequired);
}

/**
 * Exercise both dialects' quoting rules and non-destructive uses of destructive keywords.
 *
 * @param t - Owns the migration containing the lexer controls.
 */
function lexicalControls(t) {
    const sql = `/* DROP TABLE x; /* nested */ DELETE FROM x; */
-- TRUNCATE events;
SELECT 'DROP TABLE events; it''s text', "DELETE", \`DROP\`, [TRUNCATE],
       $$DELETE FROM events;$$, $body$DROP TABLE x;$body$, E'escaped\\'; DROP TABLE x;';
CREATE TABLE children (id INTEGER REFERENCES events(id) ON DELETE CASCADE);
ALTER TYPE event_state ADD VALUE 'archived';
SELECT replace('x', 'x', 'y');`;
    passes(fixture(t, { sql }).check());
}
test('ignores keywords and semicolons in comments, strings, identifiers and dollar quotes', lexicalControls);

for (const prefix of [
    '-- migration-policy: allow-destructive\n',
    '-- migration-policy: allow-destructive   \n',
    `/* ${annotation} */\n`,
    `SELECT '${annotation}';\n`,
    `SELECT 1 ${annotation}\n;\n`,
    `${annotation}\nSELECT 1;\n`,
    `${annotation}\n;\n`,
]) {
    /**
     * Ensure a blank, quoted or previously consumed reason cannot authorize the following DROP.
     *
     * @param t - Owns the file starting with this candidate prefix.
     */
    function misplacedReason(t) {
        fails(fixture(t, { sql: `${prefix}DROP TABLE events;` }).check(), /destructive statement requires/);
    }
    test(`rejects missing or misplaced annotation: ${JSON.stringify(prefix)}`, misplacedReason);
}

for (const command of [
    'pnpm exec drizzle-kit push',
    'npx drizzle-kit@0.31.0 push --config db/config.ts',
    'drizzle push',
    'drizzle-kit push:pg',
    'drizzle-kit --config=db/config.ts push',
    'pnpm exec "drizzle-kit" \\\n push',
    'pnpm exec prisma db push --accept-data-loss',
]) {
    /**
     * Require identical rejection for a manifest script and an explicit CLI command.
     *
     * @param t - Owns the synthetic package defining this command.
     */
    function schemaPush(t) {
        const f = fixture(t, { scripts: { deploy: command } });
        fails(f.run(), /package.json#scripts.deploy: schema push is prohibited/);
        f.put('package.json', '{}');
        fails(f.run('--command', command), /--command: schema push is prohibited/);
    }
    test(`prohibits schema push: ${JSON.stringify(command)}`, schemaPush);
}

/**
 * Seed ignored directories with unreadable manifests and an active directory with a prohibited command.
 *
 * @param t - Owns the disposable directory hierarchy.
 */
function packageDiscovery(t) {
    const f = fixture(t, { scripts: { migrate: 'drizzle-kit migrate', generate: 'drizzle-kit generate && git push' } });
    for (const dir of ['examples/old', 'node_modules/vendor', 'dist', '.git', 'externals/vendor']) {
        f.put(`${dir}/package.json`, '{not even valid JSON');
    }
    passes(f.run('--command', 'git push', '--command', 'prisma migrate deploy'));
    assert.match(f.run().stdout, /0 SQL migrations, 0 applied checksums/);
    f.put('packages/storage/package.json', JSON.stringify({ scripts: { sync: 'drizzle-kit push' } }));
    fails(f.run(), /packages\/storage\/package.json#scripts.sync: schema push is prohibited/);
}
test('scans nested active package scripts, not archive, vendor, hidden or build output', packageDiscovery);

for (const ledger of [
    null,
    [],
    'bad',
    { '0001.sql': 'bad' },
    { '../0001.sql': '0'.repeat(64) },
    { '/0001.sql': '0'.repeat(64) },
]) {
    /**
     * Reject invalid ledger shapes, digests and non-relative keys instead of treating them as unapplied history.
     *
     * @param t - Owns the fixture with this ledger value.
     */
    function malformedLedger(t) {
        fails(fixture(t, { applied: ledger }).check(), /Applied ledger|Invalid applied migration entry/);
    }
    test(`rejects malformed ledger ${JSON.stringify(ledger)}`, malformedLedger);
}

for (const sql of ["SELECT 'unterminated", 'SELECT "unterminated', 'SELECT $$unterminated', '/* unclosed']) {
    /**
     * Require a lexer error when input ends before a quoted region or block comment closes.
     *
     * @param t - Owns the incomplete dialect-specific input.
     */
    function unterminatedToken(t) {
        fails(fixture(t, { sql }).check(), /Unterminated SQL/);
    }
    test(`fails closed on unterminated SQL: ${sql}`, unterminatedToken);
}

/**
 * Distinguish a valid command-only check from an incomplete migration check or unusable manifest.
 *
 * @param t - Owns the files replaced by malformed inputs.
 */
function invalidInputs(t) {
    const f = fixture(t);
    fails(f.run('--migrations', 'migrations'), /must be supplied together/);
    fails(f.run('--applied', 'applied.json'), /must be supplied together/);
    fails(f.run('--unknown'), /Unknown option/);
    fails(f.run('--migrations', 'missing', '--applied', 'applied.json'), /ENOENT/);
    fails(f.run('--migrations', 'applied.json', '--applied', 'applied.json'), /Not a migration directory/);
    f.put('applied.json', '{');
    fails(f.check(), /Migration policy failed:/);
    f.put('package.json', JSON.stringify({ scripts: [] }));
    fails(f.run(), /Invalid scripts/);
    f.put('package.json', JSON.stringify({ scripts: { deploy: 1 } }));
    fails(f.run(), /Invalid script deploy/);
    f.put('package.json', '{');
    fails(f.run(), /Migration policy failed:/);
}
test('rejects invalid input and missing paths instead of reporting a vacuous pass', invalidInputs);

/**
 * Reject links inside the migration tree and at its root even when the target itself is valid.
 *
 * @param t - Owns the link targets and their temporary aliases.
 */
function migrationLinks(t) {
    const f = fixture(t);
    symlinkSync(join(f.root, 'migrations/0001.sql'), join(f.root, 'migrations/linked.sql'));
    fails(f.check(), /Migration symlinks are not allowed/);
    symlinkSync(join(f.root, 'migrations'), join(f.root, 'linked'));
    fails(f.run('--migrations', 'linked', '--applied', 'applied.json'), /must not be a symlink/);
}
test('rejects migration symlinks including a symlinked migration root', migrationLinks);

/**
 * Verify that help describes the trusted-ledger requirement and limitations without reading the root.
 *
 * @param t - Supplies a path that does not exist for the help-only invocation.
 */
function offlineHelp(t) {
    const f = fixture(t);
    const result = f.run('--help', '--root', join(f.root, 'missing'));
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /trusted JSON object/);
    assert.match(result.stdout, /No tenant-predicate checks/);
    assert.match(result.stdout, /need no down step/);
}
test('help documents the standalone integration contract without requiring input files', offlineHelp);
