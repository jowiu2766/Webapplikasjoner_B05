# Hosting · Cloudflare og GitHub Actions

Ansvar: Jo. Webappen kjører som en Cloudflare Worker med D1 (SQLite) som database. Gratisnivået holder for prosjektet. Deploy skjer automatisk fra GitHub Actions når `main` oppdateres, se `.github/workflows/deploy.yml`. Workflowen hopper over seg selv til hemmelighetene under er på plass.

Lokalt trengs ingen konto: `npm run dev` bruker en lokal database under `.wrangler/`.

## Engangsoppsett

1. **Cloudflare-konto.** Opprett en gratis konto på cloudflare.com. Noter Account ID (står i høyre marg på dashbordet, og under Workers & Pages).
2. **Logg inn lokalt** og lag databasen:

   ```bash
   npx wrangler login
   npx wrangler d1 create fiksa-db
   ```

   Svaret inneholder en `database_id`. Lim den inn i `wrangler.jsonc` der det står `__change_me__`, og commit. Uten den feiler deploy.
3. **API-token.** Cloudflare-dashbordet, My Profile, API Tokens, Create Token. Bruk malen «Edit Cloudflare Workers» og legg til `D1: Edit` under Account. Kopier tokenet med en gang, det vises bare én gang.
4. **Hemmeligheter i GitHub.** Repoet, Settings, Secrets and variables, Actions, New repository secret:

   | Navn | Verdi |
   | --- | --- |
   | `CLOUDFLARE_API_TOKEN` | tokenet fra steg 3 |
   | `CLOUDFLARE_ACCOUNT_ID` | Account ID fra steg 1 |

5. **Første deploy.** Push til `main`, eller kjør workflowen Deploy manuelt fra Actions-fanen (Run workflow). Appen får adressen `https://fiksa.<ditt-subdomene>.workers.dev`. Navnet `fiksa` kommer fra `name` i `wrangler.jsonc`.

## Hemmeligheter for selve appen

Verdier appen trenger i produksjon settes med wrangler, aldri i `wrangler.jsonc` (som ligger i git):

```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put BETTER_AUTH_URL
```

Lokalt ligger de samme verdiene i `.dev.vars` (gitignorert), se `.dev.vars.example`. `BETTER_AUTH_SECRET` lages med `openssl rand -hex 32`.

## Daglig bruk

| Hva | Hvordan |
| --- | --- |
| Deploy | push til `main`. Actions-fanen viser status |
| Deploy for hånd | `npm run release` (bygger og kjører `wrangler deploy` lokalt) |
| Ny migrasjon i skyen | kjøres av deploy-workflowen. For hånd: `npm run migrate:prod` |
| Logger fra produksjon | `npx wrangler tail` |
| Slette og starte på nytt | `npx wrangler d1 delete fiksa-db`, så steg 2 på nytt |

## Når noe ikke virker

| Problem | Løsning |
| --- | --- |
| Deploy-jobben står som «skipped» | Hemmelighetene i steg 4 mangler eller heter noe annet |
| «invalid database id» | `database_id` i `wrangler.jsonc` er ikke byttet ut |
| Token avvist | Tokenet mangler D1-rettighet, eller er utløpt. Lag nytt |
| Migrasjon feiler i skyen | Kjør `npm run migrate:prod` lokalt og les feilmeldingen. Migrasjoner endres aldri i ettertid, legg til en ny |
