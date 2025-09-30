ALTER TABLE "words" DROP CONSTRAINT "words_word_book_id_word_books_id_fk";
--> statement-breakpoint
ALTER TABLE "word_books" ALTER COLUMN "id" SET DATA TYPE char(24);--> statement-breakpoint
ALTER TABLE "words" ALTER COLUMN "word_book_id" SET DATA TYPE char(24);--> statement-breakpoint
ALTER TABLE "words" ADD CONSTRAINT "words_word_book_id_word_books_id_fk" FOREIGN KEY ("word_book_id") REFERENCES "public"."word_books"("id") ON DELETE cascade ON UPDATE no action;