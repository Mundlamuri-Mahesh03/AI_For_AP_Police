-- CreateTable
CREATE TABLE `PoliceUnit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ministry` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `legacyRef` VARCHAR(191) NULL,
    `type` ENUM('ZONE', 'RANGE', 'DISTRICT', 'CIRCLE', 'SDPO', 'PS', 'COMMISSIONERATE', 'CPO', 'DCPO', 'ACPO') NOT NULL,
    `department` VARCHAR(191) NULL,
    `isVirtual` BOOLEAN NOT NULL DEFAULT false,
    `parentId` INTEGER NULL,
    `parentUnitCode` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PoliceUnit_code_key`(`code`),
    INDEX `PoliceUnit_parentId_idx`(`parentId`),
    INDEX `PoliceUnit_type_idx`(`type`),
    INDEX `PoliceUnit_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'OFFICER') NOT NULL DEFAULT 'OFFICER',
    `policeUnitId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PoliceUnit` ADD CONSTRAINT `PoliceUnit_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `PoliceUnit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_policeUnitId_fkey` FOREIGN KEY (`policeUnitId`) REFERENCES `PoliceUnit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
