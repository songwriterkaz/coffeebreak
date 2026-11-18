// Coffeebreak Studio core: talks to free public ACE-Step Spaces on Hugging Face.
// ACE-Step is open-source by ACE Studio & StepFun. Coffeebreak did not make the model.
// Order matters: the free allowance is shared per internet connection, so the engine
// that was verified working goes first and a broken one cannot use it up.
export const BACKENDS = [
  { id: "victor/ace-step-jam", name: "ACE-Step Jam (community demo)", kind: "jam" },
  { id: "ACE-Step/Ace-Step-v1.5", name: "ACE-Step 1.5 (official demo)", kind: "v15" },
  { id: "Kansasfan/Ace-Step-v1.5", name: "ACE-Step 1.5 (community copy)", kind: "v15" },
  { id: "Blursed/Ace-Step-v1.5", name: "ACE-Step 1.5 (community copy 2)", kind: "v15" }
];

export function isQuotaError(msg) {
  return /zerogpu|quota|runs limit|exceeded/i.test(String(msg || ""));
}

function findAudio(x, depth) {
  depth = depth || 0;
  if (x == null || depth > 6) return null;
  if (typeof x === "string") {
    if (/^data:audio\//.test(x)) return x;
    if (/^https?:\/\//.test(x) && /\.(mp3|wav|flac|ogg|m4a)(\?|$)/i.test(x)) return x;
    return null;
  }
  if (Array.isArray(x)) {
    for (const y of x) { const r = findAudio(y, depth + 1); if (r) return r; }
    return null;
  }
  if (typeof x === "object") {
    if (x.url && /\.(mp3|wav|flac|ogg|m4a)/i.test(x.url + (x.path || "") + (x.orig_name || ""))) return x.url;
    if (x.value) { const r = findAudio(x.value, depth + 1); if (r) return r; }
    for (const k of Object.keys(x)) { const r = findAudio(x[k], depth + 1); if (r) return r; }
  }
  return null;
}
export { findAudio };

export function buildV15Args(params, song) {
  const over = {
    "prompt": song.style,
    "lyrics": song.lyrics,
    "vocal language": song.lang || "en",
    "audio duration (seconds)": song.duration,
    "audio format": "mp3",
    "batch size": 1,
    "samples per generation": 1
  };
  return params.map(function (p) {
    const label = String(p.label || "").toLowerCase();
    if (p.parameter_name === "generation_mode") return "custom";
    if (p.parameter_name === "selected_model") return p.parameter_default || "acestep-v15-xl-turbo";
    if (Object.prototype.hasOwnProperty.call(over, label)) return over[label];
    if (p.parameter_has_default) return p.parameter_default;
    const t = p.python_type && p.python_type.type;
    if (t === "str") return "";
    return null;
  });
}

function textOf(data) {
  if (!Array.isArray(data)) return "";
  return data.filter(function (d) { return typeof d === "string"; }).join(" \n").trim();
}

// Run one backend. onStatus(text) gets friendly progress messages.
export async function runBackend(Client, backend, song, onStatus, token) {
  const opts = { events: ["data", "status"] };
  if (token) opts.token = token;
  onStatus("Connecting to " + backend.name + "...");
  const app = await Client.connect(backend.id, opts);
  let endpoint, args;
  if (backend.kind === "v15") {
    const api = await app.view_api();
    const ep = api.named_endpoints["/generation_wrapper"];
    if (!ep) throw new Error("This music engine changed its menu. Trying another one.");
    endpoint = "/generation_wrapper";
    args = buildV15Args(ep.parameters, song);
  } else {
    endpoint = "/generate";
    args = [song.style, song.lyrics, song.duration, 8, 7.0, -1, "", 0.8];
  }
  const job = app.submit(endpoint, args);
  let data = null;
  for await (const msg of job) {
    if (msg.type === "status") {
      if (msg.stage === "error") throw new Error(msg.message || "The music engine reported an error.");
      if (msg.queue && typeof msg.position === "number") {
        onStatus("You're number " + (msg.position + 1) + " in the free queue" + (msg.eta ? " (about " + Math.round(msg.eta) + "s)" : "") + ". Hang tight!");
      } else if (msg.stage === "pending" || msg.stage === "generating") {
        onStatus("Writing your song with vocals... this usually takes 30 seconds to 2 minutes.");
      }
    } else if (msg.type === "data") {
      data = msg.data;
      break;
    }
  }
  const url = findAudio(data);
  if (!url) {
    const t = textOf(data);
    throw new Error(t || "The music engine finished but sent back no song.");
  }
  return { url: url, backend: backend.name, info: textOf(data).slice(0, 400) };
}

// Try backends in order. Stops early on quota errors (quota is shared per internet connection).
export async function makeSong(Client, song, onStatus, token, backends) {
  const list = backends || BACKENDS;
  const errors = [];
  for (const b of list) {
    try {
      return await runBackend(Client, b, song, onStatus, token);
    } catch (e) {
      const m = (e && (e.message || e.toString())) || String(e);
      errors.push(b.name + ": " + m);
      if (isQuotaError(m)) {
        const err = new Error(m); err.quota = true; err.all = errors; throw err;
      }
      onStatus(b.name + " is busy or resting. Trying the next free engine...");
    }
  }
  const err = new Error("All free music engines are busy right now."); err.all = errors; throw err;
}
