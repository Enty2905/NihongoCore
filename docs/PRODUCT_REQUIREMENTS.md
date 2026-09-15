# Product Requirements — Personal Japanese Learning System

## 1. Product Vision

Xây dựng ứng dụng học và ôn tập tiếng Nhật đa nền tảng hoạt động trên Web, Android và iOS, giúp người dùng:

1. Tự xây dựng thư viện kiến thức tiếng Nhật cá nhân.
2. Tổ chức nội dung theo Folder → Deck → Card.
3. Học cùng một dữ liệu trên nhiều thiết bị.
4. Sinh nhiều dạng bài tập từ cùng một Card.
5. Lưu lịch sử học và mức độ ghi nhớ.
6. Biết:
   - đang học gì,
   - nhớ ở mức nào,
   - yếu kỹ năng nào,
   - nên ôn nội dung nào tiếp theo.

### Product Positioning

Sản phẩm là một **Personal Japanese Learning System**, không chỉ là flashcard app.

MVP tập trung vào các luồng học có quy tắc rõ ràng và được backend kiểm soát. Các khả năng tạo nội dung hoặc chấm dịch tự động nằm ngoài phạm vi hiện tại.

---

# 2. Product Discovery

## 2.1 Problem Statement

Người tự học tiếng Nhật thường gặp các vấn đề:

- Kiến thức nằm rải rác ở nhiều ứng dụng/file.
- Flashcard thường chỉ biểu diễn một chiều hỏi–đáp.
- Khó theo dõi khả năng nhớ theo từng kỹ năng.
- Nội dung tạo trên máy tính không luôn thuận tiện để tiếp tục học trên điện thoại.
- Lịch sử sai/đúng và cách người dùng sai thường không được giữ đầy đủ.
- Người học khó biết chính xác nội dung nào cần ôn tiếp theo.

## 2.2 Working Personas

> Các persona dưới đây được suy ra từ project overview và cần được kiểm chứng bằng người dùng thực tế.

### Persona P1 — Self-directed Japanese Learner

- Tự tạo từ vựng, câu, ngữ pháp.
- Muốn học theo deck và tag.
- Muốn xem lại lỗi sai.
- Cần trải nghiệm nhanh trên điện thoại.

### Persona P2 — Desktop Content Builder / Mobile Learner

- Soạn nội dung trên Web.
- Học trên Android/iOS.
- Mong dữ liệu và tiến độ nhất quán.

### Persona P3 — JLPT-focused Learner

- Tổ chức nội dung theo JLPT level.
- Cần lọc nội dung yếu/chưa học/khó.
- Cần luyện nhiều dạng từ cùng một kiến thức.

---

# 3. Product Goals

## GOAL-01 — Unified personal library

Người dùng quản lý kiến thức theo:

```text
Folder
  ↓
Deck
  ↓
Card
```

## GOAL-02 — Complete learning loop

```text
Create / Import Content
        ↓
Organize Library
        ↓
Select Content
        ↓
Select Exercise
        ↓
Answer
        ↓
Evaluate
        ↓
Create Review
        ↓
Update Mastery
        ↓
Show Result
```

## GOAL-03 — One Card, multiple exercises

Card là nguồn dữ liệu gốc; Exercise được sinh từ Card.

## GOAL-04 — Historical learning evidence

Mỗi exercise hoàn tất tạo một Review riêng (FR-REV-001); câu trả lời đang retry hoặc rỗng chưa tạo Review. Lịch sử không bị thay đổi khi Card được chỉnh sửa (FR-REV-002, FR-CARD-006).

## GOAL-05 — Multi-platform consistency

Business logic phải hoạt động nhất quán trên Web, Android và iOS.

---

# 4. MVP Scope

## 4.1 In Scope

### Authentication
- Register.
- Login.
- Logout.
- Refresh token.

### Library
- Folder CRUD.
- Deck CRUD.
- Card CRUD.
- Search.

### Card Types
- Vocabulary.
- Sentence.
- Basic Grammar.

### Import
- CSV.
- Preview.
- Column mapping.
- Basic duplicate detection.
- User confirmation.

### Study
- Flashcard.
- Typing.
- Multiple Choice.
- Multi Deck.
- Shuffle.
- Configurable max attempts.

### Progress
- Review History.
- Correct / Wrong.
- First-try correctness.
- Basic Mastery.
- Difficult Cards.

## 4.2 Explicitly Out of MVP

- Audio.
- Listening.
- S3-compatible media storage.
- Full SRS Engine.
- Due Today scheduling.
- Cloze.
- Advanced Grammar Training.
- Kanji Dictionary.
- Offline-first.
- Sync conflicts.
- Automated translation grading.
- Social / leaderboard / marketplace.

---

# 5. Success Criteria

Các metric cụ thể chưa được xác nhận trong source overview. Bộ metric dưới đây là **đề xuất để validate**, không phải requirement đã được stakeholder phê duyệt.

- Người dùng hoàn thành được core learning loop mà không cần thao tác ngoài hệ thống.
- 100% Review được lưu lịch sử, không overwrite.
- Không thể truy cập dữ liệu Card/Deck của user khác.
- Core study flow chạy nhất quán trên Web và ít nhất một mobile platform trước khi mở rộng.
- Các business rule quan trọng có test tự động ở giai đoạn Chapter 8.

---

# 6. Functional Requirements

## 6.1 Authentication

### FR-AUTH-001
Hệ thống phải cho phép người dùng đăng ký bằng email và mật khẩu.

### FR-AUTH-002
Hệ thống phải cho phép đăng nhập bằng thông tin hợp lệ.

### FR-AUTH-003
Backend phải phát Access Token và Refresh Token theo cơ chế đã chọn.

### FR-AUTH-004
Hệ thống phải cho phép refresh Access Token bằng Refresh Token hợp lệ.

### FR-AUTH-005
Logout phải vô hiệu hóa hoặc thu hồi session/refresh token theo chiến lược backend.

### FR-AUTH-006
Mật khẩu phải được hash trước khi lưu.

### Authentication clarification baseline — approved 2026-09-14

OD-001, OD-011 và AUTH-CL-001 đã được người dùng phê duyệt và được triển khai trong feature 001-authentication ngày 2026-09-15.

- FR-AUTH-001/003: Register thành công tạo user và authenticated session, thiết lập trạng thái đăng nhập và vào authenticated application shell; không yêu cầu Login thủ công lần nữa. Không triển khai Dashboard/Library trong feature này.
- FR-AUTH-002: Login sai mật khẩu và tài khoản không tồn tại có cùng phản hồi công khai 401 / INVALID_CREDENTIALS; không phân biệt nguyên nhân.
- FR-AUTH-003/004/005: mỗi Login tạo session độc lập; browser tabs trong một profile có thể dùng chung Web session. Rotation, thời hạn cấu hình tập trung, thu hồi session hiện tại và replay-family policy theo architecture §11. Không có Logout All trong MVP hiện tại.
- AUTH-CL-001 / NFR-SEC-003: password từ 15 đến 128 Unicode code points; cho phép Unicode/khoảng trắng, không ép tổ hợp ký tự, không âm thầm trim/normalize/truncate. Frontend và backend phải dùng cùng cách đếm.
- Email: trim khoảng trắng hai đầu và lowercase representation dùng cho lookup/uniqueness; giữ nguyên dấu chấm và plus alias. Giới hạn đã chọn cho API/database là 254 ký tự sau trim; cần cú pháp email hợp lệ.
- Display name tùy chọn, trim, tối đa 80 Unicode code points; rỗng sau trim được xem như không cung cấp.
- Register với input hợp lệ nhưng email chuẩn hóa đã tồn tại trả 409 / EMAIL_ALREADY_EXISTS; không tạo thêm account/session hoặc ghi đè account cũ. Hai request đồng thời không được tạo hai account.
- NFR-SEC-001: GET /api/v1/auth/me chỉ trả profile an toàn của user trong validated authentication context; không lấy ownership từ userId client gửi.
- Duplicate Register công khai trạng thái email đã tồn tại theo quyết định người dùng; không áp dụng cách công khai này cho Login. Email chưa được xác minh quyền sở hữu.
- Password và token không được log; server chỉ lưu hash refresh token. Contract chi tiết nằm tại data/API §4/8; UX thành công/thất bại tại UX §16.

Không thêm Forgot Password, email verification, OAuth/social login, MFA, roles/admin hoặc session-list UI.

Trạng thái triển khai: DONE. Contract được kiểm chứng bằng API integration/security tests, Web–API E2E, Prisma migration status, Swagger và Expo exports Web/Android/iOS. Authenticated shell chỉ hiển thị safe current-user profile và Logout; không mở rộng sang Dashboard hoặc Library.


---

## 6.2 Library

### FR-LIB-001
Người dùng phải tạo, sửa, xóa Folder của chính mình.

### FR-LIB-002
Người dùng phải tạo, sửa, xóa Deck của chính mình.

### FR-LIB-003
Deck có thể thuộc một Folder.

### FR-LIB-004
Người dùng có thể di chuyển Deck giữa các Folder.

### FR-LIB-005
Người dùng có thể tạo, sửa, xóa và di chuyển Card.

### FR-LIB-006
Danh sách lớn phải hỗ trợ pagination hoặc cơ chế tải từng phần.

### FR-LIB-007
Backend phải kiểm tra ownership cho mọi resource cá nhân.

---

## 6.3 Card

### FR-CARD-001
MVP phải hỗ trợ Card loại `VOCABULARY`.

### FR-CARD-002
MVP phải hỗ trợ Card loại `SENTENCE`.

### FR-CARD-003
MVP phải hỗ trợ Card loại `GRAMMAR` ở mức cơ bản.

### FR-CARD-004
Card phải có entity gốc chung để Review, Tag, Accepted Answer và Mastery có thể tham chiếu thống nhất.

### FR-CARD-005
Các trường không bắt buộc phải cho phép bỏ trống theo schema của từng Card type.

### FR-CARD-006
Thay đổi Card không được làm mất Review History.

---

## 6.4 Tags and Search

### FR-SEARCH-001
Người dùng phải tìm kiếm được theo các trường được hỗ trợ của Card.

### FR-SEARCH-002
MVP có thể dùng PostgreSQL `ILIKE` trước khi nâng cấp Full Text Search.

### FR-TAG-001
Người dùng có thể gắn nhiều Tag cho Card.

---

## 6.5 Import

### FR-IMPORT-001
Người dùng có thể upload CSV.

### FR-IMPORT-002
Backend phải parse và trả preview trước khi import thật.

### FR-IMPORT-003
Người dùng phải map column nguồn sang field hệ thống.

### FR-IMPORT-004
Hệ thống phải validate dữ liệu trước khi ghi.

### FR-IMPORT-005
Hệ thống phải phát hiện duplicate cơ bản.

### FR-IMPORT-006
Khi phát hiện duplicate, hệ thống không được tự overwrite.

### FR-IMPORT-007
Người dùng phải xác nhận hành động trước khi import.

---

## 6.6 Study Session

### FR-STUDY-001
Người dùng có thể bắt đầu Study Session từ một hoặc nhiều Deck.

### FR-STUDY-002
Người dùng có thể chọn số lượng câu hỏi.

### FR-STUDY-003
Người dùng có thể chọn Exercise Type được MVP hỗ trợ.

### FR-STUDY-004
Người dùng có thể bật Shuffle.

### FR-STUDY-005
Backend phải sinh Exercise từ Card thay vì tạo Card trùng cho từng dạng luyện tập.

### FR-STUDY-006
Session phải lưu các thông tin cần thiết để tổng kết kết quả.

---

## 6.7 Exercise

### FR-EX-001
MVP phải hỗ trợ Flashcard.

### FR-EX-002
MVP phải hỗ trợ Typing Exercise.

### FR-EX-003
MVP phải hỗ trợ Multiple Choice.

### FR-EX-004
Multiple Choice distractor có thể lấy từ Card phù hợp trong cùng tập học.

### FR-EX-005
Exercise phải xác định được skill/exercise type cần đo.

---

## 6.8 Answer Evaluation

### FR-ANS-001
Backend là nơi quyết định kết quả đúng/sai cho exercise có business rule.

### FR-ANS-002
Input trước khi so sánh có thể được normalize:
- trim,
- khoảng trắng,
- Unicode,
- punctuation khi phù hợp,
- case khi phù hợp.

### FR-ANS-003
Exercise có thể có nhiều Accepted Answer.

### FR-ANS-004
Maximum attempts mặc định là `3`.

### FR-ANS-005
Input rỗng không được tính là một attempt.

### FR-ANS-006
Sai lần 1 và 2:
- báo sai,
- chưa hiển thị đáp án,
- cho phép thử lại.

### FR-ANS-007
Sai lần 3:
- hiển thị đáp án,
- hoàn tất exercise là sai,
- Card có thể trở thành difficult candidate.

### FR-ANS-008
Đúng sau khi từng sai vẫn là hoàn thành nhưng `firstTryCorrect = false`.

### FR-ANS-009
Review phải lưu ít nhất:
- attemptCount,
- firstTryCorrect,
- final result,
- response duration nếu có.

### FR-ANS-010
User override "Câu trả lời của tôi cũng đúng" phải phân biệt với system-correct.

---

## 6.9 Review

### FR-REV-001
Mỗi exercise hoàn tất phải tạo một Review.

### FR-REV-002
Review là historical record và không được overwrite tùy tiện.

### FR-REV-003
Review phải liên kết User, Card và Study Session nếu có.

### FR-REV-004
Review phải có đủ dữ liệu để phân biệt:
- System Correct,
- System Wrong,
- User Override Correct.

---

## 6.10 Basic Mastery

### FR-MAS-001
MVP phải duy trì Basic Mastery trên tổ hợp `User + Card + Skill`.

### FR-MAS-002
Một câu đúng duy nhất không đủ để xem Card là mastered.

### FR-MAS-003
Mastery có thể sử dụng:
- correct count,
- wrong count,
- first try correct count,
- streak.

### FR-MAS-004
Full SRS scheduling không thuộc MVP.

---

# 7. Non-functional Requirements

### NFR-SEC-001 — Authorization
Backend phải kiểm tra ownership bằng authenticated identity, không tin `userId` do client gửi.

### NFR-SEC-002 — Secrets
Không commit password, JWT secret, storage credential hoặc secret tương đương.

### NFR-SEC-003 — Validation
Mọi request thay đổi dữ liệu phải được backend validation.

### NFR-SEC-004 — Password
Mật khẩu phải hash bằng thuật toán phù hợp.

### NFR-PERF-001 — Pagination
Không tải toàn bộ library lớn trong một request mặc định.

### NFR-PERF-002 — Database Index
Index phải tồn tại cho các foreign key/filter quan trọng được định nghĩa trong data spec.

### NFR-PORT-001 — Cross-platform
Business behavior phải nhất quán trên Web/Android/iOS.

### NFR-MAINT-001 — Modularity
Backend chia theo NestJS modules; business rules quan trọng không nằm trong controller/UI.

### NFR-OBS-001 — Logging
Phải log lỗi hệ thống quan trọng nhưng không log password/token.

### NFR-API-001 — Error Contract
API phải sử dụng error format thống nhất với machine-readable error code.

### NFR-DOC-001 — API Documentation
Backend cung cấp Swagger/OpenAPI trong môi trường development.

---

# 8. Domain Rules

### RULE-001 — Card is source data
Không nhân bản Card chỉ để tạo nhiều dạng Exercise.

### RULE-002 — Exercise is derived
Exercise được sinh từ Card.

### RULE-003 — Review is history
Review là lịch sử và không được overwrite tùy tiện.

### RULE-004 — Card edit preserves history
Sửa Card không được làm mất hoặc sửa ngược lịch sử Review cũ.

### RULE-005 — Backend authority
Business rules quan trọng được quyết định ở backend.

### RULE-006 — Authenticated ownership
Ownership lấy từ authenticated identity.

### RULE-007 — User controls destructive merge
Không tự merge/overwrite duplicate import nếu chưa có quyết định user.

### RULE-008 — Empty answer
Empty answer không tính attempt.

### RULE-009 — Attempt limit
Mặc định tối đa 3 lần thử.

### RULE-010 — First try matters
Đúng sau khi từng sai khác với đúng ngay lần đầu.

### RULE-011 — Multiple accepted answers
Một exercise có thể có nhiều đáp án hợp lệ.

### RULE-012 — Mastery is skill-based
Mastery theo `User + Card + Skill`, không dùng duy nhất `mastered=true`.

### RULE-013 — MVP boundary
Full SRS, Audio và Offline không được đưa vào MVP nếu chưa thay đổi scope.

---

# 9. Core User Stories and Acceptance Criteria

## US-AUTH-001 — Login

**As a** registered learner
**I want** to log in
**So that** I can access my personal learning library.

### Acceptance Criteria

**Given** email/password hợp lệ
**When** user submit login
**Then**
- backend xác thực user,
- trả token theo contract,
- client vào authenticated area.

**Given** password sai
**When** user submit login
**Then**
- request bị từ chối,
- không trả token,
- response không tiết lộ thông tin nhạy cảm.

---

## US-AUTH-002 — Register and enter authenticated state

Given email chưa được dùng và input hợp lệ, khi Register thành công thì user và session được tạo nhất quán; client vào authenticated shell mà không nhập lại credentials. Nếu thất bại trước commit thì không để lại account/session thành công một phần.

Given email chuẩn hóa đã tồn tại, khi input còn lại hợp lệ thì trả 409 / EMAIL_ALREADY_EXISTS, không trả profile/token hoặc cập nhật account cũ. Nếu response thành công bị mất, retry không tạo bản sao; Login chỉ là recovery cho kết quả chưa xác nhận.

Các scenario password/email/display-name phải kiểm tra các biên đã nêu ở §6.1, kể cả Unicode và khoảng trắng. GET /api/v1/auth/me phải từ chối thiếu/sai credentials và chỉ trả user hiện tại khi đã xác thực.

---

## US-LIB-001 — Create Deck

**As a** learner
**I want** to create a Deck
**So that** I can group related learning content.

### Acceptance Criteria

**Given** user đã login
**When** user tạo Deck với name hợp lệ
**Then**
- Deck được tạo thuộc user hiện tại,
- response trả Deck mới,
- Deck xuất hiện trong library.

---

## US-CARD-001 — Create Vocabulary Card

**As a** learner
**I want** to save vocabulary information
**So that** I can practice it in different exercise types.

### Acceptance Criteria

**Given** một Deck thuộc user
**When** user submit Vocabulary Card hợp lệ
**Then**
- root Card được tạo,
- Vocabulary detail được tạo,
- Card liên kết đúng Deck,
- Card có thể được dùng để generate exercise.

---

## US-STUDY-001 — Start study session

**As a** learner
**I want** to start a session from selected decks
**So that** I can practice a focused set of content.

### Acceptance Criteria

**Given**
- user chọn ít nhất một Deck,
- Deck thuộc user,
- có Card hợp lệ

**When** user bắt đầu session

**Then**
- StudySession được tạo,
- backend xác định eligible Cards,
- session có thể trả exercise tiếp theo.

---

## US-ANSWER-001 — Three-attempt typing rule

**As a** learner
**I want** to retry an incorrect typing answer
**So that** I can recall the answer before it is revealed.

### Scenario A — First wrong answer

**Given**
- maxAttempts = 3
- current attempt = 0

**When** user submit non-empty wrong answer

**Then**
- attemptCount = 1
- answer chưa reveal
- exercise cho retry.

### Scenario B — Empty answer

**When** user submit empty/whitespace answer

**Then**
- attemptCount không tăng,
- exercise chưa hoàn tất.

### Scenario C — Third wrong answer

**Given** user đã sai hai lần

**When** user submit wrong answer lần thứ ba

**Then**
- attemptCount = 3,
- correct answer được reveal,
- result = incorrect,
- Review được tạo với `firstTryCorrect = false`.

### Scenario D — Wrong then correct

**Given** user đã sai ít nhất một lần

**When** user trả lời đúng trước khi hết attempt

**Then**
- exercise hoàn tất,
- final result = correct,
- `firstTryCorrect = false`.

---

## US-REVIEW-001 — Preserve learning history

**As a** learner
**I want** my previous attempts to remain available
**So that** I can understand my learning history.

### Acceptance Criteria

**Given** Review đã tồn tại
**When** Card content được sửa
**Then**
- Review cũ vẫn tồn tại,
- Card edit không delete Review,
- dữ liệu history vẫn interpretable.

---

## US-IMPORT-001 — Safe CSV import

**As a** learner
**I want** to preview imported data before saving
**So that** I do not accidentally corrupt my library.

### Acceptance Criteria

**When** CSV được upload
**Then**
- backend parse,
- trả preview,
- trả validation issues,
- trả duplicate candidates nếu phát hiện.

**And**
- không ghi dữ liệu thật trước user confirmation.

---

# 10. Feature Specification Summary

## FEAT-01 Authentication
Input: credentials.
Output: authenticated session.
Main rules: hashing, JWT validation, refresh lifecycle, no secret logging.

## FEAT-02 Library
Input: Folder/Deck CRUD commands.
Output: user-owned hierarchy.
Main rules: ownership enforced server-side.

## FEAT-03 Cards
Input: typed card data.
Output: root Card + subtype detail.
Main rules: type-specific validation; Review history preserved.

## FEAT-04 Import
Input: CSV + mapping + duplicate decisions.
Output: created/updated Cards after confirmation.
Main rules: preview-first; no silent overwrite.

## FEAT-05 Study Session
Input: selected decks/settings.
Output: ordered/generated exercises.
Main rules: only eligible user Cards; settings snapshot.

## FEAT-06 Answer Evaluation
Input: exercise, answer, attempt state.
Output: correct/incorrect/retry/reveal.
Main rules: normalization, accepted answers, 3-attempt rule.

## FEAT-07 Review
Input: final exercise result.
Output: immutable-ish historical Review record.
Main rules: one completed exercise creates one Review.

## FEAT-08 Basic Mastery
Input: Review outcome.
Output: updated User+Card+Skill mastery.
Main rules: do not collapse mastery to one boolean.

## FEAT-09 Search
Input: query/filter.
Output: paginated user-owned results.
Main rules: MVP starts simple; advanced FTS deferred.

---

# 11. Open Questions Requiring Human Decision

1. **Đã phê duyệt (OD-001, 2026-09-14):** session độc lập, refresh hash-only/rotation và thời hạn cấu hình tập trung; xem architecture §11 và data/API §8.
2. "Delete" Folder/Deck/Card dùng hard delete hay soft delete trong MVP?
3. **Đã quyết định (OD-012):** root Card và các bảng subtype Vocabulary/Sentence/Grammar theo data contract §2–5. Chi tiết schema/migration thuộc feature spec; public API vẫn chờ OD-003.
4. Basic Mastery formula cụ thể là gì?
5. Khi user override "câu trả lời của tôi cũng đúng", có tự thêm Accepted Answer hay cần confirm riêng?
6. Duplicate detection trong MVP áp dụng chính xác cho ba card types nào?
7. Grammar example có nằm trong MVP schema riêng hay lưu đơn giản trong text field?
8. Search MVP có cần tìm tiếng Việt không dấu hay chỉ `ILIKE` literal?
9. **Đã quyết định (OD-014):** KANJI không thuộc MVP; xem §4.2 và RULE-013.
10. **Đã quyết định (OD-014):** Basic Mastery thuộc MVP; Full SRS/Due Today không thuộc MVP, hiện dành cho V1.2 theo FR-MAS-004 và RULE-013. Thay đổi scope phải được phê duyệt riêng.

Tracker và gate theo feature nằm tại [PROJECT_PLAN.md](../PROJECT_PLAN.md). OD-001 và OD-011 đã APPROVED, AUTH-CL-001 đã RESOLVED ngày 2026-09-14; feature `001-authentication` triển khai và xác minh xong ngày 2026-09-15. Các open decision khác vẫn giữ nguyên gate của feature tương ứng.
