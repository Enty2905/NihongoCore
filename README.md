# NihongoCore

NihongoCore là dự án ứng dụng học và ôn tập tiếng Nhật cá nhân, hướng tới Web, Android và iOS. Người học sẽ tổ chức kiến thức theo **Folder → Deck → Card**, luyện tập từ cùng một nguồn nội dung và theo dõi lịch sử học theo từng kỹ năng.

**Trạng thái: nền tảng M1 và feature `001-authentication` đã được triển khai, kiểm thử.** Repository hiện có luồng Register, Login, khôi phục phiên, Logout và authenticated shell tối thiểu trên Expo Web/native foundation. Các chức năng học tập vẫn ở giai đoạn đặc tả.

## Định hướng sản phẩm

MVP được mô tả trong [yêu cầu sản phẩm](docs/PRODUCT_REQUIREMENTS.md):

- Thư viện cá nhân với Folder, Deck và Card từ vựng, câu, ngữ pháp cơ bản.
- Luyện tập bằng Flashcard, Typing và Multiple Choice.
- Nhập CSV có preview, ánh xạ cột và xử lý trùng lặp có xác nhận.
- Lưu Review History, phân biệt đúng ngay lần đầu và đúng sau khi thử lại.
- Theo dõi Basic Mastery theo người học, Card và kỹ năng.

Các mục trên là phạm vi dự kiến, chưa phải chức năng đã triển khai. Audio, Full SRS, Offline Sync và từ điển Kanji nằm ngoài MVP.

## Hiện tại chạy được những gì?

| Thành phần | Khả năng hiện có                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------- |
| Client     | Login/Register phương án A, bootstrap phiên, protected account shell và Logout với trạng thái retry |
| API        | NestJS Auth REST: Register, Login, refresh rotation, Logout và authenticated current-user context   |
| Health     | `GET /api/v1/health` trả `{ "status": "ok" }`                                                       |
| OpenAPI    | Swagger UI và tài liệu JSON trong môi trường development                                            |
| Database   | PostgreSQL, Prisma User/AuthSession/RefreshToken và migration Authentication đã được áp dụng        |
| Chất lượng | API/client tests, Web–API E2E, responsive visual review và build API/Web/Android/iOS đã đạt         |
| CI         | GitHub Actions chạy kiểm tra tự động với PostgreSQL tạm; chưa có deployment                         |

Web đã được kiểm tra trong Chromium ở 390/1024/1440 px với API/PostgreSQL thật. Android và iOS đã export bundle thành công; chưa chạy trên thiết bị vật lý trong môi trường Windows hiện tại.

## Công nghệ

| Lớp                   | Công nghệ                                                                      |
| --------------------- | ------------------------------------------------------------------------------ |
| Client                | TypeScript, React Native, Expo 57, React Native Web, Expo Router               |
| Dữ liệu và form       | TanStack Query, React Hook Form, Zod                                           |
| Backend               | TypeScript, Node.js, NestJS 11, REST, Swagger/OpenAPI                          |
| Database              | PostgreSQL 17, Prisma 7                                                        |
| Workspace và kiểm tra | npm workspaces, ESLint, Prettier, TypeScript, Node test runner, GitHub Actions |

Backend là modular monolith và chịu trách nhiệm thực thi quy tắc nghiệp vụ. Frontend hỗ trợ trải nghiệm nhập liệu; quyền sở hữu và dữ liệu không được quyết định từ thông tin client tự khai báo.

## Yêu cầu môi trường

- Node.js **24.3 trở lên trong nhánh 24**, npm **11**.
- Docker Desktop chạy Linux containers, hoặc PostgreSQL riêng.
- Git để clone repository.
- Để thử mobile: Expo client tương thích với SDK hiện tại hoặc môi trường development Android/iOS. iOS Simulator cần macOS.

Trên Windows PowerShell, dùng `npm.cmd` / `npx.cmd` nếu execution policy chặn wrapper `.ps1`.

## Cài đặt

```sh
git clone https://github.com/Enty2905/NihongoCore.git
cd NihongoCore
npm ci
```

Tạo biến môi trường từ các mẫu, tại repository root:

**PowerShell:**

```powershell
Copy-Item .env.example .env
Copy-Item apps/client/.env.example apps/client/.env
```

**macOS/Linux:**

```sh
cp .env.example .env
cp apps/client/.env.example apps/client/.env
```

API và Prisma đọc `.env` ở root khi chạy bằng workspace scripts. Expo đọc `apps/client/.env`. File mẫu chỉ chứa giá trị development; file môi trường thật được Git ignore.

`EXPO_PUBLIC_API_URL` là cấu hình công khai của client, mặc định `http://localhost:3000/api/v1`. Không đặt secret vào biến có tiền tố `EXPO_PUBLIC_`. Các secret và lifetime Authentication trong `.env` chỉ được đọc bởi API; hãy thay placeholder bằng giá trị mạnh ngoài development.

## Khởi động PostgreSQL và Prisma

```sh
docker compose up -d --wait postgres
npm run db:generate
npm run db:validate
npm run db:check
```

PostgreSQL được mở ở `localhost:15432` và lưu dữ liệu trong Docker named volume. Giữ `DATABASE_URL` đồng bộ với thông tin PostgreSQL và `POSTGRES_PORT`. Có thể trỏ `DATABASE_URL` tới PostgreSQL riêng.

`db:status` phải báo migration Authentication đã được áp dụng. `db:check` chạy `SELECT 1` để kiểm tra kết nối. API cũng kiểm tra database khi khởi động.

Workflow tạo migration development cho thay đổi schema đã được phê duyệt:

```sh
npm run db:migrate -- --name <migration_name>
npm run db:generate
npm run db:status
```

Trong CI/production dùng `npm run db:migrate:deploy`. Luôn kiểm tra SQL trước khi áp dụng vào dữ liệu dùng chung.

Dừng database và giữ dữ liệu:

```sh
docker compose down
```

## Chạy backend

Mở terminal tại root:

```sh
npm run dev:api
```

| Địa chỉ                             | Chức năng                    |
| ----------------------------------- | ---------------------------- |
| http://localhost:3000/api/v1/health | Liveness: trả trạng thái API |
| http://localhost:3000/api/docs      | Swagger UI                   |
| http://localhost:3000/api/docs-json | OpenAPI JSON                 |

Authentication nằm dưới `/api/v1/auth`: `register`, `login`, `refresh`, `logout` và protected `me`. Web refresh dùng HttpOnly cookie; native dùng Expo SecureStore. Access token chỉ ở memory.

Swagger chỉ mở khi `NODE_ENV=development`. Health không truy vấn PostgreSQL ở từng request; API sẽ không khởi động nếu kết nối database thất bại.

## Chạy frontend

Web, trong terminal khác:

```sh
npm run dev:web
```

Mở http://localhost:8081. Khi chưa đăng nhập, router vào `/login`; Register thành công đi thẳng tới `/account` mà không yêu cầu Login lần nữa.

Expo mobile:

```sh
npm run dev:mobile
```

Mở emulator từ Expo terminal hoặc quét QR bằng Expo client tương thích. Khi dùng điện thoại thật, đổi `localhost` trong `apps/client/.env` thành IP LAN của máy chạy API. Android Emulator thường dùng `10.0.2.2` để truy cập máy host. Thiết bị phải truy cập được máy host qua cổng 3000.

Khởi động lại Expo sau khi đổi biến môi trường. Nếu dùng browser origin khác, thêm origin cụ thể vào `CORS_ORIGINS`.

## Kiểm tra và build

Chạy `npm run db:generate` trước khi kiểm tra một checkout mới.

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Dùng `npm run format` để tự định dạng. Kiểm tra tương thích dependency Expo từ thư mục `apps/client` bằng `npx expo install --check`.

API integration tests dùng PostgreSQL local và tự dọn fixture Authentication. Hãy khởi động PostgreSQL và áp dụng migration trước khi chạy `npm test`.

- API build: `apps/api/dist/`; chạy bằng `npm run start --workspace @nihongocore/api`.
- Web build: `apps/client/dist/`; khi host, cấu hình SPA fallback cho các route phía client.
- Client có kiểm thử validation TypeScript; luồng Web–API được kiểm chứng bằng acceptance E2E cục bộ. Native bundle được kiểm tra bằng Expo export cho Android và iOS.

[GitHub Actions](.github/workflows/ci.yml) chạy install, Prisma, format, lint, typecheck, test và build. Workflow không cần production secrets.

## Cấu trúc repository

```text
apps/
  client/
    src/app/             Login, Register, account shell và bootstrap routing
    src/features/auth/   Auth provider, forms, credential adapters và UI phương án A
    src/services/api/    API client tập trung, access token memory và one-shot refresh
  api/
    prisma/              Auth schema, migration và truy vấn kiểm tra kết nối
    src/auth/            Auth endpoints, session/token services và protected guard
    src/users/           User persistence support và safe profile mapping
    src/common/          Environment, validation, errors, Swagger, CORS
    src/database/        Vòng đời kết nối Prisma
    src/health/          Health endpoint
    test/                Foundation, Authentication và throttling integration tests
docs/                    Yêu cầu sản phẩm, UX, kiến trúc và API/data
.github/workflows/       CI
compose.yaml             PostgreSQL local
PROJECT_PLAN.md          Trạng thái milestone và quyết định còn mở
PROJECT_OVERVIEW.md      Tầm nhìn sản phẩm dài hạn
```

## Tài liệu và bước tiếp theo

- [Chỉ mục tài liệu](docs/README.md)
- [Yêu cầu và phạm vi MVP](docs/PRODUCT_REQUIREMENTS.md)
- [Kiến trúc hệ thống](docs/SYSTEM_ARCHITECTURE.md)
- [Dữ liệu, API và traceability](docs/DATA_API_AND_TRACEABILITY.md)
- [UX và luồng sản phẩm](docs/UX_AND_PRODUCT_DESIGN.md)
- [Kế hoạch và quyết định](PROJECT_PLAN.md)
- [Tầm nhìn dài hạn](PROJECT_OVERVIEW.md)

M0, M1 và `001-authentication` đã hoàn tất. **OD-001**, **OD-011** và **AUTH-CL-001** được thực thi theo contract đã duyệt; thiết kế A đã qua kiểm thử chức năng, bảo mật và giao diện. Hạng mục tiếp theo là `002-library-hierarchy`; chưa được bắt đầu.

## Những file chỉ giữ ở máy phát triển

Theo cấu hình [.gitignore](.gitignore), repository không xuất bản secret, file `.env` thật, khóa/chứng chỉ riêng, dependency đã cài, output build/test, cache, IDE settings và artifact cục bộ.
