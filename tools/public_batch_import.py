#!/usr/bin/env python3
"""Idempotent public Coffeebreak import check.

Compares staged product zips with this repo and the known live hosts.
Copies only missing safe files. Never replaces a newer page, a longer
playlist, or an existing client config with a cleared staging copy.

Run from the repo root:
  python3 tools/public_batch_import.py --check
  python3 tools/public_batch_import.py --apply
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import ssl
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://songwriterkaz.github.io"
SITE = ORIGIN + "/coffeebreak/"
PAYID = "Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com"
OLD_CLIPS_GAME = "efe40639266e693a3310178189819e5d8b053a99cfceda8ef59b19aa3b89da06"
NEW_CLIPS_GAME = "a9ab64bfa9adf92a32fa1e310b51e3cba17513133bda77026c69b9e7178b6bbf"

# Sibling GitHub Pages confirmed live. These are not copied into this repo.
SIBLING_LIVE = {
    "aussie-dash", "bill-reminder-tracker", "budget-planner", "debt-payoff-planner",
    "fan-club", "fashion", "fashion-3d", "fashion-3d-print",
    "fashion-studio-3d-print-wigs", "fishing-store", "food-delivery",
    "journals-store", "karaoke-link-converter", "leather-glasses-store",
    "music-release-desk", "savings-goals", "sole-trader-log", "sugarloaf-vr",
    "unit-price-compare", "vr-studio", "espresso-music-maker",
}
NETLIFY_LIVE = {
    "play-tracker": "https://coffeebreak-play-tracker.netlify.app/",
    "fan-club": "https://coffeebreak-fan-club.netlify.app/",
    "sugarloaf-vr": "https://coffeebreak-sugarloaf-vr.netlify.app/",
    "vr-studio": "https://coffeebreak-vr-studio.netlify.app/",
    "fashion-3d-print": "https://coffeebreak-fashion-3d-print.netlify.app/",
}
# Exact dead-store URLs that map to a page already on GitHub.
EXACT_RETARGET = {
    "https://coffeebreaks.itch.io/coffeebreak-radio-pitch-builder": SITE + "radio-pitch-builder/",
    "https://coffeebreaks.itch.io/coffeebreak-makeup-range": SITE + "makeup-range/",
}

# Full song files stay off this public repo until payment is actually checked.
SAFE_CLIPS_AUDIO = []
# Playlist entries kept. Files were not in this batch. Filename flags are not
# treated as proof, and nothing already listed is deleted.
CLIPS_AUDIO_STILL_MISSING = [
    "assets/music/suno-coffeebreak-after-dark-v1.mp3", "assets/music/suno-coffeebreak-after-dark-v2.mp3",
    "assets/music/suno-coffeebreak-after-dark-v3.mp3", "assets/music/suno-coffeebreak-after-dark-v4.mp3",
    "assets/music/suno-coffeebreak-after-dark-v5.mp3", "assets/music/suno-coffeebreak-after-dark-v6.mp3",
    "assets/music/suno-coffeebreak-after-dark-v7.mp3", "assets/music/suno-coffeebreak-after-dark-v8.mp3",
    "assets/music/suno-coffeebreak-after-dark-v9.mp3",
    "assets/music/suno-im-weak-v1.mp3", "assets/music/suno-im-weak-v2.mp3",
    "assets/music/suno-knee-deep-mashup-v1.mp3", "assets/music/suno-knee-deep-mashup-v2.mp3",
    "assets/music/suno-knee-deep-mashup-v3.mp3", "assets/music/suno-knee-deep-mashup-v4.mp3",
    "assets/music/suno-drip-drip-drip-country-v1.mp3", "assets/music/suno-drip-drip-drip-country-v2.mp3",
    "assets/music/suno-drip-drip-drip-country-v3.mp3", "assets/music/suno-drip-drip-drip-country-v4.mp3",
    "assets/music/suno-drip-drip-drip-country-v5.mp3",
    "assets/music/suno-sweet-juices-cotton-candy-v2.mp3", "assets/music/suno-sweet-juices-cotton-candy-v3.mp3",
    "assets/music/suno-sweet-juices-cotton-candy-v4.mp3", "assets/music/suno-sweet-juices-cotton-candy-v5.mp3",
    "assets/music/suno-sweet-juices-cotton-candy-v6.mp3", "assets/music/suno-sweet-juices-cotton-candy-v7.mp3",
    "assets/music/suno-sweet-juices-cotton-candy-v8.mp3", "assets/music/suno-sweet-juices-cotton-candy-v9.mp3",
    "assets/music/user-upload-1.mp3", "assets/music/user-upload-2.mp3",
    "assets/music/track1.mp3", "assets/music/track2.mp3", "assets/music/track3.mp3", "assets/music/track4.mp3", "assets/music/track5.mp3",
    "assets/music/suno-coffee-break-v1.mp3", "assets/music/suno-cinnamon-candy-v1.mp3",
    "assets/music/suno-sweet-juices-cotton-candy-v1.mp3",
]
MAIL_STILL_MISSING = [
    "assets/three.min.js",
    "assets/music/a-delicious-disaster.mp3", "assets/music/cinnamon-candy.mp3",
    "assets/music/coffee-break-ride.mp3", "assets/music/coffee-break.mp3",
    "assets/music/drip-drip-drip-country.mp3", "assets/music/fussell-st.mp3",
    "assets/music/kicking-marshmallows-up-the-mud.mp3", "assets/music/restless-engine.mp3",
    "assets/music/sugar-coated-fever.mp3", "assets/music/sweet-juices-cotton-candy.mp3",
    "assets/music/talk-is-cheap.mp3", "assets/music/thunder-in-my-hands.mp3",
    "assets/movies/v05-singing.mp4", "assets/movies/v07-barista.mp4",
    "assets/movies/v11-dancing.mp4", "assets/movies/v18-newcastle-sunset.mp4",
    "assets/movies/v20-karaoke.mp4", "assets/movies/v21-guitar.mp4",
]

YP_RENDER = r"""
/* cb-yp-render */
(function(){
  var items = (window.DATA && DATA.items) ? DATA.items.slice() : [];
  var q = document.getElementById('q');
  var cats = document.getElementById('cats');
  var grid = document.getElementById('grid');
  var more = document.getElementById('more');
  var info = document.getElementById('info');
  var empty = document.getElementById('nm');
  var sort = document.getElementById('sort');
  var cnt = document.getElementById('cnt');
  var built = document.getElementById('built');
  var newb = document.getElementById('newb');
  var playb = document.getElementById('playb');
  if (!grid || !q) return;
  var cat = '', onlyNew = false, onlyWeb = false, shown = 60;
  if (cnt) cnt.textContent = items.length + ' ';
  if (built) built.textContent = (DATA && DATA.built) || '';
  function priceOf(p){
    var m = String(p || '').replace(/,/g,'').match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
  }
  function selected(){
    var term = (q.value || '').trim().toLowerCase();
    var list = items.filter(function(it){
      if (cat && it.c !== cat) return false;
      if (onlyNew && !it.n) return false;
      if (onlyWeb && !it.web) return false;
      if (!term) return true;
      return ((it.t || '') + ' ' + (it.d || '') + ' ' + (it.c || '')).toLowerCase().indexOf(term) >= 0;
    });
    if (sort && sort.value === 'new') list.sort(function(a,b){ return (b.n===true) - (a.n===true) || String(a.t).localeCompare(String(b.t)); });
    else if (sort && sort.value === 'pr') list.sort(function(a,b){ return priceOf(a.p) - priceOf(b.p) || String(a.t).localeCompare(String(b.t)); });
    else list.sort(function(a,b){ return String(a.t).localeCompare(String(b.t)); });
    return list;
  }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function draw(){
    var list = selected();
    if (info) info.textContent = list.length + ' listings';
    var view = list.slice(0, shown);
    if (!view.length){ grid.innerHTML = ''; if (empty) empty.style.display = 'block'; if (more) more.style.display = 'none'; return; }
    if (empty) empty.style.display = 'none';
    grid.innerHTML = view.map(function(it){
      var img = it.img ? '<img src="' + esc(it.img) + '" alt="" loading="lazy">' : '';
      return '<a class="card" href="' + esc(it.u) + '"><div class="im">' + img + '</div><div class="b"><div class="t">' + esc(it.t) + '</div><div class="m"><span class="pr">' + esc(it.p || '') + '</span><span class="ct">' + esc(it.c || '') + '</span></div></div>' + (it.n ? '<span class="new">New</span>' : '') + (it.web ? '<span class="pl">Web</span>' : '') + '</a>';
    }).join('');
    if (more) more.style.display = view.length < list.length ? 'block' : 'none';
  }
  function paintCats(){
    if (!cats) return;
    var names = {};
    items.forEach(function(it){ if (it.c) names[it.c] = 1; });
    var html = '<button type="button" class="' + (cat ? '' : 'on') + '" data-c="">All</button>';
    Object.keys(names).sort().forEach(function(name){
      html += '<button type="button" class="' + (cat === name ? 'on' : '') + '" data-c="' + esc(name) + '">' + esc(name) + '</button>';
    });
    cats.innerHTML = html;
  }
  if (cats) cats.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    cat = b.getAttribute('data-c') || ''; shown = 60; paintCats(); draw();
  });
  q.addEventListener('input', function(){ shown = 60; draw(); });
  if (sort) sort.addEventListener('change', function(){ shown = 60; draw(); });
  if (newb) newb.addEventListener('click', function(){ onlyNew = !onlyNew; newb.classList.toggle('on', onlyNew); shown = 60; draw(); });
  if (playb) playb.addEventListener('click', function(){ onlyWeb = !onlyWeb; playb.classList.toggle('on', onlyWeb); shown = 60; draw(); });
  if (more) more.addEventListener('click', function(){ shown += 60; draw(); });
  paintCats(); draw();
})();
"""


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def copy_if_missing(src: Path, dest: Path, notes: list) -> None:
    if dest.exists():
        notes.append(f"kept existing {dest.relative_to(ROOT)}")
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    notes.append(f"added {dest.relative_to(ROOT)}")


def canonical_url(slug: str) -> str | None:
    local = ROOT / slug / "index.html"
    if local.is_file():
        return SITE + slug + "/"
    apps = ROOT / "apps" / slug / "index.html"
    if apps.is_file():
        return SITE + "apps/" + slug + "/"
    if slug in SIBLING_LIVE:
        return f"{ORIGIN}/coffeebreak-{slug}/"
    if slug in NETLIFY_LIVE and slug == "play-tracker":
        return NETLIFY_LIVE[slug]
    return None


def itch_urls_for(slug: str) -> set[str]:
    return {
        f"https://coffeebreaks.itch.io/coffeebreak-{slug}",
        f"https://coffeebreaks.itch.io/{slug}",
    }


def load_pages():
    html = (ROOT / "pages" / "index.html").read_text(encoding="utf-8")
    m = re.search(r'(<script[^>]*id="cb-pages-data"[^>]*>)(.*?)(</script>)', html, re.S)
    if not m:
        raise SystemExit("pages catalogue marker missing")
    data = json.loads(m.group(2))
    return html, m, data


def save_pages(html, m, data) -> None:
    body = json.dumps(data, ensure_ascii=False, separators=(", ", ": "))
    (ROOT / "pages" / "index.html").write_text(html[: m.start(2)] + body + html[m.end(2) :], encoding="utf-8")


def load_yp_embedded():
    path = ROOT / "yellow-pages" / "index.html"
    text = path.read_text(encoding="utf-8")
    i = text.find("var DATA=")
    if i < 0:
        raise SystemExit("yellow pages data missing")
    data, end = json.JSONDecoder().raw_decode(text[i + len("var DATA=") :])
    return path, text, i, end, data


def load_yp_json():
    path = ROOT / "yellow-pages" / "data.json"
    return path, json.loads(path.read_text(encoding="utf-8"))


def retarget_items(items, url_map):
    changed = []
    for it in items:
        u = (it.get("u") or "").rstrip("/")
        if u in url_map and url_map[u].rstrip("/") != u:
            it["u"] = url_map[u]
            it["web"] = True
            it["src"] = "github"
            changed.append(u)
    return changed


def ensure_item(items, item) -> bool:
    url = item["u"].rstrip("/")
    for it in items:
        if (it.get("u") or "").rstrip("/") == url:
            return False
    items.append(item)
    return True


def page_entry(url, title, category, icon, letter):
    path = "/" + url.split("github.io/", 1)[-1]
    if not path.endswith("/"):
        path += "/"
    return {
        "url": url if url.endswith("/") else url + "/",
        "title": title,
        "category": category,
        "icon": icon,
        "letter": letter,
        "source": "restore",
        "path": path,
    }


def apply_catalogue(slugs, notes):
    url_map = dict(EXACT_RETARGET)
    for slug in slugs:
        dest = canonical_url(slug)
        if not dest:
            continue
        for old in itch_urls_for(slug):
            url_map[old.rstrip("/")] = dest
    # embedded yellow pages
    path, text, i, end, data = load_yp_embedded()
    changed = retarget_items(data["items"], url_map)
    added = []
    extra = [
        {
            "t": "Coffeebreak Coffee Mail",
            "u": SITE + "coffee-mail/",
            "img": SITE + "coffee-mail/cb-logo.png",
            "p": "$5",
            "d": "Browser inbox and coffee note. " + PAYID + ". This page does not run a mail server.",
            "web": True, "c": "Social & Mail", "n": False, "src": "github",
        },
        {
            "t": "Coffeebreak camera demo",
            "u": SITE + "apps/clips-demo/",
            "img": SITE + "apps/clips/cb-logo.jpg",
            "p": "Free",
            "d": "Demo of the Coffeebreak camera. Three clips. Full app is separate and does not verify payment.",
            "web": True, "c": "Apps & Tools", "n": True, "src": "github",
        },
    ]
    for item in extra:
        if ensure_item(data["items"], item):
            added.append(item["u"])
    data["count"] = len(data["items"])
    blob = json.dumps(data, ensure_ascii=False, separators=(", ", ": "))
    marker = "/* cb-yp-render */"
    rest = text[i + len("var DATA=") + end :]
    if marker not in rest:
        rest = ";\n" + YP_RENDER + "\n</script>\n</body></html>\n"
    path.write_text(text[: i + len("var DATA=")] + blob + rest, encoding="utf-8")
    notes.append(f"yellow-pages retargeted {len(changed)} itch links; added {len(added)}")

    jpath, jdata = load_yp_json()
    jchanged = retarget_items(jdata["items"], url_map)
    for item in extra:
        ensure_item(jdata["items"], item)
    jdata["count"] = len(jdata["items"])
    jpath.write_text(json.dumps(jdata, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    notes.append(f"yellow-pages data.json retargeted {len(jchanged)}")

    html, m, pages = load_pages()
    new_pages = [
        page_entry(SITE + "apps/clips-demo/", "Coffeebreak camera demo", "Apps & More", "☕", "C"),
        page_entry(ORIGIN + "/coffeebreak-fan-club/", "Coffeebreak Fan Club", "Social & Mail", "💌", "F"),
        page_entry(ORIGIN + "/coffeebreak-sugarloaf-vr/", "Coffeebreak Mount Sugarloaf VR Map", "Travel & Places", "🧭", "M"),
        page_entry(ORIGIN + "/coffeebreak-vr-studio/", "Coffeebreak VR Studio", "Creative Tools", "🎨", "V"),
        page_entry(NETLIFY_LIVE["play-tracker"], "Coffeebreak Play Tracker", "Music", "🎵", "P"),
        page_entry(ORIGIN + "/coffeebreak-fashion-3d-print/", "Coffeebreak Fashion 3D Print", "Fashion & Beauty", "💅", "F"),
    ]
    have = {(e.get("url") or "").rstrip("/") for e in pages}
    added_pages = []
    for e in new_pages:
        if e["url"].rstrip("/") not in have:
            pages.append(e)
            added_pages.append(e["title"])
    save_pages(html, m, pages)
    notes.append("pages added: " + (", ".join(added_pages) or "none"))

    hub = ROOT / "index.html"
    htext = hub.read_text(encoding="utf-8")
    links = [
        (SITE + "apps/clips/", "Coffeebreak camera"),
        (SITE + "apps/clips-demo/", "Coffeebreak camera demo"),
        (ORIGIN + "/coffeebreak-fan-club/", "Fan Club"),
        (ORIGIN + "/coffeebreak-fashion-3d-print/", "Fashion 3D Print"),
        (ORIGIN + "/coffeebreak-sugarloaf-vr/", "Mount Sugarloaf VR"),
        (ORIGIN + "/coffeebreak-vr-studio/", "VR Studio"),
        (NETLIFY_LIVE["play-tracker"], "Play Tracker"),
    ]
    fresh = [(u, t) for u, t in links if u not in htext]
    if fresh and 'id="restored-public-apps"' not in htext:
        block = [
            '<section id="restored-public-apps">',
            "<h2>Restored Coffeebreak apps</h2>",
            '<div class="g">',
        ]
        for u, t in fresh:
            block.append(f'<a class="a" href="{u}">{t}</a>')
        block.append("</div></section>\n")
        needle = "<!-- GHOST-APPS-HUB -->"
        if needle not in htext:
            raise SystemExit("hub marker missing")
        htext = htext.replace(needle, "\n".join(block) + needle, 1)
        hub.write_text(htext, encoding="utf-8")
        notes.append("hub links added: " + ", ".join(t for _, t in fresh))
    else:
        notes.append("hub already linked")


def restore_clips(staged: Path, notes: list) -> None:
    full = staged / "coffeebreak-app-clips-full"
    demo = staged / "coffeebreak-app-clips-demo"
    if not (full / "game.js").is_file():
        notes.append("clips staging missing; skip file restore")
        return
    got = sha256(full / "game.js")
    if got != NEW_CLIPS_GAME:
        raise SystemExit("staged game.js is not the d1105 Draw build")
    dest_game = ROOT / "apps" / "clips" / "game.js"
    cur = sha256(dest_game)
    if cur == OLD_CLIPS_GAME:
        shutil.copy2(full / "game.js", dest_game)
        notes.append("clips game.js upgraded to Draw build")
    elif cur == NEW_CLIPS_GAME:
        notes.append("clips game.js already Draw build")
    else:
        notes.append("clips game.js left unchanged (unknown hash)")
    for name in ("cb-plus.js", "cb-studio-pro.js", "cbreport.js", "cb-plus-logo.png"):
        copy_if_missing(full / name, ROOT / "apps" / "clips" / name, notes)
    notes.append("full camera audio files were not copied; payment is not checked on this site")
    index = ROOT / "apps" / "clips" / "index.html"
    html = index.read_text(encoding="utf-8")
    if "cb-studio-pro.js" not in html:
        tag = (
            '<script src="cbreport.js"></script>'
            '<script src="cb-plus.js" data-app="Coffeebreak" '
            f'data-url="{SITE}apps/clips/" data-kind="app" data-howto=""></script>'
            '<script src="cb-studio-pro.js"></script>'
        )
        if "</body>" not in html:
            raise SystemExit("clips index has no body end")
        html = html.replace("</body>", tag + "</body>", 1)
        index.write_text(html, encoding="utf-8")
        notes.append("wired report, plus and studio onto clips index")
    # demo is a complete separate tree. Do not copy its cleared config or short playlist onto the full app.
    demo_dest = ROOT / "apps" / "clips-demo"
    if not (demo_dest / "index.html").is_file() and (demo / "index.html").is_file():
        shutil.copytree(demo, demo_dest, dirs_exist_ok=False)
        public_cfg = ROOT / "apps" / "clips" / "assets" / "sb-config.js"
        cfg = demo_dest / "assets" / "sb-config.js"
        if public_cfg.is_file():
            shutil.copy2(public_cfg, cfg)
        dhtml = (demo_dest / "index.html").read_text(encoding="utf-8")
        dhtml = dhtml.replace(
            'data-url="https://coffeebreaks.itch.io/coffeebreak-app"',
            f'data-url="{SITE}apps/clips-demo/"',
        )
        dhtml = dhtml.replace('href="https://coffeebreaks.itch.io"', f'href="{SITE}"')
        if "cb-pages-bar.js" not in dhtml:
            dhtml = dhtml.replace(
                "</head>",
                '<script id="cb-pages-bar-script" src="https://songwriterkaz.github.io/coffeebreak/pages/cb-pages-bar.js" defer></script></head>',
                1,
            )
        (demo_dest / "index.html").write_text(dhtml, encoding="utf-8")
        notes.append("added clips demo as its own folder")
    elif (demo_dest / "index.html").is_file():
        notes.append("clips demo already present")


def restore_studio_song(staged: Path, notes: list) -> None:
    notes.append("virtual-music-studio song file was not added; the newer page stays as it is")


def restore_tv(staged: Path, notes: list) -> None:
    notes.append("coffeebreak-tv full package was not published; no payment check")


def batch1_slugs(summary_path: Path | None) -> list[str]:
    if summary_path and summary_path.is_file():
        data = json.loads(summary_path.read_text(encoding="utf-8"))
        return [p["slug"] for p in data.get("products", [])]
    # Fallback list used when the intake file is not beside the repo.
    return [
        "aussie-dash", "bible-board", "big-toys-creatures", "bill-reminder-tracker",
        "blockbuster-tools", "budget-planner", "burger-store", "cb-ghost-scanner",
        "coffee-mail", "coffee-stack", "creature-tarot", "crystal-confetti-lucky-dip",
        "debate-bill-builder", "debt-payoff-planner", "dj-bike", "dreams-boards-and-books",
        "eats", "espresso-music-maker", "expense-splitter", "fan-club", "fashion-3d-print",
        "fashion-3d", "fashion-studio-3d-print-wigs", "fashion", "find-my-way",
        "fishing-store", "flash-auction", "flash-register", "food-delivery",
        "girl-runway-sim", "grapevine-store", "hampers", "holidays", "hoodies",
        "ice-skate", "journals-store", "karaoke-link-converter", "leather-glasses-store",
        "leather-glasses", "makeup-collection", "makeup-store-cart", "manifest",
        "model-shoot-glossary", "music-release-desk", "music-software", "oneapp-phone",
        "op-shop", "outback-hats", "overalls", "payment-calendar", "perfect-pour",
        "piercing-store", "pinata-party", "play-tracker", "print-your-own-bricks",
        "pub-and-servo-manager", "radio-pitch-builder-v2", "reborn-doll-store",
        "reborn-dolls", "receipt-maker", "red-paper-clip-tracker", "savings-goals",
        "shoes", "sinks-and-basins", "sole-trader-log", "song-maker", "store-builder",
        "sugarloaf-vr", "target-range", "time-zone-quiz", "trophy-store", "two-plates",
        "unit-price-compare", "vending-machines", "vent-journal", "virtual-brick-castle",
        "vision-board", "vr-studio", "wifiphone-contacts", "wifiphone-jumbo",
    ]


def classify_slug(slug: str) -> dict:
    """Classify one batch-01 slug from the repo as it stands after restore."""
    if slug == "makeup-store-cart":
        return {
            "slug": slug, "status": "blocked",
            "reason": "Concept listing is already public at makeup-range. The cart only opens an email and does not take an order. It was not copied.",
            "public_url": SITE + "makeup-range/",
            "repackage": False,
        }
    if slug == "radio-pitch-builder-v2":
        return {
            "slug": slug, "status": "unchanged",
            "reason": "radio-pitch-builder on this site is a newer superset of v2, including the pages bar and PayID tip.",
            "public_url": SITE + "radio-pitch-builder/",
            "repackage": False,
        }
    if slug == "play-tracker":
        return {
            "slug": slug, "status": "unchanged",
            "reason": "Working tracker is already hosted with its sync service. The song-match library was not copied here because this site cannot check payment. Microphone listening and APRA file export run on that host, not as a static page.",
            "public_url": NETLIFY_LIVE["play-tracker"],
            "repackage": False,
            "gated_delivery": "no payment check on the public tracker",
        }
    if slug == "espresso-music-maker":
        return {
            "slug": slug, "status": "unchanged",
            "reason": "This folder redirects to the live sibling site. The older full tree was not written over that redirect.",
            "public_url": f"{ORIGIN}/coffeebreak-espresso-music-maker/",
            "repackage": False,
        }
    if slug == "coffee-mail":
        return {
            "slug": slug, "status": "unchanged",
            "reason": "In-repo page is a newer self-contained inbox. It stores mail in the browser and opens the visitor's email app. It is not a mail server. Search entry added.",
            "public_url": SITE + "coffee-mail/",
            "repackage": False,
            "requires_backend": "real mail delivery",
        }
    url = canonical_url(slug)
    local = (ROOT / slug / "index.html").is_file() or (ROOT / "apps" / slug / "index.html").is_file()
    if slug in SIBLING_LIVE and not local:
        return {
            "slug": slug, "status": "unchanged",
            "reason": "Already live on its own GitHub Pages site. Files were not copied into this repo. Directory links point at that site.",
            "public_url": url,
            "repackage": False,
        }
    if local:
        return {
            "slug": slug, "status": "unchanged",
            "reason": "Repo copy is present. Asset files match the batch except a newer index (site bar or PayID). It was not overwritten.",
            "public_url": url,
            "repackage": False,
        }
    return {
        "slug": slug, "status": "blocked",
        "reason": "No healthy public copy was found and the batch was not imported automatically.",
        "public_url": None,
        "repackage": True,
    }


def write_results(slugs: list[str]) -> None:
    out_dir = ROOT / "public-import"
    out_dir.mkdir(exist_ok=True)
    rows = [classify_slug(s) for s in slugs]
    rows.extend([
        {
            "slug": "coffeebreak-app-clips-full",
            "status": "imported",
            "reason": "Draw pen (Pink, White, Gold, Mint, Rainbow, Thin/Medium/Thick, Undo), studio and report scripts are on the existing public app. Playlist entries were kept. The audio files were not added, because this site does not check the $10 payment. Social login does not authenticate. Not fully working. Not published until this branch is merged and Pages is checked. No daily upgrade was started.",
            "public_url": SITE + "apps/clips/",
            "deployment": "branch-only until merge",
            "draw": True,
            "protected": False,
            "functional": "partial",
            "missing_files": CLIPS_AUDIO_STILL_MISSING,
            "repackage": True,
            "repackage_note": "Resend only the missing audio files. Do not resend game.js or the tracks now in the repo.",
        },
        {
            "slug": "coffeebreak-app-clips-demo",
            "status": "imported",
            "reason": "Complete demo tree placed beside the full app. It does not replace the full app. Login uses the same already-public client config and still does not authenticate.",
            "public_url": SITE + "apps/clips-demo/",
            "deployment": "branch-only until merge",
            "draw": True,
            "protected": False,
            "functional": "demo-complete",
            "repackage": False,
        },
        {
            "slug": "coffeebreak-tv",
            "status": "blocked",
            "reason": "Full TV package and videos were removed from this branch. There is no payment check, so the full app is not hosted here. No separate live URL was verified.",
            "public_url": None,
            "gated_delivery": "full TV package withheld",
            "repackage": True,
            "repackage_note": "Stage only if a protected delivery path exists. Do not treat filename wording as a content finding.",
        },
        {
            "slug": "coffeebreak-virtual-music-studio",
            "status": "unchanged",
            "reason": "The newer page was already public, including its other songs. The missing Coffee Break file was not added, so a new full download was not published.",
            "public_url": SITE + "virtual-music-studio/",
            "deployment": "already on main for the page; song file still absent",
            "repackage": False,
            "missing_files": ["songs/coffee-break.mp3"],
        },
        {
            "slug": "coffeebreak-mail",
            "status": "blocked",
            "reason": "Core only. Songs, videos and the 3D library are still missing, so the desk was not published. It also cannot send mail from a static page. Existing Coffee Mail page was left as it is.",
            "public_url": SITE + "coffee-mail/",
            "missing_files": MAIL_STILL_MISSING,
            "requires_backend": "mail delivery",
            "repackage": True,
            "repackage_note": "Send the missing media and 3D library. The core HTML and JS were already reviewed.",
        },
    ])
    counts = {}
    for row in rows:
        counts[row["status"]] = counts.get(row["status"], 0) + 1
    results = {
        "deployment": "Not published. https://songwriterkaz.github.io/coffeebreak/ stays on main until this branch is merged and Pages is checked.",
        "payment": "No payment check was added. Public GitHub files can be opened without paying. Full new downloads were not added. PayID label only. Stripe was not changed.",
        "counts": counts,
        "count_note": "Each slug has one status. Makeup cart is blocked. Play Tracker is unchanged because its existing host was left in place. Those are not two extra blocked rows.",
        "products": rows,
    }
    (out_dir / "batch-results.json").write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    wanted = []
    skip = []
    for row in rows:
        if row.get("repackage"):
            wanted.append({
                "slug": row["slug"],
                "why": row.get("repackage_note") or row["reason"],
                "missing_files": row.get("missing_files") or [],
            })
        else:
            skip.append(row["slug"])
    manifest = {
        "do_not_repackage": skip,
        "still_wanted": wanted,
        "uncompared_remaining_reported_by_intake": 361,
        "note": "The first 85 slugs are in this file. The later 361-slug groups are in queue-361.json. Do not pack do_not_repackage slugs again. review_needed there is slug text only, not a content ruling.",
    }
    (out_dir / "wanted-slugs.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def head_ok(url: str) -> bool:
    req = urllib.request.Request(url, method="GET", headers={"User-Agent": "coffeebreak-import-check"})
    try:
        with urllib.request.urlopen(req, timeout=20, context=ssl.create_default_context()) as r:
            r.read(200)
            return 200 <= r.status < 400
    except Exception:
        return False


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--apply", action="store_true")
    p.add_argument("--check", action="store_true")
    p.add_argument("--staged", default="")
    p.add_argument("--summary", default="")
    args = p.parse_args()
    slugs = batch1_slugs(Path(args.summary) if args.summary else None)
    notes: list[str] = []
    if args.apply:
        staged = Path(args.staged) if args.staged else None
        if staged and staged.is_dir():
            restore_clips(staged, notes)
            restore_studio_song(staged, notes)
            restore_tv(staged, notes)
        apply_catalogue(slugs, notes)
        write_results(slugs)
    else:
        write_results(slugs)
        notes.append("check only")
    print(json.dumps({"notes": notes, "slugs": len(slugs)}, indent=2))


if __name__ == "__main__":
    main()
