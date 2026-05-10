-- CreateTable
CREATE TABLE `administrator` (
    `admin_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `administrator_username_key`(`username`),
    PRIMARY KEY (`admin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers` (
    `teacher_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `gender` CHAR(1) NOT NULL,
    `age` INTEGER NOT NULL,
    `images` LONGBLOB NULL,

    UNIQUE INDEX `teachers_username_key`(`username`),
    PRIMARY KEY (`teacher_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `student_id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `class` VARCHAR(255) NOT NULL,
    `parent` VARCHAR(255) NOT NULL,
    `tag_id` VARCHAR(255) NOT NULL,
    `age` INTEGER NOT NULL,
    `images` LONGBLOB NULL,

    UNIQUE INDEX `students_tag_id_key`(`tag_id`),
    PRIMARY KEY (`student_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `presences` (
    `presence_id` INTEGER NOT NULL AUTO_INCREMENT,
    `teacher_id` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,
    `enter` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `exit` TIMESTAMP(0) NULL,

    INDEX `presences_teacher_id_idx`(`teacher_id`),
    INDEX `presences_student_id_idx`(`student_id`),
    PRIMARY KEY (`presence_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `presences` ADD CONSTRAINT `presences_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`teacher_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `presences` ADD CONSTRAINT `presences_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
