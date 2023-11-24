-- DropIndex
DROP INDEX "Post_id_key";

-- AlterTable
CREATE SEQUENCE post_id_seq;
ALTER TABLE "Post" ALTER COLUMN "id" SET DEFAULT nextval('post_id_seq'),
ALTER COLUMN "title" DROP NOT NULL;
ALTER SEQUENCE post_id_seq OWNED BY "Post"."id";
