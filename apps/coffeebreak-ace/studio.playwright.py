#!/usr/bin/env python3
"""Playwright checks for Coffeebreak Vocal Studio."""
from __future__ import annotations

import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[2]
PORT = 8768
PAGE = f"http://127.0.0.1:{PORT}/apps/coffeebreak-ace/index.html"


def main() -> int:
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
            page.goto(PAGE, wait_until="load", timeout=60000)
            expect(page).to_have_title("Coffeebreak Vocal Studio")
            body = page.inner_text("body")
            if re.search(r"\bACE\b", body) or "ACE-Step" in body:
                raise SystemExit("ACE still visible")
            if "11,996" in body or "11996" in body or "12,000" in body or "12000" in body:
                raise SystemExit("generated-preset bulk still visible")
            if "!" in body.replace("Coffeebreak!", ""):
                # no user-facing exclamation marks
                bangs = [line for line in body.splitlines() if "!" in line]
                if bangs:
                    raise SystemExit("exclamation marks in copy: " + " | ".join(bangs[:5]))
            expect(page.locator("h1")).to_have_text("Coffeebreak Vocal Studio")
            expect(page.locator("body")).to_contain_text("Tesla")
            expect(page.locator("body")).to_contain_text("Starlink")
            expect(page.locator("body")).to_contain_text("Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com")
            for sel in ("#vcPitch", "#vcCorrect", "#vcKey", "#vcScale", "#vcFormant", "#vcSpeed", "#vcVibrato", "#vcReverb", "#vcVolume", "#vcApply"):
                expect(page.locator(sel)).to_have_count(1)
            expect(page.locator("#cb-sung-go")).to_be_visible()
            expect(page.locator("#cb-sung-engine")).to_be_hidden()

            page.fill("#cb-sung-lyrics", "sun is up on the hill")
            page.fill("#cb-sung-style", "clear pop")
            page.fill("#cb-sung-seconds", "12")
            page.click("#cb-sung-go")
            page.wait_for_function(
                "() => { const a=document.getElementById('cb-sung-audio'); return a && a.duration > 2 && a.readyState >= 2; }",
                timeout=90000,
            )
            created = page.evaluate(
                """() => ({
                  duration: document.getElementById('cb-sung-audio').duration,
                  peak: window.CBVocal && window.CBVocal.lastPeak(),
                  hasOrig: window.CBVocal && window.CBVocal.hasOriginal(),
                  title: document.title,
                })"""
            )
            if not created["hasOrig"]:
                raise SystemExit("create did not stash a song for the controls")
            if not created["duration"] or created["duration"] < 2:
                raise SystemExit("created song was too short")

            page.fill("#vcVolume", "0.4")
            page.click("#vcApply")
            page.wait_for_function(
                "() => (document.getElementById('vcStatus')||{}).textContent === 'Applied to the current song.'",
                timeout=30000,
            )
            after = page.evaluate(
                """() => ({
                  peak: window.CBVocal && window.CBVocal.lastPeak(),
                  duration: window.CBVocal && window.CBVocal.lastDuration(),
                  volume: window.CBVocal.readControls().volume,
                })"""
            )
            if after["volume"] != 0.4:
                raise SystemExit("volume control did not stick")
            if after["peak"] is None or after["peak"] < 0.02:
                raise SystemExit("applied vocal was silent")
            if created["peak"] and after["peak"] > created["peak"] * 0.85:
                raise SystemExit(f"volume apply did not lower the peak: {created['peak']} -> {after['peak']}")

            page.click("#vcReset")
            page.wait_for_function(
                "() => window.CBVocal && Math.abs(window.CBVocal.readControls().volume - 1) < 0.01",
                timeout=30000,
            )
            browser.close()
            print({
                "title": "Coffeebreak Vocal Studio",
                "duration": created["duration"],
                "peak": created["peak"],
                "peakAfterVolume": after["peak"],
                "ok": True,
            })
            return 0
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except Exception:
            server.kill()


if __name__ == "__main__":
    raise SystemExit(main())
