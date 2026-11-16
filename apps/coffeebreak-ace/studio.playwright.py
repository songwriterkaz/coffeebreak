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
PORT = 8769
PAGE = f"http://127.0.0.1:{PORT}/apps/coffeebreak-ace/index.html"

TABS = [
    ("create", "Create"),
    ("songs", "My songs"),
    ("arrange", "Arrange"),
    ("piano", "Piano Roll"),
    ("drums", "Drum Machine"),
    ("inst", "Instruments"),
    ("mixer", "Mixer and FX"),
    ("editor", "Audio Editor"),
    ("master", "Mastering"),
    ("tools", "Tools"),
    ("karaoke", "Karaoke"),
    ("library", "Tools Browser"),
    ("export", "Export and Project"),
    ("settings", "Settings"),
    ("help", "Help"),
    ("features", "Features"),
    ("mytools", "All my tools"),
]


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
            expect(page.locator("h1")).to_have_text("Coffeebreak Vocal Studio")
            body = page.inner_text("body")
            if re.search(r"\bACE\b", body) or "ACE-Step" in body:
                raise SystemExit("ACE still visible")
            if "11,996" in body or "11996" in body or "12,000 presets" in body or "12000" in body:
                raise SystemExit("generated-preset bulk still visible")
            if "Coffeebreak Studio Espresso" in body:
                raise SystemExit("Studio Espresso name still visible")
            bangs = [line.strip() for line in body.splitlines() if "!" in line]
            if bangs:
                raise SystemExit("exclamation marks in copy: " + " | ".join(bangs[:5]))
            expect(page.locator("body")).to_contain_text("Tesla")
            expect(page.locator("body")).to_contain_text("Starlink")
            expect(page.locator("body")).to_contain_text("Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com")
            expect(page.locator("body")).to_contain_text("This page does not show a separate price")

            for key, label in TABS:
                expect(page.locator(f'#tabs button[data-t="{key}"]')).to_have_text(label)

            expect(page.locator("#createGo")).to_be_visible()
            expect(page.locator("#bRec")).to_be_visible()
            expect(page.locator("#lyr")).to_have_count(1)
            expect(page.locator("#lyrRhyme")).to_have_count(1)
            expect(page.locator("#tunBtn")).to_have_count(1)
            expect(page.locator("#strips")).to_have_count(1)
            expect(page.locator("#prNew")).to_have_count(1)
            expect(page.locator("#drNew")).to_have_count(1)
            expect(page.locator("#mOn")).to_have_count(1)
            expect(page.locator("#exFmt")).to_have_count(1)
            expect(page.locator("#edPit")).to_have_count(1)

            page.click('#tabs button[data-t="tools"]')
            page.fill("#lyrWord", "light")
            page.click("#lyrRhyme")
            rhymes = page.inner_text("#lyrR")
            if "night" not in rhymes or "bright" not in rhymes:
                raise SystemExit("rhyme pad did not return expected rhymes: " + rhymes)

            page.click('#tabs button[data-t="mixer"]')
            fx = page.inner_text("#fxAdd")
            if "Vocal tuner" not in fx:
                raise SystemExit("mixer is missing Vocal tuner")

            page.click('#tabs button[data-t="create"]')
            page.fill("#createLyrics", "sun is up on the hill")
            page.fill("#createStyle", "clear pop")
            page.click("#createGo")
            page.wait_for_function(
                """() => {
                  const t = document.getElementById('createStatus');
                  return t && /saved in My songs/i.test(t.textContent || '');
                }""",
                timeout=90000,
            )
            sung = page.evaluate(
                """async () => {
                  const rows = await window.CBSongs.list();
                  if (!rows || !rows.length) return { tracks: [], peak: 0 };
                  const opened = await window.CBSongs.open(rows[0].id);
                  return {
                    tracks: opened.tracks || [],
                    peak: opened.vocalPeak || 0,
                    title: opened.title,
                    hasTuneFx: Array.from(document.querySelectorAll('#fxAdd option')).some(o => o.textContent === 'Vocal tuner'),
                  };
                }"""
            )
            if "Drums" not in sung["tracks"] or "Vocals" not in sung["tracks"]:
                raise SystemExit("create song tracks missing: " + str(sung["tracks"]))
            if sung["peak"] < 0.02:
                raise SystemExit("created vocal was silent")
            browser.close()
            print({
                "title": "Coffeebreak Vocal Studio",
                "tracks": sung["tracks"],
                "peak": sung["peak"],
                "hasTuneFx": True,
                "rhymes": rhymes,
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
