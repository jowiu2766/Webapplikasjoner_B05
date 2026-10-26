# Fiksa · webapp

Fiksa samler dialogen mellom leietaker og utleier på ett sted. Fiksa alt lett.

Webappen til Fiksa, prosjektet til gruppe B05 i Webapplikasjoner (ITF31619) ved
Høgskolen i Østfold høsten 2026. Mobilappen ligger i et eget repo:
https://github.com/herjoh/Mopilprogrammering_B05.

Bygget på emneansvarligs startprosjekt (RedwoodSDK · React 19 · Vite 8 ·
TypeScript 7 · Tailwind 4 · Drizzle + D1 · Zod 4 · Vitest · Playwright ·
Cloudflare Workers). GitHub Actions kjører typesjekk og tester på hver push, og
deployer `main` til Cloudflare når hemmelighetene er på plass, se
`docs/hosting.md`.

## Krav

| | Versjon | Sjekk med |
| --- | --- | --- |
| Node.js | 22.12 eller nyere | `node -v` |
| npm | følger med Node | `npm -v` |

Vi bruker npm. Cloudflare-konto trengs ikke for å komme i gang, databasen
kjører lokalt.

## Kom i gang

```bash
npm install
npm run migrate:dev    # lager tabellene i den lokale databasen
npm run dev
```

Åpne `http://localhost:5173`. `npm run seed` legger inn litt testdata.

## Hva som ligger her

```
src/
├─ worker.tsx              inngangspunktet. Her registreres alle ruter
├─ client.tsx              starter React i nettleseren
├─ app/
│  ├─ Document.tsx         HTML-skallet rundt alle sider
│  ├─ headers.ts           sikkerhetsheadere, blant annet CSP
│  ├─ styles.css           én linje: @import "tailwindcss"
│  └─ pages/Home.tsx       forsiden. En server-komponent
├─ components/
│  ├─ MeldingForm.tsx      en klient-komponent ("use client")
│  └─ __tests__/           komponenttest med Testing Library
├─ db/
│  ├─ schema/              tabellene. Eksempel: users og tasks, skal byttes ut
│  ├─ relations.ts         relasjonene mellom tabellene
│  ├─ index.ts             databaseklienten
│  └─ seed.ts              testdata
├─ lib/id.ts               createId(), en id-generator
└─ test/setup-dom.ts       kjøres før hver testfil

e2e/                       Playwright-tester i ekte nettleser
drizzle/migrations/        én mappe per migrasjon. Slett aldri en gammel
public/                    statiske filer
```

Konfigurasjonen ligger i rota: `wrangler.jsonc` (hva appen har tilgang til),
`vite.config.mts`, `vitest.config.ts`, `playwright.config.ts`,
`drizzle.config.ts` og `tsconfig.json`.

**Tabellene i `src/db/schema/` er et eksempel fra starteren.** De skal byttes
ut med Fiksa sin egen datamodell. Kjør `npm run migrate:new` etterpå, og dere
har en ny migrasjon.

## Kommandoer

| Kommando | Hva den gjør |
| --- | --- |
| `npm run dev` | utviklingsserver på port 5173 |
| `npm run lint` | typesjekk med TypeScript |
| `npm test` | kjører testene én gang |
| `npm run test:watch` | kjører testene på nytt når dere lagrer |
| `npm run test:coverage` | tester med dekningsrapport (kravet er minst 50 %) |
| `npm run test:e2e` | Playwright i ekte nettleser |
| `npm run migrate:new` | lager en migrasjon fra `src/db/schema/` |
| `npm run migrate:dev` | kjører migrasjonene mot den lokale databasen |
| `npm run seed` | legger inn testdata |
| `npm run generate` | oppdaterer typene etter endring i `wrangler.jsonc` |
| `npm run build` | bygger for produksjon |

## Databasen

Databasen er **D1**, som er SQLite hos Cloudflare. Lokalt er den bare en fil
under `.wrangler/`, så dere trenger ingen konto for å jobbe.

Slik endrer dere datamodellen:

1. Endre eller legg til en tabell i `src/db/schema/`
2. `npm run migrate:new` lager en migrasjonsfil
3. `npm run migrate:dev` kjører den mot den lokale databasen

En migrasjon er en dagbok: dere **legger til** en ny, og redigerer aldri en som
har kjørt. Har databasen havnet i en rar tilstand, slett `.wrangler/` og kjør
migrasjonene og seed på nytt.

## Tester

**Vitest** er den dere bruker hele tiden. Rask, kjører i terminalen.

```bash
npm test
npm run test:coverage
```

Vanlige tester kjører i Node. Skal testen rendre en komponent, må fila ha denne
linja helt øverst:

```ts
// @vitest-environment happy-dom
```

Se `src/components/__tests__/MeldingForm.test.tsx` for et eksempel med klikk.

**Playwright** starter en ekte nettleser og klikker seg gjennom appen. Tregere,
så bruk den på de viktige flytene.

```bash
npx playwright install chromium   # bare første gang
npm run test:e2e
```

## Når noe ikke virker

| Problem | Løsning |
| --- | --- |
| Porten er opptatt | Noe annet kjører på 5173. Stopp det, eller kjør `npm run dev -- --port 5174` |
| `npm run dev` starter ikke etter install | Installasjonen hoppet over byggesteg. Kjør install på nytt, og se etter en advarsel om install-scripts |
| TypeScript finner ikke `env.DB` | `npm run generate` |
| «No migrations to apply» | Dere står i feil mappe, eller migrasjonen er ikke laget ennå |
| Testene klager på `better-sqlite3` | Slett `node_modules`, installer på nytt |
| Rare feil etter en oppdatering | `npm run clean`, så start dev-serveren på nytt |
| Databasen er i en rar tilstand | Slett `.wrangler/`, kjør `migrate:dev` og `seed` |
| Playwright finner ingen nettleser | `npx playwright install chromium` |

## Om versjonene

Alle pakker er låst til **eksakte** versjoner, uten `^` og `~`. Da har alle på
gruppa nøyaktig det samme, og en oppdatering midt i semesteret kan ikke ødelegge
noe som virket i går.

To ting er verdt å vite hvis dere spør en KI-modell om hjelp:

- **Drizzle.** Vi bruker versjon 1, som ligger under `rc` hos npm. Det npm
  kaller `latest` er fortsatt versjon 0, med et helt annet API. «Oppdater til
  siste» er altså en nedgradering her.
- **Tailwind 4.** All konfigurasjon skjer i CSS, i en `@theme`-blokk. Foreslår
  modellen en `tailwind.config.js`, svarer den for versjon 3.

`AGENTS.md` i denne mappa oppsummerer versjonene og reglene. Les den selv, og
pek KI-verktøyet på den.

## Dokumentasjon

- [docs/arbeidskrav.md](docs/arbeidskrav.md): hva prosjektet må oppfylle, hentet fra kursplanen i Canvas
- [docs/hosting.md](docs/hosting.md): Cloudflare, D1, hemmeligheter og deploy fra GitHub Actions
- [docs/produkt.md](docs/produkt.md): produktidéen fra gruppemøtet
- [docs/arkitektur.md](docs/arkitektur.md): arkitekturvalg med begrunnelse
- [docs/logg.md](docs/logg.md): utviklingslogg, råstoff til rapporten
- [docs/rapport.md](docs/rapport.md): rapportskjelett, de seks punktene fra kursplanen
- [docs/moter/](docs/moter/): møtereferater
- [KI-AVTALE.md](KI-AVTALE.md): gruppens avtale om bruk av KI. Skal ligge i repoet
- [GRUPPEKONTRAKT.md](GRUPPEKONTRAKT.md): gruppekontrakten emneansvarlig ber om

## Lenker

- Kursplan Webapplikasjoner: https://hiof.instructure.com/courses/11084/pages/webapp-kursplan
- Emneansvarligs live-repo (starter): https://github.com/mariuswallin/hiof-live-2026
- Mobilappen: https://github.com/herjoh/Mopilprogrammering_B05
