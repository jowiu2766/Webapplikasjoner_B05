// Testdata. Kjør med:
//   npm run seed
//
// Tømmer og fyller på nytt, så databasen kan nullstilles til en kjent
// tilstand. Slett .wrangler/, kjør migrasjonene og denne, så er du tilbake
// der du startet.
import { defineScript } from "rwsdk/worker";
import { drizzle } from "drizzle-orm/d1";
import { account, cases, messages, session, user, verification } from "./schema";

export const seedData = async (env: Env) => {
  const db = drizzle(env.DB);

  // Barna før foreldrene.
  await db.delete(messages);
  await db.delete(cases);
  await db.delete(session);
  await db.delete(account);
  await db.delete(verification);
  await db.delete(user);

  const [leietaker, utleier] = await db
    .insert(user)
    .values([
      { id: "demo-leietaker", name: "Kari Nordmann", email: "kari@example.com", role: "tenant" },
      { id: "demo-utleier", name: "Ola Utleier", email: "ola@example.com", role: "landlord" },
    ])
    .returning();

  const dag = 86_400_000;
  const [lekkasje] = await db
    .insert(cases)
    .values([
      {
        title: "Vannlekkasje under kjøkkenvasken",
        description: "Det drypper fra røret under vasken. Har satt en bøtte under.",
        category: "pipes",
        priority: "high",
        status: "open",
        deadline: new Date(Date.now() + 3 * dag),
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
        deadline: new Date(Date.now() + 5 * dag),
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
        deadline: new Date(Date.now() + 14 * dag),
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
        deadline: new Date(Date.now() - 20 * dag),
        tenantId: leietaker.id,
        landlordId: utleier.id,
        createdAt: new Date(Date.now() - 30 * dag),
      },
    ])
    .returning();

  await db.insert(messages).values([
    {
      caseId: lekkasje.id,
      senderId: utleier.id,
      body: "Takk, jeg ringer rørleggeren i morgen tidlig.",
      createdAt: new Date(Date.now() - 1 * dag + 3_600_000),
    },
    {
      caseId: lekkasje.id,
      senderId: leietaker.id,
      body: "Flott. Jeg er hjemme etter klokka 15.",
      createdAt: new Date(Date.now() - 1 * dag + 7_200_000),
    },
  ]);

  console.log("Seeding ferdig");
};

export default defineScript(async ({ env }) => {
  await seedData(env);
  return Response.json({ success: true });
});
