# MicroLearning API

REST API for a micro-learning platform. Admins build **courses → seasons → chapters → tasks**,
open **classes** for a course and enroll students; students sign up with an SMS one-time code.

**Stack:** Node.js · Express · PostgreSQL · Prisma · Joi · JWT · CASL

## Features

- Student sign-up / password reset with SMS OTP ([Kavenegar](https://kavenegar.com))
- Admin roles with permissions: `Admin`, `Teacher`, `Supervisor` (read-only)
- Access + rotating refresh tokens
- Course content CRUD, class capacity & locking, student progress and finished tasks
- Media upload
- Request validation, consistent JSON errors, rate limiting, security headers

## Getting started

### With Docker

```bash
cp .env.example .env   # then set POSTGRES_PASSWORD, the token secrets, ...
docker compose up -d --build
docker compose exec app node src/scripts/seedAdmin.js   # uses ADMIN_USERNAME / ADMIN_PASSWORD
```

The API listens on `http://localhost:3000`; `GET /health` returns `{"status":"ok"}`.

### Locally

Requirements: Node.js ≥ 18.18 and PostgreSQL.

```bash
cp .env.example .env          # point DATABASE_URL at your database
npm install
npm run prisma:deploy         # apply migrations
ADMIN_USERNAME=admin ADMIN_PASSWORD='ChangeMe123' npm run seed:admin
npm run dev
```

Without `KAVENEGAR_API_KEY`, OTP codes are written to the server log (development only).

## Scripts

| Script                   | Description                            |
| ------------------------ | -------------------------------------- |
| `npm start`              | Start the server                       |
| `npm run dev`            | Start with auto-reload                 |
| `npm test`               | Run the test suite                     |
| `npm run lint`           | ESLint                                 |
| `npm run format`         | Prettier                               |
| `npm run prisma:migrate` | Create/apply migrations in development |
| `npm run prisma:deploy`  | Apply migrations (production)          |
| `npm run seed:admin`     | Create the first admin                 |

## Configuration

All settings come from environment variables; see [`.env.example`](.env.example). The server
refuses to start if a required variable is missing or invalid (for example token secrets shorter
than 32 characters).

## API overview

Base URL: `/api/v1`. Send the access token as `Authorization: Bearer <token>`
(the legacy `access-token` header is also accepted).

| Area         | Endpoints                                                                                                                                                                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Student auth | `POST /authUser/signup`, `/verify`, `/login`, `/refreshToken`, `/logout`, `/forgetpassword`, `/verifyforgetpassword`                                                                                                                                                   |
| Admin auth   | `POST /authAdmin/login`, `/refreshToken`, `/logout` (`/signup` in development only)                                                                                                                                                                                    |
| Admins       | `GET /manageAdmin/getAllAdmins?page&size`, `GET\|PUT\|DELETE /manageAdmin/:userName`, `POST /manageAdmin`                                                                                                                                                              |
| Students     | `GET /manageUser/getAllUsers?page&size`, `GET\|PUT\|DELETE /manageUser/:phone`, `POST /manageUser`                                                                                                                                                                     |
| Courses      | `GET /course/getAllCourses`, `GET\|PUT\|DELETE /course/:id`, `POST /course`, `PUT /course/lock/:id`                                                                                                                                                                    |
| Seasons      | `/course/season` — CRUD, `GET /getAllSeasons`, `GET /getSeasonsOfCourse/:courseId`                                                                                                                                                                                     |
| Chapters     | `/course/chapter` — CRUD, `GET /getAllChapters`, `GET /getChaptersOfSeason/:seasonId`                                                                                                                                                                                  |
| Tasks        | `/course/task` — CRUD, `GET /getalltasks`, `GET /gettasksofchapter/:chapterId`, `POST /upload`                                                                                                                                                                         |
| Classes      | `/course/class` — CRUD, `GET /getAllClasses`, `PUT /lock/:id`                                                                                                                                                                                                          |
| Enrollment   | `/course/studentOnClass` — `POST /addStudentToClass`, `GET /getAllstudentsOnClass/:classId`, `GET /getclassesofstudent/:userId`, `GET /getStudentById/:userId/:classId`, `PUT /:userId/:classId`, `PUT /doneTask/:userId/:classId/:taskId`, `DELETE /:userId/:classId` |
| Upload       | `POST /uploader` (multipart field `media`) → `{ "url": "..." }`                                                                                                                                                                                                        |

Errors always look like `{ "code": 404, "message": "Course not found" }`.

## Project structure

```
src/
  app.js              Express app factory
  index.js            HTTP server + graceful shutdown
  config/             env validation, roles & permissions
  lib/prisma.js       shared Prisma client
  api/
    middlewares/      auth, permissions, validation, errors, rate limit
    routes/v1/        route definitions
  services/           business logic & data access
  validation/         Joi request schemas
  prisma/             schema & migrations
  scripts/            maintenance scripts (seed admin)
tests/                Jest unit & integration tests
```

See [CHANGELOG.md](CHANGELOG.md) for what changed in the 1.1.0 overhaul.
