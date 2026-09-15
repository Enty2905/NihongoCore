# ỨNG DỤNG ÔN TẬP TIẾNG NHẬT ĐA NỀN TẢNG

> Background / long-term vision. Approved documents in `docs/` govern the current MVP scope and technology stack. Roadmap examples involving SRS, Audio, Offline, Kanji or expanded account features do not add them to the MVP. Current milestone and decision status: `PROJECT_PLAN.md`.

# 1. Tổng quan dự án

Xây dựng một ứng dụng học và ôn tập tiếng Nhật đa nền tảng hoạt động trên:

- Website.
- Android.
- iOS.

Ứng dụng tập trung vào việc giúp người dùng tự xây dựng thư viện kiến thức tiếng Nhật cá nhân, tổ chức nội dung thành các bộ học và luyện tập bằng nhiều hình thức khác nhau.

Người dùng có thể tạo nội dung trên máy tính, sau đó tiếp tục học trên điện thoại với cùng dữ liệu, tiến độ và lịch ôn tập.

Ứng dụng không chỉ là một hệ thống Flashcard mà hướng tới việc trở thành một **Personal Japanese Learning System** có khả năng quản lý:

- Từ vựng.
- Kanji.
- Ngữ pháp.
- Câu.
- Audio.
- Bài tập.
- Lịch sử học.
- Mức độ ghi nhớ.
- Kỹ năng.
- Lịch ôn tập.

---

# 2. Công nghệ sử dụng

## Frontend

Frontend sử dụng:

```text
TypeScript
React Native
Expo
React Native Web
```

Mục tiêu là tận dụng tối đa một codebase để chạy trên:

```text
Web
Android
iOS
```

Các thành phần đề xuất:

```text
React Native
Expo
TypeScript
Expo Router
TanStack Query
Zustand
React Hook Form
Zod
Axios hoặc Fetch API
```

Có thể sử dụng thêm:

```text
Expo SecureStore
Expo FileSystem
Expo Audio
Expo Document Picker
Expo SQLite
```

tùy từng giai đoạn phát triển.

---

## Backend

Backend sử dụng:

```text
TypeScript
Node.js
NestJS
```

NestJS chịu trách nhiệm:

- Authentication.
- Authorization.
- Business logic.
- CRUD dữ liệu.
- Import / Export.
- Review Engine.
- Mastery Engine.
- SRS Engine.
- Đồng bộ dữ liệu.
- Xử lý media.
- API cho Web / Mobile.

---

## Database

Database chính:

```text
PostgreSQL
```

PostgreSQL lưu:

- User.
- Folder.
- Deck.
- Card.
- Card content.
- Tag.
- Accepted Answer.
- Study Session.
- Review.
- Skill Mastery.
- Review Schedule.
- Metadata của Media.
- Sync information.

Có thể sử dụng ORM:

```text
Prisma
```

để giao tiếp giữa NestJS và PostgreSQL.

---

# 3. Kiến trúc tổng thể

```text
              ┌────────────────────┐
              │       Web          │
              │ React Native Web   │
              └─────────┬──────────┘
                        │
              ┌─────────┴──────────┐
              │                    │
      ┌───────▼────────┐   ┌──────▼─────────┐
      │    Android     │   │      iOS       │
      │ React Native   │   │ React Native   │
      └───────┬────────┘   └──────┬─────────┘
              │                    │
              └─────────┬──────────┘
                        │
                        ▼
               Frontend Application
                        │
                        │ HTTPS / REST API
                        ▼
                NestJS Backend API
                        │
       ┌────────────────┼─────────────────┐
       │                │                 │
       ▼                ▼                 ▼
 PostgreSQL        File Storage      External APIs
 Database             Audio          Kanji Dictionary
```

---

# 4. Luồng sử dụng chính

Luồng sử dụng cốt lõi:

**Tạo hoặc nhập nội dung → Sắp xếp thư viện → Chọn nội dung cần học → Chọn hình thức luyện → Trả lời → Nhận kết quả → Cập nhật tiến độ → Lên lịch ôn tiếp theo**

Tất cả tính năng của ứng dụng nên phục vụ trực tiếp hoặc gián tiếp cho vòng lặp này.

---

# 5. Tài khoản người dùng

Người dùng có tài khoản riêng.

Hỗ trợ:

- Đăng ký.
- Đăng nhập.
- Đăng xuất.
- Refresh token.
- Đổi mật khẩu.
- Quên mật khẩu.
- Cập nhật hồ sơ.
- Quản lý phiên đăng nhập.

Backend sử dụng cơ chế:

```text
Access Token
+
Refresh Token
```

Access Token dùng để gọi API.

Refresh Token dùng để lấy Access Token mới.

Mật khẩu phải được hash trước khi lưu database.

---

# 6. Đồng bộ dữ liệu

Dữ liệu cần đồng bộ:

- Folder.
- Deck.
- Card.
- Tag.
- Audio.
- Accepted Answer.
- Tiến độ.
- Review.
- Mastery.
- Review Schedule.
- Study Settings.

Người dùng có thể:

- Soạn nội dung trên Web.
- Mở điện thoại.
- Tiếp tục học ngay.
- Không mất tiến độ.

---

# 7. Cấu trúc thư viện

Thư viện:

```text
Folder
   ↓
Deck
   ↓
Card
```

Ví dụ:

```text
JLPT N3
│
├── Từ vựng N3
│   ├── Bài 1
│   ├── Bài 2
│   └── Bài 3
│
├── Ngữ pháp N3
│
└── Kanji N3
```

Người dùng có thể:

- Tạo Folder.
- Sửa Folder.
- Xóa Folder.
- Tạo Deck.
- Sửa Deck.
- Xóa Deck.
- Di chuyển Deck.
- Sao chép Deck.
- Tạo Card.
- Sửa Card.
- Xóa Card.
- Di chuyển Card.
- Sao chép Card.
- Chọn nhiều Card.
- Bulk delete.
- Bulk move.
- Bulk tag.

---

# 8. Các loại Card

Ứng dụng hỗ trợ:

```text
VOCABULARY
KANJI
GRAMMAR
SENTENCE
```

Có thể mở rộng sau.

Tất cả đều được quản lý thông qua entity chung:

```text
Card
```

nhưng dữ liệu chi tiết có thể khác nhau theo từng loại.

---

# 9. Cấu trúc thẻ từ vựng

Ví dụ:

```text
Từ:
食べる

Cách đọc:
たべる

Nghĩa:
ăn

Nghĩa Hán:
...

Loại từ:
Động từ

JLPT:
N5

Ví dụ:
毎朝パンを食べます。

Nghĩa câu:
Mỗi sáng tôi ăn bánh mì.

Accepted Answers:
食べる
たべる

Audio từ:
...

Audio câu:
...

Ghi chú:
...

Tags:
N5
Verb
Daily Life
```

Không bắt buộc nhập tất cả trường.

---

# 10. Cấu trúc thẻ Kanji

```text
Kanji:
約

Âm On:
ヤク

Âm Kun:
...

Nghĩa:
ước hẹn, lời hứa

Nghĩa Hán:
Ước

Số nét:
...

Bộ thủ:
...

Từ ví dụ:
約束
予約

Ghi chú:
...

Tags:
N3
Kanji
```

---

# 11. Cấu trúc thẻ ngữ pháp

```text
Mẫu:
〜ながら

Ý nghĩa:
vừa... vừa...

Cấu trúc:
Vます + ながら

Giải thích:
...

Ví dụ:
音楽を聞きながら勉強します。

Nghĩa:
Tôi vừa nghe nhạc vừa học.

Ghi chú:
...

Tags:
N3
Grammar
```

Một Grammar Card có thể chứa nhiều câu ví dụ.

---

# 12. Cấu trúc thẻ câu

```text
Tiếng Nhật:
明日は学校へ行きません。

Cách đọc:
あしたはがっこうへいきません。

Nghĩa:
Ngày mai tôi không đi học.

Accepted Meanings:
Ngày mai tôi không đi học.
Ngày mai tôi sẽ không đến trường.

Audio:
...

Ghi chú:
...
```

---

# 13. Card và Exercise

Card là dữ liệu gốc.

Exercise là hình thức luyện tập sinh ra từ Card.

Ví dụ Card:

```text
約束
やくそく
lời hứa
```

có thể tạo:

```text
Kanji → Meaning

Kanji → Reading

Meaning → Kanji

Audio → Kana

Audio → Kanji

Audio → Meaning

Flashcard

Multiple Choice
```

Kiến trúc:

```text
Card
  ↓
Exercise Generator
  ↓
Exercise
  ↓
User Answer
  ↓
Review
```

Không tạo nhiều Card giống nhau chỉ để luyện nhiều dạng bài khác nhau.

---

# 14. Tạo và chỉnh sửa nội dung

Người dùng có thể:

- Tạo Card.
- Sửa Card.
- Sao chép Card.
- Xóa Card.
- Di chuyển Card.
- Gắn Tag.
- Thêm Accepted Answer.
- Thêm ví dụ.
- Thêm ghi chú.
- Thêm Audio.
- Ghi âm Audio.

Thay đổi Card không được làm mất Review History trước đây.

---

# 15. Nhập dữ liệu hàng loạt

Hỗ trợ:

- Paste dữ liệu.
- CSV.
- Excel.

Quy trình:

```text
Upload
   ↓
Parse File
   ↓
Preview
   ↓
Column Mapping
   ↓
Validation
   ↓
Duplicate Detection
   ↓
User Confirmation
   ↓
Import
```

---

# 16. Format import

Ví dụ:

```text
type
japanese
reading
meaning
sino_vietnamese
word_type
jlpt
example
example_meaning
accepted_answers
tags
```

Người dùng có thể map:

```text
Column A → Japanese
Column B → Reading
Column C → Meaning
Column D → Sino Vietnamese
```

---

# 17. Phát hiện nội dung trùng

Có thể kiểm tra:

### Vocabulary

```text
Japanese + Reading
```

### Kanji

```text
Kanji
```

### Grammar

```text
Grammar Pattern
```

### Sentence

```text
Normalized Japanese Sentence
```

Khi phát hiện trùng:

- Skip.
- Create anyway.
- Update existing.
- Merge.

Không tự động ghi đè dữ liệu.

---

# 18. Export và Backup

Hỗ trợ:

- CSV.
- Excel.
- JSON backup.
- Full backup.

Full backup có thể chứa:

```text
Folders
Decks
Cards
Tags
Accepted Answers
Audio metadata
Progress
Reviews
Mastery
```

---

# 19. Chọn nội dung để học

Người dùng có thể bắt đầu từ:

- Một Deck.
- Nhiều Deck.
- Folder.
- Tags.
- Cards chưa học.
- Cards đang học.
- Cards khó.
- Cards vừa sai.
- Cards cần ôn hôm nay.
- Cards được chọn thủ công.

---

# 20. Thiết lập Study Session

Trước khi học:

```text
Decks
Number of Questions
Exercise Types
Skills
Shuffle
New Cards
Review Cards
Kana Accepted
Kanji Required
Max Attempts
```

Có thể lưu cấu hình gần nhất.

---

# 21. Flashcard

Mặt trước hiển thị câu hỏi.

Người dùng lật thẻ.

Sau khi xem đáp án:

```text
Quên
Khó
Nhớ
Dễ
```

Kết quả được lưu vào Review.

---

# 22. Typing Exercise

Ví dụ câu hỏi:

```text
ăn
```

Người dùng nhập:

```text
食べる
```

hoặc:

```text
たべる
```

tùy cấu hình.

---

# 23. Multiple Choice

Ví dụ:

```text
約束 nghĩa là gì?

A. Cuộc họp
B. Lời hứa
C. Ngày nghỉ
D. Kế hoạch
```

Các đáp án sai có thể được lấy từ Cards cùng Deck hoặc cùng loại.

---

# 24. Listening — Word

Ứng dụng phát audio.

Người dùng phải nhập:

- Kana.
- Kanji.
- Hoặc một trong hai.

---

# 25. Listening — Sentence

Ứng dụng phát một câu tiếng Nhật.

Người dùng nhập nghĩa.

Ban đầu không hiển thị:

- Transcript.
- Reading.
- Meaning.

Sau khi hoàn thành mới hiển thị.

---

# 26. Cloze Exercise

Ví dụ:

```text
音楽を聞き_____勉強します。
```

Đáp án:

```text
ながら
```

Một Cloze Exercise chứa:

- Original sentence.
- Hidden range.
- Main answer.
- Accepted answers.
- Explanation.
- Grammar reference.

---

# 27. Chế độ nghe

Màn hình ban đầu:

```text
        🔊

   Phát âm thanh

[________________]

      Kiểm tra
```

Cho phép:

```text
0.75x
1.0x
1.25x
```

Có thể nghe lại nhiều lần.

---

# 28. Quy tắc ba lần thử

Mặc định:

```text
Maximum Attempts = 3
```

### Sai lần 1

- Báo sai.
- Không hiện đáp án.
- Cho thử lại.

### Sai lần 2

- Báo sai.
- Không hiện đáp án.
- Cho thử lại.

### Sai lần 3

- Hiện đáp án.
- Hiện nội dung Card.
- Đánh dấu sai.
- Đưa Card vào danh sách cần luyện thêm.

Input rỗng không tính là một lần thử.

---

# 29. Đúng sau khi từng sai

Ví dụ:

```text
Sai
↓
Sai
↓
Đúng
```

vẫn được tính hoàn thành.

Nhưng không giống:

```text
Đúng ngay lần đầu
```

Review lưu:

```text
attemptCount
firstTryCorrect
finalResult
responseTime
usedHint
```

---

# 30. Chấm đáp án linh hoạt

Trước khi so sánh, Backend có thể normalize:

- Trim.
- Khoảng trắng.
- Unicode.
- Dấu câu.
- Case khi phù hợp.

Có thể cấu hình:

```text
Accept Kana
Accept Kanji
Kanji Only
Kana Only
Exact
Normalized
```

---

# 31. Accepted Answer

Một Exercise có thể có nhiều đáp án hợp lệ.

Ví dụ:

```text
食べる
たべる
```

Có thể lưu trong:

```text
AcceptedAnswer
```

---

# 32. Chấm nghĩa câu

Ví dụ:

```text
私は昨日学校へ行きました。
```

Có thể chấp nhận:

```text
Hôm qua tôi đi học.
Hôm qua tôi đã đi học.
Hôm qua tôi đã đến trường.
```

MVP sử dụng:

- Accepted Answers.
- Text normalization.
- Manual override.

Không cần hệ thống tạo nội dung tự động ở giai đoạn đầu.

---

# 33. “Câu trả lời của tôi cũng đúng”

Sau khi bị đánh dấu sai, người dùng có thể chọn:

**Câu trả lời của tôi cũng đúng**

Sau đó:

- Chuyển Review thành accepted override.
- Có thể thêm đáp án vào Accepted Answers.

Hệ thống cần phân biệt:

```text
System Correct
System Wrong
User Override Correct
```

---

# 34. Audio

Người dùng có thể:

- Upload.
- Record.
- Preview.
- Delete.
- Replace.
- Change playback speed.

Audio có thể gắn với:

```text
Vocabulary pronunciation
Sentence pronunciation
Example sentence
```

---

# 35. File Storage

Audio không nên lưu trực tiếp dạng binary lớn trong PostgreSQL.

PostgreSQL chỉ lưu:

```text
fileId
ownerId
storageKey
fileName
mimeType
fileSize
duration
createdAt
```

File thực tế được lưu trong Object Storage.

Có thể sử dụng:

```text
S3-compatible Object Storage
```

Ví dụ:

- AWS S3.
- Cloudflare R2.
- MinIO khi development.

---

# 36. Theo dõi kỹ năng

Không sử dụng duy nhất:

```text
mastered = true
```

Mỗi Card có thể có nhiều kỹ năng.

Ví dụ:

```text
約束

Kanji → Meaning       Strong
Kanji → Reading       Strong
Audio → Meaning       Strong
Audio → Kana          Medium
Meaning → Kanji       Weak
```

---

# 37. Skill Types

Có thể định nghĩa:

```text
RECOGNITION

MEANING

READING

LISTENING

PRODUCTION

WRITING
```

Có thể thêm skill mới sau mà không thay đổi Card.

---

# 38. Mastery

Mỗi:

```text
User + Card + Skill
```

có một SkillMastery riêng.

Ví dụ:

```text
masteryScore
correctCount
wrongCount
firstTryCorrectCount
correctStreak
wrongStreak
lastReviewedAt
nextReviewAt
ease
interval
```

---

# 39. Trạng thái hiển thị

Frontend diễn giải mastery thành:

```text
Chưa học
Đang học
Khá chắc
Đã thuộc
Cần ôn
Đang gặp khó khăn
```

Không nhất thiết lưu trực tiếp những trạng thái này.

---

# 40. Quy tắc đã thuộc

Card không được coi là đã thuộc chỉ sau một câu đúng.

Có thể xét:

- Số lần đúng.
- Correct streak.
- First try correct.
- Khoảng cách giữa các phiên.
- Review interval.
- Mastery score.

Khi người dùng quên:

```text
Mastery giảm
↓
Interval giảm
↓
Card xuất hiện sớm hơn
```

---

# 41. Review History

Mỗi lần trả lời tạo một Review riêng.

Không ghi đè Review cũ.

Ví dụ:

```text
id
userId
cardId
studySessionId
exerciseType
skill
questionSnapshot
userAnswer
correctAnswer
isCorrect
firstTryCorrect
attemptCount
responseDuration
reviewedAt
```

Có thể lưu snapshot để lịch sử không bị sai nếu Card được sửa sau này.

---

# 42. Danh sách lỗi sai

Hệ thống lưu các câu trả lời sai.

Ví dụ:

```text
Correct:
約束

Previous Wrong Answers:
予約
約会
やくそう
```

Người dùng có thể xem các lỗi thường gặp.

---

# 43. Ôn lại câu sai

Card sai có thể:

```text
Card A sai
↓
5 Card khác
↓
Card A xuất hiện lại
```

Có thể cấu hình:

- Repeat after N cards.
- Repeat at session end.
- Add to difficult list.
- Schedule sooner.

---

# 44. SRS — Spaced Repetition

Ứng dụng có mục:

**Cần ôn hôm nay**

SRS Engine tính:

```text
nextReviewAt
```

dựa trên:

- Correct / Wrong.
- First try correct.
- Attempts.
- Previous interval.
- Mastery.
- Ease.
- Skill.

---

# 45. Nguyên tắc lịch ôn

```text
Sai nhiều
↓
Ôn sớm

Đúng nhưng khó
↓
Tăng interval ít

Đúng
↓
Tăng interval

Dễ
↓
Tăng interval nhiều
```

Card đã thuộc vẫn tiếp tục được ôn định kỳ.

---

# 46. SRS Engine

Logic SRS phải nằm trong Backend/Application Layer.

Không đặt trực tiếp trong UI.

```text
Review Result
      ↓
SRS Engine
      ↓
Update SkillMastery
      ↓
Update ReviewSchedule
```

Nhờ vậy có thể thay thuật toán sau này.

---

# 47. Study Session

Mỗi phiên học tạo:

```text
StudySession
```

Có thể lưu:

```text
id
userId
startedAt
finishedAt
selectedDecks
exerciseTypes
selectedSkills
totalQuestions
correctCount
wrongCount
duration
settings
```

---

# 48. Kết thúc Study Session

Hiển thị:

```text
20 câu

16 đúng

4 sai

80% accuracy

12 đúng ngay lần đầu

4 Card cần ôn lại

Thời gian: 8 phút
```

Có nút:

- Ôn lại câu sai.
- Học tiếp.
- Quay về Dashboard.

---

# 49. Dashboard

Trang chính hiển thị:

```text
Cần ôn hôm nay
Cards mới
Đang học
Đã thuộc
Đang gặp khó khăn
```

Thống kê:

- Số Card.
- Review hôm nay.
- Accuracy.
- Study streak.
- Study time.
- Weakest skill.
- Most studied Deck.

---

# 50. Search

Tìm kiếm theo:

- Japanese.
- Kana.
- Kanji.
- Meaning.
- Nghĩa Hán.
- Grammar.
- Tag.
- Deck name.

PostgreSQL có thể bắt đầu bằng:

```text
ILIKE
```

và nâng cấp sang:

```text
Full Text Search
```

khi dữ liệu lớn hơn.

---

# 51. Filter

Có thể lọc:

```text
Card Type
JLPT
Tag
Deck
Learning Status
Has Audio
No Audio
Due Today
Difficult
Mastered
Not Learned
```

---

# 52. Tra cứu Kanji

Cho phép tìm theo:

- Kanji.
- Onyomi.
- Kunyomi.
- Nghĩa.
- Nghĩa Hán.
- Bộ thủ.

Thông tin có thể gồm:

```text
Kanji
Onyomi
Kunyomi
Meaning
Sino-Vietnamese
Stroke Count
Radical
Vocabulary Examples
```

Người dùng có thể:

**Add to Deck**

để tạo Card từ kết quả tra cứu.

---

# 53. Frontend Architecture

Frontend được chia thành các layer:

```text
Presentation
     ↓
Feature / Application
     ↓
API / Data Access
     ↓
Local Storage
```

Cấu trúc đề xuất:

```text
src/
│
├── app/
│
├── components/
│
├── features/
│   ├── auth/
│   ├── library/
│   ├── decks/
│   ├── cards/
│   ├── study/
│   ├── review/
│   ├── progress/
│   ├── import/
│   ├── search/
│   └── settings/
│
├── services/
│   ├── api/
│   ├── storage/
│   ├── audio/
│   └── sync/
│
├── stores/
│
├── hooks/
│
├── schemas/
│
├── types/
│
├── utils/
│
└── constants/
```

---

# 54. Navigation

Sử dụng Expo Router.

Các route chính:

```text
/auth

/dashboard

/library

/folders/[folderId]

/decks/[deckId]

/cards/[cardId]

/cards/create

/import

/study/setup

/study/session/[sessionId]

/study/result/[sessionId]

/review/today

/progress

/search

/kanji

/settings
```

---

# 55. Frontend State

Không nên đưa tất cả dữ liệu vào global state.

Phân chia:

### Server State

Sử dụng:

```text
TanStack Query
```

cho:

- Folders.
- Decks.
- Cards.
- Reviews.
- Progress.

### Client State

Sử dụng:

```text
Zustand
```

cho:

- Study Session tạm thời.
- UI settings.
- Offline state.
- Local filters.

---

# 56. Form trên Frontend

Sử dụng:

```text
React Hook Form
+
Zod
```

cho:

- Login.
- Register.
- Card editor.
- Deck editor.
- Import mapping.
- Study settings.

Validation phải có cả:

```text
Frontend validation
+
Backend validation
```

Frontend validation chỉ hỗ trợ UX.

Backend vẫn là nguồn xác thực cuối cùng.

---

# 57. Responsive UI

Web có thể sử dụng không gian màn hình lớn hơn.

Ví dụ:

```text
Desktop

Sidebar | Content | Detail panel
```

Mobile:

```text
Header
Content
Bottom Navigation
```

Không nhất thiết mọi màn hình Web và Mobile phải giống bố cục 100%.

Business logic vẫn dùng chung.

---

# 58. Các màn hình Frontend chính

## Authentication

- Login.
- Register.
- Forgot Password.

## Dashboard

- Due Today.
- Recent Decks.
- Progress Summary.

## Library

- Folder list.
- Deck list.
- Search.

## Deck Detail

- Card list.
- Filter.
- Bulk actions.

## Card Editor

- Vocabulary form.
- Kanji form.
- Grammar form.
- Sentence form.

## Import

- File selection.
- Column mapping.
- Preview.
- Duplicate resolution.

## Study Setup

- Deck selection.
- Exercise type.
- Skill.
- Number questions.

## Study Session

- Exercise UI.
- Answer.
- Feedback.

## Result

- Accuracy.
- Mistakes.
- Review again.

## Progress

- Statistics.
- Mastery.
- Difficult cards.

## Settings

- Account.
- Study preferences.
- Audio.
- Offline content.

---

# 59. Backend Architecture

NestJS được tổ chức theo module.

```text
src/
│
├── main.ts
├── app.module.ts
│
├── auth/
├── users/
├── folders/
├── decks/
├── cards/
├── tags/
├── exercises/
├── study-sessions/
├── reviews/
├── mastery/
├── srs/
├── media/
├── imports/
├── exports/
├── search/
├── sync/
├── kanji/
├── common/
└── database/
```

---

# 60. NestJS Modules

## AuthModule

Phụ trách:

- Register.
- Login.
- Logout.
- Refresh token.
- Password reset.

## UsersModule

- Profile.
- Preferences.

## FoldersModule

- Folder CRUD.

## DecksModule

- Deck CRUD.
- Move Deck.
- Duplicate Deck.

## CardsModule

- Card CRUD.
- Card content.
- Bulk operations.

## TagsModule

- Tag CRUD.
- Assign Tag.

## ExercisesModule

- Exercise generation.
- Answer rules.

## StudySessionsModule

- Create session.
- Get next exercise.
- Finish session.

## ReviewsModule

- Submit answer.
- Review history.

## MasteryModule

- Calculate mastery.

## SrsModule

- Calculate next review.

## MediaModule

- Upload.
- Metadata.
- Delete.

## ImportsModule

- Parse CSV.
- Parse Excel.
- Preview.
- Import.

## ExportsModule

- Export user data.

## SearchModule

- Global search.

## SyncModule

- Offline synchronization.
- Conflict handling.

---

# 61. Backend request flow

Ví dụ người dùng trả lời câu hỏi:

```text
Frontend
   ↓
POST /reviews
   ↓
ReviewsController
   ↓
ReviewsService
   ↓
Answer Evaluation
   ↓
Create Review
   ↓
MasteryService
   ↓
SrsService
   ↓
PostgreSQL
   ↓
Response
   ↓
Frontend
```

---

# 62. API Design

Sử dụng REST API.

Prefix:

```text
/api/v1
```

Ví dụ:

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh

GET    /api/v1/folders
POST   /api/v1/folders
PATCH  /api/v1/folders/:id
DELETE /api/v1/folders/:id

GET    /api/v1/decks
GET    /api/v1/decks/:id
POST   /api/v1/decks
PATCH  /api/v1/decks/:id
DELETE /api/v1/decks/:id

GET    /api/v1/cards
GET    /api/v1/cards/:id
POST   /api/v1/cards
PATCH  /api/v1/cards/:id
DELETE /api/v1/cards/:id
```

---

# 63. API Study

Ví dụ:

```text
POST /api/v1/study-sessions

GET /api/v1/study-sessions/:id

GET /api/v1/study-sessions/:id/next

POST /api/v1/study-sessions/:id/answers

POST /api/v1/study-sessions/:id/finish
```

---

# 64. API Progress

```text
GET /api/v1/progress/overview

GET /api/v1/progress/due

GET /api/v1/progress/difficult

GET /api/v1/progress/cards/:cardId

GET /api/v1/reviews/history
```

---

# 65. PostgreSQL Data Model

Các bảng chính có thể gồm:

```text
users

refresh_tokens

folders

decks

cards

vocabulary_cards

kanji_cards

grammar_cards

sentence_cards

grammar_examples

cloze_exercises

accepted_answers

tags

card_tags

media

study_sessions

study_session_decks

reviews

skill_masteries

review_schedules

user_settings

sync_changes
```

---

# 66. User

```text
users

id
email
password_hash
display_name
created_at
updated_at
```

---

# 67. Folder

```text
folders

id
user_id
name
position
created_at
updated_at
version
```

---

# 68. Deck

```text
decks

id
user_id
folder_id
name
description
position
created_at
updated_at
version
```

---

# 69. Card

```text
cards

id
user_id
deck_id
type
created_at
updated_at
version
deleted_at
```

`deleted_at` hỗ trợ Soft Delete và đồng bộ offline sau này.

---

# 70. Vocabulary Card

```text
vocabulary_cards

card_id
japanese
reading
meaning
sino_vietnamese
word_type
jlpt_level
notes
```

---

# 71. Kanji Card

```text
kanji_cards

card_id
kanji
onyomi
kunyomi
meaning
sino_vietnamese
stroke_count
radical
notes
```

---

# 72. Grammar Card

```text
grammar_cards

card_id
pattern
meaning
structure
explanation
notes
```

---

# 73. Sentence Card

```text
sentence_cards

card_id
japanese
reading
meaning
notes
```

---

# 74. Accepted Answer

```text
accepted_answers

id
card_id
exercise_type
answer
normalized_answer
created_at
```

---

# 75. Tag

```text
tags

id
user_id
name
created_at
```

Many-to-many:

```text
card_tags

card_id
tag_id
```

---

# 76. Media

```text
media

id
user_id
card_id
type
storage_key
file_name
mime_type
file_size
duration
created_at
```

---

# 77. Review

```text
reviews

id
user_id
card_id
study_session_id
exercise_type
skill
user_answer
correct_answer
is_correct
first_try_correct
attempt_count
response_duration_ms
user_override
reviewed_at
```

Review là dữ liệu lịch sử và không nên bị chỉnh sửa tùy tiện.

---

# 78. Skill Mastery

```text
skill_masteries

id
user_id
card_id
skill
mastery_score
correct_count
wrong_count
first_try_correct_count
correct_streak
wrong_streak
ease
interval_days
last_reviewed_at
next_review_at
updated_at
```

Unique:

```text
user_id + card_id + skill
```

---

# 79. Review Schedule

Có thể tách riêng nếu cần:

```text
review_schedules

id
user_id
card_id
skill
due_at
interval_days
priority
```

Nếu hệ thống đơn giản, thông tin này có thể nằm trong `skill_masteries`.

---

# 80. Database Index

Cần index ít nhất:

```text
cards.user_id
cards.deck_id

decks.user_id
decks.folder_id

reviews.user_id
reviews.card_id
reviews.reviewed_at

skill_masteries.user_id
skill_masteries.next_review_at

accepted_answers.card_id

tags.user_id
```

Search field có thể bổ sung index riêng khi cần.

---

# 81. Authorization

Backend luôn kiểm tra ownership.

Ví dụ:

Người dùng A gửi:

```text
GET /cards/card-of-user-b
```

Backend phải trả:

```text
403 hoặc 404
```

Không tin `userId` gửi từ Frontend.

Backend lấy User ID từ Access Token.

---

# 82. DTO Validation

NestJS sử dụng DTO.

Ví dụ:

```text
CreateVocabularyCardDto

japanese
reading
meaning
sinoVietnamese
wordType
jlptLevel
```

Validation được thực hiện bằng:

```text
class-validator
```

hoặc giải pháp validation thống nhất được chọn trong dự án.

---

# 83. API Error Format

Nên thống nhất:

```json
{
  "statusCode": 400,
  "code": "INVALID_CARD_DATA",
  "message": "Card data is invalid",
  "details": {}
}
```

Frontend dựa vào `code` thay vì parse chuỗi `message`.

---

# 84. Pagination

Danh sách lớn phải hỗ trợ pagination.

Ví dụ:

```text
GET /cards?deckId=...&page=1&limit=50
```

Hoặc cursor pagination khi dữ liệu lớn hơn.

---

# 85. Sorting

API hỗ trợ:

```text
createdAt
updatedAt
japanese
reading
mastery
dueDate
```

---

# 86. Security

Backend cần:

- Password hashing.
- JWT validation.
- Refresh token rotation.
- Rate limiting.
- CORS.
- Request validation.
- File validation.
- Maximum upload size.
- Ownership check.
- SQL injection protection thông qua ORM.
- Không log password/token.

---

# 87. Logging

NestJS cần logging cho:

```text
Authentication failure

Unhandled errors

Import jobs

Media upload

Sync conflicts

Database failures
```

Không log dữ liệu nhạy cảm không cần thiết.

---

# 88. API Documentation

Backend sử dụng:

```text
Swagger / OpenAPI
```

Có thể truy cập trong development:

```text
/api/docs
```

Giúp Frontend kiểm tra request/response và giảm sai lệch giữa FE và BE.

---

# 89. FE–BE Type Safety

Vì cả Frontend và Backend đều dùng TypeScript, có thể chia sẻ:

```text
Enums
API Types
Constants
Schemas
```

thông qua package dùng chung.

Ví dụ monorepo:

```text
apps/
├── mobile-web/
└── api/

packages/
├── shared-types/
├── validation/
└── shared-utils/
```

---

# 90. Monorepo

Có thể tổ chức:

```text
root/
│
├── apps/
│   ├── client/
│   └── api/
│
├── packages/
│   ├── shared/
│   └── config/
│
├── package.json
└── README.md
```

Frontend:

```text
apps/client
```

Backend:

```text
apps/api
```

---

# 91. Offline Mode

Offline sẽ được triển khai sau khi online architecture ổn định.

Frontend sử dụng local database, ví dụ:

```text
Expo SQLite
```

để lưu:

- Downloaded Cards.
- Deck metadata.
- Study progress tạm thời.
- Pending Reviews.
- Sync queue.

---

# 92. Offline Sync Queue

Khi offline:

```text
User Answers
     ↓
Local Review
     ↓
Sync Queue
```

Khi có mạng:

```text
Sync Queue
     ↓
Backend
     ↓
PostgreSQL
     ↓
Mark Synced
```

---

# 93. Versioning dữ liệu

Các entity có thể có:

```text
version
updatedAt
```

Khi Frontend sửa:

```text
Card version = 5
```

Backend chỉ update nếu version hiện tại phù hợp.

Nếu server đã là:

```text
version = 6
```

thì phát hiện conflict.

---

# 94. Xử lý Conflict

Ví dụ:

Laptop sửa:

```text
meaning
```

Mobile sửa:

```text
example
```

Có thể merge.

Nếu cả hai cùng sửa:

```text
meaning
```

thì tạo conflict.

Frontend hiển thị:

```text
Phiên bản trên thiết bị

Phiên bản trên server

Giữ phiên bản thiết bị

Giữ phiên bản server

Gộp thủ công
```

---

# 95. Import Backend

Frontend upload file.

Backend:

```text
Receive File
     ↓
Validate
     ↓
Parse
     ↓
Normalize
     ↓
Detect Duplicate
     ↓
Return Preview
```

Frontend cho người dùng chỉnh mapping và xác nhận.

Sau đó mới thực hiện import thực tế.

---

# 96. Transaction

Import hàng loạt cần transaction.

Ví dụ 500 Cards.

Nếu import gặp lỗi nghiêm trọng giữa chừng thì không nên để database rơi vào trạng thái dữ liệu một nửa nếu thao tác yêu cầu tính nguyên tử.

PostgreSQL transaction được sử dụng phù hợp với từng trường hợp.

---

# 97. Performance

Không tải toàn bộ thư viện ngay khi mở ứng dụng.

Sử dụng:

- Pagination.
- Lazy loading.
- Query caching.
- Infinite query khi cần.
- Database indexes.

Study Session nên lấy trước một số câu kế tiếp để UI mượt.

---

# 98. Cache Frontend

TanStack Query quản lý:

```text
Server cache

Refetch

Stale data

Optimistic update
```

Có thể dùng Optimistic Update cho thao tác đơn giản như:

- Rename Deck.
- Add Tag.

Không nên dùng khi logic server phức tạp nếu dễ gây lệch dữ liệu.

---

# 99. Testing Frontend

Cần test các phần quan trọng:

- Answer normalization.
- Study flow.
- Three-attempt logic.
- Card form.
- Import mapping.
- Offline queue.

---

# 100. Testing Backend

Backend cần:

### Unit Test

- Answer evaluator.
- Mastery calculation.
- SRS calculation.
- Duplicate detector.

### Integration Test

- Auth.
- Card CRUD.
- Study Session.
- Review submission.
- Import.

### E2E Test

Ví dụ:

```text
Register
↓
Create Deck
↓
Create Card
↓
Start Study
↓
Submit Answer
↓
Review saved
↓
Mastery updated
```

---

# 101. Environment

Ít nhất có:

```text
Development

Staging

Production
```

Không dùng chung database production cho development.

---

# 102. Environment Variables Backend

Ví dụ:

```text
DATABASE_URL

JWT_ACCESS_SECRET

JWT_REFRESH_SECRET

STORAGE_ENDPOINT

STORAGE_ACCESS_KEY

STORAGE_SECRET_KEY

STORAGE_BUCKET
```

Không commit secret vào Git.

---

# 103. Development Infrastructure

Local development có thể sử dụng Docker Compose:

```text
NestJS
PostgreSQL
MinIO
```

Frontend có thể chạy riêng qua Expo.

---

# 104. MVP 1

Mục tiêu MVP là hoàn thiện một vòng học đầy đủ.

## Authentication

- Register.
- Login.
- Logout.
- Refresh token.

## Library

- Folder CRUD.
- Deck CRUD.
- Card CRUD.
- Search.

## Cards

- Vocabulary.
- Sentence.
- Grammar cơ bản.

## Import

- CSV.
- Preview.
- Mapping.
- Duplicate detection cơ bản.

## Study

- Flashcard.
- Typing.
- Multiple Choice.
- Shuffle.
- Multi Deck.

## Progress

- Reviews.
- Correct / Wrong.
- Basic Mastery.
- Difficult Cards.

---

# 105. MVP Frontend

Cần hoàn thành:

```text
Authentication Screens

Dashboard

Library Screen

Folder Screen

Deck Screen

Card Editor

Search

Study Setup

Flashcard Screen

Typing Screen

Multiple Choice Screen

Study Result

Progress Overview

Settings
```

---

# 106. MVP Backend

Cần hoàn thành modules:

```text
Auth

Users

Folders

Decks

Cards

Tags

Study Sessions

Exercises

Reviews

Mastery

Search

Imports
```

---

# 107. MVP Database

Các bảng ưu tiên:

```text
users

refresh_tokens

folders

decks

cards

vocabulary_cards

sentence_cards

grammar_cards

accepted_answers

tags

card_tags

study_sessions

reviews

skill_masteries
```

---

# 108. V1.1 — Listening

Thêm:

```text
Audio upload

Audio recording

Audio playback

Listening word

Listening sentence

Playback speed

Media storage
```

Backend thêm:

```text
MediaModule
```

---

# 109. V1.2 — Spaced Repetition

Thêm:

```text
Due Today

nextReviewAt

Review scheduling

SRS Engine

Repeat Wrong Cards
```

---

# 110. V1.3 — Grammar Training

Thêm:

```text
Grammar examples

Cloze

Multiple accepted answers

Grammar explanation
```

---

# 111. V2 — Advanced Learning

Thêm:

- Mastery chi tiết từng kỹ năng.
- Learning analytics.
- Error history.
- Kanji dictionary.
- Progress chart.
- Advanced search.
- Advanced filtering.

---

# 112. V3 — Offline First

Thêm:

```text
Download Deck

Local SQLite

Offline Audio

Sync Queue

Versioning

Conflict Resolution
```

Offline sync nên được thực hiện sau khi mô hình dữ liệu online đã ổn định.

---

# 113. Những tính năng chưa cần trong MVP

Không cần làm ngay:

- Tự động chấm toàn bộ câu dịch.
- Tự động tạo lesson.
- Social Network.
- Chat.
- Leaderboard.
- Marketplace.
- Public Deck Sharing.
- Kanji handwriting recognition.
- Advanced offline conflicts.

---

# 114. Nguyên tắc thiết kế

## Card là nguồn dữ liệu

Không nhân bản Card để tạo nhiều bài.

## Exercise được sinh từ Card

Một Card có nhiều Exercise.

## Review là lịch sử

Không ghi đè Review cũ.

## Mastery theo Skill

Không đánh giá Card chỉ bằng một trạng thái duy nhất.

## SRS độc lập UI

Có thể đổi thuật toán sau này.

## Backend là nguồn dữ liệu chính

Frontend không tự quyết định các business rule quan trọng.

## Người dùng kiểm soát dữ liệu

Không tự động xóa, merge hoặc ghi đè nếu không chắc chắn.

---

# 115. Core Learning Loop

```text
Tạo nội dung
      ↓
Tổ chức thư viện
      ↓
Chọn nội dung
      ↓
Chọn kỹ năng
      ↓
Backend tạo Exercise
      ↓
Người dùng trả lời
      ↓
Backend chấm đáp án
      ↓
Lưu Review
      ↓
Cập nhật Mastery
      ↓
Tính Review Schedule
      ↓
Frontend hiển thị kết quả
      ↓
Ôn lại
```

---

# 116. Luồng dữ liệu hoàn chỉnh

Ví dụ người dùng học từ:

```text
Frontend gọi:

POST /study-sessions
```

Backend:

```text
Create StudySession
↓
Find Cards
↓
Generate Exercises
```

Frontend nhận Exercise:

```text
約束 nghĩa là gì?
```

Người dùng trả lời:

```text
Lời hứa
```

Frontend gửi Backend.

Backend:

```text
Normalize Answer
↓
Compare Accepted Answers
↓
Create Review
↓
Update Skill Mastery
↓
Calculate Next Review
↓
Return Result
```

Frontend hiển thị:

```text
✓ Chính xác

約束
やくそく
Lời hứa

Ôn lại sau: 3 ngày
```

Đây là luồng trung tâm cần được hoàn thiện trước khi mở rộng các chức năng khác.

---

# 117. Stack kỹ thuật chính thức

## Frontend

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

REST API

Swagger / OpenAPI
```

## Database

```text
PostgreSQL

Prisma ORM
```

## Media

```text
S3-compatible Object Storage
```

## Local / Offline

```text
Expo SQLite
```

## Authentication

```text
JWT Access Token

Refresh Token
```

---

# 118. Kiến trúc cuối cùng

```text
┌─────────────────────────────────────────┐
│               CLIENT                    │
│                                         │
│ TypeScript                              │
│ React Native + Expo                    │
│ React Native Web                       │
│ Expo Router                            │
│ TanStack Query                         │
│ Zustand                                │
│ React Hook Form + Zod                  │
└──────────────────┬──────────────────────┘
                   │
                   │ HTTPS REST API
                   ▼
┌─────────────────────────────────────────┐
│               BACKEND                   │
│                                         │
│ TypeScript                              │
│ Node.js                                 │
│ NestJS                                  │
│ REST API                                │
│ JWT Authentication                      │
│ Business Logic                          │
│ Review Engine                           │
│ Mastery Engine                          │
│ SRS Engine                              │
│ Sync Engine                             │
└───────────┬─────────────────┬───────────┘
            │                 │
            ▼                 ▼
┌─────────────────────┐ ┌─────────────────┐
│     PostgreSQL      │ │ Object Storage  │
│                     │ │                 │
│ Users               │ │ Audio           │
│ Folders             │ │ Recordings      │
│ Decks               │ │ Media           │
│ Cards               │ └─────────────────┘
│ Reviews             │
│ Mastery             │
│ Schedules           │
└─────────────────────┘
```

---

# 119. Mục tiêu cuối cùng

Ứng dụng không chỉ lưu:

```text
Từ → Nghĩa
```

mà xây dựng hệ thống:

```text
Từ
↓
Kanji
↓
Cách đọc
↓
Nghĩa
↓
Nghĩa Hán
↓
Ngữ pháp
↓
Ví dụ
↓
Audio
↓
Exercise
↓
Review
↓
Skill Mastery
↓
SRS
↓
Review Schedule
```

Ứng dụng phải có khả năng trả lời được bốn câu hỏi quan trọng:

```text
Người dùng đang học gì?

Người dùng nhớ nội dung đó ở mức nào?

Người dùng đang yếu kỹ năng nào?

Người dùng nên ôn nội dung nào tiếp theo?
```

Mục tiêu cuối cùng là xây dựng một hệ thống học tiếng Nhật cá nhân có khả năng hoạt động nhất quán trên **Web, Android và iOS**, với kiến trúc:

**Frontend: TypeScript + React Native + Expo**

**Backend: TypeScript + Node.js + NestJS**

**Database: PostgreSQL**

và đủ khả năng mở rộng từ một ứng dụng Flashcard ban đầu thành một nền tảng ôn tập tiếng Nhật hoàn chỉnh.