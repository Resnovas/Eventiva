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

/** Normalize a file path to a workspace-relative POSIX string. */
export const normalizeRelPath = (filePath, root) => {
    const rel = root && isAbsolute(filePath) ? relative(root, filePath) : filePath;
    return rel.replaceAll('\\', '/').replace(/^\.\//, '');
};

/** Identify editable first-party JS/TS source files covered by the inline-comment ban. */
export const isInScopeCommentFile = (relativePath) => {
    const normalized = relativePath.replaceAll('\\', '/').replace(/^\.\//, '');
    return CODE_FILE.test(normalized) && !EXCLUDED_PREFIX.test(normalized) && !EXCLUDED_SEGMENT.test(normalized);
};

/** Detect files synced from Resnovas/.github whose contents are overwritten on house sync. */
export const isHouseSyncedSource = (text) => text.split('\n', 12).join('\n').includes(SYNCED_MARKER);

/** Determine whether a comment is exempt under Eventiva's comment policy. */
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

/** Read a UTF-8 file, returning undefined only when it does not exist; every other error propagates. */
export const readIfPresent = (path) => {
    try {
        return readFileSync(path, 'utf8');
    } catch (error) {
        if (error?.code === 'ENOENT') return undefined;
        throw error;
    }
};
