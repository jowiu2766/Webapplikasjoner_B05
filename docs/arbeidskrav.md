# Arbeidskrav · Webapplikasjoner (ITF31619)

Hentet fra kursplanen i Canvas (sist oppdatert der 14. august 2026). Kursplanen i Canvas gjelder alltid foran dette dokumentet.

- Kursplan: https://hiof.instructure.com/courses/11084/pages/webapp-kursplan
- Emneansvarligs live-repo med starter: https://github.com/mariuswallin/hiof-live-2026

## Ved innlevering

Utviklingsprosjektet er selve arbeidskravet. Det leveres i Canvas før prosjektpresentasjonen, sammen med rapporten. Dette må være på plass:

1. Applikasjonen kjører etter fremgangsmåten i README. Kjører den ikke, er den ikke levert
2. Få feil, ingen kritiske. Terminal og konsoll rimelig rene på hovedflyten
3. All nødvendig kode er med. Ikke `node_modules`, byggemapper eller hemmeligheter
4. `.git`-mappen er med, og GitHub-repoet er offentlig ved innlevering. Lenken står i rapporten
5. KI-bruken er dokumentert, se [KI-AVTALE.md](../KI-AVTALE.md)
6. Rapporten dekker de seks punktene under
7. Form og rammeverk følger undervisningen, i siste versjon. Annet må godkjennes på forhånd
8. Alle har bidratt. Vurderes ut fra git-historikken: commits under eget navn, fordelt gjennom semesteret. Én stor sluttcommit er verre enn mange små

Alle på gruppen skal kunne forklare koden og gjøre en liten endring på stedet under presentasjonen.

### Frister

| Når | Hva |
| --- | --- |
| Uke 40, tirsdag 29. september | Sign off hos studentassistent (Khalil eller Aleks). Vis koden. Obligatorisk oppmøte |
| Før presentasjonen | Prosjekt og rapport levert i Canvas |
| Etter uke 45, datoer annonseres | Prosjektpresentasjon, 10 til 15 min inkludert KI-bruk og en liten endring i koden. Absolutt frist, ingen ny sjanse |

Lyntale (trukket uke fra uke 37) og retrospekt (trekkes i timen) kommer i tillegg.

### Rapporten (maks 3 A4-sider, én per gruppe)

1. Kort om prosjektet: hva applikasjonen er, og hva målet var
2. Arkitekturvalg: hva vi valgte og hvorfor
3. Bruk av KI: hvilke verktøy, til hva, og hva vi sitter igjen med
4. Utfordringer: hva som gikk galt, og hvordan vi løste det
5. Gruppearbeidet: fordeling og samarbeid, ærlig
6. Læringsutbytte: hva vi kan nå som vi ikke kunne i august

## Teknisk minstekrav

| Område | Krav |
| --- | --- |
| Stack | RedwoodSDK på Cloudflare med server- og klientkomponenter. Next.js eller TanStack Start godtas også, i siste versjon |
| Database | Drizzle mot D1, med et skjema vi har designet selv |
| API | Minst ett endepunkt etter REST-praksis: ressursbasert URL, riktig HTTP-metode, riktig statuskode også når det går galt |
| Skriving av data | Server actions med autorisasjonssjekk i handleren |
| Innlogging | better-auth eller tilsvarende, minst én beskyttet rute |
| Hovedflyt | Én flyt ende til ende: logg inn, lag noe, se det igjen |
| Tester | Vitest, minst én integrasjonstest av hovedflyten, og minst 50 % dekning målt med `npm run test:coverage` |
| README | Hvordan appen startes, og hvordan testene og dekningen kjøres |

Deploy til Cloudflare er anbefalt, ikke et krav.

Status i repoet nå: stack, Drizzle/D1 med lokal database, Vitest med dekning, README og CI er på plass. Tabellene i `src/db/schema/` er eksempler fra starteren og skal byttes ut med vår egen datamodell. Dekningen med eksempeltestene er rundt 20 %; kravet er 50 % ved innlevering.

## Hva som vurderes

React med RedwoodSDK og et bevisst skille mellom server- og klientkomponenter, TypeScript (særlig props, typer på data som krysser grenser, funksjoner og state), rammeverket og rutingen, oppbygning av brukergrensesnitt, datalagring med eget skjema, design patterns fra undervisningen, refaktorering, kodekvalitet og konsistens. I tillegg: responsivt design, innhenting fra eksterne kilder, begrunnede bibliotekvalg, hva testene faktisk tester, og autentisering og autorisering.
