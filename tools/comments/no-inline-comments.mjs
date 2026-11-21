/**
 * @file tools/comments/no-inline-comments.mjs
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

import { resolve } from 'node:path';
import {
    isExemptComment,
    isHouseSyncedSource,
    isInScopeCommentFile,
    normalizeRelPath,
    readIfPresent,
} from './policy.mjs';

const ledgerCache = new Map();

/**
 * Load and cache a comment ratchet budget map from disk.
 *
 * @param {string | undefined} ratchetPath - The ledger path relative to the root, if configured.
 * @param {string} root - The workspace root.
 * @returns {Record<string, number>} Each file's comment budget; empty when no ledger exists.
 */
const loadRatchetBudget = (ratchetPath, root) => {
    if (!ratchetPath) return {};
    const absolute = resolve(root, ratchetPath);
    const raw = readIfPresent(absolute);
    if (raw === undefined) return {};
    const cached = ledgerCache.get(absolute);
    if (cached && cached.raw === raw) return cached.files;
    const parsed = JSON.parse(raw);
    const files = parsed && typeof parsed.files === 'object' && parsed.files !== null ? parsed.files : {};
    ledgerCache.set(absolute, { raw, files });
    return files;
};

/**
 * ESLint rule banning non-JSDoc inline and block comments with monotonic per-file ratchet support.
 *
 * @since 0.0.1
 * @example
 * const plugin = { rules: { 'no-inline-comments': noInlineCommentsRule } };
 */
export const noInlineCommentsRule = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Ban non-JSDoc inline and block comments while keeping FCL headers, JSDoc contracts, effect-boundary markers and test @ts-expect-error assertions.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    ratchetPath: { type: 'string' },
                    root: { type: 'string' },
                    budget: {
                        type: 'object',
                        additionalProperties: { type: 'integer', minimum: 0 },
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            bannedComment:
                'Do not add inline or block comments. Delete tautologies and stale notes, fix hacky code instead of excusing it, move non-obvious decisions to docs/adr/, or document callable contracts in attached JSDoc (/** ... */). Run /delete-comment to process existing comments.',
            ratchetExceeded:
                'This file has {{actual}} inline/block comments, exceeding its ratchet budget of {{budget}}. Delete comments (run /delete-comment) instead of adding new ones; move non-obvious decisions to docs/adr/ and document callable contracts in attached JSDoc (/** ... */).',
        },
    },
    /**
     * Build the per-file visitor, resolving the file's budget from the options or the ratchet ledger.
     *
     * @param {object} context - ESLint's rule context for one file.
     * @returns {object} A visitor that reports comments beyond the budget, or none for out-of-scope files.
     */
    create(context) {
        const option = context.options[0] ?? {};
        const root = option.root ?? context.cwd;
        const relPath = normalizeRelPath(context.filename, root);
        if (!isInScopeCommentFile(relPath)) return {};
        const budgets = option.budget ?? loadRatchetBudget(option.ratchetPath, root);
        const rawBudget = budgets[relPath];
        const budget = Number.isInteger(rawBudget) && rawBudget > 0 ? rawBudget : 0;

        return {
            /** Report every banned comment beyond this file's budget, skipping house-synced files. */
            Program() {
                const sourceCode = context.sourceCode;
                const text = sourceCode.getText();
                if (isHouseSyncedSource(text)) return;

                const banned = sourceCode.getAllComments().filter(
                    /**
                     * Keep comments the policy does not exempt.
                     *
                     * @param {object} comment - One ESLint comment token.
                     * @returns {boolean} Whether it is banned.
                     */
                    (comment) => {
                        const raw = text.slice(comment.range[0], comment.range[1]);
                        return !isExemptComment(
                            { type: comment.type, value: comment.value, raw },
                            { filename: relPath }
                        );
                    }
                );

                if (banned.length <= budget) return;

                const violations = budget === 0 ? banned : banned.slice(budget);
                for (const comment of violations) {
                    context.report({
                        loc: comment.loc,
                        messageId: budget === 0 ? 'bannedComment' : 'ratchetExceeded',
                        data: {
                            actual: String(banned.length),
                            budget: String(budget),
                        },
                    });
                }
            },
        };
    },
};
