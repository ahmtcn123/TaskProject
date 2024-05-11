/*
  Warnings:

  - Made the column `thumbnail` on table `TodoEntry` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TodoEntry" ADD COLUMN     "tags" TEXT[],
ALTER COLUMN "thumbnail" SET NOT NULL;
