import { hc } from "hono/client";
import { cookies } from "next/headers";
import type { AppType } from "@/app/api/[[...route]]/route";

export const getServerClient = async () => {
  const cookieStore = await cookies();
  return hc<AppType>("http://localhost:3000/", {
    headers: {
      Cookie: cookieStore.toString(),
    },
  }).api;
};
