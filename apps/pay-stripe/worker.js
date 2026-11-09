// Own-brand sandbox Checkout only. Not Connect. Not live.
// Docs: https://docs.stripe.com/checkout/quickstart
// https://docs.stripe.com/webhooks/signature
// https://docs.stripe.com/keys#limit-access
// Amounts are fixed on the server. The browser cannot name a price.
// No secret values belong in this file.

const ALLOWED_ORIGIN = "https://songwriterkaz.github.io";
const SUCCESS = "https://songwriterkaz.github.io/coffeebreak/apps/pay/stripe.html?result=success&session_id={CHECKOUT_SESSION_ID}";
const CANCEL = "https://songwriterkaz.github.io/coffeebreak/apps/pay/stripe.html?result=cancel";

// Fixed tips already offered on the PayID page. Not a physical coffee order.
export const CATALOG = {
  "tip-5": { name: "Coffeebreak tip", amountCents: 500 },
  "tip-10": { name: "Coffeebreak tip", amountCents: 1000 },
  "tip-20": { name: "Coffeebreak tip", amountCents: 2000 }
};

const verified = new Map();

export function sandboxReady(env) {
  const key = (env && env.STRIPE_RESTRICTED_KEY) || "";
  return key.startsWith("rk_test_") && !key.includes("live") && !!(env && env.STRIPE_WEBHOOK_SECRET);
}

export function checkoutBody(productId) {
  const item = CATALOG[productId];
  if (!item) return null;
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", "aud");
  body.set("line_items[0][price_data][unit_amount]", String(item.amountCents));
  body.set("line_items[0][price_data][product_data][name]", item.name);
  body.set("success_url", SUCCESS);
  body.set("cancel_url", CANCEL);
  return body;
}

export async function verifyStripeSignature(raw, header, secret, now) {
  if (!secret || !header) return false;
  const parts = Object.fromEntries(String(header).split(",").map(function (p) {
    const i = p.indexOf("=");
    return [p.slice(0, i), p.slice(i + 1)];
  }));
  const timestamp = parts.t;
  const signed = parts.v1;
  if (!timestamp || !signed || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs((now || Date.now()) / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp + "." + raw));
  const hex = [...new Uint8Array(mac)].map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  if (hex.length !== signed.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signed.charCodeAt(i);
  return diff === 0;
}

function json(body, status, origin) {
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
  if (origin === ALLOWED_ORIGIN) {
    headers["access-control-allow-origin"] = origin;
    headers.vary = "Origin";
  }
  return new Response(JSON.stringify(body), { status: status, headers: headers });
}

async function openSession(env, productId, fetchImpl) {
  const body = checkoutBody(productId);
  if (!body) return { status: 400, payload: { error: "Unknown product. Coffee and other goods are not for sale here." } };
  const response = await fetchImpl("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: "Basic " + btoa(env.STRIPE_RESTRICTED_KEY + ":"),
      "content-type": "application/x-www-form-urlencoded"
    },
    body: body
  });
  const data = await response.json();
  if (!response.ok || !data.url) return { status: 502, payload: { error: "Stripe did not open a test Checkout Session." } };
  return { status: 200, payload: { url: data.url, mode: "test" } };
}

export function rememberedEvent(id) {
  return verified.get(id) || null;
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("origin");
    const fetchImpl = (ctx && ctx.fetchImpl) || fetch;
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: origin === ALLOWED_ORIGIN ? {
          "access-control-allow-origin": origin,
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
          vary: "Origin"
        } : {}
      });
    }
    const url = new URL(request.url);
    const ready = sandboxReady(env || {});
    if (url.pathname === "/status" && request.method === "GET") {
      return json({
        checkout: ready ? "sandbox" : "unavailable",
        live: false,
        sandbox: ready,
        chargePattern: "own-brand Checkout only; Connect is not configured",
        tax: "off",
        products: Object.keys(CATALOG),
        holdsMoney: false,
        payid: "optional manual bank transfer, not instant"
      }, 200, origin);
    }
    if (url.pathname === "/checkout" && request.method === "POST") {
      if (!ready) return json({ checkout: "unavailable", live: false, reason: "Sandbox restricted key or webhook secret is missing." }, 403, origin);
      let input = {};
      try { input = await request.json(); } catch (e) { return json({ error: "JSON body required." }, 400, origin); }
      const opened = await openSession(env, input.productId, fetchImpl);
      return json(opened.payload, opened.status, origin);
    }
    if (url.pathname === "/webhook" && request.method === "POST") {
      if (!env || !env.STRIPE_WEBHOOK_SECRET) return json({ error: "Webhook secret is not set." }, 503, origin);
      const raw = await request.text();
      const ok = await verifyStripeSignature(raw, request.headers.get("stripe-signature"), env.STRIPE_WEBHOOK_SECRET);
      if (!ok) return json({ error: "Signature did not match." }, 400, origin);
      let event = {};
      try { event = JSON.parse(raw); } catch (e) { return json({ error: "Event was not JSON." }, 400, origin); }
      const id = event.id || "";
      if (id && verified.has(id)) return json({ received: true, verified: true, duplicate: true, type: event.type || "" }, 200, origin);
      const state = {
        verified: true,
        type: event.type || "",
        paymentStatus: event.data && event.data.object ? event.data.object.payment_status || "" : "",
        fulfillment: "not promised"
      };
      if (id) verified.set(id, state);
      return json(Object.assign({ received: true, duplicate: false }, state), 200, origin);
    }
    return json({ error: "Not found." }, 404, origin);
  }
};
