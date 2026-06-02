/*
  Warnings:

  - Added the required column `etapa` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kg` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoMascota` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `producto` ADD COLUMN `etapa` VARCHAR(191) NOT NULL,
    ADD COLUMN `kg` VARCHAR(191) NOT NULL,
    ADD COLUMN `tipoMascota` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Venta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `metodoPago` VARCHAR(191) NOT NULL,
    `total` DOUBLE NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
