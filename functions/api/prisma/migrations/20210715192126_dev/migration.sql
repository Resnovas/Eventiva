-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('USER', 'VENUE', 'SUPPLIER', 'SOFTWARE');

-- CreateEnum
CREATE TYPE "dnsType" AS ENUM ('TXT', 'CNAME');

-- CreateEnum
CREATE TYPE "FeatureType" AS ENUM ('STRING', 'BOOLEAN', 'NUMBER');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('API', 'PERSONAL', 'SYSTEM');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL DEFAULT E'USER',
    "subsciption" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstname" TEXT,
    "midname" TEXT,
    "lastname" TEXT,
    "businessName" TEXT,
    "password" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "TokenType" NOT NULL,
    "value" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "expiry" TIMESTAMP(3) NOT NULL,
    "apiToken" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubuserOnAccount" (
    "accountId" TEXT NOT NULL,
    "subuserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("accountId","subuserId")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "domain" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "dnsType" "dnsType" NOT NULL DEFAULT E'TXT',
    "data" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "accountId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "domainId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phone" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "coords" TEXT,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipcode" TEXT,
    "name" TEXT,
    "parking" BOOLEAN DEFAULT false,
    "website" TEXT,
    "hoursOfOperation" JSONB,
    "details" JSONB,
    "public" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactAtAddress" (
    "accountId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "jobTitle" TEXT,
    "phone" TEXT,
    "emailId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("accountId","addressId")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionOnAccount" (
    "subscriptionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "deactivated" TIMESTAMP(3),
    "activated" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("accountId","subscriptionId")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "cost" TEXT,
    "details" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "addressId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "floor" TEXT,
    "building" TEXT,
    "accessibility" BOOLEAN DEFAULT false,
    "checkin" TIMESTAMP(3),
    "checkout" TIMESTAMP(3),
    "length" TEXT,
    "width" TEXT,
    "height" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureOfRoom" (
    "roomId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("roomId","featureId")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FeatureType" NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrangementOfRoom" (
    "roomId" TEXT NOT NULL,
    "arrangementId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("roomId","arrangementId")
);

-- CreateTable
CREATE TABLE "Arrangement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "details" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueStyle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "details" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccountToFeature" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AddressToVenueStyle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account.username_unique" ON "Account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Account.resetPasswordToken_unique" ON "Account"("resetPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "Token.value_unique" ON "Token"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Domain.domain_unique" ON "Domain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Email.email_unique" ON "Email"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Phone.phone_unique" ON "Phone"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription.name_unique" ON "Subscription"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_AccountToFeature_AB_unique" ON "_AccountToFeature"("A", "B");

-- CreateIndex
CREATE INDEX "_AccountToFeature_B_index" ON "_AccountToFeature"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AddressToVenueStyle_AB_unique" ON "_AddressToVenueStyle"("A", "B");

-- CreateIndex
CREATE INDEX "_AddressToVenueStyle_B_index" ON "_AddressToVenueStyle"("B");

-- AddForeignKey
ALTER TABLE "Token" ADD FOREIGN KEY ("apiToken") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubuserOnAccount" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubuserOnAccount" ADD FOREIGN KEY ("subuserId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAtAddress" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAtAddress" ADD FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAtAddress" ADD FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionOnAccount" ADD FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionOnAccount" ADD FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureOfRoom" ADD FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureOfRoom" ADD FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrangementOfRoom" ADD FOREIGN KEY ("arrangementId") REFERENCES "Arrangement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrangementOfRoom" ADD FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToFeature" ADD FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToFeature" ADD FOREIGN KEY ("B") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddressToVenueStyle" ADD FOREIGN KEY ("A") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddressToVenueStyle" ADD FOREIGN KEY ("B") REFERENCES "VenueStyle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
