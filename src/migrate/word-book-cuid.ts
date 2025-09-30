import { createId } from "@paralleldrive/cuid2";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { wordBooks, words } from "@/db/schema";

try {
  console.log("start");

  await db.transaction(async (db) => {
    const wordBookList = await db
      .select({ id: wordBooks.id })
      .from(wordBooks)
      .orderBy(wordBooks.id);
    await db.execute(sql`SET session_replication_role = replica`);
    for (const wb of wordBookList) {
      const newId = createId();
      await db
        .update(words)
        .set({ wordBookId: newId })
        .where(eq(words.wordBookId, wb.id));
      await db
        .update(wordBooks)
        .set({ id: newId })
        .where(eq(wordBooks.id, wb.id));
      console.log(`updated: ${wb.id} -> ${newId}`);
    }
    await db.execute(sql`SET session_replication_role = DEFAULT`);
  });

  console.log("end");
} catch (e) {
  console.error(e);
} finally {
  db.$client.end();
}
