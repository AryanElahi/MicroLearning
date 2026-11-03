const { PrismaClient } = require("@prisma/client");

/**
 * A single PrismaClient for the whole process. Creating one client per module
 * opens a separate connection pool for every file and exhausts the database.
 */
const prisma = new PrismaClient();

module.exports = prisma;
