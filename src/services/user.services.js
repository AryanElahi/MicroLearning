const prisma = require("../lib/prisma");
const { hashPassword, verifyPassword } = require("../utils/password");
const ApiError = require("../utils/ApiError");
const tokenService = require("./token.services");
const otpService = require("./otp.services");

const INVALID_CREDENTIALS = "The phone number or password is incorrect";
const INVALID_CODE = "Access denied: the verification code is not correct";
const BLOCKED = "Access denied: this user is blocked";

const getUserById = (id) => prisma.user.findUnique({ where: { id } });

const getUserByPhone = (phone) => prisma.user.findUnique({ where: { phone } });

async function issueTokens(userId) {
  const tokens = tokenService.generateTokens(userId, "user");
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: tokenService.hashToken(tokens.refreshToken) },
  });
  return tokens;
}

const assertActive = (user) => {
  if (user && user.blocked) throw ApiError.forbidden(BLOCKED);
};

/** Step 1 of sign-up: send an OTP to a phone that is not registered yet. */
async function signup(phone) {
  if (await getUserByPhone(phone)) {
    throw ApiError.conflict("This user already exists");
  }
  await otpService.sendCode(phone);
}

/** Step 2 of sign-up: verify the OTP and create the account. */
async function verify(phone, code, password) {
  if (!otpService.verifyCode(phone, code)) throw ApiError.badRequest(INVALID_CODE);
  const user = await prisma.user.create({
    data: { phone, password: await hashPassword(password) },
  });
  return issueTokens(user.id);
}

async function login(phone, password) {
  const user = await getUserByPhone(phone);
  const valid = await verifyPassword(password, user && user.password);
  if (!user || !valid || user.softDelete) {
    throw ApiError.badRequest(INVALID_CREDENTIALS);
  }
  assertActive(user);
  return issueTokens(user.id);
}

async function refresh(refreshToken) {
  const { id } = tokenService.verifyRefreshToken(refreshToken, "user");
  const user = await getUserById(id);
  if (!user || user.softDelete || user.refreshToken !== tokenService.hashToken(refreshToken)) {
    throw ApiError.unauthorized("Access denied: refresh token is not valid");
  }
  assertActive(user);
  return issueTokens(user.id);
}

async function logout(id) {
  await prisma.user.update({ where: { id }, data: { refreshToken: "" } });
}

async function forgetPassword(phone) {
  const user = await getUserByPhone(phone);
  // Do not reveal whether the number is registered.
  if (!user || user.softDelete) return;
  assertActive(user);
  await otpService.sendCode(phone);
}

async function verifyForgetPassword(phone, code, password) {
  const user = await getUserByPhone(phone);
  if (!user || !otpService.verifyCode(phone, code)) {
    throw ApiError.badRequest(INVALID_CODE);
  }
  assertActive(user);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(password) },
  });
  return issueTokens(user.id);
}

async function getAllUsers({ page = 1, size = 20 } = {}) {
  const where = { softDelete: false };
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: size * (page - 1),
      take: size,
      orderBy: { id: "asc" },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total, page, size };
}

async function createUser({ password, ...data }) {
  if (await getUserByPhone(data.phone)) {
    throw ApiError.conflict("This user already exists");
  }
  return prisma.user.create({
    data: { ...data, password: await hashPassword(password) },
  });
}

async function updateUser(phone, changes) {
  const data = { ...changes };
  if (data.password) data.password = await hashPassword(data.password);
  if (data.blocked === true) data.refreshToken = ""; // kick blocked users out
  return prisma.user.update({ where: { phone }, data });
}

async function deleteUser(phone) {
  const user = await getUserByPhone(phone);
  if (!user) throw ApiError.notFound("User not found");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      phone: `deleted-${user.id}-${Date.now()}-${user.phone}`,
      softDelete: true,
      refreshToken: "",
    },
  });
}

module.exports = {
  signup,
  verify,
  login,
  refresh,
  logout,
  forgetPassword,
  verifyForgetPassword,
  getUserById,
  getUserByPhone,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
