/*
  Warnings:

  - You are about to drop the column `isTrailVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `isTrailVerified`,
    ADD COLUMN `freeCredit` BOOLEAN NOT NULL DEFAULT false;
