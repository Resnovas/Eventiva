-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('USER', 'BUSINESS', 'PROVIDER');

-- CreateEnum
CREATE TYPE "Title" AS ENUM ('Miss', 'Ms', 'Mrs', 'Mr', 'Dr');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('API', 'PERSONAL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('PERSONAL', 'BUSINESS');

-- CreateEnum
CREATE TYPE "dnsType" AS ENUM ('TXT', 'CNAME');

-- CreateEnum
CREATE TYPE "FeatureType" AS ENUM ('STRING', 'BOOLEAN', 'NUMBER');

-- CreateEnum
CREATE TYPE "LicenseSector" AS ENUM ('CVIT', 'CP', 'DS', 'CCTV', 'SG', 'VI', 'KH', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('FRONTLINE', 'NON_FRONTLINE');

-- CreateEnum
CREATE TYPE "BadgeStatus" AS ENUM ('ACTIVE', 'REVOKED', 'SUSPENDED', 'NON_ACTIVE');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "accountType" "AccountType" NOT NULL DEFAULT E'USER',
    "subsciption" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "applied" TIMESTAMP(3),
    "promoted" TIMESTAMP(3),
    "retired" TIMESTAMP(3),
    "title" "Title",
    "firstname" TEXT,
    "midname" TEXT,
    "lastname" TEXT,
    "Salutation" TEXT,
    "dob" TIMESTAMP(3),
    "sex" TEXT,
    "label" TEXT NOT NULL,
    "password" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "TokenType" NOT NULL,
    "value" TEXT,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "expiry" TIMESTAMP(3) NOT NULL,
    "accountID" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salt" (
    "id" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "tokenID" TEXT,
    "accountID" TEXT,

    CONSTRAINT "Salt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubuserOnAccount" (
    "accountId" TEXT NOT NULL,
    "subuserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubuserOnAccount_pkey" PRIMARY KEY ("accountId","subuserId")
);

-- CreateTable
CREATE TABLE "EmployersOnAccount" (
    "accountId" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployersOnAccount_pkey" PRIMARY KEY ("accountId","employerId")
);

-- CreateTable
CREATE TABLE "ManagersOnAccount" (
    "accountId" TEXT NOT NULL,
    "managersId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagersOnAccount_pkey" PRIMARY KEY ("accountId","managersId")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" "AddressType" NOT NULL,
    "coords" TEXT,
    "street" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipcode" TEXT,
    "addressName" TEXT,
    "name" TEXT,
    "parking" BOOLEAN DEFAULT false,
    "website" TEXT,
    "hoursOfOperation" JSONB,
    "features" TEXT NOT NULL,
    "details" JSONB,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "primaryaccountId" TEXT,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
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
    "deleted" TIMESTAMP(3),

    CONSTRAINT "ContactAtAddress_pkey" PRIMARY KEY ("accountId","addressId")
);

-- CreateTable
CREATE TABLE "VenueStyle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "VenueStyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "domainId" TEXT,
    "email" TEXT NOT NULL,
    "accountId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "path" TEXT,
    "copy" BOOLEAN NOT NULL DEFAULT true,
    "notifyFrom" TIMESTAMP(3),
    "imap_authUser" TEXT,
    "imap_authPass" TEXT,
    "imap_accessToken" TEXT,
    "imap_authServer" BOOLEAN,
    "imap_host" TEXT,
    "imap_port" TEXT,
    "imap_secure" BOOLEAN DEFAULT true,
    "imap_tslRejectUnauthorized" BOOLEAN DEFAULT true,
    "imap_tslMinVersion" TEXT,
    "imap_resyncDelay" INTEGER NOT NULL DEFAULT 900,
    "smtp_authUser" TEXT,
    "smtp_authPass" TEXT,
    "smtp_accessToken" TEXT,
    "smtp_authServer" BOOLEAN,
    "smtp_host" TEXT,
    "smtp_port" TEXT,
    "smtp_secure" BOOLEAN DEFAULT true,
    "smtp_tslRejectUnauthorized" BOOLEAN DEFAULT true,
    "smtp_tslMinVersion" TEXT,
    "oauth2_authorize" BOOLEAN NOT NULL DEFAULT true,
    "oauth2_provider" TEXT NOT NULL DEFAULT E'gmail',
    "oauth2_authUser" TEXT,
    "oauth2_accessToken" TEXT,
    "oauth2_refreshToken" TEXT,
    "oauth2_expires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "dnsType" "dnsType" NOT NULL DEFAULT E'TXT',
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FeatureType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureOfRoom" (
    "roomId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "FeatureOfRoom_pkey" PRIMARY KEY ("roomId","featureId")
);

-- CreateTable
CREATE TABLE "FeatureOfAddress" (
    "addressId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "FeatureOfAddress_pkey" PRIMARY KEY ("addressId","featureId")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),
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

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rtwId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RTW" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "RTW_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phone" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),
    "accountId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrangementOfRoom" (
    "roomId" TEXT NOT NULL,
    "arrangementId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArrangementOfRoom_pkey" PRIMARY KEY ("roomId","arrangementId")
);

-- CreateTable
CREATE TABLE "Arrangement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "details" TEXT,

    CONSTRAINT "Arrangement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SIABadge" (
    "id" INTEGER NOT NULL,
    "licenseSector" "LicenseSector" NOT NULL,
    "type" "LicenseType" NOT NULL,
    "licenseExplanation" TEXT NOT NULL,
    "additionalTerms" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" TIMESTAMP(3),
    "expiry" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),
    "account_id" TEXT,

    CONSTRAINT "SIABadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SIACheck" (
    "id" TEXT NOT NULL,
    "sia_id" INTEGER,
    "status" "BadgeStatus" NOT NULL,
    "AuthUrl" TEXT,
    "pubUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),
    "error" TEXT,
    "transactionId" TEXT,

    CONSTRAINT "SIACheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusOnAccount" (
    "statusId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "StatusOnAccount_pkey" PRIMARY KEY ("statusId","accountId")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),
    "name" TEXT,
    "cost" TEXT,
    "details" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "SubscriptionOnAccount_pkey" PRIMARY KEY ("accountId","subscriptionId")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" TIMESTAMP(3),
    "accountId" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccountToFiles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AddressToVenueStyle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_username_key" ON "accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_resetPasswordToken_key" ON "accounts"("resetPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "Token_value_key" ON "Token"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Salt_tokenID_key" ON "Salt"("tokenID");

-- CreateIndex
CREATE UNIQUE INDEX "Salt_accountID_key" ON "Salt"("accountID");

-- CreateIndex
CREATE UNIQUE INDEX "Address_primaryaccountId_key" ON "Address"("primaryaccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Email_email_key" ON "Email"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_domain_key" ON "Domain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Phone_phone_key" ON "Phone"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "SIABadge_id_key" ON "SIABadge"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_name_key" ON "Subscription"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_AccountToFiles_AB_unique" ON "_AccountToFiles"("A", "B");

-- CreateIndex
CREATE INDEX "_AccountToFiles_B_index" ON "_AccountToFiles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AddressToVenueStyle_AB_unique" ON "_AddressToVenueStyle"("A", "B");

-- CreateIndex
CREATE INDEX "_AddressToVenueStyle_B_index" ON "_AddressToVenueStyle"("B");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_accountID_fkey" FOREIGN KEY ("accountID") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salt" ADD CONSTRAINT "Salt_accountID_fkey" FOREIGN KEY ("accountID") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salt" ADD CONSTRAINT "Salt_tokenID_fkey" FOREIGN KEY ("tokenID") REFERENCES "Token"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubuserOnAccount" ADD CONSTRAINT "SubuserOnAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubuserOnAccount" ADD CONSTRAINT "SubuserOnAccount_subuserId_fkey" FOREIGN KEY ("subuserId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployersOnAccount" ADD CONSTRAINT "EmployersOnAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployersOnAccount" ADD CONSTRAINT "EmployersOnAccount_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagersOnAccount" ADD CONSTRAINT "ManagersOnAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagersOnAccount" ADD CONSTRAINT "ManagersOnAccount_managersId_fkey" FOREIGN KEY ("managersId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_primaryaccountId_fkey" FOREIGN KEY ("primaryaccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAtAddress" ADD CONSTRAINT "ContactAtAddress_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAtAddress" ADD CONSTRAINT "ContactAtAddress_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAtAddress" ADD CONSTRAINT "ContactAtAddress_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureOfRoom" ADD CONSTRAINT "FeatureOfRoom_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureOfRoom" ADD CONSTRAINT "FeatureOfRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureOfAddress" ADD CONSTRAINT "FeatureOfAddress_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureOfAddress" ADD CONSTRAINT "FeatureOfAddress_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Files" ADD CONSTRAINT "Files_rtwId_fkey" FOREIGN KEY ("rtwId") REFERENCES "RTW"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RTW" ADD CONSTRAINT "RTW_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrangementOfRoom" ADD CONSTRAINT "ArrangementOfRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrangementOfRoom" ADD CONSTRAINT "ArrangementOfRoom_arrangementId_fkey" FOREIGN KEY ("arrangementId") REFERENCES "Arrangement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SIABadge" ADD CONSTRAINT "SIABadge_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SIACheck" ADD CONSTRAINT "SIACheck_sia_id_fkey" FOREIGN KEY ("sia_id") REFERENCES "SIABadge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SIACheck" ADD CONSTRAINT "SIACheck_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusOnAccount" ADD CONSTRAINT "StatusOnAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusOnAccount" ADD CONSTRAINT "StatusOnAccount_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionOnAccount" ADD CONSTRAINT "SubscriptionOnAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionOnAccount" ADD CONSTRAINT "SubscriptionOnAccount_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToFiles" ADD FOREIGN KEY ("A") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToFiles" ADD FOREIGN KEY ("B") REFERENCES "Files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddressToVenueStyle" ADD FOREIGN KEY ("A") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddressToVenueStyle" ADD FOREIGN KEY ("B") REFERENCES "VenueStyle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
