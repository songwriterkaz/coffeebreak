/* Coffeebreak Vocal Social API. D1 for profiles, posts, likes, comments, follows, reports. KV for song audio (MP3). */
const MAX_AUDIO = 4 * 1024 * 1024;
const HIDE_AT_REPORTS = 3;
const BLOCK = ['fuck','fuk','fck','shit','cunt','bitch','slut','whore','dick','cock','pussy','penis','vagina','nude','nudes','naked','porn','porno','sex','sexy','boobs','tits','anal','cum','rape','nigger','nigga','faggot','fag','retard','kys','onlyfans','hookup','horny','milf','dildo','blowjob','handjob','bastard','wank','wanker','twat','prick','motherfucker'];
const BLOCK_RE = new RegExp('(^|[^a-z])(' + BLOCK.join('|') + ')(s|es|ing|ed|er|ers|y)?($|[^a-z])', 'i');
const LINK_RE = /(https?:\/\/|www\.|\.(com|net|org|io|ly|xyz|au)\b)/i;
const LIMITS = { profile: [30, 86400], post: [8, 3600], postip: [60, 86400], comment: [30, 3600], like: [300, 3600], follow: [200, 3600], report: [30, 86400], play: [600, 3600] };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Max-Age': '86400'
};
function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors, ...extra } });
}
function fail(msg, status = 400) { return json({ error: msg }, status); }
function now() { return Date.now(); }
function rid(p) { const a = new Uint8Array(9); crypto.getRandomValues(a); return p + [...a].map(b => b.toString(36).padStart(2, '0')).join('').slice(0, 14); }
async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join(''); }
function clean(s, max) { return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max); }
function badText(s) { return BLOCK_RE.test(' ' + String(s).toLowerCase().replace(/[0@]/g, 'o').replace(/[1!]/g, 'i').replace(/3/g, 'e').replace(/\$/g, 's') + ' '); }
function policy(fields) {
  for (const [label, v, noLinks] of fields) {
    if (v && badText(v)) return label + ' has words that are not allowed here. Vocal Social is a clean, all-ages space.';
    if (noLinks && v && LINK_RE.test(v)) return label + ' cannot contain links.';
  }
  return '';
}

async function limited(env, who, kind) {
  const [max, win] = LIMITS[kind];
  const since = now() - win * 1000;
  const r = await env.DB.prepare('SELECT COUNT(*) AS n FROM events WHERE who = ? AND kind = ? AND created > ?').bind(who, kind, since).first();
  if ((r && r.n) >= max) return true;
  await env.DB.prepare('INSERT INTO events (who, kind, created) VALUES (?, ?, ?)').bind(who, kind, now()).run();
  if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM events WHERE created < ?').bind(now() - 2 * 86400000).run();
  return false;
}

async function viewer(req, env) {
  const h = req.headers.get('Authorization') || '';
  const tok = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
  if (!tok || tok.length < 20) return null;
  return await env.DB.prepare('SELECT id, handle, name, bio, avatar, created FROM profiles WHERE token_hash = ?').bind(await sha(tok)).first();
}
async function ipHash(req) { return (await sha('cbvs:' + (req.headers.get('CF-Connecting-IP') || 'x'))).slice(0, 24); }

const POST_COLS = `p.id, p.user_id, p.title, p.lyrics, p.genre, p.mood, p.bpm, p.summary, p.duration, p.peaks, p.remix_of, p.created, p.likes, p.comments, p.plays, p.remixes,
  u.handle AS u_handle, u.name AS u_name, u.avatar AS u_avatar,
  r.title AS r_title, ru.handle AS r_handle`;
const POST_FROM = `FROM posts p JOIN profiles u ON u.id = p.user_id LEFT JOIN posts r ON r.id = p.remix_of LEFT JOIN profiles ru ON ru.id = r.user_id`;
function shapePost(row, likedSet, base) {
  return {
    id: row.id, title: row.title, lyrics: row.lyrics, genre: row.genre, mood: row.mood, bpm: row.bpm, summary: row.summary,
    duration: row.duration, peaks: row.peaks ? JSON.parse(row.peaks) : [], created: row.created,
    likes: row.likes, comments: row.comments, plays: row.plays, remixes: row.remixes,
    remixOf: row.remix_of ? { id: row.remix_of, title: row.r_title || 'a song', handle: row.r_handle || '' } : null,
    author: { id: row.user_id, handle: row.u_handle, name: row.u_name, avatar: row.u_avatar },
    liked: likedSet ? likedSet.has(row.id) : false,
    audio: base + '/api/audio/' + row.id
  };
}
async function likedSetFor(env, me, rows) {
  if (!me || !rows.length) return new Set();
  const ids = rows.map(r => r.id);
  const q = await env.DB.prepare(`SELECT post_id FROM likes WHERE user_id = ? AND post_id IN (${ids.map(() => '?').join(',')})`).bind(me.id, ...ids).all();
  return new Set(q.results.map(r => r.post_id));
}
async function profileOut(env, row, me) {
  const c = await env.DB.batch([
    env.DB.prepare('SELECT COUNT(*) AS n FROM follows WHERE followee = ?').bind(row.id),
    env.DB.prepare('SELECT COUNT(*) AS n FROM follows WHERE follower = ?').bind(row.id),
    env.DB.prepare('SELECT COUNT(*) AS n, COALESCE(SUM(likes),0) AS l FROM posts WHERE user_id = ? AND hidden = 0').bind(row.id),
    env.DB.prepare('SELECT 1 AS y FROM follows WHERE follower = ? AND followee = ?').bind(me ? me.id : '', row.id)
  ]);
  return { id: row.id, handle: row.handle, name: row.name, bio: row.bio, avatar: row.avatar, created: row.created,
    followers: c[0].results[0].n, following: c[1].results[0].n, posts: c[2].results[0].n, likes: c[2].results[0].l,
    youFollow: !!(c[3].results && c[3].results.length) };
}

async function route(req, env, url) {
  const base = url.origin;
  const p = url.pathname.replace(/\/+$/, '');
  const m = req.method;
  const seg = p.split('/').filter(Boolean); // ['api', ...]
  if (seg[0] !== 'api') return json({ ok: true, name: 'Coffeebreak Vocal Social API' });
  const me = await viewer(req, env);
  const ip = await ipHash(req);

  if (p === '/api/health') return json({ ok: true, time: now() });

  if (p === '/api/profiles' && m === 'POST') {
    const b = await req.json().catch(() => ({}));
    const name = clean(b.name, 40) || 'Guest';
    let handle = clean(b.handle, 20).toLowerCase().replace(/[^a-z0-9_]/g, '');
    const bio = clean(b.bio, 160); const avatar = clean(b.avatar, 40);
    const bad = policy([['Name', name, true], ['Handle', handle, true], ['Bio', bio, true]]);
    if (bad) return fail(bad);
    if (await limited(env, ip, 'profile')) return fail('Too many new profiles from this connection today. Try again tomorrow.', 429);
    if (handle.length < 3) handle = 'singer' + Math.floor(Math.random() * 90000 + 10000);
    const taken = await env.DB.prepare('SELECT 1 FROM profiles WHERE handle = ?').bind(handle).first();
    if (taken) handle = (handle.slice(0, 15) + Math.floor(Math.random() * 9000 + 1000));
    const id = rid('u'); const token = rid('t') + rid('') + rid('');
    await env.DB.prepare('INSERT INTO profiles (id, handle, name, bio, avatar, token_hash, ip_hash, created) VALUES (?,?,?,?,?,?,?,?)')
      .bind(id, handle, name, bio, avatar, await sha(token), ip, now()).run();
    const row = await env.DB.prepare('SELECT id, handle, name, bio, avatar, created FROM profiles WHERE id = ?').bind(id).first();
    return json({ token, profile: await profileOut(env, row, null) });
  }

  if (p === '/api/me' && m === 'GET') {
    if (!me) return fail('Not signed in.', 401);
    return json({ profile: await profileOut(env, me, me) });
  }
  if (p === '/api/me' && m === 'PATCH') {
    if (!me) return fail('Not signed in.', 401);
    const b = await req.json().catch(() => ({}));
    const name = b.name != null ? clean(b.name, 40) || me.name : me.name;
    const bio = b.bio != null ? clean(b.bio, 160) : me.bio;
    const avatar = b.avatar != null ? clean(b.avatar, 40) : me.avatar;
    let handle = b.handle != null ? clean(b.handle, 20).toLowerCase().replace(/[^a-z0-9_]/g, '') : me.handle;
    const bad = policy([['Name', name, true], ['Handle', handle, true], ['Bio', bio, true]]);
    if (bad) return fail(bad);
    if (handle.length < 3) return fail('Handle needs at least 3 letters or numbers.');
    if (handle !== me.handle) {
      const taken = await env.DB.prepare('SELECT 1 FROM profiles WHERE handle = ? AND id != ?').bind(handle, me.id).first();
      if (taken) return fail('That handle is taken. Try another.');
    }
    await env.DB.prepare('UPDATE profiles SET name = ?, bio = ?, avatar = ?, handle = ? WHERE id = ?').bind(name, bio, avatar, handle, me.id).run();
    const row = await env.DB.prepare('SELECT id, handle, name, bio, avatar, created FROM profiles WHERE id = ?').bind(me.id).first();
    return json({ profile: await profileOut(env, row, row) });
  }

  if (seg[1] === 'profiles' && seg[2] && m === 'GET') {
    const key = decodeURIComponent(seg[2]).toLowerCase();
    const row = await env.DB.prepare('SELECT id, handle, name, bio, avatar, created FROM profiles WHERE handle = ? OR id = ?').bind(key, seg[2]).first();
    if (!row) return fail('No one with that handle.', 404);
    const posts = await env.DB.prepare(`SELECT ${POST_COLS} ${POST_FROM} WHERE p.user_id = ? AND p.hidden = 0 ORDER BY p.created DESC LIMIT 60`).bind(row.id).all();
    const liked = await likedSetFor(env, me, posts.results);
    return json({ profile: await profileOut(env, row, me), posts: posts.results.map(r => shapePost(r, liked, base)) });
  }

  if (p === '/api/people' && m === 'GET') {
    const q = clean(url.searchParams.get('q'), 30).toLowerCase();
    const rows = q
      ? await env.DB.prepare(`SELECT u.id, u.handle, u.name, u.avatar, u.bio, (SELECT COUNT(*) FROM follows f WHERE f.followee = u.id) AS followers, (SELECT COUNT(*) FROM posts x WHERE x.user_id = u.id AND x.hidden = 0) AS posts FROM profiles u WHERE u.handle LIKE ? OR lower(u.name) LIKE ? ORDER BY followers DESC LIMIT 40`).bind('%' + q + '%', '%' + q + '%').all()
      : await env.DB.prepare(`SELECT u.id, u.handle, u.name, u.avatar, u.bio, (SELECT COUNT(*) FROM follows f WHERE f.followee = u.id) AS followers, (SELECT COUNT(*) FROM posts x WHERE x.user_id = u.id AND x.hidden = 0) AS posts FROM profiles u WHERE EXISTS (SELECT 1 FROM posts x WHERE x.user_id = u.id AND x.hidden = 0) ORDER BY followers DESC, u.created DESC LIMIT 40`).all();
    let mine = new Set();
    if (me && rows.results.length) {
      const f = await env.DB.prepare('SELECT followee FROM follows WHERE follower = ?').bind(me.id).all();
      mine = new Set(f.results.map(r => r.followee));
    }
    return json({ people: rows.results.map(r => ({ ...r, youFollow: mine.has(r.id) })) });
  }

  if (p === '/api/feed' && m === 'GET') {
    const mode = url.searchParams.get('mode') || 'latest';
    const before = +url.searchParams.get('before') || 0;
    const limit = Math.min(30, +url.searchParams.get('limit') || 15);
    let rows;
    if (mode === 'following') {
      if (!me) return json({ posts: [], note: 'Make a profile and follow people to fill this feed.' });
      rows = await env.DB.prepare(`SELECT ${POST_COLS} ${POST_FROM} WHERE p.hidden = 0 AND (p.user_id IN (SELECT followee FROM follows WHERE follower = ?) OR p.user_id = ?) ${before ? 'AND p.created < ?' : ''} ORDER BY p.created DESC LIMIT ${limit}`)
        .bind(...[me.id, me.id].concat(before ? [before] : [])).all();
    } else if (mode === 'trending') {
      const t = now();
      rows = await env.DB.prepare(`SELECT ${POST_COLS}, ((p.likes * 2 + p.comments * 3 + p.remixes * 4 + p.plays * 0.5 + 1) / ((((? - p.created) / 3600000.0) + 2) * (((? - p.created) / 3600000.0) + 2))) AS score ${POST_FROM} WHERE p.hidden = 0 AND p.created > ? ORDER BY score DESC LIMIT ${limit}`)
        .bind(t, t, t - 14 * 86400000).all();
    } else if (mode === 'remixes') {
      const of = url.searchParams.get('of') || '';
      rows = await env.DB.prepare(`SELECT ${POST_COLS} ${POST_FROM} WHERE p.hidden = 0 AND p.remix_of = ? ORDER BY p.created DESC LIMIT 50`).bind(of).all();
    } else {
      rows = await env.DB.prepare(`SELECT ${POST_COLS} ${POST_FROM} WHERE p.hidden = 0 ${before ? 'AND p.created < ?' : ''} ORDER BY p.created DESC LIMIT ${limit}`)
        .bind(...(before ? [before] : [])).all();
    }
    const liked = await likedSetFor(env, me, rows.results);
    return json({ posts: rows.results.map(r => shapePost(r, liked, base)) });
  }

  if (p === '/api/posts' && m === 'POST') {
    if (!me) return fail('Make a profile first.', 401);
    const form = await req.formData().catch(() => null);
    if (!form) return fail('Send the post as a form with audio.');
    let meta = {};
    try { meta = JSON.parse(form.get('meta') || '{}'); } catch (e) { return fail('Post details were not readable.'); }
    const audio = form.get('audio');
    if (!audio || typeof audio.arrayBuffer !== 'function') return fail('The song audio is missing.');
    if (audio.size > MAX_AUDIO) return fail('The song file is too big. The limit is 4 MB.');
    const bytes = new Uint8Array(await audio.arrayBuffer());
    const isMp3 = (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
    if (!isMp3 || bytes.length < 2000) return fail('Only songs made in the app can be posted (MP3 audio).');
    const title = clean(meta.title, 80) || 'Untitled song';
    const lyrics = clean(meta.lyrics, 2000);
    if (lyrics.split(/\s+/).filter(Boolean).length < 2) return fail('The lyrics need at least two words.');
    const bad = policy([['Title', title, true], ['Lyrics', lyrics, true]]);
    if (bad) return fail(bad);
    if (await limited(env, me.id, 'post')) return fail('You have posted a lot this hour. Try again a bit later.', 429);
    if (await limited(env, ip, 'postip')) return fail('Too many posts from this connection today.', 429);
    let remixOf = clean(meta.remixOf, 30) || null;
    if (remixOf) { const parent = await env.DB.prepare('SELECT id FROM posts WHERE id = ? AND hidden = 0').bind(remixOf).first(); if (!parent) remixOf = null; }
    let peaks = Array.isArray(meta.peaks) ? meta.peaks.slice(0, 96).map(v => Math.max(0, Math.min(1, +v || 0))).map(v => Math.round(v * 100) / 100) : [];
    const id = rid('p');
    await env.AUDIO.put('a:' + id, bytes, { metadata: { mime: 'audio/mpeg' } });
    const stmts = [env.DB.prepare('INSERT INTO posts (id, user_id, title, lyrics, genre, mood, bpm, summary, duration, peaks, remix_of, audio_bytes, created, ip_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(id, me.id, title, lyrics, clean(meta.genre, 30), clean(meta.mood, 30), Math.round(+meta.bpm || 0) || null, clean(meta.summary, 200), +meta.duration || 0, JSON.stringify(peaks), remixOf, bytes.length, now(), ip)];
    if (remixOf) stmts.push(env.DB.prepare('UPDATE posts SET remixes = remixes + 1 WHERE id = ?').bind(remixOf));
    await env.DB.batch(stmts);
    const row = await env.DB.prepare(`SELECT ${POST_COLS} ${POST_FROM} WHERE p.id = ?`).bind(id).first();
    return json({ post: shapePost(row, new Set(), base) });
  }

  if (seg[1] === 'posts' && seg[2]) {
    const id = seg[2];
    if (!seg[3] && m === 'GET') {
      const row = await env.DB.prepare(`SELECT ${POST_COLS} ${POST_FROM} WHERE p.id = ? AND p.hidden = 0`).bind(id).first();
      if (!row) return fail('That post is not here. It may have been removed.', 404);
      const liked = await likedSetFor(env, me, [row]);
      return json({ post: shapePost(row, liked, base) });
    }
    if (!seg[3] && m === 'DELETE') {
      if (!me) return fail('Not signed in.', 401);
      const row = await env.DB.prepare('SELECT user_id, remix_of FROM posts WHERE id = ?').bind(id).first();
      if (!row || row.user_id !== me.id) return fail('You can only delete your own posts.', 403);
      const st = [env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id), env.DB.prepare('DELETE FROM likes WHERE post_id = ?').bind(id), env.DB.prepare('DELETE FROM comments WHERE post_id = ?').bind(id)];
      if (row.remix_of) st.push(env.DB.prepare('UPDATE posts SET remixes = MAX(0, remixes - 1) WHERE id = ?').bind(row.remix_of));
      await env.DB.batch(st);
      await env.AUDIO.delete('a:' + id);
      return json({ ok: true });
    }
    if (seg[3] === 'like' && m === 'POST') {
      if (!me) return fail('Make a profile first.', 401);
      if (await limited(env, me.id, 'like')) return fail('Slow down a little.', 429);
      const had = await env.DB.prepare('SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?').bind(id, me.id).first();
      if (had) await env.DB.batch([env.DB.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').bind(id, me.id), env.DB.prepare('UPDATE posts SET likes = MAX(0, likes - 1) WHERE id = ?').bind(id)]);
      else await env.DB.batch([env.DB.prepare('INSERT OR IGNORE INTO likes (post_id, user_id, created) VALUES (?,?,?)').bind(id, me.id, now()), env.DB.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').bind(id)]);
      const r = await env.DB.prepare('SELECT likes FROM posts WHERE id = ?').bind(id).first();
      return json({ liked: !had, likes: r ? r.likes : 0 });
    }
    if (seg[3] === 'play' && m === 'POST') {
      if (!(await limited(env, ip, 'play'))) await env.DB.prepare('UPDATE posts SET plays = plays + 1 WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }
    if (seg[3] === 'comments' && m === 'GET') {
      const rows = await env.DB.prepare('SELECT c.id, c.text, c.created, u.id AS uid, u.handle, u.name, u.avatar FROM comments c JOIN profiles u ON u.id = c.user_id WHERE c.post_id = ? AND c.hidden = 0 ORDER BY c.created ASC LIMIT 200').bind(id).all();
      return json({ comments: rows.results.map(r => ({ id: r.id, text: r.text, created: r.created, author: { id: r.uid, handle: r.handle, name: r.name, avatar: r.avatar } })) });
    }
    if (seg[3] === 'comments' && m === 'POST') {
      if (!me) return fail('Make a profile first.', 401);
      const b = await req.json().catch(() => ({}));
      const text = clean(b.text, 280);
      if (!text) return fail('Write a comment first.');
      const bad = policy([['Comment', text, true]]);
      if (bad) return fail(bad);
      const post = await env.DB.prepare('SELECT id FROM posts WHERE id = ? AND hidden = 0').bind(id).first();
      if (!post) return fail('That post is not here.', 404);
      if (await limited(env, me.id, 'comment')) return fail('You have commented a lot this hour. Try again later.', 429);
      const cid = rid('c');
      await env.DB.batch([env.DB.prepare('INSERT INTO comments (id, post_id, user_id, text, created) VALUES (?,?,?,?,?)').bind(cid, id, me.id, text, now()), env.DB.prepare('UPDATE posts SET comments = comments + 1 WHERE id = ?').bind(id)]);
      return json({ comment: { id: cid, text, created: now(), author: { id: me.id, handle: me.handle, name: me.name, avatar: me.avatar } } });
    }
  }

  if (p === '/api/report' && m === 'POST') {
    if (!me) return fail('Make a profile first.', 401);
    const b = await req.json().catch(() => ({}));
    const type = b.type === 'comment' ? 'comment' : b.type === 'profile' ? 'profile' : 'post';
    const target = clean(b.id, 30); const reason = clean(b.reason, 200);
    if (!target) return fail('Nothing to report.');
    if (await limited(env, me.id, 'report')) return fail('You have sent a lot of reports today.', 429);
    const r = await env.DB.prepare('INSERT OR IGNORE INTO reports (target_type, target_id, user_id, reason, created) VALUES (?,?,?,?,?)').bind(type, target, me.id, reason, now()).run();
    if (r.meta && r.meta.changes) {
      if (type === 'post') await env.DB.prepare(`UPDATE posts SET reports = reports + 1, hidden = CASE WHEN reports + 1 >= ${HIDE_AT_REPORTS} THEN 1 ELSE hidden END WHERE id = ?`).bind(target).run();
      if (type === 'comment') await env.DB.prepare(`UPDATE comments SET reports = reports + 1, hidden = CASE WHEN reports + 1 >= ${HIDE_AT_REPORTS} THEN 1 ELSE hidden END WHERE id = ?`).bind(target).run();
    }
    return json({ ok: true, message: 'Thanks. The report is saved. Posts and comments with several reports are hidden automatically.' });
  }

  if (seg[1] === 'follow' && seg[2] && m === 'POST') {
    if (!me) return fail('Make a profile first.', 401);
    const who = seg[2];
    if (who === me.id) return fail('You cannot follow yourself.');
    const exists = await env.DB.prepare('SELECT 1 FROM profiles WHERE id = ?').bind(who).first();
    if (!exists) return fail('No one with that id.', 404);
    if (await limited(env, me.id, 'follow')) return fail('Slow down a little.', 429);
    const had = await env.DB.prepare('SELECT 1 FROM follows WHERE follower = ? AND followee = ?').bind(me.id, who).first();
    if (had) await env.DB.prepare('DELETE FROM follows WHERE follower = ? AND followee = ?').bind(me.id, who).run();
    else await env.DB.prepare('INSERT OR IGNORE INTO follows (follower, followee, created) VALUES (?,?,?)').bind(me.id, who, now()).run();
    const c = await env.DB.prepare('SELECT COUNT(*) AS n FROM follows WHERE followee = ?').bind(who).first();
    return json({ following: !had, followers: c.n });
  }

  if (seg[1] === 'audio' && seg[2] && m === 'GET') {
    const obj = await env.AUDIO.get('a:' + seg[2], { type: 'arrayBuffer', cacheTtl: 3600 });
    if (!obj) return fail('Audio not found.', 404);
    const total = obj.byteLength;
    const range = req.headers.get('Range');
    const hdr = { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=86400', ...cors };
    if (range) {
      const mm = /bytes=(\d*)-(\d*)/.exec(range);
      if (mm) {
        let s = mm[1] ? +mm[1] : total - +mm[2]; let e = mm[1] && mm[2] ? +mm[2] : total - 1;
        if (!mm[1]) e = total - 1;
        s = Math.max(0, s); e = Math.min(total - 1, e);
        return new Response(obj.slice(s, e + 1), { status: 206, headers: { ...hdr, 'Content-Range': `bytes ${s}-${e}/${total}`, 'Content-Length': String(e - s + 1) } });
      }
    }
    return new Response(obj, { headers: { ...hdr, 'Content-Length': String(total) } });
  }

  return fail('Not found.', 404);
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(req.url);
    try { return await route(req, env, url); }
    catch (err) { return json({ error: 'Something went wrong on the server.', detail: String(err && err.message || err).slice(0, 200) }, 500); }
  }
};
