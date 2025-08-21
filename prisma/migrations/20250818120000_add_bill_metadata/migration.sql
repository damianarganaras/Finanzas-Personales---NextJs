-- Add optional description, category relation, and autoPayEnabled to bills
ALTER TABLE `bills`
  ADD COLUMN `description` TEXT NULL,
  ADD COLUMN `autoPayEnabled` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `categoryId` VARCHAR(191) NULL;

-- Add foreign key to categories
ALTER TABLE `bills`
  ADD CONSTRAINT `bills_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
