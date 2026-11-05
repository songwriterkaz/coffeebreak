// Coffeebreak Tube API: a small write proxy to Sanity (project 8chc6tjv, free plan).
// Cloudflare Pages Function port. The Sanity token lives only as a Cloudflare secret (SANITY_TOKEN), never in the app.
const randomUUID = () => crypto.randomUUID();
const P = '8chc6tjv', DS = 'production', PRIVDS = 'orders', V = 'v2024-01-01';
let TOKEN;
const MAX_CHUNK = 4 * 1024 * 1024, MAX_CHUNKS = 15, HIDE_AT = 3;
const ORIGINS = [/^https:\/\/coffeebreaks\.itch\.io$/, /^https:\/\/[a-z0-9-]+\.itch\.zone$/, /^https:\/\/html-classic\.itch\.zone$/, /^https:\/\/coffeebreak-tube[a-z0-9-]*\.netlify\.app$/, /^https:\/\/([a-z0-9-]+\.)?coffeebreak-tube[a-z0-9-]*\.pages\.dev$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/, /^null$/];
const hits = new Map();
function cors(req) {
  const o = req.headers.get('origin') || '';
  return { 'Access-Control-Allow-Origin': ORIGINS.some(r => r.test(o)) ? o : 'https://coffeebreaks.itch.io', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'content-type,x-cb-profile,x-cb-key', 'Vary': 'Origin' };
}
const J = (req, data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...cors(req) } });
const hash = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s))))].map(b => b.toString(16).padStart(2, '0')).join('');
const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const PRIV = /[^\s@]+@[^\s@]+\.[a-z]{2,}|(\+?61|0)[2-478](?:[ -]?\d){8}|\d(?:[ -]?\d){8,}/i;
const privErr = (...t) => t.some(x => PRIV.test(x || ''));
const idOk = s => typeof s === 'string' && /^[A-Za-z0-9_-]{6,64}$/.test(s);
async function q(query, params = {}, ds = DS) {
  const u = new URL(`https://${P}.api.sanity.io/${V}/data/query/${ds}`);
  u.searchParams.set('query', query);
  for (const [k, v] of Object.entries(params)) u.searchParams.set('$' + k, JSON.stringify(v));
  const r = await fetch(u, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) throw new Error('query ' + r.status);
  return (await r.json()).result;
}
async function mutate(mutations, ds = DS) {
  const r = await fetch(`https://${P}.api.sanity.io/${V}/data/mutate/${ds}?returnIds=true&visibility=sync`, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify({ mutations }) });
  if (!r.ok) throw new Error('mutate ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return r.json();
}
function limited(req, kind, max) {
  const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'x';
  const k = kind + ':' + ip, now = Date.now(), arr = (hits.get(k) || []).filter(t => now - t < 3600e3);
  arr.push(now); hits.set(k, arr); return arr.length > max;
}
async function owner(profileId, key) {
  if (!idOk(profileId) || !key || String(key).length < 20) return null;
  const p = await q('*[_type=="cbTubeProfile" && _id==$id][0]{_id,keyHash}', { id: 'cbtube-p-' + profileId });
  return p && p.keyHash === await hash(key) ? p : null;
}
const PROFILE = '{"id":string::split(_id,"cbtube-p-")[1],name,bio,avatar,pronouns,gender}';
const VIDEO = `{"id":string::split(_id,"cbtube-v-")[1],title,desc,type,size,thumb,views,likes,comments,"at":_createdAt,"chunks":chunks[]{"url":asset->url,"size":asset->size},"owner":owner->${PROFILE}}`;
const visible = '_type=="cbTubeVideo" && hidden!=true && defined(owner->_id) && owner->hidden!=true';

async function handle(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
  if (!TOKEN) return J(req, { error: 'Server is not set up yet.' }, 500);
  const url = new URL(req.url), a = url.searchParams.get('a') || '';
  try {
    if (req.method === 'GET') {
      if (a === 'feed') {
        const s = clean(url.searchParams.get('q'), 60).toLowerCase(), ch = url.searchParams.get('ch');
        let filter = visible, params = {};
        if (ch && idOk(ch)) { filter += ' && owner._ref==$o'; params.o = 'cbtube-p-' + ch; }
        if (s) { filter += ' && (lower(title) match $s || lower(desc) match $s || lower(owner->name) match $s)'; params.s = '*' + s.replace(/[*"\\]/g, '') + '*'; }
        const videos = await q(`*[${filter}]|order(_createdAt desc)[0...120]${VIDEO}`, params);
        const channels = s ? await q(`*[_type=="cbTubeProfile" && hidden!=true && (lower(name) match $s || lower(bio) match $s)][0...20]${PROFILE}`, { s: params.s }) : [];
        return J(req, { videos, channels });
      }
      if (a === 'video') {
        const id = url.searchParams.get('id'); if (!idOk(id)) return J(req, { error: 'bad id' }, 400);
        const v = await q(`*[${visible} && _id==$id][0]{...${VIDEO},"cm":cm[hidden!=true]{_key,t,at,"p":p->${PROFILE}}}`, { id: 'cbtube-v-' + id });
        return v ? J(req, v) : J(req, { error: 'not found' }, 404);
      }
      if (a === 'profile') {
        const id = url.searchParams.get('id'); if (!idOk(id)) return J(req, { error: 'bad id' }, 400);
        return J(req, await q(`*[_type=="cbTubeProfile" && hidden!=true && _id==$id][0]${PROFILE}`, { id: 'cbtube-p-' + id }));
      }
      if (a === 'ping') return J(req, { ok: true });
      return J(req, { error: 'unknown' }, 400);
    }
    if (req.method !== 'POST') return J(req, { error: 'method' }, 405);
    if (a === 'chunk') {
      if (limited(req, 'chunk', 400)) return J(req, { error: 'Too many uploads, try again later.' }, 429);
      const me = await owner(req.headers.get('x-cb-profile'), req.headers.get('x-cb-key'));
      if (!me) return J(req, { error: 'Profile not recognised.' }, 403);
      const buf = new Uint8Array(await req.arrayBuffer());
      if (!buf.length || buf.length > MAX_CHUNK) return J(req, { error: 'Chunk too big.' }, 413);
      const r = await fetch(`https://${P}.api.sanity.io/${V}/assets/files/${DS}?filename=cbtube-${Date.now()}.part`, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/octet-stream' }, body: buf });
      if (!r.ok) return J(req, { error: 'Upload failed.' }, 502);
      const d = (await r.json()).document; return J(req, { asset: d._id, url: d.url });
    }
    const b = await req.json().catch(() => ({}));
    if (a === 'profile') {
      if (limited(req, 'profile', 30)) return J(req, { error: 'Too many changes, try again later.' }, 429);
      const name = clean(b.name, 40); if (!name) return J(req, { error: 'Name needed.' }, 400);
      const avatar = typeof b.avatar === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(b.avatar) && b.avatar.length < 60000 ? b.avatar : null;
      if (privErr(name, b.bio)) return J(req, { error: 'Please leave out phone numbers, email addresses and other private details.' }, 400);
      const fields = { name, bio: clean(b.bio, 300), pronouns: clean(b.pronouns, 30) || null, gender: clean(b.gender, 40) || null, avatar };
      if (b.id) {
        const me = await owner(b.id, b.key); if (!me) return J(req, { error: 'Profile not recognised.' }, 403);
        const set = {}, unset = [];
        for (const [k, v] of Object.entries(fields)) v === null ? (k === 'avatar' && b.keepAvatar ? 0 : unset.push(k)) : (set[k] = v);
        await mutate([{ patch: { id: me._id, set, unset } }]);
        return J(req, { id: b.id });
      }
      const id = randomUUID().replace(/-/g, '').slice(0, 20), key = randomUUID() + randomUUID();
      const doc = { _id: 'cbtube-p-' + id, _type: 'cbTubeProfile', keyHash: await hash(key) };
      for (const [k, v] of Object.entries(fields)) if (v !== null) doc[k] = v;
      await mutate([{ create: doc }]);
      return J(req, { id, key });
    }
    if (a === 'video') {
      if (limited(req, 'video', 20)) return J(req, { error: 'Too many uploads, try again later.' }, 429);
      const me = await owner(b.profile, b.key); if (!me) return J(req, { error: 'Profile not recognised.' }, 403);
      const title = clean(b.title, 100); if (!title) return J(req, { error: 'Title needed.' }, 400);
      if (privErr(title, b.desc)) return J(req, { error: 'Please leave out phone numbers, email addresses and other private details.' }, 400);
      const chunks = Array.isArray(b.chunks) ? b.chunks.filter(c => /^file-[a-f0-9]{40}-part$/.test(c)) : [];
      if (!chunks.length || chunks.length !== b.chunks.length || chunks.length > MAX_CHUNKS) return J(req, { error: 'Video parts missing.' }, 400);
      const thumb = typeof b.thumb === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(b.thumb) && b.thumb.length < 80000 ? b.thumb : null;
      const id = randomUUID().replace(/-/g, '').slice(0, 20);
      const doc = { _id: 'cbtube-v-' + id, _type: 'cbTubeVideo', owner: { _type: 'reference', _ref: me._id, _weak: true }, title, desc: clean(b.desc, 2000), type: clean(b.type, 40) || 'video/mp4', size: Number(b.size) || 0, comments: !!b.comments, views: 0, likes: 0, reports: 0, cm: [],
        chunks: chunks.map((c, i) => ({ _key: 'c' + i, _type: 'file', asset: { _type: 'reference', _ref: c } })) };
      if (thumb) doc.thumb = thumb;
      await mutate([{ create: doc }]);
      return J(req, { id });
    }
    if (a === 'view' || a === 'like' || a === 'unlike') {
      if (!idOk(b.id) || limited(req, a, 300)) return J(req, { ok: false });
      await mutate([{ patch: { id: 'cbtube-v-' + b.id, setIfMissing: { views: 0, likes: 0 }, inc: a === 'view' ? { views: 1 } : a === 'like' ? { likes: 1 } : { likes: -1 } } }]);
      return J(req, { ok: true });
    }
    if (a === 'comment') {
      if (limited(req, 'comment', 60)) return J(req, { error: 'Too many comments, try again later.' }, 429);
      const me = await owner(b.profile, b.key); if (!me) return J(req, { error: 'Profile not recognised.' }, 403);
      const t = clean(b.text, 500); if (!t || !idOk(b.id)) return J(req, { error: 'Empty comment.' }, 400);
      if (privErr(t)) return J(req, { error: 'Please leave out phone numbers, email addresses and other private details.' }, 400);
      const v = await q('*[_id==$id][0]{comments}', { id: 'cbtube-v-' + b.id }); if (!v || !v.comments) return J(req, { error: 'Comments are off.' }, 403);
      await mutate([{ patch: { id: 'cbtube-v-' + b.id, setIfMissing: { cm: [] }, insert: { after: 'cm[-1]', items: [{ _key: randomUUID().slice(0, 12), t, at: new Date().toISOString(), p: { _type: 'reference', _ref: me._id, _weak: true }, reports: 0 }] } } }]);
      return J(req, { ok: true });
    }
    if (a === 'report') {
      if (!idOk(b.id) || limited(req, 'report', 30)) return J(req, { ok: false }, 429);
      const reason = clean(b.reason, 300), kind = b.comment ? 'comment' : b.kind === 'channel' ? 'channel' : 'video';
      const docId = (kind === 'channel' ? 'cbtube-p-' : 'cbtube-v-') + b.id;
      if (kind === 'comment') {
        const k = String(b.comment).replace(/[^A-Za-z0-9-]/g, '');
        await mutate([{ patch: { id: docId, inc: { [`cm[_key=="${k}"].reports`]: 1 } } }]);
        const c = await q(`*[_id==$id][0].cm[_key==$k][0].reports`, { id: docId, k });
        if (c >= HIDE_AT) await mutate([{ patch: { id: docId, set: { [`cm[_key=="${k}"].hidden`]: true } } }]);
      } else {
        await mutate([{ patch: { id: docId, setIfMissing: { reports: 0 }, inc: { reports: 1 } } }]);
        const n = await q('*[_id==$id][0].reports', { id: docId });
        if (n >= HIDE_AT) await mutate([{ patch: { id: docId, set: { hidden: true } } }]);
      }
      // Private log for Karen to review in Sanity Studio (dataset "orders" is private). No reporter details are kept.
      await mutate([{ create: { _type: 'cbTubeReport', kind, target: docId, comment: b.comment ? String(b.comment).slice(0, 20) : null, reason, at: new Date().toISOString() } }], PRIVDS).catch(() => {});
      return J(req, { ok: true });
    }
    if (a === 'delete') {
      const me = await owner(b.profile, b.key); if (!me || !idOk(b.id)) return J(req, { error: 'Profile not recognised.' }, 403);
      const v = await q('*[_id==$id][0]{"o":owner._ref,"c":chunks[].asset._ref}', { id: 'cbtube-v-' + b.id });
      if (!v || v.o !== me._id) return J(req, { error: 'Only the owner can delete this.' }, 403);
      await mutate([{ delete: { id: 'cbtube-v-' + b.id } }]);
      await mutate((v.c || []).map(id => ({ delete: { id } }))).catch(() => {});
      return J(req, { ok: true });
    }
    return J(req, { error: 'unknown' }, 400);
  } catch (e) { console.error(e); return J(req, { error: 'Something went wrong, try again.' }, 500); }
}
export async function onRequest({ request, env }) { TOKEN = env.SANITY_TOKEN; return handle(request); }
