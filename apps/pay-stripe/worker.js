// Stripe Checkout + Connect destination charges.
// Docs: https://docs.stripe.com/connect/destination-charges
// Webhooks: https://docs.stripe.com/webhooks/signature
// No secret values belong in this file. Missing config refuses checkout.

const ALLOWED_ORIGIN = "https://songwriterkaz.github.io";
const PAGE_PREFIX = "https://songwriterkaz.github.io/coffeebreak/";

export function blockers(env) {
  const missing = [];
  const key = env.STRIPE_SECRET_KEY || "";
  if (!key) missing.push("STRIPE_SECRET_KEY is not set on the server.");
  else if (!/^sk_(test|live)_/.test(key)) missing.push("STRIPE_SECRET_KEY is not a Stripe secret key.");
  if (!env.STRIPE_WEBHOOK_SECRET) missing.push("STRIPE_WEBHOOK_SECRET is not set, so webhook signatures cannot be checked.");
  const bpsRaw = env.PLATFORM_FEE_BPS;
  if (bpsRaw == null || String(bpsRaw).trim() === "") {
    missing.push("PLATFORM_FEE_BPS is not set. No commission rate has been agreed.");
  } else if (!/^\d+$/.test(String(bpsRaw).trim()) || Number(bpsRaw) > 10000) {
    missing.push("PLATFORM_FEE_BPS must be a whole number of basis points from 0 to 10000.");
  }
  let sellerCount = 0;
  if (!env.SELLERS) missing.push("SELLERS is not set. No connected Stripe account ids are configured.");
  else {
    try {
      const parsed = JSON.parse(env.SELLERS);
      sellerCount = parsed && typeof parsed === "object" ? Object.keys(parsed).length : 0;
      if (!sellerCount) missing.push("SELLERS does not contain a seller account.");
    } catch (e) {
      missing.push("SELLERS is not valid JSON.");
    }
  }
  if (env.CHECKOUT_ENABLED !== "true") missing.push("CHECKOUT_ENABLED is not true. No Checkout Session will be created.");
  const mode = !key ? "unavailable" : key.startsWith("sk_live_") ? "live" : key.startsWith("sk_test_") ? "test" : "unavailable";
  return { ready: missing.length === 0, mode: missing.length ? "unavailable" : mode, missing, sellerCount };
}

export function feeCents(amountCents, bps) {
  if (!/^\d+$/.test(String(bps).trim())) throw new Error("fee rate unavailable");
  const rate = Number(bps);
  if (rate < 0 || rate > 10000) throw new Error("fee rate unavailable");
  return Math.round(amountCents * rate / 10000);
}

function sellerAccount(env, sellerKey) {
  const parsed = JSON.parse(env.SELLERS || "{}");
  const id = parsed && sellerKey ? parsed[sellerKey] : "";
  if (!id || typeof id !== "string" || !id.startsWith("acct_")) return "";
  return id;
}

function allowedReturn(url) {
  return typeof url === "string" && url.startsWith(PAGE_PREFIX);
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
  const age = Math.abs((now || Date.now()) / 1000 - Number(timestamp));
  if (age > 300) return false;
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

async function createSession(env, input) {
  const amount = Number(input.amountCents);
  if (!Number.isInteger(amount) || amount < 50 || amount > 99999999) {
    return { error: "amountCents must be a whole number of cents.", status: 400 };
  }
  const item = String(input.item || "").trim().slice(0, 120);
  if (!item) return { error: "item is required.", status: 400 };
  const account = sellerAccount(env, String(input.sellerKey || ""));
  if (!account) return { error: "That seller is not configured.", status: 400 };
  if (!allowedReturn(input.successUrl) || !allowedReturn(input.cancelUrl)) {
    return { error: "Return URLs must stay on this Coffeebreak site.", status: 400 };
  }
  const fee = feeCents(amount, env.PLATFORM_FEE_BPS);
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", "aud");
  body.set("line_items[0][price_data][unit_amount]", String(amount));
  body.set("line_items[0][price_data][product_data][name]", item);
  body.set("payment_intent_data[application_fee_amount]", String(fee));
  body.set("payment_intent_data[transfer_data][destination]", account);
  body.set("success_url", input.successUrl);
  body.set("cancel_url", input.cancelUrl);
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { authorization: "Basic " + btoa(env.STRIPE_SECRET_KEY + ":"), "content-type": "application/x-www-form-urlencoded" },
    body: body
  });
  const data = await response.json();
  if (!response.ok || !data.url) return { error: "Stripe did not open a checkout session.", status: 502 };
  return { url: data.url, status: 200 };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin");
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
    const state = blockers(env || {});
    if (url.pathname === "/status" && request.method === "GET") {
      return json({
        checkout: state.ready ? state.mode : "unavailable",
        ready: state.ready,
        mode: state.mode,
        missing: state.missing,
        sellerCount: state.sellerCount,
        holdsMoney: false,
        payid: "optional manual bank transfer, not instant"
      }, 200, origin);
    }
    if (url.pathname === "/checkout" && request.method === "POST") {
      if (!state.ready) return json({ checkout: "unavailable", missing: state.missing }, 403, origin);
      let input = {};
      try { input = await request.json(); } catch (e) { return json({ error: "JSON body required." }, 400, origin); }
      const created = await createSession(env, input);
      if (created.error) return json({ error: created.error }, created.status, origin);
      return json({ url: created.url }, 200, origin);
    }
    if (url.pathname === "/webhook" && request.method === "POST") {
      if (!env.STRIPE_WEBHOOK_SECRET) return json({ error: "Webhook secret is not set." }, 503, origin);
      const raw = await request.text();
      const ok = await verifyStripeSignature(raw, request.headers.get("stripe-signature"), env.STRIPE_WEBHOOK_SECRET);
      if (!ok) return json({ error: "Signature did not match." }, 400, origin);
      let event = {};
      try { event = JSON.parse(raw); } catch (e) { return json({ error: "Event was not JSON." }, 400, origin); }
      return json({ received: true, type: event.type || "", fulfillment: "not configured" }, 200, origin);
    }
    return json({ error: "Not found." }, 404, origin);
  }
};
