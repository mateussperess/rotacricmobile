-- CreateTable
CREATE TABLE `route_anchor_points` (
    `id` VARCHAR(191) NOT NULL,
    `route_id` VARCHAR(191) NOT NULL,
    `anchor_point_id` VARCHAR(191) NOT NULL,
    `on_route` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `route_anchor_points` ADD CONSTRAINT `route_anchor_points_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `route_anchor_points` ADD CONSTRAINT `route_anchor_points_anchor_point_id_fkey` FOREIGN KEY (`anchor_point_id`) REFERENCES `anchor_points`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
