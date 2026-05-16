-- CreateTable
CREATE TABLE `anchor_points` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `lat` VARCHAR(191) NOT NULL,
    `lng` VARCHAR(191) NOT NULL,
    `business_hours` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
