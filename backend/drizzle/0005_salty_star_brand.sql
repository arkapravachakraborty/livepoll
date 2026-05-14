ALTER TABLE "answer_table" ALTER COLUMN "option_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "answer_table" ADD COLUMN "text_answer" text;