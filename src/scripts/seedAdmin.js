/**
 * Creates the first admin account.
 *
 *   ADMIN_USERNAME=admin ADMIN_PASSWORD='S3cure-pass' npm run seed:admin
 */
const adminService = require("../services/admin.services");
const prisma = require("../lib/prisma");
const logger = require("../utils/logger");

async function main() {
  const userName = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const role = process.env.ADMIN_ROLE || "Admin";
  if (!userName || !password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set");
  }
  if (await adminService.getAdminByUserName(userName)) {
    logger.info(`Admin "${userName}" already exists, nothing to do.`);
    return;
  }
  await adminService.createAdmin({ userName, password, role });
  logger.info(`Admin "${userName}" (${role}) created.`);
}

main()
  .catch((error) => {
    logger.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
