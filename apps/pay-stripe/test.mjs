import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { blockers, feeCents, verifyStripeSignature } from "./worker.js";

if (!globalThis.crypto) globalThis.crypto = webcrypto;

const empty = blockers({});
assert.equal(empty.ready, false);
assert.ok(empty.missing.some((m) => m.includes("PLATFORM_FEE_BPS")));
assert.ok(empty.missing.some((m) => m.includes("SELLERS")));
assert.ok(empty.missing.some((m) => m.includes("CHECKOUT_ENABLED")));

const ready = blockers({
  STRIPE_SECRET_KEY: "sk_test_example",
  STRIPE_WEBHOOK_SECRET: "whsec_example",
  PLATFORM_FEE_BPS: "250",
  SELLERS: JSON.stringify({ cafe: "acct_example" }),
  CHECKOUT_ENABLED: "true"
});
assert.equal(ready.ready, true);
assert.equal(ready.mode, "test");
assert.equal(feeCents(1600, "250"), 40);

assert.throws(() => feeCents(1600, ""), /unavailable/);

const secret = "whsec_test";
const raw = JSON.stringify({ type: "checkout.session.completed" });
const t = "1700000000";
const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(t + "." + raw));
const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
assert.equal(await verifyStripeSignature(raw, "t=" + t + ",v1=" + hex, secret, 1700000000 * 1000), true);
assert.equal(await verifyStripeSignature(raw, "t=" + t + ",v1=00", secret, 1700000000 * 1000), false);
assert.equal(await verifyStripeSignature(raw, "t=" + t + ",v1=" + hex, secret, (1700000000 + 400) * 1000), false);

const worker = (await import("./worker.js")).default;
const status = await worker.fetch(new Request("https://pay.example/status"), {});
const body = await status.json();
assert.equal(body.checkout, "unavailable");
assert.equal(body.ready, false);
assert.equal(body.holdsMoney, false);

const refused = await worker.fetch(new Request("https://pay.example/checkout", {
  method: "POST",
  headers: { "content-type": "application/json", origin: "https://songwriterkaz.github.io" },
  body: JSON.stringify({ sellerKey: "cafe", item: "Flat white", amountCents: 1050 })
}), {});
assert.equal(refused.status, 403);
const refusedBody = await refused.json();
assert.equal(refusedBody.checkout, "unavailable");
assert.ok(!("url" in refusedBody));

console.log("pay-stripe tests passed");
