-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Post_id_seq";

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
