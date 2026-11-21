/**
 * @file tools/storage/policy.mjs
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
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = process.env.STORAGE_MIGRATION_BASE || 'HEAD';
if (base !== 'HEAD' && !/^[a-f0-9]{40}$/.test(base))
    throw new Error('Migration base must be HEAD or a full trusted commit SHA');
const directory = mkdtempSync(join(tmpdir(), 'eventiva-migration-policy-'));
try {
    const paths = execFileSync('git', ['ls-tree', '-rz', '--name-only', base, '--', 'storage/migrations'], {
        encoding: 'utf8',
    })
        .split('\0')
        .filter((path) => path.endsWith('.sql'));
    const applied = Object.fromEntries(
        paths.map((path) => [
            path.slice('storage/migrations/'.length),
            createHash('sha256')
                .update(execFileSync('git', ['show', `${base}:${path}`]))
                .digest('hex'),
        ])
    );
    const ledger = join(directory, 'applied.json');
    writeFileSync(ledger, JSON.stringify(applied), { mode: 0o400 });
    execFileSync(
        process.execPath,
        ['tools/storage/guard.mjs', '--migrations', 'storage/migrations', '--applied', ledger],
        { stdio: 'inherit' }
    );
} finally {
    rmSync(directory, { recursive: true, force: true });
}
