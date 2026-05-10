-- AlterTable
ALTER TABLE `administrator` ADD COLUMN `refresh_token` TEXT NULL;

-- AlterTable
ALTER TABLE `teachers` ADD COLUMN `refresh_token` TEXT NULL;
