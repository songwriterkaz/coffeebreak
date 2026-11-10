# Coffeebreak PayID cart design

Date: 2026-11-10

Status: approved. Karen approved a reusable PayID cart with manual bank confirmation, then asked for it on all stores. This spec covers only the isolated core and a labelled demo. Storefront integration is a later pass.

## Purpose

One reusable cart calculates item totals in integer minor units, keeps a stable payment reference for an unchanged cart, and never treats a browser action as proof of payment. Australian manual PayID is the only payment presentation, and only when a caller explicitly says fulfilment is verified and the currency is AUD. This repository's physical catalogues have not been switched in this pass.

## Facts used

- Published PayID label, copied exactly: `Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com`
- Published orders contact already used by store order helpers: `darkokaz@gmx.com`
- No private address, phone, or family details are added.
- Existing pages are left unchanged, including `school-bookings/coffee.js` and every `cb-pay.js`.
- Local `main` used for this branch does not contain peer commit `b9a45364`. Later school-cart integration must start from a main that contains that commit and must not overwrite it with the older coffee cart.

## Modes

The core chooses a mode. It does not convert currency and does not invent an exchange rate.

| Mode | When | What the caller may show |
| --- | --- | --- |
| `manual-aud` | `fulfilmentVerified` is exactly `true`, currency is `AUD`, and the cart has lines | PayID label, AUD total, reference, and copy actions. `requestsPayment` is true. `paid` and `confirmed` stay false. |
| `quote-before-transfer` | Fulfilment is verified and currency is a real 3-letter code other than `AUD`, or the caller asks for a quote | Original currency total only. No AUD figure. `requestsPayment` is false. |
| `enquiry-only` | Fulfilment is not verified | Totals and reference only. Payment is not requested. |
| `gated` | Physical orders are closed | Same as enquiry-only, with a closed-order notice. |
| `demo` | Demo catalogue | Cart mechanics and the published PayID identity. Items are not for sale. `requestsPayment` is false. |

Unsafe combinations downgrade. `manual-aud` without verified fulfilment becomes `enquiry-only`. `manual-aud` with USD becomes `quote-before-transfer` and keeps the USD total. An unrecognised currency returns `unsupported-currency` and requests no payment.

## Cart rules

- A line has `id`, `name`, integer `unitMinor` (cents for AUD), and integer `qty`.
- Quantity is from 1 to 20 inclusive. Out-of-range quantities are rejected and do not change the cart.
- Line and cart totals are integer multiplications. They do not use binary floating-point sums.
- `dollarsToMinor` accepts a non-negative decimal string or a number already at a whole cent. Extra decimal digits round half away from zero. It does not change currency.
- The reference is 16 characters, starts with `CB`, and is kept while the payable snapshot is unchanged. The snapshot is store id, currency, and each line id, unit minor, and quantity. Notes and a customer's "I have paid" claim do not change it. An empty cart has no reference.
- A new snapshot mints a new reference.

## What is not payment

These do not set `paid` or `confirmed`: opening the cart, clicking "I have paid", a screenshot, a mailto draft, returning from a bank, `localStorage`, or URL parameters such as `paid=1`. Saved carts strip any `paid`, `confirmed`, or `status: "paid"` flag on load. Corrupt storage loads as an empty cart.

The core has no function that marks a cart paid. Manual confirmation means the merchant checks the bank receipt outside this page.

## Customer handoff

- Copy amount, PayID, and reference as separate values.
- Download a plain-text summary. `merchantDelivered` is false.
- Build a `mailto:` draft to `darkokaz@gmx.com` only. `sent` is false. Opening the draft does not send mail. No other inbox is introduced.
- The page collects no card number, BSB, or online-banking secret.
- The core does not call Stripe, a bank, or any network API.

## Demo

`payid-cart/index.html` is a labelled demo. Its three items are not for sale and the page tells the visitor not to send money. It persists in `localStorage` under `cb-payid-cart-demo-v1`, uses the existing Coffeebreak logo file by relative path, keeps the rights disclaimer, and links to `https://www.tesla.com` and `https://www.starlink.com`.

## Later pass, not this one

Integrate the same module into storefronts in this repo, including the school Coffee tab, only after `main` contains `b9a45364`. Physical catalogues without verified stock and supplier fulfilment stay enquiry-only or gated. USD prices stay USD. Do not edit `apps/vintage-midwife-bags` or shared social files for this cart. Sibling sites linked from the hub are out of this repository and are not covered here.
