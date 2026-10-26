import { db } from "@/db";

export async function midlertidigBruker(request: Request) {
  const rolle =
    new URL(request.url).searchParams.get("rolle") === "landlord" ? "landlord" : "tenant";
  return db.query.user.findFirst({ where: { role: rolle } });
}
