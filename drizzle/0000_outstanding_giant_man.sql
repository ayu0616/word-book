CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "words" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"term" varchar(255) NOT NULL,
	"meaning" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
