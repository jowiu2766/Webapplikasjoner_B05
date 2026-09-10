# Fiksa · produktidé

Fra gruppemøtet 10. september 2026. Dette er utgangspunktet, ikke en spesifikasjon. Oppdater når design og omfang er avklart.

## Idé

Fiksa samler dialogen mellom leietaker og utleier på ett sted. Fiksa alt lett.

## Funksjoner (idéer)

- Bilder og input: melde fra om noe, med bilde
- Kommunikasjon mellom leietaker og utleier
- Innboks
- Dokumentasjon: leiekontrakten kan lastes opp her
- Prioritering: hva haster

## Funksjonelle krav

- Autentisering. Kreves også av begge kursplanene: better-auth på web, auth-context med token i SecureStore på mobil

## Web og app

Webappen (RedwoodSDK på Cloudflare) og mobilappen (Expo) er to repoer. Hva som ligger hvor, avklares. API-et lager vi selv. Hvis ikke, avklarer vi hvordan vi strukturerer det.

## Hosting

GitHub (repoer og Actions) og Cloudflare (webappen). Ansvar: Jo. Oppskrift i `docs/hosting.md` i web-repoet.

## Åpne spørsmål til neste møte

- Ansvarsområder for Billal og Tuva, som kom inn i gruppen 10. september
- Rask første versjon av brukerdesign for appen
- Hva mobilappen skal dekke i første versjon
