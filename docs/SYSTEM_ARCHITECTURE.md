# System Architecture Specification

## 1. Architecture Goals

Kiến trúc phải tối ưu cho:

1. Một codebase client dùng cho Web/Android/iOS ở mức hợp lý.
2. Backend là nguồn xác thực business logic.
3. Review history có tính bền vững.
4. Dễ mở rộng Card types và Exercise types.
5. MVP đơn giản trước; Audio/SRS/Offline thêm sau.
6. Type safety vì FE/BE đều dùng TypeScript.
7. Security boundary rõ ràng.
8. Module có thể test độc lập.

---

# 2. Official Stack

## Client

```text
TypeScript
React Native
Expo
React Native Web
Expo Router
TanStack Query
Zustand
React Hook Form
Zod
```

## Backend

```text
TypeScript
Node.js
NestJS
REST
Swagger / OpenAPI
```

## Database

```text
PostgreSQL
Prisma
```

## Deferred Infrastructure

```text
S3-compatible Object Storage
Expo SQLite
```

chỉ thêm khi Audio/Offline vào scope.

---

# 3. Stack Rationale & Trade-offs

## React Native + Expo + React Native Web

**Why**
- chia sẻ phần lớn business/UI logic,
- phù hợp mục tiêu Web + Android + iOS.

**Trade-off**
- Web UX có thể cần component/layout riêng,
- một số native/web API khác nhau.

## NestJS

**Why**
- module rõ ràng,
- dependency injection,
- DTO/validation,
- Swagger integration,
- phù hợp domain có nhiều business rules.

**Trade-off**
- nhiều boilerplate hơn Express tối giản.

## PostgreSQL

**Why**
- dữ liệu quan hệ rõ:
  User → Folder → Deck → Card → Review/Mastery,
- transaction tốt cho import,
- indexing/search cơ bản đủ cho MVP.

## Prisma

**Why**
- TypeScript-friendly,
- migration workflow,
- relation modeling rõ.

**Trade-off**
- query đặc biệt có thể cần raw SQL hoặc tối ưu riêng.

## REST

**Why**
- đơn giản,
- dễ Swagger,
- phù hợp resource-oriented API hiện tại.

**Trade-off**
- một số màn hình có thể cần nhiều request hơn GraphQL.

---

# 4. High-level Architecture

```mermaid
flowchart TB
    subgraph Clients
        W[Web\nReact Native Web]
        A[Android\nReact Native]
        I[iOS\nReact Native]
    end

    W --> API
    A --> API
    I --> API

    API[NestJS REST API]
    DB[(PostgreSQL)]
    FS[(Object Storage - Deferred)]
    EXT[External APIs - Future]

    API --> DB
    API -. Audio phase .-> FS
    API -. Future .-> EXT
```

---

# 5. Client Architecture

```text
Presentation
    ↓
Feature / Application
    ↓
API / Data Access
    ↓
Local Storage
```

## Proposed Structure

```text
apps/client/src/
├── app/
├── components/
├── features/
│   ├── auth/
│   ├── library/
│   ├── cards/
│   ├── import/
│   ├── study/
│   ├── review/
│   ├── progress/
│   ├── search/
│   └── settings/
├── services/
│   ├── api/
│   └── storage/
├── stores/
├── hooks/
├── schemas/
├── types/
├── utils/
└── constants/
```

## Client State Rule

### Server State — TanStack Query
- folders,
- decks,
- cards,
- reviews,
- progress.

### Client State — Zustand
- temporary study UI state,
- local filters,
- UI preferences,
- offline state khi feature đó được triển khai.

Không mirror toàn bộ server data vào Zustand.

---

# 6. Backend Architecture

MVP là **modular monolith**.

```text
apps/api/src/
├── auth/
├── users/
├── folders/
├── decks/
├── cards/
├── tags/
├── imports/
├── exercises/
├── study-sessions/
├── reviews/
├── mastery/
├── search/
├── common/
└── database/
```

Deferred:
- media,
- srs,
- sync,
- kanji,
- exports nâng cao.

---

# 7. Module Responsibilities

## AuthModule
- register,
- login,
- logout,
- refresh.

## UsersModule
- profile/preferences tối thiểu.

## FoldersModule
- folder CRUD.

## DecksModule
- deck CRUD,
- move.

## CardsModule
- root Card,
- subtype data,
- bulk behavior nếu MVP cần.

## TagsModule
- tag CRUD,
- card assignment.

## ImportsModule
- parse,
- preview,
- validate,
- duplicate detect,
- commit import.

## ExercisesModule
- generate Flashcard/Typing/Multiple Choice,
- answer normalization/evaluation strategy.

## StudySessionsModule
- create session,
- select cards,
- next exercise,
- finish session.

## ReviewsModule
- persist historical review,
- history query.

## MasteryModule
- basic mastery update.

## SearchModule
- user-scoped search.

---

# 8. Core Backend Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant SC as StudySessionsController
    participant SS as StudySessionsService
    participant E as Exercise/Answer Evaluator
    participant R as ReviewsService
    participant M as MasteryService
    participant DB as PostgreSQL

    C->>SC: POST /study-sessions/:id/answers
    SC->>SS: submitAnswer(authUser, session, payload)
    SS->>E: normalize + evaluate
    E-->>SS: retry/correct/final-wrong

    alt exercise completed
        SS->>R: create Review
        R->>DB: INSERT review
        SS->>M: update basic mastery
        M->>DB: UPSERT mastery
    end

    SS-->>SC: result
    SC-->>C: API response
```

---

# 9. Architecture Patterns

## 9.1 Modular Monolith
Dùng trong MVP để tránh complexity microservices.

## 9.2 Layered Boundaries
Controller:
- HTTP only,
- parse/auth/DTO,
- không chứa business algorithm.

Service/Application:
- use case coordination.

Domain/helper:
- normalization,
- exercise generation/evaluation,
- mastery calculations.

Persistence:
- Prisma/database adapter.

## 9.3 Strategy Pattern — Exercise/Evaluation

Mở rộng exercise bằng strategy:

```text
ExerciseGenerator
├── FlashcardGenerator
├── TypingGenerator
└── MultipleChoiceGenerator
```

Answer evaluation có thể tách theo exercise type nếu behavior khác nhau.

## 9.4 Future Strategy Boundary — SRS

MVP chưa implement Full SRS nhưng architecture có thể chừa interface:

```text
ReviewOutcome
    ↓
SchedulingStrategy
    ↓
ScheduleResult
```

Không cần tạo `review_schedules` nếu MVP chưa dùng.

---

# 10. Shared Types

Vì FE/BE cùng TypeScript, có thể dùng monorepo:

```text
apps/
├── client/
└── api/

packages/
├── shared-types/
├── validation/      # chỉ nếu thực sự share được
└── config/
```

### Rule

Không share internal database model trực tiếp sang client.

Ưu tiên share:
- enums,
- API response/request types sinh từ OpenAPI hoặc package ổn định,
- constants không nhạy cảm.

---

# 11. Security Architecture

## Trust Boundary

Client là **untrusted**.

Backend phải:
- validate JWT,
- resolve current user từ token,
- check resource ownership,
- validate DTO,
- enforce business rules.

## Authentication

```text
Access Token
+
Refresh Token
```

Chi tiết rotation/storage cần human decision (OD-001 trong [PROJECT_PLAN.md](../PROJECT_PLAN.md)). Các phương án trong gói quyết định là đề xuất, chưa phải architecture đã duyệt; không triển khai Authentication trước khi OD-001 được chốt.

## Authorization Rule

Không dùng:

```text
body.userId
query.userId
```

làm nguồn xác định owner.

Dùng authenticated identity.

## Password

- hash trước khi persist,
- không log raw password.

## Request Security

- CORS.
- rate limiting.
- upload/file validation khi import/media.
- max request/file size phù hợp.
- ORM parameterization.
- standardized errors.

---

# 12. Architecture Rules

### ARCH-RULE-001
UI không tự quyết định business result quan trọng.

### ARCH-RULE-002
Controller mỏng; business logic ở service/domain layer.

### ARCH-RULE-003
Repository/database access không được rải tự do qua UI/controller.

### ARCH-RULE-004
Review creation và Mastery update phải có flow nhất quán.

### ARCH-RULE-005
Module khác không được bypass ownership rule.

### ARCH-RULE-006
Không đưa SRS/Audio/Offline vào MVP chỉ vì architecture đã dự kiến.

### ARCH-RULE-007
Public API thay đổi phải cập nhật OpenAPI/contract.

### ARCH-RULE-008
Database migration phải review khả năng mất dữ liệu.

---

# 13. Architecture Decisions (ADR Summary)

## ADR-001 — Modular Monolith for MVP
**Status:** Accepted  
**Decision:** NestJS modular monolith.  
**Reason:** giảm operational complexity.  
**Future trigger:** chỉ tách service nếu có bottleneck/organizational need rõ.

## ADR-002 — Backend as Business Rule Authority
**Status:** Accepted  
**Decision:** answer evaluation, review semantics, mastery ở backend.  
**Consequence:** client chỉ hỗ trợ UX validation.

## ADR-003 — Root Card + Type-specific Details
**Status:** Accepted baseline (OD-012; AGENTS §17 and data contract §2–5); feature schema/migration details remain pending  
**Decision:** `cards` làm root, subtype tables giữ detail.  
**Reason:** Review/Tags/Mastery tham chiếu thống nhất.  
**Trade-off:** query cần joins.

## ADR-004 — REST v1
**Status:** Accepted  
**Decision:** prefix `/api/v1`.  
**Reason:** contract rõ, Swagger đơn giản.

## ADR-005 — Full SRS Deferred
**Status:** Accepted baseline (OD-014; AGENTS §7.2/DOMAIN-013, FR-MAS-004 and RULE-013)  
**Decision:** Basic Mastery trong MVP; Full SRS V1.2.  
**Consequence:** không để schedule logic block core loop.

## ADR-006 — Online-first before Offline-first
**Status:** Accepted from project overview  
**Decision:** ổn định data model online trước khi SQLite/sync.  
**Reason:** tránh conflict model quá sớm.

---

# 14. Expensive-to-Reverse Decisions

Cần review kỹ trước code lớn:

- Card root/subtype modeling.
- Review historical schema.
- User ownership model.
- Refresh token/session model.
- Basic Mastery granularity.
- API public naming/versioning.
- Offline version/conflict model (future).

Ít tốn kém hơn:
- UI component library.
- một số layout chi tiết.
- search optimization strategy ở MVP.
- exact distractor selection heuristic.

---

# 15. Architecture Assumptions

- Một user sở hữu library riêng.
- Sharing/public deck chưa thuộc MVP.
- Online backend là source of truth.
- PostgreSQL là primary datastore.
- Basic Mastery đủ cho MVP demo.
- Audio/Offline thêm sau.
- Product runtime không cần external LLM trong MVP.
