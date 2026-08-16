-- Replace phone with email as the primary user identifier for authentication
ALTER TABLE "User" RENAME COLUMN "phone" TO "email";

ALTER INDEX "User_phone_key" RENAME TO "User_email_key";
ALTER INDEX "User_phone_idx" RENAME TO "User_email_idx";
