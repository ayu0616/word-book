DROP TABLE "learning_records" CASCADE;--> statement-breakpoint
ALTER TABLE "words" ADD COLUMN "consecutive_correct_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "words" ADD COLUMN "next_review_date" timestamp DEFAULT now() NOT NULL;