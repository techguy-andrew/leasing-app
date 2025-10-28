-- Step 1: Create a temporary column to hold the formatted date
ALTER TABLE "Application" ADD COLUMN "createdAt_temp" TEXT;

-- Step 2: Convert existing DateTime values to MM/DD/YYYY format
UPDATE "Application"
SET "createdAt_temp" = TO_CHAR("createdAt"::timestamp, 'MM/DD/YYYY');

-- Step 3: Drop the old createdAt column
ALTER TABLE "Application" DROP COLUMN "createdAt";

-- Step 4: Rename the temp column to createdAt
ALTER TABLE "Application" RENAME COLUMN "createdAt_temp" TO "createdAt";
