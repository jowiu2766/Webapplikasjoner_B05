import { getDb } from "@/db";

export async function midlertidigBruker(request: Request) {
  const db = await getDb();
  const rolle =
    new URL(request.url).searchParams.get("rolle") === "Landlord" ? "Landlord" : "Tenant";
  return db.query.user.findFirst({ where: { role: rolle } });
}
