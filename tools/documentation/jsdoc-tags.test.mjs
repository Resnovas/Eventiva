/**
 * @file tools/documentation/jsdoc-tags.test.mjs
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
import { test } from 'node:test';
import { bannedTagMessage, bannedTags, jsdocTagBan } from './jsdoc-tags.mjs';

const [severity, options] = jsdocTagBan(['packages/*/src/**/*.ts']).rules['jsdoc/no-restricted-syntax'];
const selector = options.contexts[0].comment;
const tagPattern = new RegExp(/tag=\/(.+)\/\]/.exec(selector)[1]);

test('the override bans exactly the throws, exception, author and license tags as errors', /** Verify the exported tag list and esquery attribute regex reject only the four banned tag names. */ () => {
    assert.equal(severity, 'error');
    assert.deepEqual([...bannedTags], ['throws', 'exception', 'author', 'license']);
    for (const tag of bannedTags) assert.ok(tagPattern.test(tag), tag);
    for (const tag of ['param', 'returns', 'fails', 'example', 'throwsError', 'licensed', 'authors']) {
        assert.ok(!tagPattern.test(tag), tag);
    }
});

test('the override targets the caller files on every JSDoc block with the corrective message', /** Verify the flat-config entry forwards caller globs, matches every JSDoc block and emits the corrective message. */ () => {
    const files = ['apps/*/src/**/*.ts'];
    assert.deepEqual(jsdocTagBan(files).files, files);
    assert.equal(options.contexts[0].context, 'any');
    assert.match(selector, /^JsdocBlock:has\(JsdocTag\[tag=/);
    assert.equal(options.contexts[0].message, bannedTagMessage);
    assert.match(bannedTagMessage, /@fails/);
});
