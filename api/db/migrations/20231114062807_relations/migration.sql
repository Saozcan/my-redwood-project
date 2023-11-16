-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "userId" INTEGER;

-- CreateTable
CREATE TABLE "TestUser" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,

    CONSTRAINT "TestUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SgmKalem" (
    "id" SERIAL NOT NULL,
    "kalem_kodu" TEXT NOT NULL,
    "kalem_adi" TEXT,

    CONSTRAINT "SgmKalem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
