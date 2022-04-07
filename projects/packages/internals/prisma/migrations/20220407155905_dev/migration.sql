/*
  Warnings:

  - You are about to drop the column `tokenID` on the `Salt` table. All the data in the column will be lost.
  - You are about to drop the column `valid` on the `Token` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Salt" DROP CONSTRAINT "Salt_tokenID_fkey";

-- DropIndex
DROP INDEX "Salt_tokenID_key";

-- AlterTable
ALTER TABLE "Salt" DROP COLUMN "tokenID";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "valid";
