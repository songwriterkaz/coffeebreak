# Coffeebreak Deals voucher backend (free Cloudflare Worker)

Counts how many times each person uses each voucher, so limits such as "one per customer" work.

## What it stores
- A salted SHA-256 hash of the visitor IP (from the `CF-Connecting-IP` header). The raw IP is never saved.
- A random device ID made by the voucher page (stored in that browser).
- Per code: total uses, uses per IP hash, uses per device, and a log row (time, code, IP hash, device ID, order ref, total, discount). Log rows expire after about 400 days.
A "person" is counted as the higher of their IP-hash count and device count, so swapping wifi or browsers alone does not get around a limit. Shared IPs (a family or a cafe wifi) can block a second genuine customer, so set per-person limits with that in mind.

## Set up (free plan, nothing is deployed yet)
1. `npx wrangler login`
2. `npx wrangler kv namespace create DEALS` and paste the id into `wrangler.toml`
3. `npx wrangler secret put IP_SALT` (any long random text)
4. `npx wrangler secret put ADMIN_PASSWORD` (the organiser password)
5. `npx wrangler deploy`
6. Paste the Worker URL into Coffeebreak Deals > Organiser > Backend URL, and into the shop snippet (`CBDeals.API`).

The salt and password live only in Cloudflare secrets, never in code.

## Endpoints
- `POST /check` `{code,total,deviceId}` tells you whether a code is valid. It does not count a use.
- `POST /redeem` `{code,total,deviceId,order}` validates the code and counts one use.
- `GET/PUT/DELETE /admin/codes` creates, lists or deletes codes (`Authorization: Bearer <ADMIN_PASSWORD>`)
- `GET /admin/logs?code=X` returns the logs and per-person counts
- `GET /admin/export.csv` exports the log as CSV

Code fields: `code, type (percent|dollar|freeship|bundle|firstorder), value, label, starts, expires (YYYY-MM-DD), minOrder, maxTotal, maxPerPerson, firstOrder (true = 1 per person), active`.

## Limits
- KV is eventually consistent, so two redeems in the same second from different places could both pass. That is fine for a small shop, but it is not bank-grade.
- Free plan: 100,000 requests a day, and 1,000 KV writes a day (each redeem uses about 4 writes, so roughly 250 redeems a day).

## Privacy (Australian Privacy Principles)
IP addresses are checked in hashed form only, to stop voucher reuse. They are not sold or shared, and are not used for anything else.

## Test
`node test.mjs` runs the handler with mock requests and an in-memory KV.

Rights: Karen keeps all rights. Do not copy this or make your own versions.
