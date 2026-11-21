# Architecture decision records

Each record states one non-obvious decision about Eventiva's code, why it was made and what depends on it. Decisions that used to live in inline code comments move here (see [ADR-0001](0001-no-inline-comments-and-ratchet.md)); callable contracts stay in attached JSDoc.

| ADR | Decision |
| --- | --- |
| [0001](0001-no-inline-comments-and-ratchet.md) | Ban inline and block comments with a monotonic per-file ratchet |
| [0002](0002-module-boundaries-portability-and-packaging.md) | Module boundaries, portability and package structure |
| [0003](0003-portable-contracts-and-schema-compilation.md) | Portable contracts, schema compilation and canonical serialization |
| [0004](0004-action-execution-approvals-and-idempotent-replay.md) | Action execution, human approvals and idempotent replay |
| [0005](0005-identity-oidc-and-session-lifecycle.md) | Identity resolution, OIDC federation and session lifecycle |
| [0006](0006-kernel-lifecycle-hot-update-and-recovery.md) | Kernel module lifecycle, hot update and recovery fencing |
| [0007](0007-cluster-workflows-and-agent-runs.md) | Cluster sharding, workflows, agent runs and module-run fencing |
| [0008](0008-verification-tooling-and-test-isolation.md) | Verification tooling, migration safety and test isolation |

## Add a record

1. Check the table for an existing record on the topic. Extend it when the decision belongs there.
2. Otherwise copy the shape of an existing record into `NNNN-short-kebab-title.md`, using the next free number: title, status, date, owners, Context, Decision, Consequences and References (repository paths and symbols).
3. Add a row to the table above.
