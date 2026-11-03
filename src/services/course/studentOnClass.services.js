const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const { pickDefined } = require("../../utils/sanitize");

const EDITABLE_FIELDS = ["mark", "progress", "startTime", "endTime"];

const getStudentOnClass = (userID, classID) =>
  prisma.studentsOnClass.findFirst({ where: { userID, classID } });

const getRequired = async (userID, classID) => {
  const record = await getStudentOnClass(userID, classID);
  if (!record) throw ApiError.notFound("This student is not enrolled in this class");
  return record;
};

async function addStudent({ userId, classId, ...rest }) {
  if (await getStudentOnClass(userId, classId)) {
    throw ApiError.conflict("This student is already enrolled in this class");
  }
  return prisma.$transaction(async (tx) => {
    const klass = await tx.class.findUnique({
      where: { id: classId },
      include: { _count: { select: { students: true } } },
    });
    if (!klass) throw ApiError.notFound("Class not found");
    if (klass.isLocked) throw ApiError.badRequest("This class is locked");
    if (klass.capacity > 0 && klass._count.students >= klass.capacity) {
      throw ApiError.badRequest("This class is full");
    }
    return tx.studentsOnClass.create({
      data: {
        userID: userId,
        classID: classId,
        ...pickDefined(rest, EDITABLE_FIELDS),
      },
    });
  });
}

async function updateStudent(userId, classId, changes) {
  const record = await getRequired(userId, classId);
  return prisma.studentsOnClass.update({
    where: { id: record.id },
    data: pickDefined(changes, EDITABLE_FIELDS),
  });
}

/** Marks a task as done for a student (idempotent). */
async function markTaskDone(userId, classId, taskId) {
  const record = await getRequired(userId, classId);
  if (record.done.includes(taskId)) return record;
  return prisma.studentsOnClass.update({
    where: { id: record.id },
    data: { done: { push: taskId } },
  });
}

const getStudentsOfClass = (classID) => prisma.studentsOnClass.findMany({ where: { classID } });

const getClassesOfStudent = (userID) => prisma.studentsOnClass.findMany({ where: { userID } });

async function removeStudent(userId, classId) {
  const record = await getRequired(userId, classId);
  await prisma.studentsOnClass.delete({ where: { id: record.id } });
}

module.exports = {
  addStudent,
  updateStudent,
  markTaskDone,
  getStudentsOfClass,
  getClassesOfStudent,
  getStudentOnClass,
  removeStudent,
};
