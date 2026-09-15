# Bộ tài liệu nền móng dự án — Ứng dụng Ôn tập Tiếng Nhật Đa nền tảng

> Mục tiêu của thư mục này là biến `project_overview.md` thành một bộ **source of truth trước khi code** nhưng không chia nhỏ theo từng Chapter.
> Bộ tài liệu được gộp theo **mục đích sử dụng thực tế** và bao phủ yêu cầu từ Chapter 1 đến Chapter 5 của học phần.

## 1. Cấu trúc tài liệu

```text
docs/
├── README.md
├── PRODUCT_REQUIREMENTS.md
├── UX_AND_PRODUCT_DESIGN.md
├── SYSTEM_ARCHITECTURE.md
└── DATA_API_AND_TRACEABILITY.md
```

### Vai trò từng file

| File | Vai trò |
|---|---|
| `PRODUCT_REQUIREMENTS.md` | PRD + scope + personas + FR/NFR + business rules + user stories + acceptance criteria + feature specification |
| `UX_AND_PRODUCT_DESIGN.md` | Information architecture, user flow, wireframe specification, prototype scope, design review |
| `SYSTEM_ARCHITECTURE.md` | Kiến trúc FE/BE, module boundaries, patterns, stack rationale, security boundaries, ADR và trade-off |
| `DATA_API_AND_TRACEABILITY.md` | Data model/ERD, database constraints, API contract, error format, traceability Requirements → UI → API → Data |

`project_overview.md` vẫn được giữ làm **Master Vision / Raw Product Overview**. Các file trong thư mục này là tài liệu đã được chuẩn hóa để dùng khi thiết kế và code.

---

## 2. Quy tắc Source of Truth

Các tài liệu yêu cầu, kiến trúc, dữ liệu/API và UX đã được duyệt là nguồn chuẩn cho phạm vi triển khai. Không biến giả định thành requirement hoặc thay đổi quyết định sản phẩm khi chưa được phê duyệt.

Mọi thay đổi về:
- scope,
- business rule,
- database invariant,
- API behavior,
- architecture boundary

phải cập nhật tài liệu liên quan trước hoặc đồng thời với code.

---

## 3. Phạm vi Chapter 1–5 được bao phủ

| Nội dung | Nơi thể hiện |
| --- | --- |
| Product Discovery, PRD, Requirement Analysis, User Stories và Acceptance Criteria | `PRODUCT_REQUIREMENTS.md` |
| User Flow, Wireframe, Prototype và Design Review | `UX_AND_PRODUCT_DESIGN.md` |
| Architecture, patterns, database design và API design | `SYSTEM_ARCHITECTURE.md`, `DATA_API_AND_TRACEABILITY.md` |
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
- Automated grading service.
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
- Human review đối với các thay đổi sản phẩm hoặc kiến trúc được đề xuất.

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
- UX behavior nằm ở `UX_AND_PRODUCT_DESIGN.md`.
- Nếu cần nhắc lại, dùng Requirement ID hoặc Rule ID để tham chiếu.

## 7. Trạng thái nền tảng và quyết định

Xem [PROJECT_PLAN.md](../PROJECT_PLAN.md) để biết trạng thái M0/M1, các feature và OD-001 đến OD-014. OD-001/OD-011 đã APPROVED, AUTH-CL-001 đã RESOLVED ngày 2026-09-14; `001-authentication` được triển khai và xác minh ngày 2026-09-15.
