-- AlterTable
ALTER TABLE "Arrangement" ADD COLUMN     "deleted" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ArrangementOfRoom" ADD COLUMN     "deleted" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "EmployersOnAccount" ADD COLUMN     "deleted" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ManagersOnAccount" ADD COLUMN     "deleted" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Salt" ADD COLUMN     "deleted" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SubuserOnAccount" ADD COLUMN     "deleted" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "deleted" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "VenueStyle" ADD COLUMN     "deleted" TIMESTAMP(3);
