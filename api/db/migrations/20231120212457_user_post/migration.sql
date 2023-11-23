/*
  Warnings:

  - You are about to drop the `SgmKalem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_userId_fkey";

-- DropTable
DROP TABLE "SgmKalem";

-- DropTable
DROP TABLE "TestUser";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
