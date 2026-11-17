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

function fixture(t, { sql = 'CREATE TABLE events (id TEXT PRIMARY KEY);\n', applied = {}, scripts = {} } = {}) {
    const root = mkdtempSync(join(tmpdir(), 'eventiva-migration-policy-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const put = (name, value) => {
        const path = join(root, name);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, value);
        return path;
    };
    put('package.json', JSON.stringify({ scripts }));
    put('migrations/0001.sql', sql);
    put('applied.json', JSON.stringify(applied));
    const run = (...args) => spawnSync(process.execPath, [guard, '--root', root, ...args], { encoding: 'utf8' });
    const check = () => run('--migrations', 'migrations', '--applied', 'applied.json');
    return { root, put, run, check };
}

function passes(result) {
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Migration policy passed:/);
    assert.equal(result.stderr, '');
}

function fails(result, message) {
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, message);
    assert.doesNotMatch(result.stdout, /Migration policy passed:/);
}

test('accepts forward-only migrations, backfills and tenant-isolated SQL without down files', (t) => {
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
});

test('checks exact applied bytes and permits appended migrations without rewriting the ledger', (t) => {
    // SHA-256 of abc is an independent standard test vector, not computed by the guard.
    const hash = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
    const f = fixture(t, { sql: 'abc', applied: { '0001.sql': hash } });
    const ledger = readFileSync(join(f.root, 'applied.json'));
    f.put('migrations/postgres/0002.sql', 'CREATE TABLE fresh (id INTEGER);');
    passes(f.check());
    assert.match(f.check().stdout, /2 SQL migrations, 1 applied checksums/);
    f.put('migrations/0001.sql', 'abc\n');
    fails(f.check(), /0001.sql: applied migration checksum changed/);
    assert.deepEqual(readFileSync(join(f.root, 'applied.json')), ledger);
});

test('rejects deleted or renamed applied migrations, including nested paths', (t) => {
    const f = fixture(t, { applied: { 'postgres/0000.sql': '0'.repeat(64) } });
    fails(f.check(), /postgres\/0000.sql: applied migration is missing \(deleted or renamed\)/);
});

test('annotation cannot excuse checksum mutation of an applied destructive migration', (t) => {
    const original = `${annotation}\nDROP TABLE obsolete;\n`;
    const hash = createHash('sha256').update(original).digest('hex');
    const f = fixture(t, { sql: original, applied: { '0001.sql': hash } });
    passes(f.check());
    f.put('migrations/0001.sql', original.replace('obsolete', 'events'));
    fails(f.check(), /checksum changed/);
});

test('requires a separate preceding reason for each destructive statement', (t) => {
    const f = fixture(t, { sql: `${annotation}\nDROP TABLE old;\nTRUNCATE TABLE events;` });
    const result = f.check();
    fails(result, /0001.sql:3: destructive statement requires/);
    assert.doesNotMatch(result.stderr, /0001.sql:2:/);
    f.put('migrations/0001.sql', `${annotation}\nDROP TABLE old;\n${annotation}\nTRUNCATE TABLE events;`);
    passes(f.check());
});

test('accepts CRLF annotations and a final destructive statement without a semicolon', (t) => {
    passes(fixture(t, { sql: `${annotation}\r\nDELETE FROM events` }).check());
});

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
    test(`requires annotation for ${sql}`, (t) => {
        const f = fixture(t, { sql });
        fails(f.check(), /destructive statement requires/);
        f.put('migrations/0001.sql', `${annotation}\n${sql}`);
        passes(f.check());
    });
}

test('ignores keywords and semicolons in comments, strings, identifiers and dollar quotes', (t) => {
    const sql = `/* DROP TABLE x; /* nested */ DELETE FROM x; */
-- TRUNCATE events;
SELECT 'DROP TABLE events; it''s text', "DELETE", \`DROP\`, [TRUNCATE],
       $$DELETE FROM events;$$, $body$DROP TABLE x;$body$, E'escaped\\'; DROP TABLE x;';
CREATE TABLE children (id INTEGER REFERENCES events(id) ON DELETE CASCADE);
ALTER TYPE event_state ADD VALUE 'archived';
SELECT replace('x', 'x', 'y');`;
    passes(fixture(t, { sql }).check());
});

for (const prefix of [
    '-- migration-policy: allow-destructive\n',
    '-- migration-policy: allow-destructive   \n',
    `/* ${annotation} */\n`,
    `SELECT '${annotation}';\n`,
    `SELECT 1 ${annotation}\n;\n`,
    `${annotation}\nSELECT 1;\n`,
    `${annotation}\n;\n`,
]) {
    test(`rejects missing or misplaced annotation: ${JSON.stringify(prefix)}`, (t) => {
        fails(fixture(t, { sql: `${prefix}DROP TABLE events;` }).check(), /destructive statement requires/);
    });
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
    test(`prohibits schema push: ${JSON.stringify(command)}`, (t) => {
        const f = fixture(t, { scripts: { deploy: command } });
        fails(f.run(), /package.json#scripts.deploy: schema push is prohibited/);
        f.put('package.json', '{}');
        fails(f.run('--command', command), /--command: schema push is prohibited/);
    });
}

test('scans nested active package scripts, not archive, vendor, hidden or build output', (t) => {
    const f = fixture(t, { scripts: { migrate: 'drizzle-kit migrate', generate: 'drizzle-kit generate && git push' } });
    for (const dir of ['examples/old', 'node_modules/vendor', 'dist', '.git', 'externals/vendor']) {
        f.put(`${dir}/package.json`, '{not even valid JSON');
    }
    passes(f.run('--command', 'git push', '--command', 'prisma migrate deploy'));
    assert.match(f.run().stdout, /0 SQL migrations, 0 applied checksums/);
    f.put('packages/storage/package.json', JSON.stringify({ scripts: { sync: 'drizzle-kit push' } }));
    fails(f.run(), /packages\/storage\/package.json#scripts.sync: schema push is prohibited/);
});

for (const ledger of [
    null,
    [],
    'bad',
    { '0001.sql': 'bad' },
    { '../0001.sql': '0'.repeat(64) },
    { '/0001.sql': '0'.repeat(64) },
]) {
    test(`rejects malformed ledger ${JSON.stringify(ledger)}`, (t) => {
        fails(fixture(t, { applied: ledger }).check(), /Applied ledger|Invalid applied migration entry/);
    });
}

for (const sql of ["SELECT 'unterminated", 'SELECT "unterminated', 'SELECT $$unterminated', '/* unclosed']) {
    test(`fails closed on unterminated SQL: ${sql}`, (t) => {
        fails(fixture(t, { sql }).check(), /Unterminated SQL/);
    });
}

test('rejects invalid input and missing paths instead of reporting a vacuous pass', (t) => {
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
});

test('rejects migration symlinks including a symlinked migration root', (t) => {
    const f = fixture(t);
    symlinkSync(join(f.root, 'migrations/0001.sql'), join(f.root, 'migrations/linked.sql'));
    fails(f.check(), /Migration symlinks are not allowed/);
    symlinkSync(join(f.root, 'migrations'), join(f.root, 'linked'));
    fails(f.run('--migrations', 'linked', '--applied', 'applied.json'), /must not be a symlink/);
});

test('help documents the standalone integration contract without requiring input files', (t) => {
    const f = fixture(t);
    const result = f.run('--help', '--root', join(f.root, 'missing'));
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /trusted JSON object/);
    assert.match(result.stdout, /No tenant-predicate checks/);
    assert.match(result.stdout, /need no down step/);
});
