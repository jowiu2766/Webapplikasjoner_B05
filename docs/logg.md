# Utviklingslogg · webapp

Kort og datert: hva som ble gjort, hva som gikk galt, og hvordan det ble løst. Råstoff til «Utfordringer» og «Læringsutbytte» i rapporten, og til sign off i uke 40.

## 2026-09-16

- Hosting satt opp etter `docs/hosting.md`: Cloudflare-konto (Jo), `wrangler login`, D1-databasen `fiksa-db` opprettet og id lagt i `wrangler.jsonc`, API-token og Account ID lagt som hemmeligheter i GitHub
- Første Deploy-kjøring i Actions feilet: «You need to register a workers.dev subdomain». Subdomenet ble registrert av at vi åpnet Workers & Pages i dashbordet, og neste kjøring gikk gjennom. Notert i hosting.md
- Appen ligger på https://fiksa.hiof-b05.workers.dev. `/api/status` svarer JSON. Subdomenet ble byttet fra Jos brukernavn til `hiof-b05` i Cloudflare-dashbordet (Workers & Pages, Account details, Subdomain)
- Konsollen på forsiden viser React-feil #418 (hydreringsavvik). Den kommer fra starterens `TimeClient`, som med vilje viser ulik tid på server og klient, og forsvinner når vi bytter ut `Home.tsx`. Kursplanen krever ren konsoll på hovedflyten, så ikke ta med komponenten videre

## 2026-09-10

- Repoet satt opp fra emneansvarligs starter (`webapp/starter` i hiof-live-2026, commit 8d9b280), renamet til Fiksa. Vi bruker npm, ikke pnpm, så pnpm-filene er tatt ut. Lokal D1-database migrert. GitHub Actions kjører typesjekk og tester, og deployer `main` til Cloudflare når hemmelighetene er satt
- Tabellene i `src/db/schema/` er eksempler fra starteren og skal byttes ut med vår egen datamodell
- Dekningen med eksempeltestene er rundt 20 %. Kravet er 50 % ved innlevering
