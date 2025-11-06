-- CreateTable
CREATE TABLE "rfq_requests" (
    "id" UUID NOT NULL,
    "inquiry_id" UUID,
    "product_category" TEXT NOT NULL,
    "quantity" INTEGER,
    "budget_range" TEXT,
    "timeline" TEXT,
    "requirements" TEXT,
    "specifications" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "quote_amount" DECIMAL(15,2),
    "quote_sent_at" TIMESTAMP(3),
    "decision_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfq_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_queue" (
    "id" UUID NOT NULL,
    "to_email" TEXT NOT NULL,
    "from_email" TEXT,
    "subject" TEXT NOT NULL,
    "body_html" TEXT,
    "body_text" TEXT,
    "template_name" TEXT,
    "template_data" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rfq_requests_status_idx" ON "rfq_requests"("status");

-- CreateIndex
CREATE INDEX "rfq_requests_created_at_idx" ON "rfq_requests"("created_at");

-- CreateIndex
CREATE INDEX "rfq_requests_inquiry_id_idx" ON "rfq_requests"("inquiry_id");

-- CreateIndex
CREATE INDEX "email_queue_status_created_at_idx" ON "email_queue"("status", "created_at");

-- AddForeignKey
ALTER TABLE "rfq_requests" ADD CONSTRAINT "rfq_requests_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
