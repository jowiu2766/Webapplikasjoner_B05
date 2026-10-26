-- testdata for prod, samme innhold som src/db/seed.ts
-- kjør fra repo-rota: npx wrangler d1 execute DB --remote --file=drizzle/seed.sql

DELETE FROM messages;
DELETE FROM cases;
DELETE FROM tasks;
DELETE FROM users;

INSERT INTO users (id, name, email, role) VALUES
  (1, 'Kari Nordmann', 'kari@example.com', 'tenant'),
  (2, 'Ola Utleier', 'ola@example.com', 'landlord');

INSERT INTO cases (id, title, description, category, priority, deadline, status, tenant_id, landlord_id, created_at) VALUES
  ('seed-sak-1', 'Vannlekkasje under kjøkkenvasken', 'Det drypper fra røret under vasken. Har satt en bøtte under.', 'pipes', 'high', strftime('%s', 'now', '+3 days'),'open', 1, 2, strftime('%s', 'now', '-1 days')),
  ('seed-sak-2', 'Stikkontakten på badet virker ikke', 'Ingen strøm i kontakten ved speilet. Sikringen er sjekket.', 'electricity', 'medium', strftime('%s', 'now', '+5 days'), 'in_progress', 1, 2, strftime('%s', 'now', '-5 days')),
  ('seed-sak-3', 'Maur i kjøkkenskapet', 'Små svarte maur kommer inn ved vinduet over benken.', 'pests', 'low', strftime('%s', 'now', '+12 days'),'pending', 1, 2, strftime('%s', 'now', '-12 days')),
  ('seed-sak-4', 'Dørlåsen henger', 'Nøkkelen må vris hardt for å få opp ytterdøra.', 'maintenance', 'medium', strftime('%s', 'now', '+2 days'), 'closed', 1, 2, strftime('%s', 'now', '-30 days'));
INSERT INTO cases (id, title, description, category, priority, status, tenant_id, landlord_id, created_at) VALUES
  ('seed-sak-1', 'Vannlekkasje under kjøkkenvasken', 'Det drypper fra røret under vasken. Har satt en bøtte under.', 'pipes', 'high', 'open', 1, 2, strftime('%s', 'now', '-1 days')),
  ('seed-sak-2', 'Stikkontakten på badet virker ikke', 'Ingen strøm i kontakten ved speilet. Sikringen er sjekket.', 'electricity', 'medium', 'in_progress', 1, 2, strftime('%s', 'now', '-5 days')),
  ('seed-sak-3', 'Maur i kjøkkenskapet', 'Små svarte maur kommer inn ved vinduet over benken.', 'pests', 'low', 'pending', 1, 2, strftime('%s', 'now', '-12 days')),
  ('seed-sak-4', 'Dørlåsen henger', 'Nøkkelen må vris hardt for å få opp ytterdøra.', 'maintenance', 'medium', 'closed', 1, 2, strftime('%s', 'now', '-30 days'));

INSERT INTO messages (id, case_id, sender_id, body, created_at) VALUES
  ('seed-melding-1', 'seed-sak-1', 2, 'Takk, jeg ringer rørleggeren i morgen tidlig.', strftime('%s', 'now', '-23 hours')),
  ('seed-melding-2', 'seed-sak-1', 1, 'Flott. Jeg er hjemme etter klokka 15.', strftime('%s', 'now', '-22 hours'));
