CREATE TABLE "word_books" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"title" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "post" CASCADE;--> statement-breakpoint
ALTER TABLE "words" ADD COLUMN "word_book_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "word_books" ADD CONSTRAINT "word_books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "words" ADD CONSTRAINT "words_word_book_id_word_books_id_fk" FOREIGN KEY ("word_book_id") REFERENCES "public"."word_books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "words" DROP COLUMN "user_id";