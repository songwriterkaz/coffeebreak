import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import worker, { checkoutBody, sandboxReady, rememberedEvent, verifyStripeSignature } from "./worker.js";

if (!globalThis.crypto) globalThis.crypto = webcrypto;

assert.equal(sandboxReady({}), false);
assert.equal(sandboxReady({ STRIPE_RESTRICTED_KEY: "sk_live_x", STRIPE_WEBHOOK_SECRET: "whsec_x" }), false);
assert.equal(sandboxReady({ STRIPE_RESTRICTED_KEY: "rk_test_x", STRIPE_WEBHOOK_SECRET: "whsec_x" }), true);

const fields = checkoutBody("tip-5");
assert.equal(fields.get("line_items[0][price_data][unit_amount]"), "500");
assert.equal(fields.get("line_items[0][price_data][product_data][name]"), "Coffeebreak tip");
assert.equal(fields.get("mode"), "payment");
assert.equal([...fields.keys()].some((k) => k.includes("application_fee") || k.includes("transfer_data") || k.includes("automatic_tax")), false);
assert.equal(checkoutBody("flat-white"), null);

const env = { STRIPE_RESTRICTED_KEY: "rk_test_example", STRIPE_WEBHOOK_SECRET: "whsec_example" };
const blocked = await worker.fetch(new Request("https://pay.example/checkout", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ productId: "tip-5" })
}), {});
assert.equal(blocked.status, 403);

let called = null;
const fakeFetch = async (url, opts) => {
  called = { url, body: opts.body.toString(), auth: opts.headers.authorization };
  return { ok: true, json: async () => ({ url: "https://checkout.stripe.com/c/pay/cs_test_example" }) };
};
const opened = await worker.fetch(new Request("https://pay.example/checkout", {
  method: "POST",
  headers: { "content-type": "application/json", origin: "https://songwriterkaz.github.io" },
  body: JSON.stringify({ productId: "tip-10", amountCents: 1 })
}), env, { fetchImpl: fakeFetch });
const openedBody = await opened.json();
assert.equal(opened.status, 200);
assert.equal(openedBody.mode, "test");
assert.equal(openedBody.url.includes("cs_test_"), true);
const sent = new URLSearchParams(called.body);
assert.equal(called.url, "https://api.stripe.com/v1/checkout/sessions");
assert.equal(sent.get("line_items[0][price_data][unit_amount]"), "1000");
assert.equal(sent.get("line_items[0][price_data][product_data][name]"), "Coffeebreak tip");
assert.equal(called.body.includes("amountCents"), false);
assert.equal(called.body.includes("application_fee"), false);
assert.equal(called.body.includes("transfer_data"), false);
assert.equal(called.auth, "Basic " + Buffer.from("rk_test_example:").toString("base64"));

const coffee = await worker.fetch(new Request("https://pay.example/checkout", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ productId: "flat-white" })
}), env, { fetchImpl: fakeFetch });
assert.equal(coffee.status, 400);

const secret = "whsec_example";
const raw = JSON.stringify({ id: "evt_1", type: "checkout.session.completed", data: { object: { payment_status: "paid" } } });
const t = String(Math.floor(Date.now() / 1000));
const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(t + "." + raw));
const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
const hook = await worker.fetch(new Request("https://pay.example/webhook", {
  method: "POST",
  headers: { "stripe-signature": "t=" + t + ",v1=" + hex },
  body: raw
}), env);
const hookBody = await hook.json();
assert.equal(hook.status, 200);
assert.equal(hookBody.verified, true);
assert.equal(hookBody.paymentStatus, "paid");
assert.equal(hookBody.fulfillment, "not promised");
assert.equal(rememberedEvent("evt_1").type, "checkout.session.completed");
const again = await worker.fetch(new Request("https://pay.example/webhook", {
  method: "POST",
  headers: { "stripe-signature": "t=" + t + ",v1=" + hex },
  body: raw
}), env);
assert.equal((await again.json()).duplicate, true);
assert.equal(await verifyStripeSignature(raw, "t=" + t + ",v1=00", secret), false);

const status = await worker.fetch(new Request("https://pay.example/status"), {});
const statusBody = await status.json();
assert.equal(statusBody.live, false);
assert.equal(statusBody.sandbox, false);
assert.equal(statusBody.tax, "off");

console.log("sandbox checkout tests passed");
