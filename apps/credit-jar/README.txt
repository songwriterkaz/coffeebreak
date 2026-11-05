COFFEEBREAK CREDIT JAR - README
===============================

What this is
  A one page donation app. Plain HTML, CSS and JavaScript. Nothing to install and
  nothing to build. Open index.html in a browser to try it, or upload the folder
  (or jar-upload.zip) to any free static host, such as itch.io HTML upload,
  GitHub Pages or Netlify.

Files
  index.html        the whole app
  assets/           logo.png and qrcode.min.js (the QR code maker)
  jar-upload.zip    the same app zipped, index.html at the root
  screenshot.png    picture of the app, 1280 x 800
  cover.png         cover picture, 630 x 500
  listing.txt       title, tagline, description, tags and disclaimer

Where to change things
  Open index.html in a text editor (Notepad is fine). Search for the words
  CREDIT JAR SETTINGS. The settings sit together there:

    BTC_ADDRESS   your Bitcoin receiving address (empty switches Bitcoin off)
    PAYID         the PayID people send to
    OWNER_EMAIL   where the I have donated email goes
    GOAL_AUD      the monthly goal in A$ (default 50)
    RAISED_AUD    how much has come in this month in A$ (default 0)
    GOAL_LABEL    the words above the meter (default Karen's monthly goal)
    CREDIT_VALUE  what one credit is worth in A$ (default 1)
    PACKS         the quick pick amounts, for example [1, 5, 10, 25]
    MIN_AUD       smallest gift (default 1)
    MAX_AUD       largest gift (default 5000)
    FALLBACK_BTC_AUD  Bitcoin price in A$ used only if the live price fails (0 means none)

Updating the goal meter
  The meter is NOT tracked automatically. When money arrives, change RAISED_AUD to
  the new total for the month, save, and upload again. At the start of a month set
  it back to 0. The page says plainly that Karen updates it by hand.

The thank you wall
  In this version the wall is saved in the visitor's own browser only. Nobody else
  sees it. The three Example cards are made up and are labelled Example. To change
  or remove them, edit the EXAMPLES list in index.html.

What you do when someone gives
  The I have donated button opens an email to OWNER_EMAIL with the reference
  (CB-XXXXXX), amount, method, message, display name and whether it can be shown.
  Check your PayID or Bitcoin wallet for the matching amount and reference, then
  thank them. The page does not detect payments by itself.

Bitcoin price
  The Bitcoin amount is worked out from a live A$ price (CoinGecko, no key needed).
  If the price cannot load, the page asks people to press Refresh price or use PayID.

Rights
  Karen O'Brien (Coffeebreak) keeps all rights to the app, design, name and logo.
  People may use the app but may not copy it or make their own versions.
