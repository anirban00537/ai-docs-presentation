/*
  Warnings:

  - You are about to drop the column `freeCredits` on the `credit_balances` table. All the data in the column will be lost.
  - You are about to drop the column `freeCreditsUsed` on the `credit_balances` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyLimit` on the `credit_balances` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyUsed` on the `credit_balances` table. All the data in the column will be lost.
  - You are about to drop the column `remainingCredits` on the `credit_balances` table. All the data in the column will be lost.
  - You are about to drop the column `totalCredits` on the `credit_balances` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "credit_balances" DROP COLUMN "freeCredits",
DROP COLUMN "freeCreditsUsed",
DROP COLUMN "monthlyLimit",
DROP COLUMN "monthlyUsed",
DROP COLUMN "remainingCredits",
DROP COLUMN "totalCredits",
ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "quota" INTEGER NOT NULL DEFAULT 30;
