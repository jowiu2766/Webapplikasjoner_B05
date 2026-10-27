// Testdata. Kjør med:
//   npm run seed      (eller pnpm seed)
//
// Oppretter to demobrukere og fire eksempelsaker.
// Bruker faste ID-er for å unngå duplikater.
// Skal bare brukes i utviklingsmiljøet.
import { defineScript } from "rwsdk/worker";
import { drizzle } from "drizzle-orm/d1";
import { user, cases,messages,  } from "./schema";
import { users, tasks, cases, messages } from "./schema";

export const seedData = async (env: Env) => {
  const db = drizzle(env.DB);

  // Seed skal ikke slette ekte brukere eller saker.
// Vi bruker faste demo-ID-er og unngår duplikater.
const leietakerId = "demo-leietaker";
const utleierId = "demo-utleier";
const now = new Date();
  // Tøm først, så seed kan kjøres om igjen uten å doble alt.
  // barna før foreldrene
  await db.delete(messages);
  await db.delete(cases);
  await db.delete(tasks);
  await db.delete(users);

  // Brukerne må inn før sakene: fremmednøkkelen krever at brukeren finnes.
  // Databasen nekter hvis dere tar rekkefølgen feil, og det er en god ting.
  
await db.insert(user).values([
  {
    id: leietakerId,
    name: "Kari Nordmann",
    email: "kari@example.com",
    emailVerified: false,
    role: "tenant",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: utleierId,
    name: "Ola Utleier",
    email: "ola@example.com",
    emailVerified: false,
    role: "landlord",
    createdAt: now,
    updatedAt: now,
  },
]).onConflictDoNothing();


  // fire saker med ulik status og prioritet
  const dag = 86_400_000;
  const [lekkasje] = await db
    .insert(cases)
    .values([
    {
      title: "Vannlekkasje under kjøkkenvasken",
      description:
        "Det drypper fra røret under vasken. Har satt en bøtte under.",
      category: "pipes",
      description: "Det drypper fra røret under vasken. Har satt en bøtte under.",
      category: "pipes", 
      priority: "high",
      deadline: new Date(Date.now() + 3 * dag),
      status: "open",
      tenantId: leietakerId,
      landlordId: utleierId,
      createdAt: new Date(Date.now() - 1 * dag),
    },
    {
      title: "Stikkontakten på badet virker ikke",
      description: "Ingen strøm i kontakten ved speilet. Sikringen er sjekket.",
      category: "electricity",
      priority: "medium",
      deadline: new Date(Date.now() + 5 * dag),
      status: "in_progress",
      tenantId: leietakerId,
      landlordId: utleierId,
      createdAt: new Date(Date.now() - 5 * dag),
    },
    {
      title: "Maur i kjøkkenskapet",
      description: "Små svarte maur kommer inn ved vinduet over benken.",
      category: "pests",
      priority: "low",
      deadline: new Date(Date.now() + 12 * dag),
      status: "pending",
      tenantId: leietakerId,
      landlordId: utleierId,
      createdAt: new Date(Date.now() - 12 * dag),
    },
    {
      title: "Dørlåsen henger",
      description: "Nøkkelen må vris hardt for å få opp ytterdøra.",
      category: "maintenance",
      deadline: new Date(Date.now() + 2 * dag),
      priority: "medium",
      status: "closed",
      tenantId: leietakerId,
      landlordId: utleierId,
      createdAt: new Date(Date.now() - 30 * dag),
    },
  ]).onConflictDoNothing();
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
