// Testdata. Kjør med:
//   npm run seed      (eller pnpm seed)
//
// Poenget med en seed er at databasen kan nullstilles til en kjent tilstand.
// Slett .wrangler/, kjør migrasjonene og denne, så er dere tilbake der dere
// startet. Da slipper dere å lure på om feilen ligger i dataene.
import { defineScript } from "rwsdk/worker";
import { drizzle } from "drizzle-orm/d1";
import { users, tasks, cases } from "./schema";

export const seedData = async (env: Env) => {
  const db = drizzle(env.DB);

  // Tøm først, så seed kan kjøres om igjen uten å doble alt.
  // barna før foreldrene
  await db.delete(cases);
  await db.delete(tasks);
  await db.delete(users);

  // Brukerne må inn før sakene: fremmednøkkelen krever at brukeren finnes.
  // Databasen nekter hvis dere tar rekkefølgen feil, og det er en god ting.
  const [leietaker, utleier] = await db
    .insert(users)
    .values([
      { name: "Kari Nordmann", email: "kari@example.com", role: "tenant" },
      { name: "Ola Utleier", email: "ola@example.com", role: "landlord" },
    ])
    .returning();

  await db.insert(tasks).values([
    {
      title: "Lese leksjonen før timen",
      completed: true,
      userId: leietaker.id,
      dueDate: new Date(Date.now() - 86_400_000),
    },
    {
      title: "Sette opp prosjektet",
      completed: false,
      userId: leietaker.id,
      dueDate: new Date(Date.now() + 86_400_000),
    },
  ]);

  // fire saker med ulik status og prioritet
  const dag = 86_400_000;
  await db.insert(cases).values([
    {
      title: "Vannlekkasje under kjøkkenvasken",
      description: "Det drypper fra røret under vasken. Har satt en bøtte under.",
      category: "pipes",
      priority: "high",
      status: "open",
      tenantId: leietaker.id,
      landlordId: utleier.id,
      createdAt: new Date(Date.now() - 1 * dag),
    },
    {
      title: "Stikkontakten på badet virker ikke",
      description: "Ingen strøm i kontakten ved speilet. Sikringen er sjekket.",
      category: "electricity",
      priority: "medium",
      status: "in_progress",
      tenantId: leietaker.id,
      landlordId: utleier.id,
      createdAt: new Date(Date.now() - 5 * dag),
    },
    {
      title: "Maur i kjøkkenskapet",
      description: "Små svarte maur kommer inn ved vinduet over benken.",
      category: "pests",
      priority: "low",
      status: "pending",
      tenantId: leietaker.id,
      landlordId: utleier.id,
      createdAt: new Date(Date.now() - 12 * dag),
    },
    {
      title: "Dørlåsen henger",
      description: "Nøkkelen må vris hardt for å få opp ytterdøra.",
      category: "maintenance",
      priority: "medium",
      status: "closed",
      tenantId: leietaker.id,
      landlordId: utleier.id,
      createdAt: new Date(Date.now() - 30 * dag),
    },
  ]);

  console.log("Seeding ferdig");
};

export default defineScript(async ({ env }) => {
  await seedData(env);
  return Response.json({ success: true });
});
