-- AlterTable
ALTER TABLE `anchor_points` ADD COLUMN `category_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `anchor_point_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `icon_name` VARCHAR(191) NOT NULL,
    `icon_image` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `anchor_points` ADD CONSTRAINT `anchor_points_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `anchor_point_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
