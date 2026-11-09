import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { blockers, verifyStripeSignature } from "./worker.js";

if (!globalThis.crypto) globalThis.crypto = webcrypto;

const empty = blockers({});
assert.equal(empty.ready, false);
assert.ok(empty.missing.some((m) => m.includes("CHARGE_PATTERN")));
assert.ok(empty.missing.some((m) => m.includes("PLATFORM_FEE_BPS")));
assert.ok(empty.missing.some((m) => m.includes("rk_test_")));

const filled = blockers({
  STRIPE_RESTRICTED_KEY: "rk_test_example",
  STRIPE_WEBHOOK_SECRET: "whsec_example",
  CHARGE_PATTERN: "direct",
  PLATFORM_FEE_BPS: "250",
  SELLERS: JSON.stringify({ cafe: "acct_example" })
});
assert.equal(filled.ready, false);
assert.equal(filled.sandbox, true);
assert.ok(filled.missing.some((m) => m.includes("not activated")));

const secret = "whsec_test";
const raw = JSON.stringify({ type: "checkout.session.completed" });
const t = "1700000000";
const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(t + "." + raw));
const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
assert.equal(await verifyStripeSignature(raw, "t=" + t + ",v1=" + hex, secret, 1700000000 * 1000), true);
assert.equal(await verifyStripeSignature(raw, "t=" + t + ",v1=" + hex, secret, (1700000000 + 400) * 1000), false);

const worker = (await import("./worker.js")).default;
const status = await worker.fetch(new Request("https://pay.example/status"), {});
const body = await status.json();
assert.equal(body.checkout, "unavailable");
assert.equal(body.chargePattern, "not selected");
assert.equal(body.tax, "off");
assert.equal(JSON.stringify(body).includes("rk_test_example"), false);

const refused = await worker.fetch(new Request("https://pay.example/checkout", {
  method: "POST",
  headers: { "content-type": "application/json", origin: "https://songwriterkaz.github.io" },
  body: JSON.stringify({ item: "Flat white", amountCents: 1050 })
}), { STRIPE_RESTRICTED_KEY: "rk_test_example", STRIPE_WEBHOOK_SECRET: "whsec_example" });
assert.equal(refused.status, 403);
const refusedBody = await refused.json();
assert.equal(refusedBody.checkout, "unavailable");
assert.equal("url" in refusedBody, false);

console.log("pay-stripe hold tests passed");
