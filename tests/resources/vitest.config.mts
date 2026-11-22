/**
 * @file tests/resources/vitest.config.mts
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

import { testProject } from '../../vitest.shared.ts';

/**
 * Vitest project for the resource conformance tests, with coverage measured over the contract, runtime and SQL resource modules.
 *
 * @since 0.0.1
 * @example
 * pnpm nx run @eventiva/resource-tests:test
 */
export default testProject(
    'resource-tests',
    [
        'packages/contracts/src/resource.ts',
        'packages/runtime/src/resource.ts',
        'packages/integrations/sql/src/resource.ts',
    ],
    import.meta.url
);
