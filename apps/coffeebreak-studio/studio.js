import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client@2.8.0/dist/index.min.js";
import { makeSong } from "./studio-core.js";

const $ = (id) => document.getElementById(id);
const LIST_KEY = "cbStudioSongs.v1";
const TOKEN_KEY = "cbStudioHfToken";
const CHIPS = ["pop", "female vocal", "male vocal", "country", "rock", "R&B", "soul", "gospel", "hip hop", "EDM", "lofi", "ballad", "piano", "acoustic guitar", "strings", "sad", "happy", "romantic", "energetic", "120 BPM"];

// ---------- tiny IndexedDB store for the audio itself ----------
function db() {
  return new Promise((res, rej) => {
    const r = indexedDB.open("cbStudio", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("audio");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function putAudio(id, blob) {
  const d = await db();
  return new Promise((res, rej) => { const t = d.transaction("audio", "readwrite"); t.objectStore("audio").put(blob, id); t.oncomplete = res; t.onerror = () => rej(t.error); });
}
async function getAudio(id) {
  const d = await db();
  return new Promise((res, rej) => { const t = d.transaction("audio").objectStore("audio").get(id); t.onsuccess = () => res(t.result || null); t.onerror = () => rej(t.error); });
}
async function delAudio(id) {
  const d = await db();
  return new Promise((res) => { const t = d.transaction("audio", "readwrite"); t.objectStore("audio").delete(id); t.oncomplete = res; t.onerror = res; });
}

function loadList() { try { return JSON.parse(localStorage.getItem(LIST_KEY) || "[]"); } catch (e) { return []; } }
function saveList(l) { localStorage.setItem(LIST_KEY, JSON.stringify(l.slice(0, 50))); }

function setStatus(msg, kind) {
  const s = $("status");
  s.textContent = msg;
  s.className = "status" + (kind ? " " + kind : "");
}
function safeName(t) { return (t || "coffeebreak-song").replace(/[^a-z0-9\- ]/gi, "").trim().replace(/\s+/g, "-").toLowerCase() || "coffeebreak-song"; }
function extOf(blob, url) {
  const t = (blob && blob.type) || "";
  if (/wav/.test(t) || /^data:audio\/wav/.test(url) || /\.wav/i.test(url)) return "wav";
  if (/flac/.test(t) || /\.flac/i.test(url)) return "flac";
  return "mp3";
}

// ---------- UI ----------
const chipBox = $("chips");
CHIPS.forEach((c) => {
  const b = document.createElement("button");
  b.type = "button"; b.textContent = "+ " + c;
  b.onclick = () => { const s = $("style"); s.value = s.value.trim() ? s.value.trim().replace(/,\s*$/, "") + ", " + c : c; };
  chipBox.appendChild(b);
});
$("duration").oninput = () => { $("durOut").textContent = $("duration").value; };
$("token").value = localStorage.getItem(TOKEN_KEY) || "";
$("saveToken").onclick = () => {
  const v = $("token").value.trim();
  if (v && !/^hf_/.test(v)) { setStatus("That doesn't look like a Hugging Face token (it should start with hf_).", "err"); return; }
  if (v) localStorage.setItem(TOKEN_KEY, v); else localStorage.removeItem(TOKEN_KEY);
  setStatus(v ? "Token saved in this browser." : "Token removed.");
};
$("clearToken").onclick = () => { localStorage.removeItem(TOKEN_KEY); $("token").value = ""; setStatus("Token removed."); };

let currentUrl = null;
function showSong(title, blobOrUrl, info) {
  if (currentUrl && currentUrl.startsWith("blob:")) URL.revokeObjectURL(currentUrl);
  const url = typeof blobOrUrl === "string" ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  currentUrl = url;
  $("result").hidden = false;
  $("resTitle").textContent = title;
  $("player").src = url;
  $("dl").href = url;
  $("dl").download = safeName(title) + "." + extOf(typeof blobOrUrl === "string" ? null : blobOrUrl, url);
  $("resInfo").textContent = info || "";
  $("result").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function renderList() {
  const ul = $("songList");
  const list = loadList();
  ul.innerHTML = "";
  if (!list.length) { ul.innerHTML = '<li class="muted">No songs yet. Make your first one above!</li>'; return; }
  list.forEach((s) => {
    const li = document.createElement("li");
    const t = document.createElement("div"); t.className = "t"; t.textContent = s.title;
    const m = document.createElement("div"); m.className = "m"; m.textContent = new Date(s.at).toLocaleString() + " · " + s.duration + "s · " + s.style;
    const acts = document.createElement("div"); acts.className = "acts";
    const play = document.createElement("button"); play.className = "small"; play.textContent = "▶ Play";
    play.onclick = async () => {
      const blob = await getAudio(s.id).catch(() => null);
      if (blob) showSong(s.title, blob, "From your saved songs.");
      else setStatus("Sorry, this song's audio is no longer stored in this browser.", "err");
    };
    const reuse = document.createElement("button"); reuse.className = "small ghost"; reuse.textContent = "Reuse lyrics";
    reuse.onclick = () => { $("title").value = s.title; $("style").value = s.style; $("lyrics").value = s.lyrics; window.scrollTo({ top: 0, behavior: "smooth" }); };
    const del = document.createElement("button"); del.className = "small ghost"; del.textContent = "Delete";
    del.onclick = async () => {
      if (!confirm("Delete \"" + s.title + "\" from this browser?")) return;
      await delAudio(s.id); saveList(loadList().filter((x) => x.id !== s.id)); renderList();
    };
    acts.append(play, reuse, del);
    li.append(t, m, acts);
    ul.appendChild(li);
  });
}

async function toBlob(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("download failed " + r.status);
  return r.blob();
}

$("go").onclick = async () => {
  const title = $("title").value.trim() || "My Coffeebreak Song";
  const style = $("style").value.trim();
  let lyrics = $("lyrics").value.trim();
  const instrumental = $("instrumental").checked;
  if (!style) { setStatus("Add a few style tags first, like: pop, female vocal, piano.", "err"); return; }
  if (instrumental) lyrics = "[Instrumental]";
  else if (!lyrics) { setStatus("Add some lyrics so there's something to sing (or tick Instrumental).", "err"); return; }
  const song = { style, lyrics, duration: Number($("duration").value), lang: $("lang").value };
  const btn = $("go");
  btn.disabled = true; btn.textContent = "🎶 Making your song...";
  setStatus("Starting the free music engine...", "busy");
  try {
    const token = localStorage.getItem(TOKEN_KEY) || "";
    const res = await makeSong(Client, song, (m) => setStatus(m, "busy"), token);
    let blob = null;
    try { blob = await toBlob(res.url); } catch (e) { /* fall back to the URL */ }
    const info = "Made with " + res.backend + ".";
    if (blob) {
      const id = "s" + Date.now();
      try {
        await putAudio(id, blob);
        const list = loadList();
        list.unshift({ id, title, style, lyrics, duration: song.duration, at: Date.now(), backend: res.backend });
        saveList(list);
      } catch (e) { /* storage full or private mode: still play it */ }
      showSong(title, blob, info);
    } else {
      showSong(title, res.url, info + " Download it now; this link expires.");
    }
    setStatus("Done! Your song is ready below. 🎉");
    renderList();
  } catch (e) {
    if (e && e.quota) {
      setStatus("The free music engine's daily allowance for your internet connection is used up. Try again later (it resets about 24 hours after you started), or add a free Hugging Face token under \"Making lots of songs?\" below.", "err");
    } else {
      setStatus("All the free music engines are busy or resting right now. Please try again in a few minutes. (" + ((e && e.message) || e) + ")", "err");
    }
    if (e && e.all) console.warn("Coffeebreak Studio engine errors:", e.all);
  } finally {
    btn.disabled = false; btn.textContent = "🎤 Make my song";
  }
};

renderList();
