/* Coffeebreak Vocal Social API. D1 for profiles, posts, likes, comments, follows, reports. KV for song audio (MP3). */
const MAX_AUDIO = 4 * 1024 * 1024;
const HIDE_AT_REPORTS = 3;
const BLOCK = ['fuck','fuk','fck','shit','cunt','bitch','slut','whore','dick','cock','pussy','penis','vagina','nude','nudes','naked','porn','porno','sex','sexy','boobs','tits','anal','cum','rape','nigger','nigga','faggot','fag','retard','kys','onlyfans','hookup','horny','milf','dildo','blowjob','handjob','bastard','wank','wanker','twat','prick','motherfucker'];
const BLOCK_RE = new RegExp('(^|[^a-z])(' + BLOCK.join('|') + ')(s|es|ing|ed|er|ers|y)?($|[^a-z])', 'i');
const LINK_RE = /(https?:\/\/|www\.|\.(com|net|org|io|ly|xyz|au)\b)/i;
const LIMITS = { profile: [30, 86400], post: [8, 3600], postip: [60, 86400], comment: [30, 3600], like: [300, 3600], follow: [200, 3600], report: [30, 86400], play: [600, 3600], wall: [30, 3600] };

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
  return await env.DB.prepare('SELECT id, handle, name, bio, avatar, created, xp, frame, streak, last_day FROM profiles WHERE token_hash = ?').bind(await sha(tok)).first();
}
async function ipHash(req) { return (await sha('cbvs:' + (req.headers.get('CF-Connecting-IP') || 'x'))).slice(0, 24); }

const POST_COLS = `p.id, p.user_id, p.title, p.lyrics, p.genre, p.mood, p.bpm, p.summary, p.duration, p.peaks, p.remix_of, p.created, p.likes, p.comments, p.plays, p.remixes, p.challenge_day,
  u.handle AS u_handle, u.xp AS u_xp, u.frame AS u_frame, u.name AS u_name, u.avatar AS u_avatar,
  r.title AS r_title, ru.handle AS r_handle`;
const POST_FROM = `FROM posts p JOIN profiles u ON u.id = p.user_id LEFT JOIN posts r ON r.id = p.remix_of LEFT JOIN profiles ru ON ru.id = r.user_id`;
function shapePost(row, likedSet, base) {
  return {
    id: row.id, title: row.title, lyrics: row.lyrics, genre: row.genre, mood: row.mood, bpm: row.bpm, summary: row.summary,
    duration: row.duration, peaks: row.peaks ? JSON.parse(row.peaks) : [], created: row.created,
    likes: row.likes, comments: row.comments, plays: row.plays, remixes: row.remixes,
    remixOf: row.remix_of ? { id: row.remix_of, title: row.r_title || 'a song', handle: row.r_handle || '' } : null,
    author: { id: row.user_id, handle: row.u_handle, name: row.u_name, avatar: row.u_avatar, level: levelOf(row.u_xp), frame: row.u_frame || '' },
    challenge: row.challenge_day ? challengeFor(row.challenge_day) : null,
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
  const g = await env.DB.prepare('SELECT xp, frame, streak, last_day FROM profiles WHERE id = ?').bind(row.id).first();
  const bd = await env.DB.prepare('SELECT badge FROM badges WHERE user_id = ? ORDER BY created').bind(row.id).all();
  return { id: row.id, handle: row.handle, name: row.name, bio: row.bio, avatar: row.avatar, created: row.created,
    ...levelInfo(g ? g.xp : 0), frame: g ? g.frame || '' : '', streak: liveStreak(g), badges: bd.results.map(x => ({ id: x.badge, ...(BADGES[x.badge] || {}) })),
    followers: c[0].results[0].n, following: c[1].results[0].n, posts: c[2].results[0].n, likes: c[2].results[0].l,
    youFollow: !!(c[3].results && c[3].results.length) };
}

const WALL_CHANNELS = ['vocal', 'parenting'];
const WALL_COLS = `w.id, w.user_id, w.wall_id, w.channel, w.text, w.created, w.comments,
  u.handle AS u_handle, u.name AS u_name, u.avatar AS u_avatar,
  o.handle AS w_handle, o.name AS w_name`;
const WALL_FROM = `FROM wall_posts w JOIN profiles u ON u.id = w.user_id JOIN profiles o ON o.id = w.wall_id`;
function shapeWall(row) {
  return {
    id: row.id, text: row.text, channel: row.channel, created: row.created, comments: row.comments, device: false,
    author: { id: row.user_id, handle: row.u_handle, name: row.u_name, avatar: row.u_avatar },
    wall: { id: row.wall_id, handle: row.w_handle, name: row.w_name }
  };
}
async function wallRoute(req, env, me, ip, seg, p, m) {
  if (p === '/api/walls/capabilities' && m === 'GET') {
    return json({ walls: true, channels: WALL_CHANNELS, shared: true });
  }
  if (seg[1] !== 'walls') return null;
  const channelOf = (value) => WALL_CHANNELS.indexOf(value) >= 0 ? value : '';
  if (p === '/api/walls/feed' && m === 'GET') {
    const url = new URL(req.url);
    const channel = channelOf(url.searchParams.get('channel') || 'vocal');
    if (!channel) return fail('Unknown channel.');
    const before = +url.searchParams.get('before') || 0;
    const rows = await env.DB.prepare(`SELECT ${WALL_COLS} ${WALL_FROM} WHERE w.hidden = 0 AND w.channel = ? ${before ? 'AND w.created < ?' : ''} ORDER BY w.created DESC LIMIT 40`)
      .bind(...[channel].concat(before ? [before] : [])).all();
    return json({ shared: true, channel, posts: rows.results.map(shapeWall) });
  }
  if (p === '/api/walls' && m === 'POST') {
    if (!me) return fail('Make a profile first.', 401);
    const b = await req.json().catch(() => ({}));
    const channel = channelOf(clean(b.channel, 20) || 'vocal');
    if (!channel) return fail('Unknown channel.');
    const text = clean(b.text, channel === 'parenting' ? 500 : 500);
    if (!text) return fail('Write something first.');
    const bad = policy([['Post', text, true]]);
    if (bad) return fail(bad);
    let wall = me;
    const handle = clean(b.wall, 20).toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (handle && handle !== me.handle) {
      wall = await env.DB.prepare('SELECT id, handle, name FROM profiles WHERE handle = ?').bind(handle).first();
      if (!wall) return fail('That wall is not here.', 404);
    }
    if (await limited(env, me.id, 'wall')) return fail('You have posted a lot this hour. Try again later.', 429);
    const id = rid('w');
    await env.DB.prepare('INSERT INTO wall_posts (id, user_id, wall_id, channel, text, created) VALUES (?,?,?,?,?,?)')
      .bind(id, me.id, wall.id, channel, text, now()).run();
    const row = await env.DB.prepare(`SELECT ${WALL_COLS} ${WALL_FROM} WHERE w.id = ?`).bind(id).first();
    return json({ post: shapeWall(row), shared: true });
  }
  if (seg[1] === 'walls' && seg[2] && seg[2] !== 'feed' && !seg[3] && m === 'GET') {
    const url = new URL(req.url);
    const channel = channelOf(url.searchParams.get('channel') || 'vocal');
    if (!channel) return fail('Unknown channel.');
    const handle = decodeURIComponent(seg[2]).toLowerCase();
    const who = await env.DB.prepare('SELECT id, handle, name FROM profiles WHERE handle = ? OR id = ?').bind(handle, seg[2]).first();
    if (!who) return fail('That wall is not here.', 404);
    const rows = await env.DB.prepare(`SELECT ${WALL_COLS} ${WALL_FROM} WHERE w.hidden = 0 AND w.channel = ? AND w.wall_id = ? ORDER BY w.created DESC LIMIT 60`)
      .bind(channel, who.id).all();
    return json({ shared: true, channel, wall: { id: who.id, handle: who.handle, name: who.name }, posts: rows.results.map(shapeWall) });
  }
  if (seg[1] === 'walls' && seg[2] && seg[3] === 'comments' && m === 'GET') {
    const rows = await env.DB.prepare('SELECT c.id, c.text, c.created, u.id AS uid, u.handle, u.name, u.avatar FROM wall_comments c JOIN profiles u ON u.id = c.user_id WHERE c.post_id = ? AND c.hidden = 0 ORDER BY c.created ASC LIMIT 200').bind(seg[2]).all();
    return json({ comments: rows.results.map(r => ({ id: r.id, text: r.text, created: r.created, device: false, author: { id: r.uid, handle: r.handle, name: r.name, avatar: r.avatar } })) });
  }
  if (seg[1] === 'walls' && seg[2] && seg[3] === 'comments' && m === 'POST') {
    if (!me) return fail('Make a profile first.', 401);
    const b = await req.json().catch(() => ({}));
    const text = clean(b.text, 280);
    if (!text) return fail('Write a comment first.');
    const bad = policy([['Comment', text, true]]);
    if (bad) return fail(bad);
    const post = await env.DB.prepare('SELECT id FROM wall_posts WHERE id = ? AND hidden = 0').bind(seg[2]).first();
    if (!post) return fail('That post is not here.', 404);
    if (await limited(env, me.id, 'comment')) return fail('You have commented a lot this hour. Try again later.', 429);
    const cid = rid('c');
    await env.DB.batch([
      env.DB.prepare('INSERT INTO wall_comments (id, post_id, user_id, text, created) VALUES (?,?,?,?,?)').bind(cid, seg[2], me.id, text, now()),
      env.DB.prepare('UPDATE wall_posts SET comments = comments + 1 WHERE id = ?').bind(seg[2])
    ]);
    return json({ comment: { id: cid, text, created: now(), device: false, author: { id: me.id, handle: me.handle, name: me.name, avatar: me.avatar } }, shared: true });
  }
  return null;
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
  const gr = await gameRoute(req, env, url, me, ip, seg, p, m);
  if (gr) return gr;

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
    let frame = me.frame || '';
    if (b.frame != null) { const f = FRAMES.find(x => x.id === String(b.frame)); if (!f) return fail('Unknown frame.'); if (levelOf(me.xp) < f.level) return fail('Reach level ' + f.level + ' to unlock the ' + f.name + '.'); frame = f.id; }
    let handle = b.handle != null ? clean(b.handle, 20).toLowerCase().replace(/[^a-z0-9_]/g, '') : me.handle;
    const bad = policy([['Name', name, true], ['Handle', handle, true], ['Bio', bio, true]]);
    if (bad) return fail(bad);
    if (handle.length < 3) return fail('Handle needs at least 3 letters or numbers.');
    if (handle !== me.handle) {
      const taken = await env.DB.prepare('SELECT 1 FROM profiles WHERE handle = ? AND id != ?').bind(handle, me.id).first();
      if (taken) return fail('That handle is taken. Try another.');
    }
    await env.DB.prepare('UPDATE profiles SET name = ?, bio = ?, avatar = ?, handle = ?, frame = ? WHERE id = ?').bind(name, bio, avatar, handle, frame, me.id).run();
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
      ? await env.DB.prepare(`SELECT u.id, u.handle, u.name, u.avatar, u.bio, u.xp, u.frame, (SELECT COUNT(*) FROM follows f WHERE f.followee = u.id) AS followers, (SELECT COUNT(*) FROM posts x WHERE x.user_id = u.id AND x.hidden = 0) AS posts FROM profiles u WHERE u.handle LIKE ? OR lower(u.name) LIKE ? ORDER BY followers DESC LIMIT 40`).bind('%' + q + '%', '%' + q + '%').all()
      : await env.DB.prepare(`SELECT u.id, u.handle, u.name, u.avatar, u.bio, u.xp, u.frame, (SELECT COUNT(*) FROM follows f WHERE f.followee = u.id) AS followers, (SELECT COUNT(*) FROM posts x WHERE x.user_id = u.id AND x.hidden = 0) AS posts FROM profiles u WHERE EXISTS (SELECT 1 FROM posts x WHERE x.user_id = u.id AND x.hidden = 0) ORDER BY followers DESC, u.created DESC LIMIT 40`).all();
    let mine = new Set();
    if (me && rows.results.length) {
      const f = await env.DB.prepare('SELECT followee FROM follows WHERE follower = ?').bind(me.id).all();
      mine = new Set(f.results.map(r => r.followee));
    }
    return json({ people: rows.results.map(r => ({ ...r, level: levelOf(r.xp), frame: r.frame || '', youFollow: mine.has(r.id) })) });
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
    let challengeDay = null;
    if (meta.challenge) {
      const ch = challengeFor(sydDay());
      if (!new RegExp('(^|[^a-z])' + ch.word + '([^a-z]|$)', 'i').test(lyrics)) return fail('To enter today\'s challenge, use the word "' + ch.word + '" in your lyrics.');
      challengeDay = ch.day;
    }
    const game = await new Game(env, me.id).start();
    const id = rid('p');
    await env.AUDIO.put('a:' + id, bytes, { metadata: { mime: 'audio/mpeg' } });
    const stmts = [env.DB.prepare('INSERT INTO posts (id, user_id, title, lyrics, genre, mood, bpm, summary, duration, peaks, remix_of, audio_bytes, created, ip_hash, challenge_day) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(id, me.id, title, lyrics, clean(meta.genre, 30), clean(meta.mood, 30), Math.round(+meta.bpm || 0) || null, clean(meta.summary, 200), +meta.duration || 0, JSON.stringify(peaks), remixOf, bytes.length, now(), ip, challengeDay)];
    if (remixOf) stmts.push(env.DB.prepare('UPDATE posts SET remixes = remixes + 1 WHERE id = ?').bind(remixOf));
    await env.DB.batch(stmts);
    await onPosted(game, env, me, id, remixOf, challengeDay);
    const row = await env.DB.prepare(`SELECT ${POST_COLS} ${POST_FROM} WHERE p.id = ?`).bind(id).first();
    return json({ post: shapePost(row, new Set(), base), game: await game.result() });
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
      const r = await env.DB.prepare('SELECT likes, user_id FROM posts WHERE id = ?').bind(id).first();
      const game = await new Game(env, me.id).start();
      if (!had && r && r.user_id !== me.id) {
        await game.award(me.id, 'like_given', id, XP.like_given, 'Liked a song');
        if (await game.award(r.user_id, 'like_received', id + ':' + me.id, XP.like_received, 'Got a like')) await game.check(r.user_id);
      }
      return json({ liked: !had, likes: r ? r.likes : 0, game: await game.result() });
    }
    if (seg[3] === 'play' && m === 'POST') {
      if (!(await limited(env, ip, 'play'))) await env.DB.prepare('UPDATE posts SET plays = plays + 1 WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }
    if (seg[3] === 'comments' && m === 'GET') {
      const rows = await env.DB.prepare('SELECT c.id, c.text, c.created, u.id AS uid, u.handle, u.name, u.avatar, u.xp, u.frame FROM comments c JOIN profiles u ON u.id = c.user_id WHERE c.post_id = ? AND c.hidden = 0 ORDER BY c.created ASC LIMIT 200').bind(id).all();
      return json({ comments: rows.results.map(r => ({ id: r.id, text: r.text, created: r.created, author: { id: r.uid, handle: r.handle, name: r.name, avatar: r.avatar, level: levelOf(r.xp), frame: r.frame || '' } })) });
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
      const game = await new Game(env, me.id).start();
      const today = await env.DB.prepare("SELECT COUNT(*) n FROM xp_events WHERE user_id = ? AND kind = 'comment' AND day = ?").bind(me.id, sydDay()).first();
      if (today.n < 10) await game.award(me.id, 'comment', cid, XP.comment, 'Left a comment');
      return json({ comment: { id: cid, text, created: now(), author: { id: me.id, handle: me.handle, name: me.name, avatar: me.avatar, level: levelOf(me.xp), frame: me.frame || '' } }, game: await game.result() });
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
    const game = await new Game(env, me.id).start();
    if (!had) await game.award(me.id, 'follow', who, XP.follow, 'Followed a singer');
    return json({ following: !had, followers: c.n, game: await game.result() });
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


/* ================= Game layer: XP, levels, streaks, badges, challenges, battles, leaderboard, quest ================= */
const XP = { post: 50, challenge: 40, streak: 10, like_received: 5, comment: 5, remix: 30, remixed: 20, vote: 3, battle_win: 100, battle_entry: 10, play: 2, follow: 3, like_given: 1 };
const FRAMES = [
  { id: '', name: 'No frame', level: 1 }, { id: 'bronze', name: 'Bronze ring', level: 2 }, { id: 'silver', name: 'Silver ring', level: 3 },
  { id: 'gold', name: 'Gold ring', level: 5 }, { id: 'neon', name: 'Neon glow', level: 7 }, { id: 'rainbow', name: 'Rainbow spin', level: 10 },
  { id: 'crown', name: 'Star crown', level: 15 }
];
const BADGES = {
  first_song: { name: 'First song', desc: 'Post your first song', icon: '🎤' },
  five_songs: { name: 'Songwriter', desc: 'Post 5 songs', icon: '📝' },
  ten_likes: { name: 'Crowd pleaser', desc: 'Get 10 likes on your songs', icon: '💖' },
  first_remix: { name: 'Remixer', desc: 'Post your first remix', icon: '🔁' },
  remixed: { name: 'Inspiration', desc: 'Someone remixed your song', icon: '✨' },
  challenger: { name: 'Challenger', desc: 'Enter a daily challenge', icon: '🎯' },
  streak3: { name: 'On a roll', desc: 'Post songs 3 days in a row', icon: '🔥' },
  streak7: { name: 'Week warrior', desc: 'Post songs 7 days in a row', icon: '🏅' },
  first_vote: { name: 'Judge', desc: 'Vote in a song battle', icon: '⚖️' },
  ten_votes: { name: 'Head judge', desc: 'Vote in 10 song battles', icon: '🧑‍⚖️' },
  battle_winner: { name: 'Battle winner', desc: 'Win a song battle', icon: '🏆' },
  commenter: { name: 'Kind words', desc: 'Leave your first comment', icon: '💬' },
  social: { name: 'Friendly', desc: 'Follow someone', icon: '🤝' },
  level5: { name: 'Rising star', desc: 'Reach level 5', icon: '⭐' },
  level10: { name: 'Headliner', desc: 'Reach level 10', icon: '🌟' },
  quest: { name: 'Quest complete', desc: 'Finish the starter quest', icon: '🗺️' }
};
const QUEST = [
  { id: 'play', name: 'Listen to a song', kind: 'play' },
  { id: 'like', name: 'Like a song', kind: 'like_given' },
  { id: 'vote', name: 'Vote in a song battle', kind: 'vote' },
  { id: 'post', name: 'Make and post your own song', kind: 'post' },
  { id: 'comment', name: 'Leave a kind comment', kind: 'comment' },
  { id: 'follow', name: 'Follow a singer', kind: 'follow' },
  { id: 'challenge', name: 'Enter the daily challenge', kind: 'challenge' }
];
const CHALLENGES = [
  ['Sunrise', 'morning'], ['Ocean', 'waves'], ['Road trip', 'highway'], ['Coffee time', 'coffee'], ['Rainy day', 'rain'], ['Best friends', 'friend'],
  ['City lights', 'neon'], ['Home', 'home'], ['Dancing', 'dance'], ['Stars', 'stars'], ['Summer', 'summer'], ['Thank you', 'thanks'],
  ['Dreams', 'dream'], ['Brave', 'brave'], ['Country roads', 'dusty'], ['Heartbeat', 'heart'], ['Fireworks', 'spark'], ['Garden', 'flowers'],
  ['Moonlight', 'moon'], ['Weekend', 'saturday'], ['Wild horses', 'gallop'], ['Birthday', 'candles'], ['Flying', 'wings'], ['Snow', 'winter'],
  ['Hometown', 'street'], ['Kindness', 'smile'], ['Adventure', 'map'], ['Golden hour', 'golden'], ['Lullaby', 'sleep'], ['Comeback', 'again'], ['Thunder', 'storm']
];
const BATTLE_MS = 12 * 3600 * 1000;
Object.assign(LIMITS, { vote: [40, 3600], voteip: [120, 3600] });

const fmtDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' });
function sydDay(t) { return fmtDay.format(new Date(t == null ? now() : t)); }
function dayNum(day) { return Math.floor(Date.parse(day + 'T00:00:00Z') / 86400000); }
function weekKey(day) { const n = dayNum(day); const monday = n - ((n + 3) % 7); return new Date(monday * 86400000).toISOString().slice(0, 10); }
function prevDay(day) { return new Date((dayNum(day) - 1) * 86400000).toISOString().slice(0, 10); }
function challengeFor(day) { const c = CHALLENGES[((dayNum(day) % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length]; return { day, theme: c[0], word: c[1] }; }
function levelOf(xp) { return Math.floor(Math.sqrt((xp || 0) / 40)) + 1; }
function xpFor(level) { return 40 * (level - 1) * (level - 1); }
function levelInfo(xp) { const l = levelOf(xp); return { xp: xp || 0, level: l, levelXp: xpFor(l), nextXp: xpFor(l + 1) }; }

function Game(env, uid) { this.env = env; this.uid = uid; this.gained = 0; this.reasons = []; this.badges = []; this.before = null; }
Game.prototype.start = async function () { if (this.uid && this.before == null) { const r = await this.env.DB.prepare('SELECT xp FROM profiles WHERE id = ?').bind(this.uid).first(); this.before = r ? r.xp || 0 : 0; } return this; };
Game.prototype.award = async function (uid, kind, ref, points, label) {
  const day = sydDay();
  const r = await this.env.DB.prepare('INSERT OR IGNORE INTO xp_events (user_id, kind, ref, points, week, day, created) VALUES (?,?,?,?,?,?,?)').bind(uid, kind, String(ref), points, weekKey(day), day, now()).run();
  if (!(r.meta && r.meta.changes)) return 0;
  await this.env.DB.prepare('UPDATE profiles SET xp = COALESCE(xp,0) + ? WHERE id = ?').bind(points, uid).run();
  if (uid === this.uid) { this.gained += points; this.reasons.push({ points, label }); }
  return points;
};
Game.prototype.give = async function (uid, badge) {
  if (!BADGES[badge]) return;
  const r = await this.env.DB.prepare('INSERT OR IGNORE INTO badges (user_id, badge, created) VALUES (?,?,?)').bind(uid, badge, now()).run();
  if (r.meta && r.meta.changes && uid === this.uid) this.badges.push({ id: badge, ...BADGES[badge] });
};
Game.prototype.check = async function (uid) {
  const env = this.env;
  const q = await env.DB.batch([
    env.DB.prepare('SELECT COUNT(*) n, COALESCE(SUM(likes),0) l, COALESCE(SUM(remixes),0) rx, SUM(CASE WHEN remix_of IS NOT NULL THEN 1 ELSE 0 END) mine_rx, SUM(CASE WHEN challenge_day IS NOT NULL THEN 1 ELSE 0 END) ch FROM posts WHERE user_id = ?').bind(uid),
    env.DB.prepare("SELECT SUM(CASE WHEN kind='vote' THEN 1 ELSE 0 END) votes, SUM(CASE WHEN kind='battle_win' THEN 1 ELSE 0 END) wins, SUM(CASE WHEN kind='comment' THEN 1 ELSE 0 END) comments, SUM(CASE WHEN kind='follow' THEN 1 ELSE 0 END) follows FROM xp_events WHERE user_id = ?").bind(uid),
    env.DB.prepare('SELECT xp, streak FROM profiles WHERE id = ?').bind(uid)
  ]);
  const a = q[0].results[0] || {}, b = q[1].results[0] || {}, c = q[2].results[0] || {};
  const lv = levelOf(c.xp);
  const want = [];
  if (a.n >= 1) want.push('first_song'); if (a.n >= 5) want.push('five_songs'); if (a.l >= 10) want.push('ten_likes');
  if (a.mine_rx >= 1) want.push('first_remix'); if (a.rx >= 1) want.push('remixed'); if (a.ch >= 1) want.push('challenger');
  if (c.streak >= 3) want.push('streak3'); if (c.streak >= 7) want.push('streak7');
  if (b.votes >= 1) want.push('first_vote'); if (b.votes >= 10) want.push('ten_votes'); if (b.wins >= 1) want.push('battle_winner');
  if (b.comments >= 1) want.push('commenter'); if (b.follows >= 1) want.push('social');
  if (lv >= 5) want.push('level5'); if (lv >= 10) want.push('level10');
  const quest = await questFor(env, uid);
  if (quest.every(s => s.done)) want.push('quest');
  for (const w of want) await this.give(uid, w);
};
Game.prototype.result = async function () {
  if (!this.uid) return null;
  await this.check(this.uid);
  const r = await this.env.DB.prepare('SELECT xp, streak FROM profiles WHERE id = ?').bind(this.uid).first();
  const xp = r ? r.xp || 0 : 0;
  const info = levelInfo(xp);
  const beforeLv = levelOf(this.before || 0);
  const unlocked = FRAMES.filter(f => f.level > beforeLv && f.level <= info.level && f.id);
  return { gained: this.gained, reasons: this.reasons, badges: this.badges, levelUp: info.level > beforeLv ? info.level : 0, frames: unlocked, streak: r ? r.streak : 0, ...info };
};

async function questFor(env, uid) {
  const rows = await env.DB.prepare('SELECT DISTINCT kind FROM xp_events WHERE user_id = ?').bind(uid).all();
  const have = new Set(rows.results.map(r => r.kind));
  return QUEST.map(s => ({ id: s.id, name: s.name, done: have.has(s.kind) }));
}
function liveStreak(row) { const today = sydDay(); return row && (row.last_day === today || row.last_day === prevDay(today)) ? row.streak || 0 : 0; }

async function gameState(env, uid) {
  const row = await env.DB.prepare('SELECT xp, streak, last_day, frame FROM profiles WHERE id = ?').bind(uid).first();
  const b = await env.DB.prepare('SELECT badge, created FROM badges WHERE user_id = ? ORDER BY created').bind(uid).all();
  const today = sydDay();
  const wk = await env.DB.prepare('SELECT COALESCE(SUM(points),0) s FROM xp_events WHERE user_id = ? AND week = ?').bind(uid, weekKey(today)).first();
  const enteredToday = await env.DB.prepare('SELECT 1 FROM posts WHERE user_id = ? AND challenge_day = ?').bind(uid, today).first();
  const info = levelInfo(row ? row.xp : 0);
  return {
    ...info, streak: liveStreak(row), postedToday: row && row.last_day === today, frame: row ? row.frame || '' : '', weekXp: wk.s,
    badges: b.results.map(x => ({ id: x.badge, created: x.created, ...(BADGES[x.badge] || {}) })),
    allBadges: Object.entries(BADGES).map(([id, v]) => ({ id, ...v })),
    frames: FRAMES.map(f => ({ ...f, unlocked: info.level >= f.level })),
    quest: await questFor(env, uid),
    challenge: { ...challengeFor(today), entered: !!enteredToday }
  };
}

async function onPosted(game, env, me, postId, remixOf, challengeDay) {
  const today = sydDay();
  await game.award(me.id, 'post', postId, XP.post, 'Posted a song');
  const row = await env.DB.prepare('SELECT streak, last_day FROM profiles WHERE id = ?').bind(me.id).first();
  if (row.last_day !== today) {
    const streak = row.last_day === prevDay(today) ? (row.streak || 0) + 1 : 1;
    await env.DB.prepare('UPDATE profiles SET streak = ?, last_day = ? WHERE id = ?').bind(streak, today, me.id).run();
    await game.award(me.id, 'streak', today, Math.min(70, XP.streak * streak), 'Day ' + streak + ' streak');
  }
  if (challengeDay) await game.award(me.id, 'challenge', challengeDay, XP.challenge, 'Daily challenge entry');
  if (remixOf) {
    await game.award(me.id, 'remix', postId, XP.remix, 'Posted a remix');
    const parent = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(remixOf).first();
    if (parent && parent.user_id !== me.id) { await game.award(parent.user_id, 'remixed', postId, XP.remixed, 'Your song was remixed'); await game.check(parent.user_id); }
  }
}

async function settleBattles(env) {
  const due = await env.DB.prepare('SELECT * FROM battles WHERE settled = 0 AND ends < ? LIMIT 10').bind(now()).all();
  for (const bt of due.results) {
    const winner = bt.a_votes > bt.b_votes ? bt.a_post : bt.b_votes > bt.a_votes ? bt.b_post : null;
    const r = await env.DB.prepare('UPDATE battles SET settled = 1, winner = ? WHERE id = ? AND settled = 0').bind(winner, bt.id).run();
    if (!(r.meta && r.meta.changes) || !winner) continue;
    const post = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(winner).first();
    if (post) { const g = new Game(env, null); await g.award(post.user_id, 'battle_win', bt.id, XP.battle_win, 'Won a song battle'); await g.check(post.user_id); }
  }
}
async function makeBattle(env, exclude) {
  const rows = await env.DB.prepare(`SELECT p.id, p.user_id FROM posts p WHERE p.hidden = 0 AND p.created > ? AND p.id NOT IN (SELECT a_post FROM battles WHERE settled = 0) AND p.id NOT IN (SELECT b_post FROM battles WHERE settled = 0) ORDER BY RANDOM() LIMIT 30`).bind(now() - 30 * 86400000).all();
  const list = rows.results;
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    if (list[i].user_id === list[j].user_id) continue;
    if (exclude && (list[i].user_id === exclude || list[j].user_id === exclude)) continue;
    const id = rid('b');
    await env.DB.prepare('INSERT INTO battles (id, a_post, b_post, created, ends) VALUES (?,?,?,?,?)').bind(id, list[i].id, list[j].id, now(), now() + BATTLE_MS).run();
    for (const pp of [list[i], list[j]]) { const g = new Game(env, null); await g.award(pp.user_id, 'battle_entry', id + ':' + pp.id, XP.battle_entry, 'Your song is in a battle'); }
    return id;
  }
  return null;
}
async function battleOut(env, bt, me, base) {
  const posts = await env.DB.prepare(`SELECT ${POST_COLS} ${POST_FROM} WHERE p.id IN (?, ?)`).bind(bt.a_post, bt.b_post).all();
  const by = {}; posts.results.forEach(r => { by[r.id] = shapePost(r, null, base); });
  if (!by[bt.a_post] || !by[bt.b_post]) return null;
  let voted = null;
  if (me) { const v = await env.DB.prepare('SELECT choice FROM battle_votes WHERE battle_id = ? AND user_id = ?').bind(bt.id, me.id).first(); voted = v ? v.choice : null; }
  const own = me && (by[bt.a_post].author.id === me.id || by[bt.b_post].author.id === me.id);
  const showCounts = !!(voted || own || bt.settled);
  return { id: bt.id, a: by[bt.a_post], b: by[bt.b_post], ends: bt.ends, settled: !!bt.settled, winner: bt.winner, voted, own: !!own,
    aVotes: showCounts ? bt.a_votes : null, bVotes: showCounts ? bt.b_votes : null };
}

async function gameRoute(req, env, url, me, ip, seg, p, m) {
  const base = url.origin;
  if (p === '/api/game/me' && m === 'GET') {
    if (!me) return fail('Not signed in.', 401);
    return json({ game: await gameState(env, me.id) });
  }
  if (p === '/api/challenge' && m === 'GET') {
    const today = sydDay();
    const c = await env.DB.prepare('SELECT COUNT(*) n FROM posts WHERE challenge_day = ? AND hidden = 0').bind(today).first();
    const top = await env.DB.prepare(`SELECT ${POST_COLS} ${POST_FROM} WHERE p.challenge_day = ? AND p.hidden = 0 ORDER BY p.likes DESC, p.created ASC LIMIT 6`).bind(today).all();
    return json({ challenge: { ...challengeFor(today), entries: c.n, xp: XP.challenge }, top: top.results.map(r => shapePost(r, null, base)) });
  }
  if (p === '/api/leaderboard' && m === 'GET') {
    const period = url.searchParams.get('period') === 'all' ? 'all' : 'week';
    const wk = weekKey(sydDay());
    const rows = period === 'week'
      ? await env.DB.prepare('SELECT u.id, u.handle, u.name, u.avatar, u.xp, u.frame, SUM(e.points) AS score FROM xp_events e JOIN profiles u ON u.id = e.user_id WHERE e.week = ? GROUP BY e.user_id ORDER BY score DESC, u.xp DESC LIMIT 25').bind(wk).all()
      : await env.DB.prepare('SELECT id, handle, name, avatar, xp, frame, xp AS score FROM profiles WHERE xp > 0 ORDER BY xp DESC LIMIT 25').all();
    return json({ period, week: wk, leaders: rows.results.map((r, i) => ({ rank: i + 1, id: r.id, handle: r.handle, name: r.name, avatar: r.avatar, frame: r.frame || '', level: levelOf(r.xp), score: r.score })) });
  }
  if (p === '/api/battle' && m === 'GET') {
    await settleBattles(env);
    const open = await env.DB.prepare('SELECT * FROM battles WHERE settled = 0 AND ends > ? ORDER BY created DESC LIMIT 20').bind(now()).all();
    let pick = null; let fallback = null;
    for (const bt of open.results) {
      const out = await battleOut(env, bt, me, base);
      if (!out) continue;
      if (!out.voted && !out.own) { pick = out; break; }
      if (!fallback) fallback = out;
    }
    if (!pick && open.results.length < 6) { const id = await makeBattle(env, me ? me.id : null); if (id) pick = await battleOut(env, await env.DB.prepare('SELECT * FROM battles WHERE id = ?').bind(id).first(), me, base); }
    const recent = await env.DB.prepare('SELECT * FROM battles WHERE settled = 1 AND winner IS NOT NULL ORDER BY ends DESC LIMIT 3').all();
    const past = [];
    for (const bt of recent.results) { const o = await battleOut(env, bt, me, base); if (o) past.push(o); }
    return json({ battle: pick || fallback, past });
  }
  if (seg[1] === 'battles' && seg[2] && seg[3] === 'vote' && m === 'POST') {
    if (!me) return fail('Make a profile first.', 401);
    const b = await req.json().catch(() => ({}));
    const choice = b.choice === 'b' ? 'b' : b.choice === 'a' ? 'a' : '';
    if (!choice) return fail('Pick a song.');
    const bt = await env.DB.prepare('SELECT * FROM battles WHERE id = ?').bind(seg[2]).first();
    if (!bt) return fail('That battle is not here.', 404);
    if (bt.settled || bt.ends < now()) return fail('That battle has finished.');
    const posts = await env.DB.prepare('SELECT id, user_id FROM posts WHERE id IN (?, ?)').bind(bt.a_post, bt.b_post).all();
    if (posts.results.some(x => x.user_id === me.id)) return fail('You cannot vote in a battle with your own song.', 403);
    const already = await env.DB.prepare('SELECT 1 FROM battle_votes WHERE battle_id = ? AND user_id = ?').bind(bt.id, me.id).first();
    if (already) return fail('You already voted in this battle.', 409);
    const ipCount = await env.DB.prepare('SELECT COUNT(*) n FROM battle_votes WHERE battle_id = ? AND ip_hash = ?').bind(bt.id, ip).first();
    if (ipCount.n >= 3) return fail('Too many votes in this battle from this connection.', 429);
    if (await limited(env, me.id, 'vote')) return fail('You have voted a lot this hour. Try again later.', 429);
    if (await limited(env, ip, 'voteip')) return fail('Too many votes from this connection this hour.', 429);
    const ins = await env.DB.prepare('INSERT OR IGNORE INTO battle_votes (battle_id, user_id, choice, ip_hash, created) VALUES (?,?,?,?,?)').bind(bt.id, me.id, choice, ip, now()).run();
    if (!(ins.meta && ins.meta.changes)) return fail('You already voted in this battle.', 409);
    await env.DB.prepare(`UPDATE battles SET ${choice === 'a' ? 'a_votes = a_votes + 1' : 'b_votes = b_votes + 1'} WHERE id = ?`).bind(bt.id).run();
    const game = await new Game(env, me.id).start();
    await game.award(me.id, 'vote', bt.id, XP.vote, 'Voted in a battle');
    const fresh = await env.DB.prepare('SELECT * FROM battles WHERE id = ?').bind(bt.id).first();
    return json({ battle: await battleOut(env, fresh, me, base), game: await game.result() });
  }
  if (p === '/api/quest/play' && m === 'POST') {
    if (!me) return json({ game: null });
    const game = await new Game(env, me.id).start();
    await game.award(me.id, 'play', sydDay(), XP.play, 'Listened today');
    return json({ game: await game.result() });
  }
  const wall = await wallRoute(req, env, me, ip, seg, p, m);
  if (wall) return wall;
  return null;
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(req.url);
    try { return await route(req, env, url); }
    catch (err) { return json({ error: 'Something went wrong on the server.', detail: String(err && err.message || err).slice(0, 200) }, 500); }
  }
};
