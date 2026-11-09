// Stripe prep for GitHub Pages. Checkout stays refused.
// Official refs: docs.stripe.com/connect/charges ,
// docs.stripe.com/connect/accounts-v2 ,
// docs.stripe.com/webhooks/signature .
// Charge type, fee, refund liability, and seller accounts are not selected here.
// No secret values belong in this file. This Worker does not call Stripe.

const ALLOWED_ORIGIN = "https://songwriterkaz.github.io";

export function blockers(env) {
  const missing = [];
  const key = env.STRIPE_RESTRICTED_KEY || "";
  if (!key) missing.push("STRIPE_RESTRICTED_KEY is not set. Use an isolated sandbox restricted key (rk_test_), not a live secret key.");
  else if (!key.startsWith("rk_test_")) missing.push("STRIPE_RESTRICTED_KEY must be an rk_test_ sandbox key. Live and unrestricted secret keys are not accepted.");
  if (!env.STRIPE_WEBHOOK_SECRET) missing.push("STRIPE_WEBHOOK_SECRET is not set, so a Checkout Session cannot be verified.");
  if (!env.CHARGE_PATTERN) missing.push("CHARGE_PATTERN is unset. Direct, destination, and separate charges are not selected.");
  else missing.push("CHARGE_PATTERN is present but not activated. Fee payer, loss liability, and seller onboarding are still undecided.");
  if (env.PLATFORM_FEE_BPS == null || String(env.PLATFORM_FEE_BPS).trim() === "") {
    missing.push("PLATFORM_FEE_BPS is unset. No commission rate is configured, and none will be assumed.");
  }
  if (!env.SELLERS) missing.push("SELLERS is unset. No connected account ids are stored.");
  missing.push("CHECKOUT is held off. No Session is created, and no tax is collected.");
  return { ready: false, mode: "unavailable", missing, sandbox: key.startsWith("rk_test_") };
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
        checkout: "unavailable",
        ready: false,
        mode: state.mode,
        missing: state.missing,
        sandboxKeyShape: state.sandbox,
        chargePattern: "not selected",
        tax: "off",
        holdsMoney: false,
        payid: "optional manual bank transfer, not instant"
      }, 200, origin);
    }
    if (url.pathname === "/checkout" && request.method === "POST") {
      return json({ checkout: "unavailable", missing: state.missing }, 403, origin);
    }
    if (url.pathname === "/webhook" && request.method === "POST") {
      if (!env.STRIPE_WEBHOOK_SECRET) return json({ error: "Webhook secret is not set." }, 503, origin);
      const raw = await request.text();
      const ok = await verifyStripeSignature(raw, request.headers.get("stripe-signature"), env.STRIPE_WEBHOOK_SECRET);
      if (!ok) return json({ error: "Signature did not match." }, 400, origin);
      return json({ received: true, acted: false, fulfillment: "not configured" }, 200, origin);
    }
    return json({ error: "Not found." }, 404, origin);
  }
};
