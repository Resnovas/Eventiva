/*
  Warnings:

  - The `deleted` column on the `Address` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `Arrangement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `ArrangementOfRoom` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `ContactAtAddress` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `Domain` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `Email` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `EmployersOnAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `Feature` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `FeatureOfAddress` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `FeatureOfRoom` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `Files` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `ManagersOnAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `Phone` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `RTW` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `Room` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `SIABadge` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `SIACheck` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `Salt` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `Status` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `StatusOnAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `SubscriptionOnAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `SubuserOnAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `Token` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `VenueStyle` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted` column on the `accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Arrangement" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "ArrangementOfRoom" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "ContactAtAddress" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "EmployersOnAccount" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Feature" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "FeatureOfAddress" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "FeatureOfRoom" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Files" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "ManagersOnAccount" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Phone" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "RTW" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "SIABadge" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "SIACheck" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Salt" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Status" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "StatusOnAccount" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "SubscriptionOnAccount" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "SubuserOnAccount" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "VenueStyle" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "deletedDate" TIMESTAMP(3),
DROP COLUMN "deleted",
ADD COLUMN     "deleted" BOOLEAN;
