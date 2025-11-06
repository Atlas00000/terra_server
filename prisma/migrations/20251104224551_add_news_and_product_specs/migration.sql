-- CreateTable
CREATE TABLE "news_stories" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "author_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "featured_image_id" UUID,
    "category" TEXT,
    "tags" TEXT[],
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_specifications" (
    "id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specifications" JSONB NOT NULL,
    "performance_metrics" JSONB NOT NULL,
    "technical_details" JSONB NOT NULL,
    "media_gallery_ids" TEXT[],
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "news_stories_slug_key" ON "news_stories"("slug");

-- CreateIndex
CREATE INDEX "news_stories_status_published_at_idx" ON "news_stories"("status", "published_at");

-- CreateIndex
CREATE INDEX "news_stories_author_id_idx" ON "news_stories"("author_id");

-- CreateIndex
CREATE INDEX "news_stories_slug_idx" ON "news_stories"("slug");

-- CreateIndex
CREATE INDEX "news_stories_category_idx" ON "news_stories"("category");

-- CreateIndex
CREATE INDEX "product_specifications_category_idx" ON "product_specifications"("category");

-- CreateIndex
CREATE INDEX "product_specifications_created_by_idx" ON "product_specifications"("created_by");

-- AddForeignKey
ALTER TABLE "news_stories" ADD CONSTRAINT "news_stories_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_stories" ADD CONSTRAINT "news_stories_featured_image_id_fkey" FOREIGN KEY ("featured_image_id") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
