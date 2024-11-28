-- AlterTable
ALTER TABLE `CompanyEnrichment` MODIFY `common_email_pattern` TEXT NULL,
    MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `Education` MODIFY `schoolLogo` TEXT NULL,
    MODIFY `schoolUrl` TEXT NULL,
    MODIFY `degreeName` TEXT NULL,
    MODIFY `fieldOfStudy` TEXT NULL;

-- AlterTable
ALTER TABLE `WorkExperience` MODIFY `companyName` TEXT NULL,
    MODIFY `companyLogo` TEXT NULL,
    MODIFY `companyUrl` TEXT NULL,
    MODIFY `description` TEXT NULL;
