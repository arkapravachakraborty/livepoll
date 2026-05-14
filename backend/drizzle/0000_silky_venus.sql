CREATE TABLE "answer_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"option_id" uuid NOT NULL,
	"question_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "option_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"option" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"is_anonymous" boolean DEFAULT false,
	"expire_time" timestamp NOT NULL,
	"is_publish" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "question_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"question" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"is_mandatory" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "response_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"user_id" uuid,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(322) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"password" varchar(66) NOT NULL,
	"salt" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "answer_table" ADD CONSTRAINT "answer_table_response_id_response_table_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."response_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_table" ADD CONSTRAINT "answer_table_option_id_option_table_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."option_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_table" ADD CONSTRAINT "answer_table_question_id_question_table_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_table" ADD CONSTRAINT "option_table_question_id_question_table_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_table" ADD CONSTRAINT "poll_table_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_table" ADD CONSTRAINT "question_table_poll_id_poll_table_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."poll_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_table" ADD CONSTRAINT "response_table_poll_id_poll_table_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."poll_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_table" ADD CONSTRAINT "response_table_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;