Coffeebreak Metal Detector - novelty camera scanner (HTML5, itch.io "played in the browser")

FILES
  index.html   whole app (HTML, CSS and JS inline)
  logo.png     Coffeebreak logo
  Zip: /workspace/metal-detector-flat.zip (index.html at the zip root)

HOW TO TEST ON A PHONE
  1. Camera needs HTTPS or localhost. Easiest: upload the zip to itch.io as an HTML project
     (draft or restricted visibility is fine), open the page on the phone, tap "Allow camera and start".
  2. Or from a computer on the same network: run  python3 -m http.server 8000  in this folder,
     then expose it over HTTPS (any tunnel) and open that address on the phone. Plain http://LAN-IP
     will NOT give camera access on phones.
  3. Aim the centre circle at a coin, keys, foil, chrome tap. Signal and beep rise. Try Zero, Freeze, Sound on/off.
  4. Denied test: choose Block when asked. The page shows instructions, a retry button and a
     "Scan a photo instead" option that works without live camera.
  itch.io note: the embed iframe must allow the camera. If the camera is blocked inside the embed,
  use itch's fullscreen button, or open the game in its own tab. Check this once after upload.

APIs USED (all built into the browser, no libraries, no network calls, no paid services)
  navigator.mediaDevices.getUserMedia (rear camera preferred via facingMode environment)
  Canvas 2D getImageData (analysis on a 64x64 centre crop of each frame, ~20 times a second)
  Web Audio OscillatorNode + GainNode (beep: faster and higher as signal rises)
  <input type=file capture> for the photo fallback

DETECTION IN PLAIN WORDS
  Each frame is cropped to the centre square and shrunk. Pixels near the reticle count the most
  (soft falloff). Three cues are blended into a 0-100 score:
   - bright, low-colour pixels that stand out from their surroundings (specular highlights)
   - small glints much brighter than neighbours
   - strong light/dark edges inside low-colour areas (chrome / brushed-metal look)
  Plain bright walls or paper score low because they are flat. The score rises fast and falls
  slowly. Zero stores the current reading as background. It is NOT real metal detection.
  Lamps, windows and glossy plastic can also score high. Images are never sent or stored.

COPY RULES
  No exclamation marks, no medical claims, rights disclaimer and https://coffeebreaks.itch.io in footer.
