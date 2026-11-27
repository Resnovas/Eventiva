/**
 * @file tools/documentation/jsdoc-tags.mjs
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

// Eventiva's local override of the house JSDoc `contracts` set (owner decision,
// Jonathan, 2026-11-21). The house set no longer requires @throws; Eventiva goes
// further and bans the tags it never wants. Effect code fails through its typed
// error channel, git records authors and the file header holds the licence.
// The synced tools/lint/funnel.mjs stays unedited: compose this entry after the
// `contracts` entry for the same files once eslint-plugin-jsdoc is installed.

/** JSDoc tags Eventiva never writes, without the leading `@`. */
export const bannedTags = Object.freeze(['throws', 'exception', 'author', 'license']);

/** Corrective message shown on every banned tag. */
export const bannedTagMessage =
    'Do not use @throws, @author or @license. Document Effect failures with @fails, let git record authors, and keep licence terms in the file header.';

/**
 * Build the flat-config entry that bans {@link bannedTags} in the given files.
 * It relies on the `jsdoc` plugin that the house `contracts` entry registers,
 * so place it after that entry; flat config applies the last matching setting.
 *
 * @param files - The same globs the `contracts` entry uses.
 * @returns A config entry setting `jsdoc/no-restricted-syntax` to error.
 */
export const jsdocTagBan = (files) => ({
    files,
    rules: {
        'jsdoc/no-restricted-syntax': [
            'error',
            {
                contexts: [
                    {
                        comment: `JsdocBlock:has(JsdocTag[tag=/^(?:${bannedTags.join('|')})$/])`,
                        context: 'any',
                        message: bannedTagMessage,
                    },
                ],
            },
        ],
    },
});
