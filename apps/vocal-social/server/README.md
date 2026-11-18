# Vocal Social server

Cloudflare Worker `cb-vocal-social` on the free plan, at https://cb-vocal-social.coffeebreaks.workers.dev

- `worker.js`: the API (profiles, posts, feeds, likes, comments, follows, reports, audio).
- `schema.sql`: the D1 tables.
- Bindings: `DB` (D1 database `cb-vocal-social`) and `AUDIO` (KV namespace `cb-vocal-social-audio`, song MP3s).

No secrets are stored here. Each visitor gets a random token kept in their browser, and only its SHA-256 hash is stored on the server.
