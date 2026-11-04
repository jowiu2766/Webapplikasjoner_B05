-- Testdata for databasen i skyen. Samme brukere og saker som seed.ts.
-- Kjør med: npm run seed:prod
-- Tømmer først, så den kan kjøres om igjen.
DELETE FROM messages;
DELETE FROM cases;
DELETE FROM session;
DELETE FROM user;

INSERT INTO user (id, name, email, password_hash, role, address) VALUES
  ('demo-leietaker', 'kari_leietaker', 'kari@fiksa.no', '188a7a67e065e8aa5143ef8b0eba5164:9115cbb87bb3463fa050aa34a5c9ff67ebf7b3aeeec5c3b11a8b05ba0f038450820f1721ce4c128a08968047fb410bc4b2143d4e82c8967a46f05ccc4df200c3', 'Tenant', 'Testveien 1'),
  ('demo-utleier', 'ola_utleier', 'ola@fiksa.no', '6e05c92cd1839a91c3b07017c8b00238:48882a97d2a997660cc11ff1acac8a3a0eb95da73801c3e556111fecedc23b6f0f592bf30f9ba2ca330bb245c4987ac81346fbbe82fdc4e72bf9884f9570798b', 'Landlord', 'Testveien 2');

-- Tidspunkt i sekunder, slik Drizzle lagrer dem for saker og meldinger.
INSERT INTO cases (id, title, description, category, priority, deadline, status, tenant_id, landlord_id, created_at, updated_at) VALUES
  ('demo-sak-1', 'Vannlekkasje under kjøkkenvasken', 'Det drypper fra røret under vasken. Har satt en bøtte under.', 'pipes', 'high', unixepoch('now', '+3 days'), 'open', 'demo-leietaker', 'demo-utleier', unixepoch('now', '-1 day'), unixepoch('now', '-1 day')),
  ('demo-sak-2', 'Stikkontakten på badet virker ikke', 'Ingen strøm i kontakten ved speilet. Sikringen er sjekket.', 'electricity', 'medium', unixepoch('now', '+5 days'), 'in_progress', 'demo-leietaker', 'demo-utleier', unixepoch('now', '-5 days'), unixepoch('now', '-5 days')),
  ('demo-sak-3', 'Maur i kjøkkenskapet', 'Små svarte maur kommer inn ved vinduet over benken.', 'pests', 'low', unixepoch('now', '+12 days'), 'pending', 'demo-leietaker', 'demo-utleier', unixepoch('now', '-12 days'), unixepoch('now', '-12 days')),
  ('demo-sak-4', 'Dørlåsen henger', 'Nøkkelen må vris hardt for å få opp ytterdøra.', 'maintenance', 'medium', unixepoch('now', '+2 days'), 'closed', 'demo-leietaker', 'demo-utleier', unixepoch('now', '-30 days'), unixepoch('now', '-30 days'));

INSERT INTO messages (id, case_id, sender_id, body, created_at) VALUES
  ('demo-melding-1', 'demo-sak-1', 'demo-utleier', 'Takk, jeg ringer rørleggeren i morgen tidlig.', unixepoch('now', '-1 day', '+1 hour')),
  ('demo-melding-2', 'demo-sak-1', 'demo-leietaker', 'Flott. Jeg er hjemme etter klokka 15.', unixepoch('now', '-1 day', '+2 hours'));
