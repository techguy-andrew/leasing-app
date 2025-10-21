-- AlterTable: Replace single address field with separate street, city, state, zip fields
-- This migration will clear existing address data as per requirement

-- Drop the old address column
ALTER TABLE "Property" DROP COLUMN "address";

-- Add new address component columns with default empty strings
ALTER TABLE "Property" ADD COLUMN "street" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Property" ADD COLUMN "city" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Property" ADD COLUMN "state" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Property" ADD COLUMN "zip" TEXT NOT NULL DEFAULT '';
