// Coffeebreak Deals voucher backend (Cloudflare Worker, free plan).
// Stores ONLY a salted SHA-256 hash of the visitor IP plus a random device ID. Never the raw IP.
// Secrets (set with wrangler secret put): IP_SALT, ADMIN_PASSWORD. KV binding: DEALS.
const J = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', ...cors, ...h } });
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS', 'access-control-allow-headers': 'content-type,authorization' };
const norm = c => String(c || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 40);
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
function same(a, b) { a = String(a || ''); b = String(b || ''); let r = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) r |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return r === 0 && a.length > 0; }
async function num(kv, k) { return +(await kv.get(k)) || 0; }
async function inc(kv, k) { const n = (await num(kv, k)) + 1; await kv.put(k, String(n)); return n; }

function discount(v, total) {
  total = +total || 0;
  switch (v.type) {
    case 'percent': return Math.round(total * v.value) / 100;
    case 'dollar': return Math.min(total, +v.value);
    case 'freeship': return 0;
    default: return +v.value || 0;
  }
}

async function evaluate(env, req, body) {
  const code = norm(body.code);
  if (!code) return { ok: false, reason: 'No code entered' };
  const v = JSON.parse((await env.DEALS.get('code:' + code)) || 'null');
  if (!v || v.active === false) return { ok: false, reason: 'Beanbot checked every cup. That code does not exist.' };
  const now = Date.now();
  if (v.starts && now < Date.parse(v.starts)) return { ok: false, reason: 'This code is not brewing yet' };
  if (v.expires && now > Date.parse(v.expires) + 86399999) return { ok: false, reason: 'This code has gone cold (expired)' };
  if (v.minOrder && (+body.total || 0) < v.minOrder) return { ok: false, reason: 'Minimum order is AUD ' + v.minOrder };
  const ip = req.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const ipH = (await sha(env.IP_SALT + '|' + ip)).slice(0, 32);
  const dev = String(body.deviceId || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 48) || 'none';
  const total = await num(env.DEALS, `cnt:${code}:total`);
  const ipN = await num(env.DEALS, `cnt:${code}:ip:${ipH}`);
  const devN = dev === 'none' ? 0 : await num(env.DEALS, `cnt:${code}:dev:${dev}`);
  const person = Math.max(ipN, devN);
  if (v.maxTotal && total >= v.maxTotal) return { ok: false, reason: 'All of these have been used up' };
  const perPerson = v.firstOrder ? 1 : v.maxPerPerson;
  if (perPerson && person >= perPerson) return { ok: false, reason: 'You have already used this code ' + person + ' time(s). Limit is ' + perPerson + ' per customer.' };
  return { ok: true, code, v, ipH, dev, total, person, discount: discount(v, body.total) };
}

async function handle(req, env) {
  const url = new URL(req.url), p = url.pathname;
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (!env.IP_SALT || !env.ADMIN_PASSWORD) return J({ ok: false, reason: 'Server secrets not set' }, 500);
  if (p === '/check' || p === '/redeem') {
    if (req.method !== 'POST') return J({ ok: false }, 405);
    let body = {}; try { body = await req.json(); } catch (e) {}
    const r = await evaluate(env, req, body);
    if (!r.ok) return J(r);
    const pub = { ok: true, code: r.code, type: r.v.type, value: r.v.value, discount: r.discount, label: r.v.label || '', usesLeftForYou: r.v.maxPerPerson ? r.v.maxPerPerson - r.person : null };
    if (p === '/check') return J(pub);
    await inc(env.DEALS, `cnt:${r.code}:total`);
    await inc(env.DEALS, `cnt:${r.code}:ip:${r.ipH}`);
    if (r.dev !== 'none') await inc(env.DEALS, `cnt:${r.code}:dev:${r.dev}`);
    const ts = new Date().toISOString();
    await env.DEALS.put(`log:${r.code}:${ts}:${Math.random().toString(36).slice(2, 8)}`, JSON.stringify({ ts, code: r.code, ipHash: r.ipH, device: r.dev, order: String(body.order || '').slice(0, 60), total: +body.total || 0, discount: r.discount }), { expirationTtl: 60 * 60 * 24 * 400 });
    return J({ ...pub, redeemed: true, usesLeftForYou: pub.usesLeftForYou === null ? null : pub.usesLeftForYou - 1 });
  }
  if (p.startsWith('/admin')) {
    const tok = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!same(tok, env.ADMIN_PASSWORD)) return J({ ok: false, reason: 'Wrong organiser password' }, 401);
    if (p === '/admin/codes' && req.method === 'GET') {
      const out = [];
      for (const k of (await env.DEALS.list({ prefix: 'code:' })).keys) { const v = JSON.parse(await env.DEALS.get(k.name)); v.used = await num(env.DEALS, `cnt:${v.code}:total`); out.push(v); }
      return J({ ok: true, codes: out });
    }
    if (p === '/admin/codes' && req.method === 'PUT') {
      const v = await req.json(); v.code = norm(v.code); if (!v.code) return J({ ok: false, reason: 'code required' }, 400);
      await env.DEALS.put('code:' + v.code, JSON.stringify(v)); return J({ ok: true, code: v.code });
    }
    if (p === '/admin/codes' && req.method === 'DELETE') { await env.DEALS.delete('code:' + norm(url.searchParams.get('code'))); return J({ ok: true }); }
    if (p === '/admin/logs' || p === '/admin/export.csv') {
      const c = norm(url.searchParams.get('code')); const logs = []; let cursor;
      do { const l = await env.DEALS.list({ prefix: 'log:' + (c ? c + ':' : ''), cursor }); for (const k of l.keys) logs.push(JSON.parse(await env.DEALS.get(k.name))); cursor = l.list_complete ? null : l.cursor; } while (cursor);
      const per = {}; logs.forEach(l => { const k = l.code + '|' + l.ipHash; per[k] = (per[k] || 0) + 1; });
      if (p === '/admin/logs') return J({ ok: true, logs, perPerson: per });
      const q = s => '"' + String(s).replace(/"/g, '""') + '"';
      const csv = 'time,code,ip_hash,device_id,order,total,discount\n' + logs.map(l => [l.ts, l.code, l.ipHash, l.device, l.order, l.total, l.discount].map(q).join(',')).join('\n');
      return new Response(csv, { headers: { 'content-type': 'text/csv', 'content-disposition': 'attachment; filename="coffeebreak-deals-log.csv"', ...cors } });
    }
    return J({ ok: false }, 404);
  }
  return J({ ok: true, service: 'Coffeebreak Deals', note: 'Beanbot is awake. POST /check or /redeem.' });
}
export default { fetch: (req, env) => handle(req, env).catch(e => J({ ok: false, reason: 'Server hiccup' }, 500)) };
