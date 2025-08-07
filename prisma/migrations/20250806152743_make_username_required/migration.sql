/*
  Warnings:

  - Made the column `displayUsername` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "displayUsername" SET NOT NULL,
ALTER COLUMN "username" SET NOT NULL;
