# Coffee Break order backend (Cloudflare Worker, free plan)

Nothing here is deployed yet. This folder is NOT part of itch-upload.zip.

## What it does
1. When a customer taps "Send order", the shop emails the order to songwriterkaz@gmail.com (as before) AND posts it to this Worker. The Worker saves it in Cloudflare KV with status "awaiting payment". Prices are recalculated in the Worker so they can't be changed in the browser.
2. Karen opens `https://<worker>/organiser` and enters her organiser password. The password is checked against the ORGANISER_KEY secret, which is stored only in Cloudflare.
3. When the PayID payment shows in her Teachers Mutual Bank app with the matching reference (NIO-...) and amount, she taps **Payment received**. The Worker sends the order to Printful with her private token.
   - `CONFIRM_ORDERS="false"` (default): Printful **draft**. Nothing is charged until Karen confirms it in Printful.
   - `CONFIRM_ORDERS="true"`: the order is confirmed straight away and Printful charges her Printful billing method for production and shipping.

PayID payments can't be detected by an app, so step 3 needs one tap.

## Karen needs (all free)
- A Printful account (free), a billing method in Printful, and the 3 design PNGs from `designs/` hosted at a public URL (for example uploaded to the same itch page or Printful's file library; set DESIGN_BASE_URL).
- A Printful private token (Developer Portal: https://developers.printful.com/) with Orders access. It expires, so renew it when Printful says.
- The Printful catalog variant id for each product, size and colour, filled into `PRODUCTS` in worker.js (from https://api.printful.com/products/{id}). Orders with a missing variant id show an error instead of sending.
- A free Cloudflare account.

## Deploy (about 10 minutes)
```
npm i -g wrangler          # or use npx wrangler
npx wrangler login
npx wrangler kv namespace create ORDERS     # paste the id into wrangler.toml
npx wrangler secret put ORGANISER_KEY       # pick a long password
npx wrangler secret put PRINTFUL_TOKEN      # paste the Printful private token
npx wrangler deploy
```
Then put the Worker URL into `orderEndpoint` in index.html's SHOP_CONFIG, set ALLOWED_ORIGIN in wrangler.toml to the shop's address, and rebuild the zip.

## Limits (free plan)
- Workers: 100,000 requests/day. KV: 1,000 writes/day, 1,000 list operations/day, 1 GB. These are far beyond a small shop.
- Shipping is not added automatically. The shop shows shipping as confirmed by email.
- The organiser lists the latest 100 orders.
