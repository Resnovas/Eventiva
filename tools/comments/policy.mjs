/**
 * @file tools/comments/policy.mjs
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

import { readFileSync } from 'node:fs';
import { isAbsolute, relative } from 'node:path';

const CODE_FILE = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const EXCLUDED_PREFIX =
    /^(?:Examples|examples|externals|graphify-out|\.amp|\.claude|\.cursor|\.opencode|tests\/boundaries\/fixtures)\//;
const EXCLUDED_SEGMENT =
    /(?:^|\/)(?:node_modules|dist|out-tsc|coverage|test-output|test-results|playwright-report|\.nx|\.expo)(?:\/|$)/;
const TEST_FILE = /(?:^|\/)(?:tests?|__tests__)\/|(?:\.(?:test|spec|conformance)\.[cm]?[jt]sx?)$/;
const LICENSE_MARKER = 'DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.';
const SYNCED_MARKER = 'Synced from Resnovas/.github';
const EFFECT_BOUNDARY = /^\s*effect-boundary:\s+\S/;
const TS_EXPECT_ERROR = /^\s*@ts-expect-error\b/;

/**
 * Normalize a file path to a workspace-relative POSIX string.
 *
 * @since 0.0.1
 * @param {string} filePath - An absolute or relative path.
 * @param {string} [root] - The workspace root, used to relativize absolute paths.
 * @returns {string} The path relative to the root, with forward slashes and no leading `./`.
 * @example
 * normalizeRelPath('/repo/packages/a.ts', '/repo'); // 'packages/a.ts'
 */
export const normalizeRelPath = (filePath, root) => {
    const rel = root && isAbsolute(filePath) ? relative(root, filePath) : filePath;
    return rel.replaceAll('\\', '/').replace(/^\.\//, '');
};

/**
 * Identify editable first-party JS/TS source files covered by the inline-comment ban.
 *
 * @since 0.0.1
 * @param {string} relativePath - A workspace-relative path.
 * @returns {boolean} Whether it is a JS/TS file outside vendored, generated, historical and fixture directories.
 * @example
 * isInScopeCommentFile('packages/runtime/src/host.ts'); // true
 */
export const isInScopeCommentFile = (relativePath) => {
    const normalized = relativePath.replaceAll('\\', '/').replace(/^\.\//, '');
    return CODE_FILE.test(normalized) && !EXCLUDED_PREFIX.test(normalized) && !EXCLUDED_SEGMENT.test(normalized);
};

/**
 * Detect files synced from Resnovas/.github whose contents are overwritten on house sync.
 *
 * @since 0.0.1
 * @param {string} text - The file's source text.
 * @returns {boolean} Whether one of its first 12 lines carries the house sync marker.
 * @example
 * isHouseSyncedSource('// Synced from Resnovas/.github templates/x.mjs.'); // true
 */
export const isHouseSyncedSource = (text) => text.split('\n', 12).join('\n').includes(SYNCED_MARKER);

/**
 * Determine whether a comment is exempt under Eventiva's comment policy.
 *
 * @since 0.0.1
 * @param {{ type: string, value: string, raw?: string }} comment - The comment's kind, inner text and full source text.
 * @param {string} comment.type - `Line`, `Block` or `Shebang`.
 * @param {string} comment.value - The text inside the comment delimiters.
 * @param {string} [comment.raw] - The full comment source, including delimiters.
 * @param {{ filename?: string }} [options] - Where the comment lives.
 * @param {string} [options.filename] - The workspace-relative file path, used for the test-only `@ts-expect-error` exemption.
 * @returns {boolean} Whether the comment is a licence header, JSDoc, an effect-boundary marker, a shebang, or a test `@ts-expect-error`.
 * @example
 * isExemptComment({ type: 'Line', value: ' effect-boundary: vendor promise.' }); // true
 */
export const isExemptComment = ({ type, value, raw }, { filename = '' } = {}) => {
    if (type === 'Shebang') return true;
    if (type === 'Block') {
        if (value.includes(LICENSE_MARKER)) return true;
        const source = raw ?? `/*${value}*/`;
        return source.startsWith('/**') && !source.startsWith('/***') && source !== '/**/';
    }
    if (type === 'Line') {
        if (EFFECT_BOUNDARY.test(value)) return true;
        const normalized = filename.replaceAll('\\', '/');
        if (TEST_FILE.test(normalized) && TS_EXPECT_ERROR.test(value)) return true;
    }
    return false;
};

/**
 * Read a UTF-8 file, returning undefined only when it does not exist; every other error propagates.
 *
 * @since 0.0.1
 * @param {string} path - The file to read.
 * @returns {string | undefined} The file's text, or undefined when it does not exist.
 * @example
 * const ledger = readIfPresent('tools/comments/ratchet.json');
 */
export const readIfPresent = (path) => {
    try {
        return readFileSync(path, 'utf8');
    } catch (error) {
        if (error?.code === 'ENOENT') return undefined;
        throw error;
    }
};
