#!/usr/bin/env python3
"""Playwright checks for Coffeebreak Vocal Studio."""
from __future__ import annotations

import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[2]
PORT = 8766
PAGE = f"http://127.0.0.1:{PORT}/apps/coffeebreak-ace/index.html"

def main() -> int:
    import subprocess, os, signal
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        for _ in range(40):
            try:
                urllib.request.urlopen(PAGE, timeout=1)
                break
            except Exception:
                time.sleep(0.15)
        else:
            raise SystemExit("local page did not start")

        with sync_playwright() as p:
            browser = p.chromium.launch(
                executable_path="/usr/bin/google-chrome",
                args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--autoplay-policy=no-user-gesture-required"],
                headless=True,
            )
            page = browser.new_page()
            page.goto(PAGE, wait_until="load")
            expect(page).to_have_title("Coffeebreak Vocal Studio")
            body = page.locator("body")
            expect(body).to_contain_text("Coffeebreak Vocal Studio")
            expect(body).to_contain_text("Coffeebreak voice")
            expect(body).to_contain_text("Tesla")
            expect(body).to_contain_text("Starlink")
            expect(body).to_contain_text("Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com")
            expect(body).to_contain_text("34 tools, 11,996 presets")
            visible = page.inner_text("body")
            if "ACE-Step" in visible or " ACE " in visible or visible.strip().startswith("ACE"):
                raise SystemExit("ACE still visible: " + visible[:200])
            # word ACE should not appear as a name
            import re
            if re.search(r"\bACE\b", visible):
                raise SystemExit("ACE word still visible")

            page.fill("#search", "Hall 1.6s 28% mix Warm")
            page.select_option("#filter", "Effect")
            page.wait_for_timeout(50)
            first = page.locator(".preset").first
            expect(first).to_contain_text("Reverb: Hall")

            page.fill("#lyrics", "sun is up on the hill")
            sung = page.evaluate(
                """async () => {
                  const out = await CBVocalStudio.sing('sun is up on the hill', { seed: 3, bpm: 110 });
                  const st = CBVocalStudio.state();
                  const pitch = CBVocalStudio.detectPitch();
                  return { out, st, pitch, counts: CBVocalStudio.counts() };
                }"""
            )
            if sung["counts"]["tools"] != 34 or sung["counts"]["presets"] != 11996:
                raise SystemExit("count mismatch " + str(sung["counts"]))
            if sung["st"]["peak"] <= 0.05:
                raise SystemExit("silent vocal " + str(sung))
            if sung["st"]["seconds"] < 4:
                raise SystemExit("too short " + str(sung["st"]))

            applied = page.evaluate(
                """async () => {
                  const preset = CBVocalStudio.search('Hall, 1.6s, 28% mix, Warm', 'Effect')[0];
                  const result = await CBVocalStudio.apply(preset);
                  const st = CBVocalStudio.state();
                  return { result, peak: st.peak };
                }"""
            )
            if applied["peak"] <= 0.05:
                raise SystemExit("effect silenced the vocal " + str(applied))

            print({
                "title": page.title(),
                "counts": sung["counts"],
                "peak": sung["st"]["peak"],
                "seconds": sung["st"]["seconds"],
                "effectPeak": applied["peak"],
                "ok": True,
            })
            browser.close()
        return 0
    finally:
        server.send_signal(signal.SIGTERM)
        try:
            server.wait(timeout=3)
        except Exception:
            server.kill()

if __name__ == "__main__":
    raise SystemExit(main())
