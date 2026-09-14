# Bộ tài liệu nền móng dự án — Ứng dụng Ôn tập Tiếng Nhật Đa nền tảng

> Mục tiêu của thư mục này là biến `project_overview.md` thành một bộ **source of truth trước khi code** nhưng không chia nhỏ theo từng Chapter.  
> Bộ tài liệu được gộp theo **mục đích sử dụng thực tế** và bao phủ yêu cầu từ Chapter 1 đến Chapter 5 của học phần.

## 1. Cấu trúc tài liệu

```text
docs/
├── README.md
├── PRODUCT_REQUIREMENTS.md
├── AI_WORKFLOW_AND_RULES.md
├── UX_AND_PRODUCT_DESIGN.md
├── SYSTEM_ARCHITECTURE.md
└── DATA_API_AND_TRACEABILITY.md
```

### Vai trò từng file

| File | Vai trò |
|---|---|
| `PRODUCT_REQUIREMENTS.md` | PRD + scope + personas + FR/NFR + business rules + user stories + acceptance criteria + feature specification |
| `AI_WORKFLOW_AND_RULES.md` | Cách dự án sử dụng AI, giới hạn AI, prompt rules, context engineering, structured output, prompt workflow, evidence log |
| `UX_AND_PRODUCT_DESIGN.md` | Information architecture, user flow, wireframe specification, prototype scope, design review |
| `SYSTEM_ARCHITECTURE.md` | Kiến trúc FE/BE, module boundaries, patterns, stack rationale, security boundaries, ADR và trade-off |
| `DATA_API_AND_TRACEABILITY.md` | Data model/ERD, database constraints, API contract, error format, traceability Requirements → UI → API → Data |

`project_overview.md` vẫn được giữ làm **Master Vision / Raw Product Overview**. Các file trong thư mục này là tài liệu đã được chuẩn hóa để dùng khi thiết kế và code.

---

## 2. Quy tắc Source of Truth

Thứ tự có thẩm quyền và cách xử lý mâu thuẫn nằm tại `AGENTS.md` §5–6 (file local, không xuất bản). AGENTS và các invariant bắt buộc đứng đầu, sau đó lần lượt là tài liệu baseline đã duyệt, feature artifacts đã duyệt, overview, implementation và giả định. Constitution bổ sung các nguyên tắc ổn định, không thay thế AGENTS hoặc product docs.

AI không được tự ý biến giả định thành requirement.

Mọi thay đổi về:
- scope,
- business rule,
- database invariant,
- API behavior,
- architecture boundary

phải cập nhật tài liệu liên quan trước hoặc đồng thời với code.

---

## 3. Phạm vi Chapter 1–5 được bao phủ

| Yêu cầu môn học | Nơi thể hiện |
|---|---|
| AI trong SDLC, AI-Assisted vs AI-Native, reliability, responsible AI | `AI_WORKFLOW_AND_RULES.md`, `PRODUCT_REQUIREMENTS.md` |
| Prompt fundamentals, prompting techniques, context engineering, structured outputs, workflow, best practices | `AI_WORKFLOW_AND_RULES.md` |
| Product Discovery, PRD, Requirement Analysis, User Stories, Acceptance Criteria, Feature Specification | `PRODUCT_REQUIREMENTS.md` |
| User Flow, Wireframe, Prototype, AI Design Review | `UX_AND_PRODUCT_DESIGN.md` |
| Architecture, patterns, UML/system modeling, database design, API design, design patterns | `SYSTEM_ARCHITECTURE.md`, `DATA_API_AND_TRACEABILITY.md` |
| Traceability và human verification | Toàn bộ bộ tài liệu, đặc biệt `DATA_API_AND_TRACEABILITY.md` |

---

## 4. MVP được freeze cho giai đoạn coding đầu tiên

### Included

- Authentication: Register, Login, Logout, Refresh Token.
- Folder CRUD.
- Deck CRUD.
- Card CRUD.
- Card types trong MVP:
  - Vocabulary.
  - Sentence.
  - Basic Grammar.
- Search cơ bản.
- CSV Import:
  - Upload.
  - Preview.
  - Column mapping.
  - Basic duplicate detection.
- Study:
  - Flashcard.
  - Typing.
  - Multiple Choice.
  - Shuffle.
  - Multi-deck.
  - Maximum attempts.
- Progress:
  - Review history.
  - Correct / Wrong.
  - Basic Mastery.
  - Difficult Cards.

### Deferred

- Audio / Listening.
- Media storage.
- Full SRS scheduling.
- Review Schedule engine đầy đủ.
- Advanced Grammar / Cloze.
- Kanji dictionary.
- Advanced mastery analytics.
- Offline-first.
- SQLite sync queue.
- Conflict resolution.
- AI grading runtime.
- Social features.

> **Quyết định nền móng:** MVP giữ `Basic Mastery`; SRS scheduling hoàn chỉnh thuộc V1.2. Kiến trúc có thể chừa boundary cho SRS nhưng không để SRS làm tăng scope MVP.

---

## 5. Definition of Ready trước Chapter 6 / Coding

Một feature chỉ nên bắt đầu code khi có đủ:

- Requirement ID.
- User story hoặc use case.
- Acceptance criteria kiểm chứng được.
- Business rules liên quan.
- UI flow hoặc API flow.
- Data impact.
- API contract nếu feature đi qua backend.
- Error/edge cases chính.
- Quyết định ownership/security.
- Human review đối với output do AI đề xuất.

### Vertical slice đầu tiên đề xuất

```text
Register/Login
    ↓
Create Folder
    ↓
Create Deck
    ↓
Create Vocabulary Card
    ↓
Start Study Session
    ↓
Generate Typing Exercise
    ↓
Submit Answer
    ↓
Create Review
    ↓
Update Basic Mastery
    ↓
Show Result
```

Nếu slice này hoạt động end-to-end, nền móng FE–BE–DB của dự án đã được kiểm chứng.

---

## 6. Quy tắc bảo trì tài liệu

- Không copy cùng một business rule sang nhiều file nếu không cần thiết.
- Business rule chi tiết nằm ở `PRODUCT_REQUIREMENTS.md`.
- Kiến trúc và boundary nằm ở `SYSTEM_ARCHITECTURE.md`.
- Contract dữ liệu/API nằm ở `DATA_API_AND_TRACEABILITY.md`.
- AI behavior nằm ở `AI_WORKFLOW_AND_RULES.md`.
- UX behavior nằm ở `UX_AND_PRODUCT_DESIGN.md`.
- Nếu cần nhắc lại, dùng Requirement ID hoặc Rule ID để tham chiếu.

## 7. Trạng thái nền tảng và quyết định

Xem [PROJECT_PLAN.md](../PROJECT_PLAN.md) để biết trạng thái M0/M1, OD-001 đến OD-014 và gói quyết định đang chờ phê duyệt. Báo cáo `FOUNDATION_AUDIT.md`, `AI_WORKFLOW_AND_RULES.md`, `AGENTS.md`, constitution và các cấu hình/skills agent được giữ local theo chính sách xuất bản của chủ dự án; chúng không đi kèm bản clone GitHub. Các tham chiếu tới chúng ghi lại quy trình nội bộ, không phải file cần có để build hoặc chạy ứng dụng. Đây không phải phê duyệt bắt đầu Authentication.
