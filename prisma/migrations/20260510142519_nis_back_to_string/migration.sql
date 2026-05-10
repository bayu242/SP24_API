/*
  Warnings:

  - A unique constraint covering the columns `[nis]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nis` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `students` ADD COLUMN `nis` VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `students_nis_key` ON `students`(`nis`);
