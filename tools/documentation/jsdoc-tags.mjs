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

/**
 * JSDoc tags Eventiva never writes, without the leading `@`.
 * Effect code fails through its typed error channel, git records authors and the file header holds the licence.
 *
 * @since 0.0.1
 * @example
 * const forbidden = bannedTags.includes('throws');
 */
export const bannedTags = Object.freeze(['throws', 'exception', 'author', 'license']);

/**
 * Corrective diagnostic message shown when a JSDoc block uses one of {@link bannedTags}.
 *
 * @since 0.0.1
 * @example
 * const guidance = bannedTagMessage;
 */
export const bannedTagMessage =
    'Do not use @throws, @author or @license. Document Effect failures with @fails, let git record authors, and keep licence terms in the file header.';

/**
 * Build the flat-config override entry that bans {@link bannedTags} in the given files without editing the synced `tools/lint/funnel.mjs`.
 * Place it after the house `contracts` entry for the same files so flat config applies the override after the `jsdoc` plugin is registered.
 *
 * @since 0.0.1
 * @param {string[]} files - File globs matching the house `contracts` entry.
 * @returns {object} A flat-config entry setting `jsdoc/no-restricted-syntax` to error.
 * @example
 * const entry = jsdocTagBan(['packages/schema/src/compose.ts']);
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
