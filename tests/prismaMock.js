/**
 * A minimal in-test replacement for the Prisma client. Every model method is a
 * jest.fn() so each test can describe exactly what the database returns.
 */
const models = ["admin", "user", "course", "season", "chapter", "task", "class", "studentsOnClass"];
const methods = ["findUnique", "findFirst", "findMany", "count", "create", "update", "delete"];

const prisma = {};
models.forEach((model) => {
  prisma[model] = {};
  methods.forEach((method) => {
    prisma[model][method] = jest.fn();
  });
});
prisma.$transaction = jest.fn((arg) => (Array.isArray(arg) ? Promise.all(arg) : arg(prisma)));
prisma.$connect = jest.fn();
prisma.$disconnect = jest.fn();

module.exports = prisma;
