#!/bin/bash
# Run AFTER `npx wrangler login` (Cloudflare free account, no card). Deploys, sets secret, points app at the live URL, tests, rebuilds the itch zip.
set -euo pipefail
cd "$(dirname "$0")"
npx wrangler whoami | grep -qi "associated with the email" || { echo "Not logged in to Cloudflare"; exit 1; }
tr -d '\n' < /workspace/private/sanity-token.txt | npx wrangler secret put SANITY_TOKEN
OUT=$(npx wrangler deploy 2>&1); echo "$OUT" | grep -v -i token
URL=$(echo "$OUT" | grep -o 'https://coffeebreak-tube-share\.[a-z0-9-]*\.workers\.dev' | head -1)
[ -n "$URL" ] || { echo "No workers.dev URL found (claim a workers.dev subdomain in the dashboard first)"; exit 1; }
curl -fs "$URL/?a=ping" | grep -q '"ok":true' && echo "PING OK $URL"
cd /workspace/coffeebreak-tube
sed -i "s#https://coffeebreak-tube-share\.CF_SUBDOMAIN\.workers\.dev/#$URL/#" index.html dist/index.html test/two_devices.py
grep -q "$URL" dist/index.html
(cd dist && python3 -m http.server 3333 --bind 127.0.0.1 >/tmp/dist.log 2>&1 &) ; sleep 1
(cd test && python3 two_devices.py "http://localhost:3333/index.html?api=$URL/") | tee /tmp/cbt-live-test.log | grep -E "^(PASS|FAIL|EXC)"
pkill -f "http.server 3333" || true
grep -q -E "^(FAIL|EXC)" /tmp/cbt-live-test.log && { echo "Tests failed, zip NOT rebuilt"; exit 1; }
rm -f coffeebreak-tube-itch.zip && (cd dist && zip -q -X ../coffeebreak-tube-itch.zip index.html sw.js manifest.json logo.png icon-192.png icon-512.png)
echo "Rebuilt coffeebreak-tube-itch.zip pointing at $URL"
