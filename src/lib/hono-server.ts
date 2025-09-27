import { hc } from "hono/client";
import { cookies } from "next/headers";
import type { AppType } from "@/app/api/[[...route]]/route";

const url =
  process.env.NODE_ENV === "production"
    ? `http://app:${process.env.PORT || "3000"}/`
    : `http://localhost:${process.env.PORT || "3000"}/`;

export const getServerClient = async () => {
  const cookieStore = await cookies();
  return hc<AppType>(url, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  }).api;
};
