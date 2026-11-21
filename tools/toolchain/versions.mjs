#!/usr/bin/env node
/**
 * @file tools/toolchain/versions.mjs
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

/**
 * Check that every file pinning the toolchain names the same versions, and print them with the versions running.
 * package.json is the source: engines.node holds the minimum Node release and packageManager the pnpm release;
 * .node-version, .nvmrc and .tool-versions repeat the Node release for version managers and CI.
 * Run without flags to print pinned and active versions, or with --check to also fail when a pin disagrees.
 */

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const read = (file) => readFileSync(file, 'utf8').trim()
const pkg = JSON.parse(read('package.json'))

const node = /^>=(\d+\.\d+\.\d+) <\d+$/.exec(pkg.engines?.node ?? '')?.[1]
const pnpm = /^pnpm@(\d+\.\d+\.\d+)$/.exec(pkg.packageManager ?? '')?.[1]

const problems = []
if (!node) problems.push('package.json engines.node must be ">=X.Y.Z <N"')
if (!pnpm) problems.push('package.json packageManager must be "pnpm@X.Y.Z"')

const pins = {
    '.node-version': read('.node-version'),
    '.nvmrc': read('.nvmrc'),
    '.tool-versions': /^nodejs (\S+)$/m.exec(read('.tool-versions'))?.[1],
}
for (const [file, value] of Object.entries(pins)) {
    if (value !== node) problems.push(`${file} pins Node ${value ?? '(none)'}, package.json engines.node pins ${node}`)
}

let activePnpm = '(not on PATH)'
try {
    activePnpm = execFileSync('pnpm', ['--version'], { encoding: 'utf8', shell: process.platform === 'win32' }).trim()
} catch (error) {
    if (!error || typeof error !== 'object' || error.code !== 'ENOENT') throw error
}

console.log(`Node ${node} pinned, ${process.versions.node} active`)
console.log(`pnpm ${pnpm} pinned, ${activePnpm} active`)

if (process.argv.includes('--check') && problems.length > 0) {
    for (const problem of problems) console.error(`toolchain: ${problem}`)
    process.exit(1)
}
