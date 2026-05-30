/*
  Warnings:

  - You are about to alter the column `lat` on the `anchor_points` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.
  - You are about to alter the column `lng` on the `anchor_points` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- DropForeignKey
ALTER TABLE `user_stamps` DROP FOREIGN KEY `user_stamps_anchor_point_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_stamps` DROP FOREIGN KEY `user_stamps_route_id_fkey`;

-- DropIndex
DROP INDEX `user_stamps_anchor_point_id_fkey` ON `user_stamps`;

-- DropIndex
DROP INDEX `user_stamps_route_id_fkey` ON `user_stamps`;

-- AlterTable
ALTER TABLE `anchor_points` MODIFY `lat` DOUBLE NOT NULL,
    MODIFY `lng` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `routes` MODIFY `polyline` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user_stamps` MODIFY `anchor_point_id` VARCHAR(191) NULL,
    MODIFY `route_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `user_stamps` ADD CONSTRAINT `user_stamps_anchor_point_id_fkey` FOREIGN KEY (`anchor_point_id`) REFERENCES `anchor_points`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_stamps` ADD CONSTRAINT `user_stamps_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
