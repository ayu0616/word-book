import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgres://postgres:postgres@localhost:5432/app_db";

export const client = postgres(databaseUrl, { prepare: true, max: 10 });
export const db = drizzle(client);
