-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `ApiKey` VARCHAR(191) NULL,
    `username` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `provider` VARCHAR(191) NOT NULL,
    `phoneNumber` INTEGER NOT NULL,
    `isPhoneVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `totalCredit` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `User_userId_key`(`userId`),
    UNIQUE INDEX `User_ApiKey_key`(`ApiKey`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `planeName` VARCHAR(191) NULL,
    `credits` VARCHAR(191) NULL,
    `price` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `priceId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `mode` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `metadata` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_paymentId_key`(`paymentId`),
    UNIQUE INDEX `Order_sessionId_key`(`sessionId`),
    INDEX `Order_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditUsage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `dataType` VARCHAR(191) NULL,
    `linkedinProfiles` INTEGER NULL DEFAULT 0,
    `validEmails` INTEGER NULL DEFAULT 0,
    `phoneNumbers` INTEGER NULL DEFAULT 0,
    `totalUseCredits` INTEGER NULL DEFAULT 0,
    `entries` INTEGER NULL DEFAULT 0,
    `files` INTEGER NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CreditUsage_date_key`(`date`),
    UNIQUE INDEX `CreditUsage_date_userId_key`(`date`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usage` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `linkedinProfiles` INTEGER NOT NULL DEFAULT 0,
    `validEmails` INTEGER NOT NULL DEFAULT 0,
    `unverifiedEmails` INTEGER NOT NULL DEFAULT 0,
    `bulkCompanyEmails` INTEGER NOT NULL DEFAULT 0,
    `phoneNumbers` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usage_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Email` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `emailAnonId` VARCHAR(191) NULL,
    `domainUrl` VARCHAR(191) NULL,
    `emailStatus` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `email_type` VARCHAR(191) NULL,
    `socialId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `domainId` VARCHAR(191) NULL,

    UNIQUE INDEX `Email_email_key`(`email`),
    UNIQUE INDEX `Email_emailAnonId_key`(`emailAnonId`),
    UNIQUE INDEX `Email_domainUrl_key`(`domainUrl`),
    UNIQUE INDEX `Email_socialId_key`(`socialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mobile` (
    `id` VARCHAR(191) NOT NULL,
    `socialUrl` VARCHAR(191) NULL,
    `raw_format` VARCHAR(191) NOT NULL,
    `international_format` VARCHAR(191) NOT NULL,
    `national_format` VARCHAR(191) NOT NULL,
    `prefix` VARCHAR(191) NOT NULL,
    `country_name` VARCHAR(191) NOT NULL,
    `country_code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `socialId` VARCHAR(191) NULL,

    UNIQUE INDEX `Mobile_socialId_key`(`socialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Social` (
    `id` VARCHAR(191) NOT NULL,
    `userEnterUrl` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `first_name` VARCHAR(191) NULL,
    `last_name` VARCHAR(191) NULL,
    `full_name` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `job_title` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NULL,
    `social_url` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(191) NULL,
    `premium` VARCHAR(191) NULL,
    `skills` VARCHAR(191) NULL,
    `current_job_year` VARCHAR(191) NULL,
    `current_job_month` VARCHAR(191) NULL,
    `picture` VARCHAR(191) NULL,
    `company_name` VARCHAR(191) NULL,
    `company_size` VARCHAR(191) NULL,
    `company_logo` VARCHAR(191) NULL,
    `company_linkedin` VARCHAR(191) NULL,
    `company_website` VARCHAR(191) NULL,
    `company_common_email_pattern` VARCHAR(191) NULL,
    `company_industry` VARCHAR(191) NULL,
    `company_founded_in` VARCHAR(191) NULL,
    `company_description` VARCHAR(191) NULL,
    `company_country` VARCHAR(191) NULL,
    `company_country_code` VARCHAR(191) NULL,
    `company_state` VARCHAR(191) NULL,
    `company_city` VARCHAR(191) NULL,
    `company_timezone` VARCHAR(191) NULL,
    `company_timezone_offset` VARCHAR(191) NULL,
    `company_postal_code` VARCHAR(191) NULL,
    `company_address` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `country_code` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `timezone` VARCHAR(191) NULL,
    `timezone_offset` VARCHAR(191) NULL,
    `postal_code` VARCHAR(191) NULL,
    `raw` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Social_social_url_key`(`social_url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkExperience` (
    `id` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NULL,
    `companyLogo` VARCHAR(191) NULL,
    `companyUrl` VARCHAR(191) NULL,
    `employeeStart` INTEGER NULL,
    `employeeEnd` INTEGER NULL,
    `startMonth` INTEGER NULL,
    `startDay` INTEGER NULL,
    `startYear` INTEGER NULL,
    `endMonth` INTEGER NULL,
    `endDay` INTEGER NULL,
    `endYear` INTEGER NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `employmentType` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `socialId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Education` (
    `id` VARCHAR(191) NOT NULL,
    `schoolName` VARCHAR(191) NULL,
    `schoolLogo` VARCHAR(191) NULL,
    `schoolUrl` VARCHAR(191) NULL,
    `degreeName` VARCHAR(191) NULL,
    `fieldOfStudy` VARCHAR(191) NULL,
    `startYear` INTEGER NULL,
    `endYear` INTEGER NULL,
    `socialId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Domain` (
    `id` VARCHAR(191) NOT NULL,
    `domain` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `total_emails` INTEGER NOT NULL,
    `remaining_emails` INTEGER NOT NULL,
    `search_id` VARCHAR(191) NOT NULL,
    `more_results` BOOLEAN NOT NULL,
    `limit` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Domain_domain_key`(`domain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompanyEnrichment` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `is_catch_all` BOOLEAN NULL,
    `size` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `linkedin` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `common_email_pattern` VARCHAR(191) NULL,
    `industry` VARCHAR(191) NULL,
    `founded_in` INTEGER NULL,
    `description` VARCHAR(191) NULL,
    `anon_id` VARCHAR(191) NULL,
    `locationId` VARCHAR(191) NULL,
    `domainId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CompanyEnrichment_domainId_key`(`domainId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `id` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `country_code` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `timezone` VARCHAR(191) NULL,
    `timezone_offset` VARCHAR(191) NULL,
    `postal_code` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usage` ADD CONSTRAINT `Usage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Email` ADD CONSTRAINT `Email_socialId_fkey` FOREIGN KEY (`socialId`) REFERENCES `Social`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Email` ADD CONSTRAINT `Email_domainId_fkey` FOREIGN KEY (`domainId`) REFERENCES `Domain`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mobile` ADD CONSTRAINT `Mobile_socialId_fkey` FOREIGN KEY (`socialId`) REFERENCES `Social`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkExperience` ADD CONSTRAINT `WorkExperience_socialId_fkey` FOREIGN KEY (`socialId`) REFERENCES `Social`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Education` ADD CONSTRAINT `Education_socialId_fkey` FOREIGN KEY (`socialId`) REFERENCES `Social`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanyEnrichment` ADD CONSTRAINT `CompanyEnrichment_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanyEnrichment` ADD CONSTRAINT `CompanyEnrichment_domainId_fkey` FOREIGN KEY (`domainId`) REFERENCES `Domain`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
