# Vocal Social server

Cloudflare Worker `cb-vocal-social` on the free plan, at https://cb-vocal-social.coffeebreaks.workers.dev

- `worker.js`: the API (profiles, posts, feeds, likes, comments, follows, reports, audio).
- `schema.sql`: the D1 tables.
- Bindings: `DB` (D1 database `cb-vocal-social`) and `AUDIO` (KV namespace `cb-vocal-social-audio`, song MP3s).

No secrets are stored here. Each visitor gets a random token kept in their browser, and only its SHA-256 hash is stored on the server.

Text walls (a post on someone's wall, also listed in the channel newsfeed) are in `worker.js` under `/api/walls`. They need `schema-walls.sql`. Song posts still require MP3 audio on `/api/posts`.

From the repo root, after `npx wrangler login` and with the existing `DB` and `AUDIO` bindings:

```
npx wrangler d1 execute cb-vocal-social --remote --file=apps/vocal-social/server/schema-walls.sql
npx wrangler deploy apps/vocal-social/server/worker.js --name cb-vocal-social
```

Until that deploy is done, the live API does not accept text posts. The pages keep those notes in the browser and label them "On this device for now".
