/**
 * @file apps/server/vitest.config.mts
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

const config = testProject(
    'server-cluster',
    [
        'apps/server/src/cluster*.ts',
        'apps/server/src/backend.ts',
        'apps/server/src/agent-run.ts',
        'apps/server/src/module-run.ts',
        'apps/server/src/agent-output.ts',
        'apps/server/src/telemetry-correlation.ts',
        'apps/server/src/telemetry-live.ts',
        'apps/server/src/telemetry-local.ts',
        'apps/server/src/identity-oidc.ts',
        'apps/server/src/identity-session-policy.ts',
        'apps/server/src/session-renewal.ts',
        'apps/server/src/approval-consent.ts',
        'apps/server/src/http-actions.ts',
        'apps/server/src/http-entry.ts',
        'apps/server/src/http-action-batch.ts',
    ],
    import.meta.url
);
const serverConfig: ReturnType<typeof testProject> = {
    ...config,
    test: { ...config.test, include: ['tests/**/*.spec.ts'] },
};
export default serverConfig;
