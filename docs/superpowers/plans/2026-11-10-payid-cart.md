# PayID cart core implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an isolated, tested PayID cart core and a labelled demo that cannot mark itself paid.

**Architecture:** `payid-cart/cart.js` is a browser global and a CommonJS module with pure cart, money, reference, and checkout functions. `payid-cart/demo.js` only renders that API. No store file is edited.

**Tech Stack:** Plain JavaScript, Node.js built-in test runner, static HTML and CSS. No packages, API keys, or payment services.

## Global Constraints

- Payment label is exactly `Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com`.
- Orders draft address is exactly `darkokaz@gmx.com`.
- Totals are integer minor units. Quantity is an integer from 1 to 20.
- `paid` and `confirmed` stay false for every customer, storage, and URL action.
- Non-AUD totals are not relabelled or converted.
- Demo items are not for sale and the demo does not request payment.
- Preserve every existing file. Do not merge or deploy.
- Later store integration waits until `main` contains commit `b9a45364`.

---

### Task 1: Core tests

**Files:**
- Create: `payid-cart/cart.test.mjs`
- Create: `payid-cart/cart.js`

- [x] Write `payid-cart/cart.test.mjs` for rounding, bounds, reference stability, tampered status and currency, empty cart, persistence, mailto, and the demo page's safety strings.
- [x] Run `node --test payid-cart/cart.test.mjs` and confirm it fails because the module is missing.
- [x] Implement `payid-cart/cart.js` until the same command passes. The default mint path must use `globalThis`, not the wrapper's `root` parameter, and a test calls it without an injected random source.

### Task 2: Labelled demo

**Files:**
- Create: `payid-cart/index.html`
- Create: `payid-cart/demo.js`
- Create: `payid-cart/demo.css`

- [x] Add a mobile-friendly demo that adds and removes the three not-for-sale items, copies amount, PayID, and reference separately, downloads a summary, and offers one mailto draft.
- [x] "I have paid", `localStorage`, and `?paid=1` leave the visible status unverified.
- [x] Re-run `node --test payid-cart/cart.test.mjs`.

### Task 3: Record the branch

- [x] Commit the spec, plan, core, demo, and tests.
- [x] Push `cursor/payid-cart-core-31a0` and open a pull request. Do not merge.

## Integration example

A later store page, after the school-cart commit check, would call the same module:

```javascript
const state = CoffeebreakCart.buildState({
  storeId: 'example-store',
  currency: 'AUD',
  lines: [{ id: 'sku-1', name: 'Example item', unitMinor: 1295, qty: 1 }],
  rng: Math.random
});
const view = CoffeebreakCart.checkout(state, {
  currency: 'AUD',
  fulfilmentVerified: false,
  mode: 'enquiry-only'
});
// view.requestsPayment === false, view.paid === false, view.currency === 'AUD'
```

Verified AUD fulfilment is the only configuration that sets `requestsPayment` to true, and even then `paid` remains false.
