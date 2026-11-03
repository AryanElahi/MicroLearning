const prisma = require("../lib/prisma");
const { hashPassword, verifyPassword } = require("../utils/password");
const { permissionsForRole } = require("../config/roles");
const ApiError = require("../utils/ApiError");
const tokenService = require("./token.services");

const INVALID_CREDENTIALS = "The username or password is incorrect";

const getAdminById = (id) => prisma.admin.findUnique({ where: { id } });

const getAdminByUserName = (userName) => prisma.admin.findUnique({ where: { userName } });

async function getAllAdmins({ page = 1, size = 20 } = {}) {
  const where = { softDelete: false };
  const [items, total] = await prisma.$transaction([
    prisma.admin.findMany({
      where,
      skip: size * (page - 1),
      take: size,
      orderBy: { id: "asc" },
    }),
    prisma.admin.count({ where }),
  ]);
  return { items, total, page, size };
}

async function issueTokens(adminId) {
  const tokens = tokenService.generateTokens(adminId, "admin");
  await prisma.admin.update({
    where: { id: adminId },
    data: { refreshToken: tokenService.hashToken(tokens.refreshToken) },
  });
  return tokens;
}

/** Creates an admin. Permissions are always derived from the role. */
async function createAdmin({ userName, password, role, ...profile }) {
  if (await getAdminByUserName(userName)) {
    throw ApiError.conflict("This admin already exists");
  }
  return prisma.admin.create({
    data: {
      ...profile,
      userName,
      role,
      password: await hashPassword(password),
      permissions: permissionsForRole(role),
    },
  });
}

async function signup(data) {
  const admin = await createAdmin(data);
  return issueTokens(admin.id);
}

async function login(userName, password) {
  const admin = await getAdminByUserName(userName);
  const valid = await verifyPassword(password, admin && admin.password);
  if (!admin || !valid || admin.softDelete) {
    throw ApiError.badRequest(INVALID_CREDENTIALS);
  }
  return issueTokens(admin.id);
}

async function refresh(refreshToken) {
  const { id } = tokenService.verifyRefreshToken(refreshToken, "admin");
  const admin = await getAdminById(id);
  if (!admin || admin.softDelete || admin.refreshToken !== tokenService.hashToken(refreshToken)) {
    throw ApiError.unauthorized("Access denied: refresh token is not valid");
  }
  return issueTokens(admin.id);
}

async function logout(id) {
  await prisma.admin.update({ where: { id }, data: { refreshToken: "" } });
}

async function updateAdmin(userName, changes) {
  const data = { ...changes };
  if (data.password) {
    data.password = await hashPassword(data.password);
  }
  if (data.role) {
    // Keep permissions in sync with the role.
    data.permissions = permissionsForRole(data.role);
  }
  return prisma.admin.update({ where: { userName }, data });
}

async function deleteAdmin(userName) {
  const admin = await getAdminByUserName(userName);
  if (!admin) throw ApiError.notFound("Admin not found");
  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      // Free the unique username so it can be reused.
      userName: `deleted-${admin.id}-${Date.now()}-${admin.userName}`,
      softDelete: true,
      refreshToken: "",
    },
  });
}

module.exports = {
  signup,
  login,
  refresh,
  logout,
  getAdminById,
  getAdminByUserName,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
