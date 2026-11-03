/*
  Warnings:

  - You are about to drop the column `classID` on the `studentsOnClass` table. All the data in the column will be lost.
  - You are about to drop the `Class` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endTime` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mentorID` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseID` to the `studentsOnClass` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_courseID_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_mentorID_fkey";

-- DropForeignKey
ALTER TABLE "studentsOnClass" DROP CONSTRAINT "studentsOnClass_classID_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "mentorID" INTEGER NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "studentsOnClass" DROP COLUMN "classID",
ADD COLUMN     "courseID" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Class";

-- AddForeignKey
ALTER TABLE "studentsOnClass" ADD CONSTRAINT "studentsOnClass_courseID_fkey" FOREIGN KEY ("courseID") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_mentorID_fkey" FOREIGN KEY ("mentorID") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
