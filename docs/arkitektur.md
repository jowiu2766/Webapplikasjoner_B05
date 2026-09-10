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

Kommer. Skjemaet skal være vårt eget (krav i kursplanen for Webapplikasjoner).
