Coffeebreak Pulse Scanner - entertainment / wellness novelty camera toy (HTML5, itch.io "played in the browser")
NOT a medical device. Not for diagnosis or treatment. No medical accuracy is claimed.

FILES
  index.html   whole app (HTML, CSS, JS inline)
  logo.png     Coffeebreak logo
  Zip: /workspace/pulse-scanner-flat.zip (index.html at the zip root)

HOW TO TEST ON A PHONE
  1. Camera needs HTTPS or localhost. Easiest: upload the zip to itch.io as an HTML project
     (draft / restricted is fine), open it on the phone, tap "Allow camera and start".
  2. Rest a fingertip gently over the REAR lens (and light). Hold still ~15 seconds.
     The BPM number appears once the signal is steady. The waveform shows the filtered red signal.
  3. Light button: uses the camera torch where the browser supports it (Chrome on Android usually does;
     iOS Safari usually does not, so ambient light or a bright room is used instead).
  4. Denied test: choose Block when asked. A clear message and retry button appear.
  itch.io note: the embed iframe must allow the camera. If blocked inside the embed, use fullscreen
  or open the game in its own tab. Check once after upload.

APIs USED (browser built-ins only, no libraries, no network calls, no paid services)
  navigator.mediaDevices.getUserMedia (rear camera preferred), track.getCapabilities / applyConstraints
  ({advanced:[{torch:true}]}) when supported, requestVideoFrameCallback (falls back to requestAnimationFrame),
  Canvas 2D getImageData.

DETECTION IN PLAIN WORDS
  Each video frame: average the red value of a small centre square (16x16 downsample of the middle 20 percent).
  Keep ~12 seconds, resample to 30 Hz, remove slow drift (1.2 s moving average), flip sign (more blood = less red),
  smooth lightly, find peaks at least 0.33 s apart and above 0.35 standard deviations. Use the median gap
  between peaks, clamp to 40-180 BPM, require at least 4 steady gaps within 20 percent of each other
  before showing a number. Hints: no fingertip (red not dominant), too dark, too bright, moving
  (2 s swing over 12 percent), weak signal, steady.
  Self-test: synthetic 48-170 BPM signals recovered within 1 BPM; noise-only is rejected; a fake
  camera feed of 75 BPM showed 75.

COPY RULES
  No exclamation marks, no glucose/diabetes features, strong disclaimer in top banner, intro and footer,
  rights disclaimer and https://coffeebreaks.itch.io in footer.
