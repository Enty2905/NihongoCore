# Project Plan — Foundation and Decision Gates

Initial audit date: 2026-09-14. Last status synchronization: 2026-09-15. Repository: NihongoCore.

This tracker records the approved foundation, delivery milestones and open product decisions. It does not approve a new product roadmap; the canonical product documents remain authoritative.

## Current status

| Milestone                                           | State          | Evidence / blocker                                                                                    |
| --------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| M0 — Phase 0: Documentation Freeze & Open Decisions | DONE           | OD-001/OD-011 approved and AUTH-CL-001 resolved 2026-09-14; canonical documentation synchronized      |
| M1 — Phase 1: Repository & Engineering Foundation   | DONE; VERIFIED | Actual commands, HTTP/browser checks and limitations in local Foundation Audit report (not published) |
| `001-authentication`                                | DONE; VERIFIED | Approved design A implemented; 50/50 tasks complete; API/client/E2E/build/database/visual checks pass |

## Phase 0 — Documentation Freeze & Open Decisions

Closure requires all of the following:

- [x] Compare approved docs, overview and constitution; synchronize unambiguous stale statements.
- [x] Preserve approved stack, MVP scope, ownership and Review history invariants.
- [x] Track future decisions with their required feature gate instead of deciding the whole product now.
- [x] Confirm engineering principles are compatible with approved product and architecture documents.
- [x] Human approves OD-001 and OD-011 (explicit approval 2026-09-14).
- [x] Architecture, data/API and UX/product docs record those approved choices and AUTH-CL-001.
- [x] Confirm no blocking requirements ambiguity remains; bounded technical details belong to planning after design.

Major UI work still requires approved requirements, clarification, design selection, implementation planning, tests and visual review. M0 closure does not waive feature readiness,
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

The initial M1 audit correctly recorded an empty schema with no migration. Feature
`001-authentication` later added the first additive Prisma migration for `User`,
`AuthSession` and `RefreshToken`. Final `prisma migrate status` reports one
migration and an up-to-date PostgreSQL schema.

The final feature verification exports valid Web, Android and iOS bundles. Web
was exercised against the live API at 390, 1024 and 1440 widths and passed
independent visual review. Physical Android/iOS device interaction, platform screen-reader
runs and a hosted GitHub Actions execution were not available in this local
Windows environment; these limits are recorded without weakening the tested
security and behavior contracts.

## Open Decision Tracker

A = ALREADY_DECIDED; B = SAFE_TECHNICAL_DECISION; C = HUMAN_APPROVAL_REQUIRED;
D = DEFERRED. A entries record the previously approved baseline; C / APPROVED entries record explicit subsequent human approval, not an inferred implementation choice. D means unresolved and gated before the named feature; it requires review before implementation.

| ID     | Decision                         | Class / status                        | Confirmed baseline and unresolved part                                                                                                                                                                                                              | Required before                                                             |
| ------ | -------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| OD-001 | Session / refresh strategy       | C / APPROVED 2026-09-14               | Independent sessions; centrally configurable 15m access, 7d inactivity, 30d absolute lifetime; hash-only rotation, current-session Logout, reuse family revocation; Web protected cookies/native SecureStore. See architecture §11 and data/API §8. | Resolved; preserve approved behavior in 001-authentication                  |
| OD-002 | Folder / Deck / Card deletion    | D / DEFERRED; human approval required | Preserve Review history is mandatory; hard/soft delete, child-resource behavior and retention are unresolved. Nullable `deleted_at` is not complete deletion policy.                                                                                | Library implementation; coordinate with Vocabulary Card and OD-006          |
| OD-003 | Card public API strategy         | D / DEFERRED; human approval required | Unified API example is a recommendation, not approval. Choose unified discriminated DTO versus subtype endpoints. Data/API §10 explicitly leaves it open.                                                                                           | Vocabulary Card implementation                                              |
| OD-004 | Basic Mastery formula            | D / DEFERRED; human approval required | User + Card + Skill and first-try distinction approved; weights, thresholds and decay not approved. No SRS scheduling.                                                                                                                              | Core Study Loop / Review + Basic Mastery                                    |
| OD-005 | User Override behavior           | D / DEFERRED; human approval required | System correctness and override remain distinguishable. Whether/how override adds Accepted Answers and adjusts aggregates is unresolved.                                                                                                            | Answer Evaluation / Review                                                  |
| OD-006 | Review snapshot depth            | D / DEFERRED; human approval required | Card edits cannot rewrite history. Exact content/version snapshots and deletion retention need approval.                                                                                                                                            | Vocabulary Card schema choices that constrain history; then Core Study Loop |
| OD-007 | Study/exercise persistence       | D / DEFERRED; human approval required | Backend authority and protected answer timing approved; ordered exercise persistence, resume, replay/idempotency and attempt state unresolved.                                                                                                      | Core Study Session                                                          |
| OD-008 | Flashcard rating -> Mastery      | D / DEFERRED; human approval required | Four-level rating is shown in UX but explicitly awaits mapping to Review/Mastery; do not infer SM-2/FSRS.                                                                                                                                           | Flashcard implementation and its Review/Mastery integration                 |
| OD-009 | CSV limits / duplicate actions   | D / DEFERRED; human approval required | CSV, preview, mapping, validation and user confirmation approved. File/row limits, normalization and supported Skip/Create/Update/Merge subset unresolved.                                                                                          | CSV Import                                                                  |
| OD-010 | Search API / normalization       | D / DEFERRED; human approval required | PostgreSQL search and bounded retrieval approved; endpoint style, searchable fields and Vietnamese/Japanese normalization remain open.                                                                                                              | Search; earlier if Library includes search                                  |
| OD-011 | Successful registration behavior | C / APPROVED 2026-09-14               | Register creates user and authenticated session then enters the authenticated shell without manual Login; Dashboard/Library excluded. PRD §6.1, data/API §8, UX §16.                                                                                | Resolved for 001-authentication                                             |
| OD-012 | Card storage baseline            | A / APPROVED                          | Root `cards` plus Vocabulary/Sentence/Grammar detail tables; the approved data contract §2–5. Physical details/migrations remain feature work. Public API is still OD-003.                                                                             | Baseline recorded; revisit only through approved change                     |
| OD-013 | Grammar examples storage         | D / DEFERRED; human approval required | Basic Grammar is in MVP; separate example table versus simple fields is not decided. PRD §11.7; data/API §2.2/18.                                                                                                                                   | Basic Grammar schema/spec; earlier if shared Card contract depends on it    |
| OD-014 | MVP exclusions and SRS phase     | A / APPROVED                          | KANJI, Audio, Full SRS/Due Today and Offline remain outside MVP. Basic Mastery stays in MVP; Full SRS currently V1.2. FR-MAS-004, RULE-013 and docs README §4.                                                                       | Baseline recorded; no new infrastructure now                                |

## Authentication approval record — 2026-09-14

The user explicitly approved OD-001 and OD-011 and resolved AUTH-CL-001 with amendments. The former recommendation packet is superseded; no further approval is needed for these decisions.

- OD-001 canonical security/session policy: [System Architecture §11](docs/SYSTEM_ARCHITECTURE.md). Access/refresh/session lifetimes are configurable with defaults of 15 minutes / 7 days inactivity / 30 days absolute.
- OD-011 canonical Register success: [Product Requirements §6.1](docs/PRODUCT_REQUIREMENTS.md), [Data/API §8](docs/DATA_API_AND_TRACEABILITY.md), [UX §16](docs/UX_AND_PRODUCT_DESIGN.md).
- AUTH-CL-001 = RESOLVED: password 15-128 Unicode code points, spaces/Unicode allowed, no composition rules or silent trimming/truncation; normalized trimmed/lowercase email without provider transforms; optional trimmed display name up to 80 characters; duplicate Register 409 / EMAIL_ALREADY_EXISTS; equivalent invalid Login behavior; protected GET /api/v1/auth/me.
- The user delegated the reasonable email length to API/database design; use a 254-character maximum after trimming, consistent across client/server and future persistence. Details are recorded in data/API §4/8.
- Feature 001 has approved requirements, resolved decisions, design A, an implementation plan and 50 completed tasks.
- M0 itself did not implement Authentication. Feature 001 subsequently passed design, plan, tasks, analysis, implementation, verification and convergence gates. Future ODs stay deferred as listed above.

## 001-authentication completion — 2026-09-15

- [x] OD-001, OD-011 and AUTH-CL-001 preserved exactly as approved.
- [x] Candidate A (Reading desk) selected by the user, refined and handed off; the final visual review found no blocker.
- [x] Production Login/Register UI, `/account` shell, bootstrap, refresh and current-session Logout implemented.
- [x] NestJS Register/Login/Refresh/Logout/me endpoints, protected context and stable safe errors implemented.
- [x] PostgreSQL/Prisma User, AuthSession and hash-only RefreshToken persistence added in one migration.
- [x] Web uses an HttpOnly/SameSite=Lax refresh cookie with Origin/CSRF controls; native uses Expo SecureStore; access tokens remain in memory.
- [x] API 24/24 and client 6/6 tests pass; Web–API E2E passes with 12 checked auth responses.
- [x] Lint, typecheck, Web/API build, Android/iOS exports, Prisma checks, live health and Swagger checks pass.
- [x] Requirements-to-implementation consistency review reports no remaining actionable finding; tasks are 50/50 complete.

No password recovery, verification, OAuth, MFA, role/admin, Dashboard, Library,
full SRS, Offline or Audio capability was added.

## Next action

The next intended product feature is `002-library-hierarchy`. Its implementation
has not started. Begin it only through its requirement, clarification and design
gates; do not infer its deferred deletion/history decisions from Authentication.
