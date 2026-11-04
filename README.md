# Fiksa · webapp

Fiksa samler dialogen mellom leietaker og utleier på ett sted. Fiksa alt lett.

Webappen til Fiksa, prosjektet til gruppe B05 i Webapplikasjoner (ITF31619) ved
Høgskolen i Østfold høsten 2026. Mobilappen ligger i et eget repo:
https://github.com/herjoh/Mopilprogrammering_B05.

Bygget på emneansvarligs startprosjekt: RedwoodSDK på Cloudflare Workers,
React 19, Vite 8, TypeScript 7, Tailwind 4, Drizzle mot D1, better-auth, Zod 4,
Vitest og Playwright. GitHub Actions kjører typesjekk og tester på hver pull
request, og deployer `main` til https://fiksa.hiof-b05.workers.dev, se
`docs/hosting.md`.

## Hva appen gjør

Leietakeren melder inn noe som må fikses i boligen, for eksempel en lekkasje
eller en stikkontakt som er død, med kategori, prioritet, frist og gjerne et
bilde. Utleieren ser sakene som er sendt til seg og flytter dem fram ett steg om
gangen: åpen, under arbeid, venter, venter på bekreftelse, lukket. Begge skriver
meldinger på saken, så alt om den ligger på ett sted. Leietakeren kan avbryte
en sak som fortsatt er åpen.

Hovedflyten er: logg inn, meld inn en sak, se den i lista og åpne den. Utleier
logger inn, ser den samme saken, endrer status og svarer.

## Krav

| | Versjon | Sjekk med |
| --- | --- | --- |
| Node.js | 22.12 eller nyere | `node -v` |
| npm | følger med Node | `npm -v` |

Vi bruker npm. Cloudflare-konto trengs ikke for å komme i gang: databasen (D1)
og fillageret for bilder (R2) ligger som filer under `.wrangler/` lokalt.

## Kom i gang

```bash
npm install
npm run migrate:dev    # lager tabellene i den lokale databasen
npm run seed           # to brukere og fire saker
npm run dev
```

Åpne `http://localhost:5173` og logg inn på `/auth/login`. Du logger inn med
brukernavn, ikke e-post:

| Rolle | Brukernavn | Passord |
| --- | --- | --- |
| Leietaker | `kari_leietaker` | `Kari1234` |
| Utleier | `ola_utleier` | `Ola12345` |

De to hører sammen: Karis fire saker er sendt til Ola, og den første saken har
to meldinger. `npm run seed:prod` legger de samme brukerne og sakene inn i
databasen i skyen, så de kan brukes på adressen over også.

Eller registrer en ny bruker på `/auth/register`. Der velger du rolle, og
adressefeltet søker i Kartverkets adresse-API mens du skriver, så det trenger
nett.

## Hva som ligger her

```
src/
├─ worker.tsx                 inngangspunktet. Middleware og alle ruter
├─ client.tsx                 starter React i nettleseren
├─ app/
│  ├─ Document.tsx            HTML-skallet rundt alle sider
│  ├─ headers.ts              sikkerhetsheadere, blant annet CSP
│  ├─ styles.css              Tailwind, med @theme-blokk
│  └─ pages/
│     ├─ Home.tsx             forsiden
│     ├─ layouts/AppLayout.tsx  header med meny. Leser ctx.user
│     └─ saker/               List, NewCase og Detail. Server-komponenter
├─ actions/saker.ts           server actions: send melding, endre status, avbryt sak
├─ adresser/                  adressesøk mot Kartverket: kall, handler og zod-skjema
├─ api/auth/                  registrering og innlogging: repository, service, server actions
├─ cases/                     opprett sak: skjema, repository, service, controller og REST-rute
├─ components/
│  ├─ NewCaseForm.tsx         skjema for ny sak, med AdresseSok og FileUpload
│  ├─ MeldingForm.tsx         klientkomponentene på en sak: melding,
│  ├─ StatusVelger.tsx        neste steg for utleier,
│  ├─ AvbrytSakKnapp.tsx      og avbryt for leietaker
│  ├─ SakRad.tsx              én rad i lista
│  ├─ auth/                   login- og registreringsskjema, brukermeny
│  └─ __tests__/              komponenttester med Testing Library
├─ context/AuthProvider.tsx   innlogget bruker, til klientkomponentene
├─ db/
│  ├─ schema/                 auth-schema (better-auth), case-schema, message-schema
│  ├─ relations.ts            relasjonene mellom tabellene
│  ├─ queries/saker.ts        spørringene sidene bruker
│  ├─ index.ts                databaseklienten
│  └─ seed.ts                 testdata
├─ lib/
│  ├─ auth.ts, auth/          better-auth-oppsettet, passord, sesjon og roller
│  ├─ enums.ts                kategori, prioritet og status: engelsk i databasen, norsk på skjermen
│  ├─ sak-status.ts           lovlige statusoverganger og hvem som får gjøre hva
│  ├─ sak-filter.ts           filteret i adressen på /saker
│  ├─ validation.ts           tittel, beskrivelse og kategori
│  └─ upload.ts               sjekker og lagrer bilder i R2
├─ middelWare/                Authentication setter ctx.user, Authorization beskytter ruter
├─ routes/media.ts            opplasting og henting av bilder
├─ test/                      hjelpere til testene: SQLite i minnet, requestInfo, DOM
└─ types/                     felles typer

e2e/                          Playwright-tester i ekte nettleser
drizzle/migrations/           én mappe per migrasjon. Slett aldri en gammel
public/                       statiske filer
```

Konfigurasjonen ligger i rota: `wrangler.jsonc` (hva appen har tilgang til),
`vite.config.mts`, `vitest.config.ts`, `playwright.config.ts`,
`drizzle.config.ts` og `tsconfig.json`.

## Ruter

| Rute | Hva |
| --- | --- |
| `/` | forsiden |
| `/auth/login`, `/auth/register` | innlogging og registrering |
| `/saker` | sakene dine. Krever innlogging. `?status=open&prioritet=high` filtrerer |
| `/saker/ny` | meld inn en sak |
| `/saker/:id` | saken, med meldinger, status og avbryt |
| `POST /api/saker` | REST-endepunkt som oppretter en sak. Svarer 201, 400, 401, 403 eller 405 |
| `POST /api/saker/:id/fil` | laster opp et bilde (jpeg, png, webp, gif, maks 5 MB) til R2 |
| `GET /media/*` | henter bildet |
| `GET /api/adresser?sok=` | adressesøk, videresendt til Kartverket |
| `GET /api/status` | helsesjekk, svarer JSON |

Skriving fra sidene går gjennom server actions i `src/actions/saker.ts`, som
sjekker rollen før de rører databasen.

## Kommandoer

| Kommando | Hva den gjør |
| --- | --- |
| `npm run dev` | utviklingsserver på port 5173 |
| `npm run lint` | typesjekk med TypeScript |
| `npm test` | kjører testene én gang |
| `npm run test:watch` | kjører testene på nytt når du lagrer |
| `npm run test:coverage` | tester med dekningsrapport (kravet er minst 50 %) |
| `npm run test:e2e` | Playwright i ekte nettleser |
| `npm run migrate:new` | lager en migrasjon fra `src/db/schema/` |
| `npm run migrate:dev` | kjører migrasjonene mot den lokale databasen |
| `npm run migrate:prod` | kjører dem mot databasen i skyen |
| `npm run seed` | legger inn testdata |
| `npm run seed:prod` | legger de samme testdataene inn i databasen i skyen |
| `npm run generate` | oppdaterer typene etter endring i `wrangler.jsonc` |
| `npm run build` | bygger for produksjon |
| `npm run release` | bygger og deployer for hånd |

## Innlogging og lagring

Innlogging er vår egen, med brukernavn og passord. Fra better-auth bruker vi
bare passord-hashingen (`better-auth/crypto`) og tabellene i skjemaet, ikke
innloggingsflyten. Slik henger det sammen:

- `/auth/register` lager en rad i `user` med `name` (brukernavnet du logger inn
  med), `email`, `password_hash`, `role` (`Tenant` eller `Landlord`) og
  `address`. Passordet må ha minst 8 tegn, stor og liten bokstav og et tall.
- `/auth/login` slår opp på brukernavn, sjekker passordet mot hashen og lager en
  rad i `session` som varer i sju dager. Sesjons-id-en ligger i cookien
  `fika_session_cookie`.
- Middlewaren i `src/middelWare/Authentication.ts` leser cookien på hver
  forespørsel og setter `ctx.user`, så server-komponenter og server actions vet
  hvem som spør. `Authorization.ts` sender deg til `/auth/login` om du ikke er
  logget inn, og har `requireRole` for ruter som krever en bestemt rolle.
- Tabellene `account` og `verification` ligger i skjemaet, men brukes ikke.

Koden ligger i `src/api/auth/` (service, repository og server actions) og
`src/lib/auth/` (passord, sesjon og roller).

Databasen er **D1**, som er SQLite hos Cloudflare. Sakene ligger i `cases`,
meldingene i `messages`. Bilder ligger i R2, bare nøkkelen lagres på saken.
Slik endrer du datamodellen:

1. Endre eller legg til en tabell i `src/db/schema/`
2. `npm run migrate:new` lager en migrasjonsfil
3. `npm run migrate:dev` kjører den mot den lokale databasen

En migrasjon er en dagbok: du **legger til** en ny, og redigerer aldri en som
har kjørt. Har databasen havnet i en rar tilstand, slett `.wrangler/` og kjør
migrasjonene og seed på nytt.

## Tester

```bash
npm test
npm run test:coverage
```

Testene ligger i `__tests__`-mapper ved siden av koden de tester. Tre slag
kjører i samme Vitest-suite:

- Enhetstester: `src/lib/__tests__/` tester statusmaskinen, filteret,
  valideringen, enum-listene og rollene uten database.
- Integrasjonstester: `src/actions/__tests__/saker.test.ts` og
  `src/db/queries/__tests__/saker.test.ts` kjører server actions og spørringer
  mot SQLite i minnet med de ekte migrasjonene (`src/test/db.ts`). Sidene i
  `src/app/pages/saker/__tests__/` rendres som innlogget leietaker og utleier:
  en sak som meldes inn finnes igjen i lista og på detaljsida.
- Komponenttester: skjemaet og knappene i `src/components/__tests__/`, med
  klikk og feilmeldinger. De trenger DOM, og må ha denne linja helt øverst:

```ts
// @vitest-environment happy-dom
```

**Playwright** starter dev-serveren selv, åpner en ekte nettleser og klikker
seg gjennom forsiden. Tregere, så bruk den på de viktige flytene.

```bash
npx playwright install chromium   # bare første gang
npm run test:e2e
```

## Valg vi tok

- **Server-komponenter som standard.** Sidene henter data selv på serveren.
  `"use client"` bare der det er state eller klikk: skjemaene og knappene.
- **Server actions for skriving, med autorisasjon i handleren.** Hver action
  henter `ctx.user` og spør `src/lib/sak-status.ts` om akkurat denne brukeren
  får gjøre akkurat dette med akkurat denne saken. Opprett sak har i tillegg
  et REST-endepunkt, fordi kursplanen krever ett.
- **Ett steg om gangen.** Statusmaskinen ligger i én fil, så sidene, actions
  og testene er enige om hva som er lov. Bare utleier endrer status, bare
  leietaker avbryter, og bare en åpen sak.
- **Engelsk i databasen, norsk på skjermen.** Verdiene og etikettene bor
  sammen i `src/lib/enums.ts`, så databasen, Zod og UI bruker samme liste.
- **SQLite i minnet i testene.** Samme migrasjoner som D1 kjører, uten å starte
  en worker. En integrasjonstest kjører på millisekunder.

## Når noe ikke virker

| Problem | Løsning |
| --- | --- |
| `/saker` sier «Ikke logget inn» | Logg inn, eller kjør `npm run seed` og bruk en av brukerne over |
| Porten er opptatt | Noe annet kjører på 5173. Stopp det, eller kjør `npm run dev -- --port 5174` |
| `npm run dev` starter ikke etter install | Installasjonen hoppet over byggesteg. Kjør install på nytt, og se etter en advarsel om install-scripts |
| TypeScript finner ikke `env.DB` | `npm run generate` |
| «No migrations to apply» | Du står i feil mappe, eller migrasjonen er ikke laget ennå |
| Adressesøket finner ingenting | Det går mot api.kartverket.no og trenger nett |
| Testene klager på `better-sqlite3` | Slett `node_modules`, installer på nytt |
| Rare feil etter en oppdatering | `npm run clean`, så start dev-serveren på nytt |
| Databasen er i en rar tilstand | Slett `.wrangler/`, kjør `migrate:dev` og `seed` |
| Playwright finner ingen nettleser | `npx playwright install chromium` |

## Om versjonene

Alle pakker er låst til **eksakte** versjoner, uten `^` og `~`. Da har alle på
gruppa nøyaktig det samme, og en oppdatering midt i semesteret kan ikke ødelegge
noe som virket i går.

To ting er verdt å vite hvis du spør en KI-modell om hjelp:

- **Drizzle.** Vi bruker versjon 1, som ligger under `rc` hos npm. Det npm
  kaller `latest` er fortsatt versjon 0, med et helt annet API. «Oppdater til
  siste» er altså en nedgradering her.
- **Tailwind 4.** All konfigurasjon skjer i CSS, i en `@theme`-blokk. Foreslår
  modellen en `tailwind.config.js`, svarer den for versjon 3.

`AGENTS.md` i denne mappa oppsummerer versjonene og reglene. Les den selv, og
pek KI-verktøyet på den.

## Dokumentasjon

- [docs/arbeidskrav.md](docs/arbeidskrav.md): hva prosjektet må oppfylle, hentet fra kursplanen i Canvas
- [docs/arkitektur.md](docs/arkitektur.md): arkitekturvalg og datamodellen, med begrunnelse
- [docs/hosting.md](docs/hosting.md): Cloudflare, D1, hemmeligheter og deploy fra GitHub Actions
- [KI-AVTALE.md](KI-AVTALE.md): gruppens avtale om bruk av KI. Skal ligge i repoet
- [GRUPPEKONTRAKT.md](GRUPPEKONTRAKT.md): gruppekontrakten emneansvarlig ber om

## Lenker

- Kursplan Webapplikasjoner: https://hiof.instructure.com/courses/11084/pages/webapp-kursplan
- Emneansvarligs live-repo (starter): https://github.com/mariuswallin/hiof-live-2026
- Appen i drift: https://fiksa.hiof-b05.workers.dev
- Mobilappen: https://github.com/herjoh/Mopilprogrammering_B05
