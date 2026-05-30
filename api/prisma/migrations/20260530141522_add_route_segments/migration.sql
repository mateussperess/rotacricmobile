-- CreateTable
CREATE TABLE `route_segments` (
    `id` VARCHAR(191) NOT NULL,
    `route_id` VARCHAR(191) NOT NULL,
    `from_city_id` VARCHAR(191) NOT NULL,
    `to_city_id` VARCHAR(191) NOT NULL,
    `distance` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `route_segments` ADD CONSTRAINT `route_segments_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `route_segments` ADD CONSTRAINT `route_segments_from_city_id_fkey` FOREIGN KEY (`from_city_id`) REFERENCES `cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `route_segments` ADD CONSTRAINT `route_segments_to_city_id_fkey` FOREIGN KEY (`to_city_id`) REFERENCES `cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
