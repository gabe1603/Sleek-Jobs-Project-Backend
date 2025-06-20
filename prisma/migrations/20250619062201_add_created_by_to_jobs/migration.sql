/*
  Warnings:

  - You are about to drop the `_JobToSkill` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `location` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `salaryMax` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `salaryMin` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_JobToSkill" DROP CONSTRAINT "_JobToSkill_A_fkey";

-- DropForeignKey
ALTER TABLE "_JobToSkill" DROP CONSTRAINT "_JobToSkill_B_fkey";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "createdById" TEXT,
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "salaryMax" SET NOT NULL,
ALTER COLUMN "salaryMin" SET NOT NULL;

-- DropTable
DROP TABLE "_JobToSkill";

-- CreateTable
CREATE TABLE "_JobSkills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_JobSkills_AB_unique" ON "_JobSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_JobSkills_B_index" ON "_JobSkills"("B");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobSkills" ADD CONSTRAINT "_JobSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobSkills" ADD CONSTRAINT "_JobSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
