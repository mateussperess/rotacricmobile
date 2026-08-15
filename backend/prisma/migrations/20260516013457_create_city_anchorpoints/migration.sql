-- CreateTable
CREATE TABLE `city_anchorpoints` (
    `id` VARCHAR(191) NOT NULL,
    `city_id` VARCHAR(191) NOT NULL,
    `anchor_point_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `city_anchorpoints` ADD CONSTRAINT `city_anchorpoints_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `city_anchorpoints` ADD CONSTRAINT `city_anchorpoints_anchor_point_id_fkey` FOREIGN KEY (`anchor_point_id`) REFERENCES `anchor_points`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
