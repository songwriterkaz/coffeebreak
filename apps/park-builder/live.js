// Live multiplayer for Coffeebreak Park Builder.
// Only real players are shown. No chat. Nicknames are filtered here and again on the server.
const SERVER = 'wss://cb-park-builder-live.coffeebreaks.workers.dev/ws';
const NICK_KEY = 'coffeebreakParkBuilder_nick';

const BAD = ['fuck','fuk','fck','shit','bitch','cunt','dick','cock','pussy','slut','whore','fag','nigg','niga','retard','rape','porn','nazi','hitler','penis','vagina','anal','anus','boob','tits','twat','wank','bastard','asshole','arsehole','dildo','cum','sex','xxx','kill','suicide','pedo','paedo','molest','incest','horny','nude','naked','boner','jizz','sexy','spunk','skank','hoe','kkk','isis','terror','bollock','prick','douche','crap','piss','damn','hell'];
const SHORT_WORDS = ['rape','xxx','sexy','cum','sex','hoe','kkk','hell','crap','anal','anus','tits','damn','piss','kill','fag','dick','cock','prick'];
const LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '9': 'g', '@': 'a', '$': 's', '!': 'i' };
export function cleanName(n) {
  if (typeof n !== 'string') return '';
  n = n.replace(/\s+/g, ' ').trim().slice(0, 16);
  if (!/^[A-Za-z0-9][A-Za-z0-9 '\-_.]{0,15}$/.test(n)) return '';
  const low = n.toLowerCase().replace(/[0-9@$!]/g, c => LEET[c] || c);
  const squash = low.replace(/[^a-z]/g, '').replace(/(.)\1+/g, '$1');
  const words = low.split(/[^a-z]+/).filter(Boolean);
  for (const b of BAD) {
    if (SHORT_WORDS.includes(b)) { if (words.includes(b) || words.includes(b + 's')) return ''; continue; }
    if (squash.includes(b.replace(/(.)\1+/g, '$1'))) return '';
  }
  return n;
}
export function savedNick() { try { return localStorage.getItem(NICK_KEY) || ''; } catch (e) { return ''; } }

export function startLive(api) {
  const { THREE, scene, makeAvatar, setOutfit, textTex, animateWalk, buildPiece, unregister, player, state, OUTFITS, placed, PLOT, half, plotSign, toast, $ } = api;
  const room = (new URLSearchParams(location.search).get('room') || 'park').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24) || 'park';
  const remotes = new Map();
  const live = api.live;
  let ws = null, myId = '', myName = '', retry = 0, sendT = 0, parkT = null, last = {}, pingT = null;
  const insidePlot = p => Math.abs(p.x - PLOT.x) < half && Math.abs(p.z - PLOT.z) < half;
  const myPlotTex = plotSign.material.map;

  function setOnline(text) { const el = $('online'); if (el) el.textContent = text; }
  function updateCount() {
    if (!ws || ws.readyState !== 1 || !myId) return;
    const n = remotes.size + 1;
    setOnline(n === 1 ? '1 real player online' : n + ' real players online');
    live.online = n;
  }

  function tag(name) {
    const t = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTex(name, '#ff3caa'), depthTest: true }));
    t.scale.set(5, 1.25, 1); t.position.y = 7.2; return t;
  }
  function addRemote(p) {
    if (remotes.has(p.id)) removeRemote(p.id);
    const o = OUTFITS[(p.o | 0) % OUTFITS.length];
    const av = makeAvatar(o.top, o.bottom, o.extra);
    setOutfit(av, o);
    av.add(tag(p.name));
    av.position.set(p.x, p.y, p.z); av.rotation.y = p.r;
    scene.add(av);
    remotes.set(p.id, { id: p.id, name: p.name, o: p.o | 0, av, tx: p.x, ty: p.y, tz: p.z, tr: p.r, w: p.w || 0, v: p.v || '', pieces: p.pieces || [], inMine: false });
  }
  function removeRemote(id) {
    const r = remotes.get(id); if (!r) return;
    scene.remove(r.av); remotes.delete(id);
    if (live.visiting && live.visiting.id === id) { goHome(); toast(r.name + ' left, so you are back in your park'); }
  }

  // ----- visiting another real player's park -----
  function clearVisit() {
    for (const p of live.visitPlaced) { unregister(p.group); scene.remove(p.group); }
    live.visitPlaced.length = 0;
  }
  function showPieces(pieces) {
    clearVisit();
    for (const d of pieces) {
      try {
        const g = buildPiece(d.id, d.v);
        g.position.set(PLOT.x + d.x, 0, PLOT.z + d.z); g.rotation.y = -d.r * Math.PI / 2;
        scene.add(g); live.visitPlaced.push({ data: d, group: g });
      } catch (e) {}
    }
  }
  function visit(id) {
    const r = remotes.get(id); if (!r) return;
    live.visiting = { id, name: r.name };
    for (const p of placed) p.group.visible = false;
    showPieces(r.pieces);
    plotSign.material.map = textTex((r.name + "'s park").toUpperCase(), '#ff3caa'); plotSign.material.needsUpdate = true;
    api.enterPlot();
    toast('Welcome to ' + r.name + "'s park");
    sendMove(true);
  }
  function goHome() {
    if (!live.visiting) return;
    live.visiting = null; clearVisit();
    for (const p of placed) p.group.visible = true;
    plotSign.material.map = myPlotTex; plotSign.material.needsUpdate = true;
    sendMove(true);
  }
  live.goHome = goHome;

  function renderParks() {
    const el = $('parks'); el.innerHTML = '<h3>Real players online</h3>';
    if (!remotes.size) {
      const d = document.createElement('div'); d.style.cssText = 'width:100%;text-align:center;padding:4px 8px';
      d.textContent = ws && ws.readyState === 1 ? 'Nobody else is here right now. Share the game link with a friend and you will see each other.' : 'Not connected yet. Trying again soon.';
      el.appendChild(d);
    }
    for (const r of remotes.values()) {
      const b = document.createElement('button'); b.className = 'piece';
      b.innerHTML = '';
      b.append(document.createTextNode('Visit ' + r.name + "'s park"));
      const sm = document.createElement('small'); sm.textContent = r.pieces.length + ' pieces built'; b.appendChild(sm);
      b.onclick = () => { api.closePanels(); visit(r.id); };
      el.appendChild(b);
    }
    if (live.visiting) { const h = document.createElement('button'); h.className = 'alt'; h.textContent = 'Back to my park'; h.onclick = () => { api.closePanels(); goHome(); api.enterPlot(); }; el.appendChild(h); }
    const info = document.createElement('div'); info.style.cssText = 'width:100%;text-align:center;font-size:12px;opacity:.85;padding-top:4px';
    info.textContent = 'Room: ' + room + '. Only real players are shown. There is no chat.';
    el.appendChild(info);
  }
  live.renderParks = renderParks;

  // ----- network -----
  function send(o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
  function sendMove(force) {
    if (!myId) return;
    const p = player.position;
    const m = { t: 'm', x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2), r: +player.rotation.y.toFixed(2), w: Math.round(live.speed || 0), v: live.visiting ? live.visiting.id : '' };
    if (!force && m.x === last.x && m.y === last.y && m.z === last.z && m.r === last.r && m.w === last.w && m.v === last.v) return;
    last = m; send(m);
  }
  live.onPark = () => { clearTimeout(parkT); parkT = setTimeout(() => send({ t: 'park', pieces: state.pieces }), 700); };
  live.onOutfit = () => send({ t: 'o', o: state.outfit | 0 });

  function connect() {
    setOnline('Connecting');
    try { ws = new WebSocket(SERVER + '?room=' + encodeURIComponent(room)); } catch (e) { return later(); }
    ws.onopen = () => {
      retry = 0;
      const p = player.position;
      send({ t: 'join', name: myName, o: state.outfit | 0, x: p.x, y: p.y, z: p.z, r: player.rotation.y, pieces: state.pieces });
      clearInterval(pingT); pingT = setInterval(() => { if (ws && ws.readyState === 1) ws.send('ping'); }, 30000);
    };
    ws.onmessage = e => {
      if (e.data === 'pong') return;
      let m; try { m = JSON.parse(e.data); } catch (err) { return; }
      if (m.t === 'hello') { myId = m.id; live.myId = m.id; for (const p of m.players) addRemote(p); updateCount(); sendMove(true); }
      else if (m.t === 'full') { setOnline('Park is full, try later'); }
      else if (m.t === 'join') { addRemote(m); updateCount(); toast(m.name + ' joined the park'); }
      else if (m.t === 'leave') { removeRemote(m.id); updateCount(); }
      else if (m.t === 'm') { const r = remotes.get(m.id); if (r) { r.tx = m.x; r.ty = m.y; r.tz = m.z; r.tr = m.r; r.w = m.w; r.v = m.v || ''; } }
      else if (m.t === 'o') { const r = remotes.get(m.id); if (r) { r.o = m.o; setOutfit(r.av, OUTFITS[m.o % OUTFITS.length]); } }
      else if (m.t === 'park') { const r = remotes.get(m.id); if (r) { r.pieces = m.pieces; if (live.visiting && live.visiting.id === m.id) showPieces(m.pieces); } }
    };
    ws.onclose = () => {
      clearInterval(pingT);
      for (const id of [...remotes.keys()]) removeRemote(id);
      myId = ''; live.myId = ''; live.online = 0;
      later();
    };
  }
  function later() {
    retry = Math.min(retry + 1, 6);
    setOnline('Offline, reconnecting');
    setTimeout(connect, 1500 * retry);
  }

  // ----- per frame -----
  live.step = (dt, T) => {
    sendT += dt;
    if (sendT > 0.15) { sendT = 0; sendMove(false); }
    const view = live.visiting ? live.visiting.id : myId;
    const k = Math.min(1, dt * 10);
    for (const r of remotes.values()) {
      const a = r.av;
      a.position.x += (r.tx - a.position.x) * k; a.position.y += (r.ty - a.position.y) * k; a.position.z += (r.tz - a.position.z) * k;
      let d = r.tr - a.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); a.rotation.y += d * k;
      animateWalk(a, r.ty > 0.2 ? 0 : r.w, T + r.id.charCodeAt(0));
      if (r.ty > 0.2) { const p = a.userData.parts; p.la.rotation.x = p.ra.rotation.x = -2.6; }
      const inside = insidePlot(a.position);
      const owner = r.v || r.id;
      a.visible = !inside || owner === view;
      const inMine = inside && r.v === myId && !!myId;
      if (inMine && !r.inMine) toast(r.name + ' is visiting your park');
      r.inMine = inMine;
    }
  };
  live.visitorsInMyPark = () => { let n = 0; for (const r of remotes.values()) if (r.inMine) n++; return n; };
  live.remotes = remotes;

  live.start = nick => { myName = nick; if (!ws) connect(); };
  return live;
}
