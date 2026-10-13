# Arkitektur

Beslutninger med begrunnelse. Rapporten og presentasjonen spør etter «hvilke valg dere tok, særlig på arkitektur», så skriv dem ned når de tas. Ansvarlig: Herman.

## Oversikt

Fiksa består av to apper i hvert sitt repo: webappen (RedwoodSDK på Cloudflare) og mobilappen (Expo). Hva som ligger hvor, og hvordan de deler data, avklares. Skisse kommer.

## Beslutninger

| Dato | Beslutning | Hvorfor | Alternativer vurdert |
| --- | --- | --- | --- |
| 10.09 | To repoer, ett per emne | Hvert emne krever eget offentlig repo med egen git-historikk ved innlevering | Ett monorepo for begge |
| 10.09 | Webapp bygger på emneansvarligs RedwoodSDK-starter | Kursets stack. D1, Drizzle, Vitest og better-auth er ferdig satt opp, og det er det undervisningen viser | create-rwsdk uten ekstra oppsett, Next.js, TanStack Start |
| 10.09 | Mobilapp fra offisiell Expo-mal, SDK 57, Expo Router | Kursets stack i siste versjon | |
| 10.09 | Hosting på GitHub og Cloudflare | Cloudflare er der RedwoodSDK hører hjemme, og gratisnivået holder | Azure |
| 10.09 | API lages selv | Fra gruppemøtet. Hvis ikke, avklares strukturen | |
| | Autentisering: better-auth på web, token i SecureStore på mobil | Krav i begge kursplanene | |

## Datamodell

Utkast 5. oktober 2026, ikke vedtatt av gruppa ennå. Kilden er UML-dokumentet på WEB-teamets Home i Linear (sist endret 30. september): https://linear.app/webapplikasjonerb05/document/uml-1ef9cca9710a. Det som står her er UML-en oversatt til tabeller for Drizzle mot D1, avgrenset til det vi mener hører til v1. Endres UML-en, oppdateres dette. Oppgaven i Linear er WEB-28 (K1).

Skjemaet skal være vårt eget (krav i kursplanen). better-auth eier tabellene `user`, `session`, `account` og `verification`; vi utvider `user` med egne kolonner i stedet for å lage en egen brukertabell.

### Tabeller i v1

**user** (fra better-auth, pluss egne kolonner)

| Kolonne | Type | Merknad |
| --- | --- | --- |
| id | text, primærnøkkel | better-auth |
| name, email, emailVerified, image, createdAt, updatedAt | | better-auth |
| role | text, `tenant` eller `landlord` | UML «role: landlord or renter». Påkrevd, velges ved registrering |
| phone | text, valgfri | UML |
| address | text, valgfri | UML. Fylles via adressesøk fra Kartverket (WEB-52) |

**cases** (UML «Case» og «CreateCaseScheme»)

| Kolonne | Type | Merknad |
| --- | --- | --- |
| id | text, primærnøkkel | `createId()` fra `src/lib/id.ts` |
| title | text | |
| category | text, enum | UML «Enum Issue», se under |
| priority | text, enum | UML «Enum Priority», se under |
| status | text, enum | UML «Enum CaseStatus», se under |
| description | text | `validateDescription`: 1 til 500 tegn |
| deadline | timestamp, valgfri | UML «deadline». Settes senere ut fra prioritet |
| tenantId | text, fremmednøkkel til user.id | UML «createdBy: tenantUser» |
| landlordId | text, fremmednøkkel til user.id | UML «sentTo: landlordUser» |
| createdAt, updatedAt | timestamp | |

**messages** (UML «Chat»)

| Kolonne | Type | Merknad |
| --- | --- | --- |
| id | text, primærnøkkel | |
| caseId | text, fremmednøkkel til cases.id, onDelete cascade | Slettes saken, slettes meldingene |
| senderId | text, fremmednøkkel til user.id | |
| body | text | 1 til 2000 tegn |
| createdAt | timestamp | |

Relasjoner: en bruker har mange saker som leietaker og mange som utleier. En sak har mange meldinger. En melding har en avsender. Indekser på `cases.tenantId`, `cases.landlordId` og `messages.caseId`, siden det er disse vi filtrerer på.

### Enum-verdier og etiketter

Forslag: verdiene lagres på engelsk, som i UML-en, og vises på norsk. Begge deler bor i `src/lib/enums.ts`, så databasen, valideringen og brukergrensesnittet bruker samme liste.

| category | Etikett |
| --- | --- |
| electricity | Strøm |
| pipes | Rør |
| pests | Skadedyr |
| water_damage | Vannskade |
| maintenance | Vedlikehold |
| complaint | Klage |
| other | Annet |

| priority | Etikett |
| --- | --- |
| low | Lav |
| medium | Middels |
| high | Høy |
| critical | Kritisk |

| status | Etikett |
| --- | --- |
| open | Åpen |
| in_progress | Under arbeid |
| pending | Venter |
| awaiting_confirmation | Venter på bekreftelse |
| closed | Lukket |

Lovlige overganger (UML «updateStatus», «cancelCase»): open → in_progress → pending → awaiting_confirmation → closed, pluss open → closed når leietakeren trekker saken. Bare utleier endrer status, leietaker kan bare trekke egen åpen sak.

### Utsatt fra UML-en, ikke v1

- **Property.** UML-en merker den selv med «kan muligens bare filtrere». I v1 kobles utleier direkte til saken via `landlordId`. Egen tabell først hvis vi trenger flere boliger per utleier.
- **Receipt** med `exportReceipt()`. Kan lages som en utskriftsvisning av en sak, trenger ingen egen tabell.
- **files** på CreateCaseScheme og Chat. Vedlegg i R2 med en egen `attachments`-tabell, se `datalagring.md`.
- Login, Profile, Dashboard og Error i UML-en er skjermer og operasjoner, ikke tabeller. De dekkes av sidene og server actions.

### Gruppa må avgjøre

1. Språk i koden: engelske nøkler i databasen og norske etiketter i UI (forslaget over), eller norsk hele veien. Henger sammen med WEB-25.
2. Antall statuser: skissene i Linear bruker tre (Sendt, Under arbeid, Fiksa), UML-en bruker fem. Forslaget over følger UML-en.
3. Hvordan en leietaker finner utleieren sin: velge fra liste når saken opprettes, eller fast kobling på brukeren. v1-forslag: fast kobling satt i seed-data, velger i skjemaet kommer senere.
