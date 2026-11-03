# Changelog

## 1.1.1 — Merge upstream "remove classes"

- Merged the upstream change that removed the `Class` model: a course now has a `mentor`
  (defaults to the teacher), `startTime` and `endTime` (default: now → +6 months), and students
  enroll directly in courses (`studentsOnClass.courseID`).
- Enrollment routes use `courseId`: `POST /course/studentOnClass/addStudentToCourse`,
  `PUT|DELETE /course/studentOnClass/:userId/:courseId`, `PUT .../doneTask/:userId/:courseId/:taskId`,
  `GET .../getStudentById/:userId/:courseId`. The `/course/class` routes were removed.
- Fixed upstream issues while porting: course update no longer resets `startTime`/`endTime` to
  hard-coded 2022/2024 defaults; enrolling in a locked course is refused; the hard-coded server
  IP for uploads is replaced by `PUBLIC_BASE_URL` (set it to `http://82.115.18.249:3000`).
- Note: migration `20231022093322_` adds `NOT NULL` columns without defaults and drops `Class`;
  it only applies to a database whose `Course` table is empty (as on the upstream server).

## 1.1.0 — Codebase overhaul

### Security

- **Removed the hard-coded Kavenegar API key** from `src/services/sms.js`; it is now read from
  `KAVENEGAR_API_KEY`. The old key is still in git history and **must be revoked**.
- Fixed privilege escalation: student and admin access tokens were signed with the same secret
  and only carried an `id`, so a student token was accepted as the admin with the same id.
  Tokens now carry a `type` claim and admin routes require `type: "admin"`.
- Re-enabled the CASL permission checks (`isCan`) that were commented out on most course,
  season, chapter, task and enrollment routes.
- Creating a user/admin no longer echoes the plain-text password in the response.
- Refresh tokens are stored hashed, rotated on every refresh, and revoked on logout/block/delete.
- JWT lifetimes were ~41 days (access) and ~114 years (refresh) because `expiresIn` numbers are
  seconds; now `15m` / `30d` by default and configurable.
- OTP codes use `crypto.randomInt`, are single-use, expire, and lock after 5 wrong attempts.
- Rate limiting on login / OTP endpoints, `helmet` security headers, JSON body size limit.
- Uploads: allow-listed extensions (no SVG/HTML/scripts), size limit, random file names,
  configurable public URL instead of a hard-coded server IP.
- Internal error messages (database errors, stack traces) are no longer sent to clients
  outside development. Login takes constant time whether or not the account exists.
- Open admin sign-up is disabled in production; use `npm run seed:admin`.
- 0 known vulnerabilities in production dependencies (`npm audit --omit=dev`).

### Bug fixes

- `POST /authAdmin/refreshToken` always crashed (`receivedRefreshToken` was undefined).
- Refresh endpoints required a _valid access token_, making refresh impossible once it expired.
- `POST /authAdmin/signup` hung forever outside development (no response was sent).
- Every `PUT` on course/season/chapter/task/enrollment failed because request fields
  (`courseId`, `mentorId`, `id`, ...) were passed straight to Prisma.
- Creating without dates threw (`Date.prototype.getDate()`); create endpoints returned
  an empty body instead of the created record.
- Task create/update errors were never caught (empty `try` blocks) and crashed the request.
- Logging in / resetting the password of an unknown phone number crashed with a 500.
- `errorHandler` crashed when an error had no status code; invalid tokens returned 411/413.
- SMS failures produced an unhandled promise rejection that could kill the process.
- `DELETE` routes for course content were empty stubs and never responded.
- Enrolling a student ignored capacity and lock status; tasks could be marked done twice.
- Titles/descriptions only accepted `[a-zA-Z0-9- ]`, so Persian text was rejected.
- A single `PrismaClient` is shared instead of one connection pool per file.

### Breaking changes for API clients

- Delete endpoints take the identifier in the URL: `DELETE /manageAdmin/:userName`,
  `DELETE /manageUser/:phone`, `DELETE /course/:id`, `/course/season/:id`, `/course/chapter/:id`,
  `/course/task/:id`, `/course/studentOnClass/:userId/:courseId`.
- `getAllAdmins` / `getAllUsers` are paginated (`?page=&size=`) and return
  `{ items, total, page, size }`.
- Upload endpoints return `{ "url": "..." }` instead of a bare string.
- Old tokens are invalid (no `type` claim) — everyone must log in again once.
- New passwords need 8–64 characters with at least one letter and one digit
  (existing passwords still work for login).
- Env variables renamed: `ACCESSTOKEN_SECRET` → `ACCESS_TOKEN_SECRET`,
  `REFRESHTOKEN_SECRET` → `REFRESH_TOKEN_SECRET`, `ENVIRONMENT` → `NODE_ENV`.

### Tooling

- `src/app.js` (testable app factory) + `src/index.js` (server with graceful shutdown), `/health`.
- Environment validated at startup (`src/config`), `.env.example` added.
- Fixed the Dockerfile (`npm install apt-get install -y postgresql` and `prisma migrate dev` in
  production), non-root image with healthcheck; docker-compose reads secrets from `.env`.
- Prisma 5, ESLint 9 (flat config) + Prettier, Jest + Supertest test suite, GitHub Actions CI.
- Removed junk files (`exit`, `crash.log`), unused/harmful packages (`fs`, `path` shims, `level`,
  `kavenegar`, `simple-data-storage`, `lodash`, `uuid`, TypeScript tooling) and file names with spaces.
