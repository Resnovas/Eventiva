/**
 * @file tests/telemetry/vitest.config.mts
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
 * Vitest project for the telemetry suites, measuring coverage over the observability contracts, runtime telemetry and server telemetry integration sources.
 *
 * @since 0.0.1
 * @example pnpm nx run @eventiva/telemetry-tests:test
 */
export default testProject(
    'telemetry-tests',
    [
        'packages/contracts/src/observability.ts',
        'packages/contracts/src/telemetry-export.ts',
        'packages/runtime/src/telemetry.ts',
        'packages/runtime/src/telemetry-export.ts',
        'packages/runtime/src/telemetry-correlation.ts',
        'packages/runtime/src/function-instrumentation.ts',
        'packages/integrations/telemetry.server/src/logger.ts',
        'packages/integrations/telemetry.server/src/pseudonym.ts',
        'packages/integrations/telemetry.server/src/otlp.ts',
    ],
    import.meta.url
);
