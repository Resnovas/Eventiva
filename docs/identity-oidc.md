# OIDC access tokens with Keycloak (EVE-43)

Eventiva accepts OpenID Connect access tokens from one configured issuer and turns them into an Eventiva caller. The issuer proves who the person is. Eventiva still decides tenant, membership, permissions and audit from its own SQL records. A token's roles, groups, organization or `sid` grant nothing.

The selected issuer is Keycloak 26.8.2, pinned by digest. The token library is `oauth4webapi@3.8.8`, MIT, with no runtime dependencies. Jonathan approved both on 2026-11-18 ([decision](planning/decisions.md#later-owner-decisions---2026-11-18)). The supply-chain evidence and every open finding are in the [vulnerability register](supply-chain/eve-43-keycloak-findings.md).

## How a request is authenticated

1. `@eventiva/integrations.oidc/token` `makeOidcVerifier` discovers the issuer once. Discovery must return exactly the configured issuer string.
2. For each request, the verifier checks the RFC 9068 JWT access token: signature against the issuer's published keys, header `typ: at+jwt`, an algorithm from the allowlist, exact issuer, the configured audience, expiry and not-before with zero clock tolerance, and the required `jti`, `iat`, `sub` and `client_id` claims. It then requires `client_id` to be a configured client and a nonempty `sid`.
3. The verifier derives the Eventiva `SessionId` from the issuer and `sid` with `oidcSessionId`. The ID is deterministic and not secret.
4. `@eventiva/runtime/identity` `authenticateTokenSession` checks the policy issuer, audience and scopes, then requires the exact tenant-local issuer/subject link, an active principal, and a live SQL session whose subject matches. `identitySecurity` then checks membership and grants on every action.

Knowing a session ID gives no access: every call needs a fresh verified token whose subject matches the live session row. Closing the session or deactivating the membership denies the next call, even while the provider token is still unexpired.

## Configuration

Read by `oidcVerifierSettings` and `OidcStandardsVerifierLive` in `apps/server/src/identity-oidc.ts`:

| Variable                       | Default  | Meaning                                                                                              |
| ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `OIDC_ISSUER`                  | required | Exact issuer identifier, for example `https://id.example.com/realms/eventiva`.                       |
| `OIDC_AUDIENCE`                | required | Audience this API accepts. Configure a Keycloak audience mapper to add it.                           |
| `OIDC_CLIENTS`                 | required | Comma-separated OAuth client IDs whose tokens are accepted.                                          |
| `OIDC_ALGORITHMS`              | `ES256`  | Comma-separated allowlist. Only asymmetric JWS algorithms are valid; HMAC and `none` are refused.    |
| `OIDC_ALLOW_INSECURE_LOOPBACK` | `false`  | Allows a plain `http://` issuer only on `127.0.0.1`, `[::1]` or `localhost`. Never set it elsewhere. |

The required scopes and audience for `authenticateTokenSession` also come from trusted server configuration, never from the request. Construction fails with `OidcConfigurationError` instead of falling back to an accepting verifier.

Configure each Keycloak client with `access.token.header.type.rfc9068 = true` and `access.token.signed.response.alg = ES256`. Keycloak 26.8.2 does not put `client_id` in user access tokens by default, so add a hardcoded `client_id` claim mapper per client, and keep the `basic` scope so `sub` is present. `tests/integrations/oidc/fixtures/realm.json` is a complete working example.

## Sessions: open and close

Sessions are opened by trusted backend code, never by a user-facing action:

- `openOidcSession(claims, expiresAt)` from `@eventiva/integrations.oidc/session` creates the session row for verified claims. It requires an existing link to an active human principal and an expiry chosen by server policy. It never creates principals, links or memberships. Repeating it for the same subject is idempotent; a closed or foreign session is never reopened.
- `closeOidcSession(session)` deactivates the session with compare-and-set. Call it only after the logout or deprovisioning signal is authenticated.

Both run on the tenant's `IdentityStore`, inside the tenant route the control plane chose. Run them in the same storage transaction as their audit record.

## Example

```ts
import { makeOidcVerifier } from '@eventiva/integrations.oidc/token';
import { openOidcSession } from '@eventiva/integrations.oidc/session';
import { authenticateTokenSession } from '@eventiva/runtime/identity';
import { Clock, Effect, Redacted } from 'effect';
import { oidcStandardsVerifier } from './identity-oidc.ts';

// Inside one routed tenant: IdentityStore, CurrentTenant and identitySecurity are provided.
export const signInThenCall = (accessToken: string) =>
    Effect.gen(function* () {
        const verifier = yield* makeOidcVerifier({
            issuer: 'https://id.example.com/realms/eventiva',
            audience: 'eventiva-api',
            clients: ['eventiva-web'],
            algorithms: ['ES256'],
            allowInsecureLoopback: false,
        });
        const token = Redacted.make(accessToken);
        const now = yield* Clock.currentTimeMillis;
        yield* openOidcSession(yield* verifier.verify(token), now + 8 * 3_600_000);
        return yield* authenticateTokenSession(token, {
            issuer: verifier.issuer,
            audience: 'eventiva-api',
            scopes: ['eventiva.invoke'],
        }).pipe(Effect.provide(oidcStandardsVerifier(verifier)));
    });
```

The result is `{ caller, issuer, sessionExpiresAt }`. Key per-session state on the issuer plus the canonical `caller.subject`, `caller.session` and `caller.tenant`, never on the raw provider subject. Re-authenticate on every call instead of caching beyond `sessionExpiresAt`.

## Run the live Keycloak conformance lane

The default `test` target needs no Keycloak. The live lane is a separate target and fails when its issuer is not set. It needs about 1 GB of free memory.

```bash
docker network create eventiva-oidc-test
KC_BOOTSTRAP_ADMIN_PASSWORD=$(openssl rand -hex 24) docker run --detach --rm --name eventiva-oidc-test \
    --network eventiva-oidc-test -p 127.0.0.1:18080:8080 --memory 1024m --pids-limit 512 \
    -e KC_BOOTSTRAP_ADMIN_USERNAME=fixture-admin -e KC_BOOTSTRAP_ADMIN_PASSWORD \
    -v "$PWD/tests/integrations/oidc/fixtures/realm.json:/opt/keycloak/data/import/realm.json:ro" \
    quay.io/keycloak/keycloak@sha256:c68e286cacd87b942ac1939a0a1481461109d6acd3a57dc496969a319a76bbf0 \
    start-dev --import-realm --http-port=8080 --features-disabled=twitter-broker
until curl -sf http://127.0.0.1:18080/realms/eventiva-test/.well-known/openid-configuration >/dev/null; do sleep 2; done
OIDC_TEST_ISSUER=http://127.0.0.1:18080/realms/eventiva-test pnpm nx run @eventiva/server:keycloak-conformance
docker stop eventiva-oidc-test && docker network rm eventiva-oidc-test
```

The realm, user password and client secret in the fixture are synthetic and only reachable on loopback. The lane proves, with real Keycloak tokens on a migrated SQLite tenant database: no access before link and session provisioning, acceptance afterwards, refusal of a forged signature, a client-credentials token without `sid`, another tenant's database and another audience, and denial after session close and after membership deactivation.

## Production deployment controls

- Run the pinned digest only. Re-scan it before each deployment and move to the first supplier 26.8.x respin that fixes the residual findings.
- Use `KC_DB=postgres`, `start` (not `start-dev`), TLS, and `--features-disabled=twitter-broker`. Leave `KC_TRACING_ENABLED` off and Kerberos federation unconfigured until a fixed image ships.
- Do not federate to identity providers whose certificate chains rely on eMudhra intermediates.

## What this does not cover yet

SAML in either direction, inbound enterprise federation, SCIM, LDAP/AD/Kerberos, passkeys/MFA step-up, consent issuance, back-channel logout delivery, key-rotation drills and high-availability topology are not implemented or tested here. Agent and service callers do not authenticate through this path: a token without `sid` is refused, and `openOidcSession` opens human sessions only.

## Common problems

- `oidc-invalid`: signature, `typ`, issuer string (including a trailing slash), audience, time or a required claim failed. Check the client's RFC 9068 and algorithm attributes and the audience mapper.
- `oidc-unsupported-client`: the token's `client_id` is not in `OIDC_CLIENTS`, or the `client_id` mapper is missing.
- `oidc-missing-session`: the token has no `sid`, for example a client-credentials token.
- `oidc-unavailable`: the issuer's key endpoint could not be fetched. Fix connectivity; do not disable verification.
- `identity-denied` after a valid token: no link, no live session for that subject, or inactive principal or membership. Provision through the trusted store; never trust token roles to repair it.
