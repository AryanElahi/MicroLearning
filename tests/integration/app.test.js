jest.mock("../../src/lib/prisma", () => require("../prismaMock"));

const request = require("supertest");
const { Prisma } = require("@prisma/client");
const prisma = require("../../src/lib/prisma");
const createApp = require("../../src/app");
const { hashPassword } = require("../../src/utils/password");
const { hashToken } = require("../../src/services/token.services");
const { tokenFor, adminRecord } = require("./helpers");

const app = createApp();

describe("general", () => {
  it("GET /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("returns JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/v1/nope");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe(404);
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await request(app)
      .post("/api/v1/authAdmin/login")
      .set("Content-Type", "application/json")
      .send("{bad json");
    expect(res.status).toBe(400);
  });
});

describe("authentication & authorization", () => {
  it("rejects requests without a token with 401", async () => {
    const res = await request(app).get("/api/v1/manageAdmin/getAllAdmins");
    expect(res.status).toBe(401);
  });

  it("rejects an invalid token with 401", async () => {
    const res = await request(app)
      .get("/api/v1/manageAdmin/getAllAdmins")
      .set("Authorization", "Bearer not-a-token");
    expect(res.status).toBe(401);
  });

  it("does not let a student token act as the admin with the same id", async () => {
    prisma.admin.findUnique.mockResolvedValue(adminRecord({ id: 1 }));
    const res = await request(app)
      .get("/api/v1/manageAdmin/getAllAdmins")
      .set("access-token", tokenFor(1, "user"));
    expect(res.status).toBe(403);
    expect(prisma.admin.findMany).not.toHaveBeenCalled();
  });

  it("enforces CASL permissions (Supervisor cannot create a course)", async () => {
    prisma.admin.findUnique.mockResolvedValue(adminRecord({ role: "Supervisor" }));
    const res = await request(app)
      .post("/api/v1/course")
      .set("Authorization", `Bearer ${tokenFor(1, "admin")}`)
      .send({ title: "دوره پایتون", teacherId: 1 });
    expect(res.status).toBe(403);
    expect(prisma.course.create).not.toHaveBeenCalled();
  });

  it("understands permissions stored as a JSON string (legacy rows)", async () => {
    const legacy = adminRecord();
    legacy.permissions = JSON.stringify(legacy.permissions);
    prisma.admin.findUnique.mockResolvedValue(legacy);
    prisma.course.create.mockResolvedValue({ id: 5, title: "دوره پایتون" });
    const res = await request(app)
      .post("/api/v1/course")
      .set("Authorization", `Bearer ${tokenFor(1, "admin")}`)
      .send({ title: "دوره پایتون", teacherId: 1 });
    expect(res.status).toBe(201);
    expect(prisma.course.create.mock.calls[0][0].data).toMatchObject({
      title: "دوره پایتون",
      description: "",
      teacherID: 1,
      mentorID: 1,
    });
  });
});

describe("admin auth", () => {
  it("logs in and returns tokens without leaking the password", async () => {
    const admin = adminRecord({ password: await hashPassword("Secret123") });
    prisma.admin.findUnique.mockResolvedValue(admin);
    prisma.admin.update.mockResolvedValue(admin);

    const res = await request(app)
      .post("/api/v1/authAdmin/login")
      .send({ userName: "rootadmin", password: "Secret123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("Access_Token");
    expect(res.body).toHaveProperty("Refresh_Token");
    // Refresh token is stored hashed.
    const stored = prisma.admin.update.mock.calls[0][0].data.refreshToken;
    expect(stored).toBe(hashToken(res.body.Refresh_Token));
  });

  it("rejects a wrong password with a generic message", async () => {
    prisma.admin.findUnique.mockResolvedValue(
      adminRecord({ password: await hashPassword("Secret123") })
    );
    const res = await request(app)
      .post("/api/v1/authAdmin/login")
      .send({ userName: "rootadmin", password: "wrong-pass1" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/incorrect/);
  });

  it("refreshes tokens without needing a valid access token", async () => {
    const admin = adminRecord({ password: await hashPassword("Secret123") });
    prisma.admin.findUnique.mockResolvedValue(admin);
    prisma.admin.update.mockImplementation(async ({ data }) => {
      admin.refreshToken = data.refreshToken;
      return admin;
    });
    const login = await request(app)
      .post("/api/v1/authAdmin/login")
      .send({ userName: "rootadmin", password: "Secret123" });

    const res = await request(app)
      .post("/api/v1/authAdmin/refreshToken")
      .send({ RefreshToken: login.body.Refresh_Token });
    expect(res.status).toBe(200);

    // The old refresh token was rotated and can't be reused.
    const reuse = await request(app)
      .post("/api/v1/authAdmin/refreshToken")
      .send({ RefreshToken: login.body.Refresh_Token });
    expect(reuse.status).toBe(401);
  });

  it("does not accept a user refresh token for an admin", async () => {
    const { generateTokens } = require("../../src/services/token.services");
    const { refreshToken } = generateTokens(1, "user");
    const res = await request(app)
      .post("/api/v1/authAdmin/refreshToken")
      .send({ RefreshToken: refreshToken });
    expect(res.status).toBe(401);
  });
});

describe("manage admins", () => {
  it("never returns the password when creating an admin", async () => {
    prisma.admin.findUnique
      .mockResolvedValueOnce(adminRecord()) // requireAdmin
      .mockResolvedValueOnce(null); // username is free
    prisma.admin.create.mockImplementation(async ({ data }) => ({ id: 2, ...data }));

    const res = await request(app)
      .post("/api/v1/manageAdmin")
      .set("Authorization", `Bearer ${tokenFor(1, "admin")}`)
      .send({ userName: "teacher1", password: "Teacher123", role: "Teacher" });

    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty("password");
    expect(res.body.permissions).toEqual(
      expect.arrayContaining([{ action: "read", subject: "Admin" }])
    );
    const { data } = prisma.admin.create.mock.calls[0][0];
    expect(data.password).not.toBe("Teacher123");
  });

  it("paginates the admin list", async () => {
    prisma.admin.findUnique.mockResolvedValue(adminRecord());
    prisma.admin.findMany.mockResolvedValue([adminRecord()]);
    prisma.admin.count.mockResolvedValue(1);
    const res = await request(app)
      .get("/api/v1/manageAdmin/getAllAdmins?page=1&size=10")
      .set("Authorization", `Bearer ${tokenFor(1, "admin")}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 1, page: 1, size: 10 });
    expect(res.body.items[0]).not.toHaveProperty("password");
  });
});

describe("user auth", () => {
  it("blocks login for blocked users", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 3,
      phone: "09121234567",
      password: await hashPassword("Student123"),
      blocked: true,
      softDelete: false,
    });
    const res = await request(app)
      .post("/api/v1/authUser/login")
      .send({ phone: "09121234567", password: "Student123" });
    expect(res.status).toBe(403);
  });

  it("does not crash when an unknown phone logs in", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post("/api/v1/authUser/login")
      .send({ phone: "09121234567", password: "Student123" });
    expect(res.status).toBe(400);
  });

  it("validates phone numbers", async () => {
    const res = await request(app).post("/api/v1/authUser/signup").send({ phone: "123" });
    expect(res.status).toBe(400);
  });
});

describe("course content", () => {
  const auth = () => `Bearer ${tokenFor(1, "admin")}`;
  beforeEach(() => prisma.admin.findUnique.mockResolvedValue(adminRecord()));

  it("lets students browse courses", async () => {
    prisma.course.findMany.mockResolvedValue([{ id: 1, title: "x" }]);
    const res = await request(app)
      .get("/api/v1/course/getAllCourses")
      .set("Authorization", `Bearer ${tokenFor(9, "user")}`);
    expect(res.status).toBe(200);
  });

  it("defaults the mentor to the teacher and fills course dates", async () => {
    prisma.course.create.mockImplementation(async ({ data }) => ({ id: 3, ...data }));
    const res = await request(app)
      .post("/api/v1/course")
      .set("Authorization", auth())
      .send({ title: "Course", teacherId: 2 });
    expect(res.status).toBe(201);
    const { data } = prisma.course.create.mock.calls[0][0];
    expect(data).toMatchObject({ teacherID: 2, mentorID: 2 });
    expect(new Date(data.endTime) > new Date(data.startTime)).toBe(true);
  });

  it("maps camelCase ids to the Prisma columns when updating a course", async () => {
    prisma.course.update.mockResolvedValue({ id: 4 });
    const res = await request(app)
      .put("/api/v1/course/4")
      .set("Authorization", auth())
      .send({ teacherId: 2, mentorId: 3 });
    expect(res.status).toBe(200);
    // Dates are not reset on update.
    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: { teacherID: 2, mentorID: 3 },
    });
  });

  it("rejects a course that ends before it starts", async () => {
    const res = await request(app).post("/api/v1/course").set("Authorization", auth()).send({
      title: "Course",
      teacherId: 2,
      startTime: "2025-02-01T00:00:00.000Z",
      endTime: "2025-01-01T00:00:00.000Z",
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 for a missing record", async () => {
    prisma.task.findUnique.mockResolvedValue(null);
    const res = await request(app).get("/api/v1/course/task/99").set("Authorization", auth());
    expect(res.status).toBe(404);
  });

  it("translates Prisma 'record not found' into 404", async () => {
    prisma.season.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("not found", {
        code: "P2025",
        clientVersion: "5",
      })
    );
    const res = await request(app).delete("/api/v1/course/season/1").set("Authorization", auth());
    expect(res.status).toBe(404);
  });

  it("does not leak internal errors", async () => {
    prisma.chapter.findMany.mockRejectedValue(new Error("connection string with password"));
    const res = await request(app)
      .get("/api/v1/course/chapter/getAllChapters")
      .set("Authorization", auth());
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal server error");
  });

  it("refuses to enroll a student in a locked course", async () => {
    prisma.studentsOnClass.findFirst.mockResolvedValue(null);
    prisma.course.findUnique.mockResolvedValue({ id: 1, isLocked: true });
    const res = await request(app)
      .post("/api/v1/course/studentOnClass/addStudentToCourse")
      .set("Authorization", auth())
      .send({ userId: 5, courseId: 1 });
    expect(res.status).toBe(400);
    expect(prisma.studentsOnClass.create).not.toHaveBeenCalled();
  });

  it("enrolls a student in a course", async () => {
    prisma.studentsOnClass.findFirst.mockResolvedValue(null);
    prisma.course.findUnique.mockResolvedValue({ id: 1, isLocked: false });
    prisma.studentsOnClass.create.mockImplementation(async ({ data }) => ({ id: 1, ...data }));
    const res = await request(app)
      .post("/api/v1/course/studentOnClass/addStudentToCourse")
      .set("Authorization", auth())
      .send({ userId: 5, courseId: 1 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ userID: 5, courseID: 1 });
  });

  it("marks a task done only once", async () => {
    prisma.studentsOnClass.findFirst.mockResolvedValue({ id: 8, done: [3] });
    const res = await request(app)
      .put("/api/v1/course/studentOnClass/doneTask/5/1/3")
      .set("Authorization", auth());
    expect(res.status).toBe(200);
    expect(prisma.studentsOnClass.update).not.toHaveBeenCalled();
  });
});
