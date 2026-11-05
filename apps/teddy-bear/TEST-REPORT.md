# Coffeebreak Teddy Bear - test report

Date: 24 Oct 2026 (Sydney time). Tool: Playwright with Chrome headless, phone 390x844 (touch, 2x), tablet 820x1180, TV 1920x1080. Served from a local http server. Speech and share were stubbed (headless Chrome has no voices); audio ran on the real WebAudio engine (muted output).

Result: 41 of 41 checks passed. Console had no errors or warnings.

Checked: start screen with logo and rights note; tap belly (hug, heartbeat, purr), nose, left and right ear, left and right paw, foot, head; drag to rock and settle back upright; Calm mode on and off (9 second glow, no flashing); Sleep mode on and wake up (lullaby scheduled); sound on/off switch; volume slider (saved); Say hello speaks "Hello from Coffeebreak"; Bedtime story reads 11 chunks and shows the text; dress-up (bow, hat, scarf, cowboy hat, headphones, clear all, head items replace each other, saved after reload); Add phone nearby sheet and Web Share API call; no exclamation marks in visible text, labels or spoken text; disclaimer visible; logo loads; service worker registered with cache cbsim-teddy-v1; loads offline; manifest; no external network requests; tablet and TV layouts have no sideways scroll.

Notes: Add phone nearby is a small built-in share sheet (Web Share API plus copy link), not nearby.js, because nearby.js is built around phone contacts and numbers, which a teddy does not have. Real AirDrop cannot be started by a web page. Real voices, real sound and real PWA install on a phone were not tested on this box. The share link points to the suggested itch page https://coffeebreaks.itch.io/coffeebreak-teddy, so change it if the page name differs. Screenshots are in shots/.
