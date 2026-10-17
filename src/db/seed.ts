// Testdata. Kjør med:
//   npm run seed      (eller pnpm seed)
//
// Oppretter to demobrukere og fire eksempelsaker.
// Bruker faste ID-er for å unngå duplikater.
// Skal bare brukes i utviklingsmiljøet.
import { defineScript } from "rwsdk/worker";
import { drizzle } from "drizzle-orm/d1";
import { user, cases } from "./schema";

export const seedData = async (env: Env) => {
  const db = drizzle(env.DB);

  // Seed skal ikke slette ekte brukere eller saker.
// Vi bruker faste demo-ID-er og unngår duplikater.
const leietakerId = "demo-leietaker";
const utleierId = "demo-utleier";
const now = new Date();

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
  await db.insert(cases).values([
    {
      title: "Vannlekkasje under kjøkkenvasken",
      description: "Det drypper fra røret under vasken. Har satt en bøtte under.",
      category: "pipes", 
      priority: "high",
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
      status: "pending",
      tenantId: leietakerId,
      landlordId: utleierId,
      createdAt: new Date(Date.now() - 12 * dag),
    },
    {
      title: "Dørlåsen henger",
      description: "Nøkkelen må vris hardt for å få opp ytterdøra.",
      category: "maintenance",
      priority: "medium",
      status: "closed",
      tenantId: leietakerId,
      landlordId: utleierId,
      createdAt: new Date(Date.now() - 30 * dag),
    },
  ]).onConflictDoNothing();

  console.log("Seeding ferdig");
};

export default defineScript(async ({ env }) => {
  await seedData(env);
  return Response.json({ success: true });
});
