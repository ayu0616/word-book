import { createId } from "@paralleldrive/cuid2";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { words } from "@/db/schema";

try {
  console.log("start");

  await db.transaction(async (db) => {
    const wl = db
      .select({
        id: words.id,
        idInt: sql`cast(${words.id} as int)`.as("idInt"),
      })
      .from(words)
      .as("wl");
    const wordList = await db.select({ id: wl.id }).from(wl).orderBy(wl.idInt);

    await db.execute(sql`SET session_replication_role = replica`);

    for (const w of wordList) {
      const newId = createId();
      await db.update(words).set({ id: newId }).where(eq(words.id, w.id));
      console.log(`updated: ${w.id} -> ${newId}`);
    }

    await db.execute(sql`SET session_replication_role = DEFAULT`);
  });

  console.log("end");
} catch (e) {
  console.error(e);
} finally {
  db.$client.end();
}
