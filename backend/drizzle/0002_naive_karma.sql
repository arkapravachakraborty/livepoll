ALTER TABLE "answer_table" DROP CONSTRAINT "answer_table_response_id_response_table_id_fk";
--> statement-breakpoint
ALTER TABLE "answer_table" DROP CONSTRAINT "answer_table_option_id_option_table_id_fk";
--> statement-breakpoint
ALTER TABLE "answer_table" DROP CONSTRAINT "answer_table_question_id_question_table_id_fk";
--> statement-breakpoint
ALTER TABLE "option_table" DROP CONSTRAINT "option_table_question_id_question_table_id_fk";
--> statement-breakpoint
ALTER TABLE "poll_table" DROP CONSTRAINT "poll_table_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "question_table" DROP CONSTRAINT "question_table_poll_id_poll_table_id_fk";
--> statement-breakpoint
ALTER TABLE "response_table" DROP CONSTRAINT "response_table_poll_id_poll_table_id_fk";
--> statement-breakpoint
ALTER TABLE "response_table" DROP CONSTRAINT "response_table_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "answer_table" ADD CONSTRAINT "answer_table_response_id_response_table_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."response_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_table" ADD CONSTRAINT "answer_table_option_id_option_table_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."option_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_table" ADD CONSTRAINT "answer_table_question_id_question_table_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_table" ADD CONSTRAINT "option_table_question_id_question_table_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_table" ADD CONSTRAINT "poll_table_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_table" ADD CONSTRAINT "question_table_poll_id_poll_table_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."poll_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_table" ADD CONSTRAINT "response_table_poll_id_poll_table_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."poll_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_table" ADD CONSTRAINT "response_table_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;