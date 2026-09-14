# Project Plan — Foundation and Decision Gates

Audit date: 2026-09-14. Repository: NihongoCore.

No `PROJECT_PLAN.md` existed at audit preflight. This minimal tracker is created
from the user's approved M1 foundation and Phase 0 audit instructions, the existing
AGENTS rules and canonical documents. It does not claim to recover an earlier
plan or approve a new product roadmap. AGENTS.md remains authoritative.

Publication note: agent instructions, integrations, feature-workflow artifacts,
constitution and internal audit evidence remain local at the owner's request.
References to them describe the local governance; they are not required to build
or run the published application foundation.

## Current status

| Milestone                                           | State                            | Evidence / blocker                                                                                    |
| --------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| M0 — Phase 0: Documentation Freeze & Open Decisions | WAITING_FOR_DECISION             | OD-001 and OD-011 need human approval before Authentication                                           |
| M1 — Phase 1: Repository & Engineering Foundation   | DONE; VERIFIED                   | Actual commands, HTTP/browser checks and limitations in local Foundation Audit report (not published) |
| `001-authentication`                                | NOT_READY_FOR_001_AUTHENTICATION | Session/refresh strategy and post-registration behavior remain unresolved; no feature work started    |

## Phase 0 — Documentation Freeze & Open Decisions

Closure requires all of the following:

- [x] Compare approved docs, overview and constitution; synchronize unambiguous stale statements.
- [x] Preserve approved stack, MVP scope, ownership and Review history invariants.
- [x] Track future decisions with their required feature gate instead of deciding the whole product now.
- [x] Confirm constitution compatibility with AGENTS and approved docs.
- [ ] Human approves OD-001 and OD-011.
- [ ] Architecture, data/API and UX/product docs record those approved choices.
- [ ] Confirm no remaining ambiguity would force the upcoming feature to guess.

Major UI still requires the Spec -> Clarify -> CKW direction -> SuperDesign
exploration -> CKW critique -> human selection -> refinement/handoff -> Plan /
Checklist / Tasks / Analyze -> Implementation / Tests -> Visual Review ->
Converge workflow in AGENTS §9–10. M0 closure does not waive feature readiness,
design approval, acceptance criteria or explicit implementation authorization.

## Phase 1 — Repository & Engineering Foundation

M1 scope is the minimal existing foundation, not product functionality:

- [x] npm workspaces, lockfile, editor/ignore/env conventions; no package-manager migration.
- [x] TypeScript Expo / React Native / React Native Web / Expo Router development shell.
- [x] TanStack Query provider, React Hook Form and Zod dependencies, centralized environment-driven API layer.
- [x] NestJS modular monolith, `/api/v1`, DTO validation, configuration, errors, logging and development CORS.
- [x] Working public health endpoint and development Swagger/OpenAPI.
- [x] PostgreSQL-only Compose, Prisma generation/validation/connectivity and documented migration workflow.
- [x] Formatting, lint, typecheck, backend HTTP tests and API/Web builds verified.
- [x] Minimal verification-only GitHub Actions and practical README inspected.
- [x] No domain tables or product features added as foundation.

`db:status` currently exits 1 because no migration exists; this is the documented
empty-schema M1 state. It is not proof of a broken connection. The real database
returns `SELECT 1` successfully and has zero public tables. The first domain
migration belongs to an approved feature. No dummy model or baseline migration
is needed for this audit.

Native device/emulator rendering and a hosted GitHub Actions run were not
performed; Web render/build, native-compatible source/dependency checks and local
CI-equivalent quality commands establish the M1 evidence boundary. This is not a
claim that the product or every platform is release-ready.

## Open Decision Tracker

A = ALREADY_DECIDED; B = SAFE_TECHNICAL_DECISION; C = HUMAN_APPROVAL_REQUIRED;
D = DEFERRED. An APPROVED entry below records an existing authoritative baseline,
not new approval granted by this audit. D means unresolved and gated before the
named feature; it does not authorize an agent to choose later without review.

| ID     | Decision                         | Class / status                        | Confirmed baseline and unresolved part                                                                                                                                                       | Required before                                                             |
| ------ | -------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| OD-001 | Session / refresh strategy       | C / OPEN                              | Access + refresh and authenticated ownership are approved. Per-session granularity, storage, rotation, expiry and revocation details are not. Architecture §11; data/API §4/8; AGENTS §47.1. | `001-authentication`                                                        |
| OD-002 | Folder / Deck / Card deletion    | D / DEFERRED; human approval required | Preserve Review history is mandatory; hard/soft delete, child-resource behavior and retention are unresolved. Nullable `deleted_at` is not complete deletion policy.                         | Library implementation; coordinate with Vocabulary Card and OD-006          |
| OD-003 | Card public API strategy         | D / DEFERRED; human approval required | Unified API example is a recommendation, not approval. Choose unified discriminated DTO versus subtype endpoints. Data/API §10 explicitly leaves it open.                                    | Vocabulary Card implementation                                              |
| OD-004 | Basic Mastery formula            | D / DEFERRED; human approval required | User + Card + Skill and first-try distinction approved; weights, thresholds and decay not approved. No SRS scheduling.                                                                       | Core Study Loop / Review + Basic Mastery                                    |
| OD-005 | User Override behavior           | D / DEFERRED; human approval required | System correctness and override remain distinguishable. Whether/how override adds Accepted Answers and adjusts aggregates is unresolved.                                                     | Answer Evaluation / Review                                                  |
| OD-006 | Review snapshot depth            | D / DEFERRED; human approval required | Card edits cannot rewrite history. Exact content/version snapshots and deletion retention need approval.                                                                                     | Vocabulary Card schema choices that constrain history; then Core Study Loop |
| OD-007 | Study/exercise persistence       | D / DEFERRED; human approval required | Backend authority and protected answer timing approved; ordered exercise persistence, resume, replay/idempotency and attempt state unresolved.                                               | Core Study Session                                                          |
| OD-008 | Flashcard rating -> Mastery      | D / DEFERRED; human approval required | Four-level rating is shown in UX but explicitly awaits mapping to Review/Mastery; do not infer SM-2/FSRS.                                                                                    | Flashcard implementation and its Review/Mastery integration                 |
| OD-009 | CSV limits / duplicate actions   | D / DEFERRED; human approval required | CSV, preview, mapping, validation and user confirmation approved. File/row limits, normalization and supported Skip/Create/Update/Merge subset unresolved.                                   | CSV Import                                                                  |
| OD-010 | Search API / normalization       | D / DEFERRED; human approval required | PostgreSQL search and bounded retrieval approved; endpoint style, searchable fields and Vietnamese/Japanese normalization remain open.                                                       | Search; earlier if Library includes search                                  |
| OD-011 | Successful registration behavior | C / OPEN                              | Data/API §8 explicitly leaves immediate session versus separate Login unanswered.                                                                                                            | `001-authentication`                                                        |
| OD-012 | Card storage baseline            | A / APPROVED                          | Root `cards` plus Vocabulary/Sentence/Grammar detail tables; AGENTS §17 and data/API §2–5. Physical details/migrations remain feature work. Public API is still OD-003.                      | Baseline recorded; revisit only through approved change                     |
| OD-013 | Grammar examples storage         | D / DEFERRED; human approval required | Basic Grammar is in MVP; separate example table versus simple fields is not decided. PRD §11.7; data/API §2.2/18.                                                                            | Basic Grammar schema/spec; earlier if shared Card contract depends on it    |
| OD-014 | MVP exclusions and SRS phase     | A / APPROVED                          | KANJI, Audio, Full SRS/Due Today and Offline remain outside MVP. Basic Mastery stays in MVP; Full SRS currently V1.2. AGENTS §7.2/20.1, FR-MAS-004, RULE-013, docs README §4.                | Baseline recorded; no new infrastructure now                                |

No unresolved product/security decision was classified B merely to close M0.
The reversible Expo configuration cleanup is a foundation tooling fix, not a
product decision. No approval for token strategy exists in the recorded setup or
constitution requests; those requests authorized tooling and stable principles.

## Human Decision Packet

All currently blocking decisions are presented together below. Recommendations
are **PROPOSED, NOT APPROVED** and have not been applied to runtime code, schemas
or canonical authentication contracts.

### OD-001 — Session and refresh strategy

**Question:** Should each login have an independently revocable session, or should
each account have only one active session? Approve the accompanying security and
storage behavior as one coherent contract, or state specific changes.

**Why it matters:** This determines concurrent Web/mobile use, database records,
token transport, replay handling, logout and how quickly stolen access is revoked.
AGENTS §19/32/47.1 and architecture §11 require human approval.

**Option A — Independent sessions (recommended).** Each login creates its own
session/refresh family. Logging out or detecting refresh reuse revokes that
session/family, leaving other sessions intact. Advantages: fits use across Web
and mobile, limits revocation impact, clear ownership. Disadvantages: more
session records and transactional rotation logic; concurrent refresh must be
coordinated to avoid treating legitimate races as reuse.

**Option B — One active session per account.** A new login revokes the previous
session. Keep the same secure storage and rotation rules below. Advantages:
simpler session cardinality and account-wide revocation. Disadvantages: switching
between Web and mobile logs the earlier client out, and compromise/revocation
interrupts the entire account. This user-visible restriction is not currently
approved.

**Concrete recommended contract for A, awaiting approval:**

- JWT access token: proposed 15-minute expiry, held in client memory; include a
  server-issued session reference. Every protected request checks that session's
  active status in PostgreSQL, so revocation blocks remaining access immediately.
- Refresh token: cryptographically random opaque value; persist only its hash
  plus session/family metadata in PostgreSQL. Rotate once per successful refresh
  in a transaction. Proposed inactivity expiry: 7 days; absolute session expiry:
  30 days. Rotation does not extend the absolute deadline. These durations are
  recommendations, not facts already approved by the project.
- Web: refresh token in a host-only `HttpOnly`, `Secure`, `SameSite=Lax` cookie
  for the API; do not return it in Web JSON or put it in local/session storage.
  Use HTTPS and same-site client/API hosting in production, explicit credentialed
  CORS origins, Origin validation and CSRF protection for cookie-bearing auth
  operations. Local HTTP exceptions must stay development-only. Final domain
  names are not being chosen here.
- Native: refresh token in Expo SecureStore; access token in memory. SecureStore
  would be added only during the approved authentication feature. Handle absent
  or unreadable storage by returning to Login; the backend still decides validity.
- Logout: revoke the current session/family and clear local tokens/cookie. Do not
  add a session-management screen or Logout All feature merely for this strategy.
- Expired/invalid/revoked refresh: reject with a generic authentication error and
  require Login. Reuse of an already consumed refresh token revokes its family;
  do not return a replacement token. Coordinate refresh calls per session and
  document lost-response/concurrent-tab handling in the feature plan.
- Never accept client `userId` as ownership, store raw refresh tokens on the
  server, or log credentials. Explicitly distinguish Web/native token transport
  in the final API contract. The existing JSON example is not that final contract.

Rotation/replay protection is informed by [RFC 9700 §4.14](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14);
this recommendation does not introduce an OAuth provider or claim this custom
login API implements the full OAuth protocol. Cookie/session handling follows
[OWASP session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
Native storage capability is documented by [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).
The specific lifetimes, per-session policy and immediate revocation choice above
are project recommendations requiring approval, not requirements asserted by those sources.

**Impacted files after approval:** architecture §11 and an auth ADR; data/API
§4/8; PRD auth acceptance behavior where affected; UX expired-session/logout
behavior; this tracker; future `specs/001-authentication/` artifacts.

**Blocking:** `001-authentication` specification freeze and implementation.

### OD-011 — What happens after successful registration?

**Question:** Does Register create an authenticated session immediately, or does
it create the account and then require Login?

**Why it matters:** The register response, frontend navigation, token creation and
acceptance tests depend on the answer. Data/API §8 explicitly leaves it open.

**Option A — Create account and session (recommended).** Return the authenticated
result using the approved OD-001 platform transport, then enter the authenticated
area defined by the feature spec. Advantage: no repeated credentials step.
Disadvantage: registration must handle session creation consistently and recover
cleanly if the response is lost.

**Option B — Create account, then Login.** Return account-creation success without
tokens and navigate to Login. Advantage: separates registration and session
creation. Disadvantage: an extra user step and distinct navigation/acceptance flow.

**Recommendation:** A, reusing OD-001. Neither option adds email verification,
password reset, a Dashboard implementation or another unapproved feature.

**Impacted files after approval:** PRD registration acceptance criteria; data/API
register response; UX registration flow; this tracker; future authentication spec.

**Blocking:** `001-authentication` specification freeze and implementation.

## Next action

Human reviews OD-001 and OD-011 together. After approval, synchronize their
canonical contracts, reassess M0, then explicitly authorize the separate
`001-authentication` workflow. Future OD gates stay deferred until their named
features. No Authentication implementation is authorized by this audit.
