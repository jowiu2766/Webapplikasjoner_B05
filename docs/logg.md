# Utviklingslogg · webapp

Kort og datert: hva som ble gjort, hva som gikk galt, og hvordan det ble løst. Råstoff til «Utfordringer» og «Læringsutbytte» i rapporten, og til sign off i uke 40.

## 2026-09-10

- Repoet satt opp fra emneansvarligs starter (`webapp/starter` i hiof-live-2026, commit 8d9b280), renamet til Fiksa. Vi bruker npm, ikke pnpm, så pnpm-filene er tatt ut. Lokal D1-database migrert. GitHub Actions kjører typesjekk og tester, og deployer `main` til Cloudflare når hemmelighetene er satt
- Tabellene i `src/db/schema/` er eksempler fra starteren og skal byttes ut med vår egen datamodell
- Dekningen med eksempeltestene er rundt 20 %. Kravet er 50 % ved innlevering
