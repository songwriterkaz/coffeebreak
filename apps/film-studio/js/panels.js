'use strict';
(function(CB){
  const S = CB.S, $ = CB.$, $$ = CB.$$, esc = CB.esc;

  // ---------- tabs ----------
  CB.initTabs = function () {
    $$('.tab').forEach(b => b.onclick = () => {
      $$('.tab').forEach(x => x.classList.toggle('on', x === b));
      $$('.pane').forEach(p => p.classList.toggle('on', p.id === 'pane-' + b.dataset.pane));
    });
  };
  CB.showTab = (n) => { const b = $('.tab[data-pane="' + n + '"]'); if (b) b.click(); };

  // ---------- media bin ----------
  CB.renderMedia = function () {
    const box = $('#mediaList'); box.innerHTML = '';
    const list = Array.from(S.assets.values()).filter(a => !a.charKey);
    if (!list.length) { box.innerHTML = '<div class="empty">Nothing imported yet.<br>Press Import media, or drag files here.</div>'; }
    list.forEach(a => {
      const d = document.createElement('div'); d.className = 'mitem' + (a.missing ? ' miss' : ''); d.draggable = true;
      const th = document.createElement('div'); th.className = 'mth';
      if (a.thumb) { const c = document.createElement('canvas'); c.width = a.thumb.width; c.height = a.thumb.height; c.getContext('2d').drawImage(a.thumb, 0, 0); th.appendChild(c); }
      else th.innerHTML = a.kind === 'audio' ? '<span>&#9835;</span>' : '<span>?</span>';
      d.appendChild(th);
      const meta = document.createElement('div'); meta.className = 'mmeta';
      meta.innerHTML = '<b title="' + esc(a.name) + '">' + esc(a.name) + '</b><small>' + (a.missing ? 'Missing: import it again' : a.kind + (a.duration ? ' &middot; ' + CB.fmt(a.duration, 1) : '')) + '</small>';
      d.appendChild(meta);
      const add = document.createElement('button'); add.className = 'mini'; add.textContent = 'Add'; add.setAttribute('data-tip', 'Add to the timeline at the playhead');
      add.onclick = (e) => { e.stopPropagation(); if (a.missing) return CB.toast('Import this file again to reconnect it'); CB.addAssetClip(a, S.t); };
      d.appendChild(add);
      d.ondragstart = (e) => { e.dataTransfer.setData('application/x-cbfs', JSON.stringify({ kind: 'asset', id: a.id })); e.dataTransfer.effectAllowed = 'copy'; };
      d.ondblclick = () => { if (!a.missing) CB.addAssetClip(a, S.t); };
      box.appendChild(d);
    });
    $('#dropHint').style.display = S.p.clips.length ? 'none' : '';
  };

  // ---------- characters ----------
  CB.chars = []; CB.charVoice = {};
  CB.loadChars = async function () {
    try { CB.chars = await (await fetch('chars/characters.json')).json(); } catch (e) { CB.chars = []; }
    const saved = await CB.idb.get('kv', 'charvoice'); CB.charVoice = saved || {};
    const mine = await CB.idb.all('chars');
    mine.forEach(m => CB.chars.push({ id: m.id, name: m.name, role: 'Your upload', voice: 'off', strength: 50, mine: true, blob: m.blob, outfits: [{ id: 'art', label: 'Your picture' }] }));
    CB.renderChars();
  };
  const cvoice = (ch) => Object.assign({ voice: ch.voice, strength: ch.strength }, CB.charVoice[ch.id] || {});
  CB.charAsset = async function (id, outfit) {
    const ch = CB.chars.find(c => c.id === id); const key = 'char_' + id + '_' + outfit;
    let a = S.assets.get(key);
    if (a && !a.missing) return a;
    if (ch.mine) {
      a = { id: key, name: ch.name, kind: 'image', charKey: true }; S.assets.set(key, a);
      await CB.fillAsset(a, ch.blob); a.charKey = true;
      CB.idb.put('assets', key, { id: key, name: ch.name, kind: 'image', blob: ch.blob });
    } else {
      a = await CB.assetFromUrl(key, ch.name + ' ' + outfit, 'chars/' + id + '-' + outfit + '.png'); a.charKey = true;
    }
    S.p.assets = Array.from(S.assets.values()).map(CB.metaOf);
    return a;
  };
  CB.charClipExtra = function (id, outfit) {
    const ch = CB.chars.find(c => c.id === id); const of = ch.outfits.find(o => o.id === outfit);
    return { charId: id, outfit, label: ch.name + ' - ' + (of ? of.label : outfit), fit: 'contain', zoom: 1, panX: 0, panY: 0, track: CB.defaultTrackFor('char') };
  };
  CB.addCharacter = async function (id, outfit) {
    const a = await CB.charAsset(id, outfit);
    const c = CB.addAssetClip(a, S.t, null, CB.charClipExtra(id, outfit));
    CB.toast(CB.chars.find(x => x.id === id).name + ' added');
    return c;
  };
  CB.renderChars = function () {
    const box = $('#charList'); if (!box) return; box.innerHTML = '';
    CB.chars.forEach(ch => {
      const v = cvoice(ch);
      const card = document.createElement('div'); card.className = 'ccard';
      const first = ch.outfits[0];
      const imgUrl = ch.mine ? (ch._url || (ch._url = URL.createObjectURL(ch.blob))) : 'chars/' + ch.id + '-' + first.id + '.png';
      card.innerHTML = '<div class="chead"><img class="cface" src="' + imgUrl + '" alt="" loading="lazy"><div><b>' + esc(ch.name) + '</b><small>' + esc(ch.role) + '</small></div></div>' +
        '<div class="cvoice" data-tip="The voice preset linked to this character. Use it on a recording with Apply voice in the inspector."><span>Voice</span>' +
        '<select data-k="voice"><option value="off">Off</option><option value="female">Female</option><option value="male">Male</option></select>' +
        '<input type="range" min="0" max="100" data-k="strength" value="' + v.strength + '" aria-label="Voice strength"><em>' + v.strength + '</em></div>' +
        '<div class="couts"></div>';
      const sel = $('select', card); sel.value = v.voice;
      sel.onchange = () => { CB.charVoice[ch.id] = Object.assign(cvoice(ch), { voice: sel.value }); CB.idb.put('kv', 'charvoice', CB.charVoice); };
      const rg = $('input', card); rg.oninput = () => { $('em', card).textContent = rg.value; CB.charVoice[ch.id] = Object.assign(cvoice(ch), { strength: +rg.value }); CB.idb.put('kv', 'charvoice', CB.charVoice); };
      const outs = $('.couts', card);
      ch.outfits.forEach(o => {
        const b = document.createElement('div'); b.className = 'cout'; b.draggable = true;
        const url = ch.mine ? imgUrl : 'chars/' + ch.id + '-' + o.id + '.png';
        b.innerHTML = '<img src="' + url + '" alt="' + esc(ch.name + ' ' + o.label) + '" loading="lazy"><span>' + esc(o.label) + '</span>';
        b.setAttribute('data-tip', 'Click to add at the playhead, or drag onto the timeline');
        b.onclick = () => CB.addCharacter(ch.id, o.id);
        b.ondragstart = (e) => { e.dataTransfer.setData('application/x-cbfs', JSON.stringify({ kind: 'char', charId: ch.id, outfit: o.id })); e.dataTransfer.effectAllowed = 'copy'; };
        outs.appendChild(b);
      });
      if (ch.mine) {
        const rm = document.createElement('button'); rm.className = 'mini'; rm.textContent = 'Remove'; rm.onclick = async () => { await CB.idb.del('chars', ch.id); CB.chars = CB.chars.filter(x => x !== ch); CB.renderChars(); };
        card.appendChild(rm);
      }
      box.appendChild(card);
    });
  };
  CB.uploadCharacters = async function (files) {
    for (const f of Array.from(files)) {
      if (!/^image\//.test(f.type) && !/\.(png|jpe?g|gif|webp|svg)$/i.test(f.name)) { CB.toast('Characters need to be pictures'); continue; }
      const name = f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 40) || 'My character';
      const id = CB.uid('mine');
      await CB.idb.put('chars', id, { id, name, blob: f });
      CB.chars.push({ id, name, role: 'Your upload', voice: 'off', strength: 50, mine: true, blob: f, outfits: [{ id: 'art', label: 'Your picture' }] });
    }
    CB.renderChars(); CB.toast('Character saved in this browser');
  };

  // ---------- add panel ----------
  const TXT = { text: 'Your title', font: CB.FONTS[0][0], size: 96, color: '#ffffff', bold: true, italic: false, x: 50, y: 50, align: 'center', outline: false, bg: false, shadow: true, spacing: 0, caps: false, roll: false };
  CB.addText = function (kind) {
    const p = {
      title: { dur: 4, label: 'Title', text: Object.assign({}, TXT, { text: 'Your title' }) },
      lower: { dur: 4, label: 'Lower third', text: Object.assign({}, TXT, { text: 'Name or caption', size: 44, y: 84, bg: true, bold: true, shadow: false }) },
      cine: { dur: 5, label: 'Cinematic title', text: Object.assign({}, TXT, { text: 'YOUR TITLE', font: 'Cinzel, Georgia, serif', size: 104, color: '#f4efe6', bold: false, spacing: 22, caps: true, shadow: false }), tr: 0.9 },
      roll: { dur: 16, label: 'Credit roll', text: Object.assign({}, TXT, { text: '# Directed by\nYour name\n\n# Starring\nLead role | Actor name\nSupporting role | Actor name\n\n# Music\nSong title | Artist\n\n# Special thanks\nEveryone who helped', font: 'Montserrat, Arial, sans-serif', size: 40, bold: false, spacing: 6, caps: false, roll: true, shadow: false }), tr: 0.4 },
      end: { dur: 5, label: 'End card', text: Object.assign({}, TXT, { text: 'Thank you for watching\nA Coffeebreak film', font: '"Playfair Display", Georgia, serif', size: 78, color: '#f6e6ee', bold: false, spacing: 4, shadow: false }), tr: 0.9 },
      sub: { dur: 3, label: 'Subtitle', text: Object.assign({}, TXT, { text: 'Subtitle text goes here', font: 'Poppins, Arial, sans-serif', size: 46, y: 90, bold: false, outline: true, outlineColor: '#000000', shadow: false }), tr: 0.15 },
      lyric: { dur: 4, label: 'Lyric line', text: Object.assign({}, TXT, { text: 'Type your lyric here', font: '"Brush Script MT", "Pacifico", cursive', size: 90, color: '#ffd6e6', outline: true, outlineColor: '#d6336f', bold: false, y: 80 }) }
    }[kind];
    CB.mutate(() => { const c = CB.addClip({ type: 'text', start: S.t, dur: p.dur, label: p.label, text: p.text, trans: 'dissolve', transDur: p.tr || 0.4, track: CB.defaultTrackFor('char') }); S.sel = c.id; });
  };
  CB.addBackground = function () {
    CB.mutate(() => { const v = S.p.tracks.filter(t => t.type === 'v'); const c = CB.addClip({ type: 'color', start: S.t, dur: 5, label: 'Background', color: '#ff7fb0', color2: '#4d1c3e', track: v[v.length - 1].id }); S.sel = c.id; });
  };

  // ---------- inspector ----------
  function row(label, inner, tip) { return '<div class="irow"' + (tip ? ' data-tip="' + esc(tip) + '"' : '') + '><label>' + label + '</label>' + inner + '</div>'; }
  function slider(k, label, min, max, step, val, unit, tip) {
    return row(label, '<input type="range" data-k="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"><output>' + val + (unit || '') + '</output>', tip);
  }
  CB.renderInspector = function () {
    const box = $('#inspector'); const c = CB.selClip();
    if (!c) {
      box.innerHTML = '<div class="empty">Select a clip on the timeline to change its volume, speed, colour, voice and more.</div>' +
        '<div class="sect"><h4>Project</h4>' + row('Background', '<input type="color" id="pBg" value="' + (S.p.bg || '#000000') + '">') + '</div>' +
        '<div class="sect"><h4>Shortcuts</h4><div class="keys"><span><kbd>Space</kbd> play</span><span><kbd>S</kbd> split</span><span><kbd>Del</kbd> delete</span><span><kbd>Shift</kbd>+<kbd>Del</kbd> ripple</span><span><kbd>Ctrl</kbd>+<kbd>Z</kbd> undo</span><span><kbd>Left</kbd><kbd>Right</kbd> frame</span><span><kbd>Ctrl</kbd>+<kbd>D</kbd> duplicate</span><span><kbd>+</kbd><kbd>-</kbd> zoom</span></div></div>';
      const bg = $('#pBg'); if (bg) bg.oninput = () => CB.mutate(() => { S.p.bg = bg.value; }, 'bg');
      return;
    }
    const isAV = c.type === 'video' || c.type === 'audio', isVis = c.type !== 'audio', isMedia = c.type === 'video' || c.type === 'image';
    let h = '<div class="sect"><h4>' + esc(c.label || c.type) + '</h4><div class="small">' + c.type + ' &middot; ' + CB.fmt(c.start, 1) + ' to ' + CB.fmt(c.start + c.dur, 1) + '</div></div>';
    if (c.type === 'text') {
      const t = c.text;
      h += '<div class="sect"><h4>Text</h4><textarea data-t="text" rows="3">' + esc(t.text) + '</textarea>' +
        row('Font', '<select data-t="font">' + CB.FONTS.map(f => '<option value="' + esc(f[0]) + '"' + (f[0] === t.font ? ' selected' : '') + '>' + f[1] + '</option>').join('') + '</select>') +
        slider('t:size', 'Size', 16, 240, 2, t.size, '') +
        row('Colour', '<input type="color" data-t="color" value="' + t.color + '">') +
        row('Style', '<label class="chk"><input type="checkbox" data-t="bold"' + (t.bold ? ' checked' : '') + '> Bold</label><label class="chk"><input type="checkbox" data-t="italic"' + (t.italic ? ' checked' : '') + '> Italic</label><label class="chk"><input type="checkbox" data-t="outline"' + (t.outline ? ' checked' : '') + '> Outline</label><label class="chk"><input type="checkbox" data-t="bg"' + (t.bg ? ' checked' : '') + '> Box</label>') +
        (t.outline ? row('Outline colour', '<input type="color" data-t="outlineColor" value="' + (t.outlineColor || '#3a1030') + '">') : '') +
        (t.bg ? row('Box colour', '<input type="color" data-t="bgColor" value="' + (t.bgColor || '#d6336f') + '">') : '') +
        row('', '<label class="chk"><input type="checkbox" data-t="caps"' + (t.caps ? ' checked' : '') + '> Capitals</label><label class="chk" data-tip="Scrolls the text up the screen over the length of the clip"><input type="checkbox" data-t="roll"' + (t.roll ? ' checked' : '') + '> Credit roll</label>') +
        slider('t:spacing', 'Letter spacing', -5, 60, 1, t.spacing || 0, '%') +
        (t.roll ? '<div class="small">Credit roll: start a line with # for a heading, and write Role | Name for two columns. A longer clip scrolls slower.</div>' : '') +
        row('Align', '<select data-t="align"><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select>') +
        slider('t:x', 'Position across', 0, 100, 1, t.x, '%') + slider('t:y', 'Position down', 0, 100, 1, t.y, '%') + '</div>';
    }
    if (c.type === 'color') h += '<div class="sect"><h4>Background</h4>' + row('Top', '<input type="color" data-k="color" value="' + (c.color || '#ff7fb0') + '">') + row('Bottom', '<input type="color" data-k="color2" value="' + (c.color2 || '#4d1c3e') + '">') + '</div>';
    h += '<div class="sect"><h4>Timing</h4>' + row('Start (s)', '<input type="number" step="0.1" min="0" data-k="start" value="' + c.start.toFixed(2) + '">') + row('Length (s)', '<input type="number" step="0.1" min="0.1" data-k="dur" value="' + c.dur.toFixed(2) + '">');
    if (isAV) h += row('Speed', '<input type="range" data-k="speed" min="0.5" max="2" step="0.05" value="' + (c.speed || 1) + '"><output>' + (c.speed || 1) + 'x</output>', 'Slow down to 0.5x or speed up to 2x');
    h += '</div>';
    if (isAV) {
      h += '<div class="sect"><h4>Sound</h4>' + slider('vol', 'Volume', 0, 200, 5, Math.round((c.vol == null ? 1 : c.vol) * 100), '%') + slider('fadeIn', 'Fade in (s)', 0, 5, 0.1, c.fadeIn || 0, '') + slider('fadeOut', 'Fade out (s)', 0, 5, 0.1, c.fadeOut || 0, '') + '</div>';
      const v = c.voice || 'off';
      h += '<div class="sect voice"><h4>Voice converter</h4><div class="seg" id="vseg">' +
        ['off:Off', 'female:Female', 'male:Male'].map(s => { const [k, l] = s.split(':'); return '<button data-v="' + k + '" class="' + (v === k ? 'on' : '') + '">' + l + '</button>'; }).join('') + '</div>' +
        slider('voiceStr', 'Strength', 0, 100, 5, c.voiceStr == null ? 50 : c.voiceStr, '%', 'How strong the change is. Higher moves the pitch further.') +
        row('', '<label class="chk" data-tip="Keeps voices natural when you change the speed"><input type="checkbox" data-k="keepPitch"' + (c.keepPitch ? ' checked' : '') + '> Keep pitch when speed changes</label>') +
        '<div class="small">Female raises the pitch and brightens the voice. Male lowers it and warms it. Best on speech.</div></div>';
    }
    if (isVis) {
      h += '<div class="sect"><h4>Picture</h4>' + slider('opacity', 'Opacity', 0, 100, 1, Math.round((c.opacity == null ? 1 : c.opacity) * 100), '%');
      if (isMedia) {
        h += row('Look', '<select data-k="look">' + Object.keys(CB.LOOKS).map(k => '<option value="' + k + '"' + ((c.look || 'none') === k ? ' selected' : '') + '>' + CB.LOOKS[k].name + '</option>').join('') + '</select>', 'Film looks') +
          slider('bright', 'Brightness', 40, 180, 1, c.bright, '%') + slider('contrast', 'Contrast', 40, 180, 1, c.contrast, '%') + slider('sat', 'Saturation', 0, 200, 1, c.sat, '%') +
          row('Fit', '<select data-k="fit"><option value="cover">Fill the frame</option><option value="contain">Show whole picture</option></select>') +
          slider('zoom', 'Crop / zoom', 1, 4, 0.05, c.zoom || 1, 'x', 'Zoom in to crop the edges') + slider('panX', 'Move across', -1, 1, 0.02, c.panX || 0, '') + slider('panY', 'Move down', -1, 1, 0.02, c.panY || 0, '') +
          '<div class="small" style="margin-top:8px">Slow push in or pull out (Ken Burns): set where the zoom ends. It moves smoothly across the clip.</div>' +
          slider('zoomEnd', 'End zoom', 1, 4, 0.05, c.zoomEnd || c.zoom || 1, 'x', 'The zoom at the end of the clip. Different from Crop / zoom gives a slow push in or pull out') + slider('panXEnd', 'End across', -1, 1, 0.02, c.panXEnd == null ? (c.panX || 0) : c.panXEnd, '') + slider('panYEnd', 'End down', -1, 1, 0.02, c.panYEnd == null ? (c.panY || 0) : c.panYEnd, '');
      }
      h += '</div><div class="sect"><h4>Transitions</h4>' +
        row('Style', '<select data-k="trans"><option value="none">None</option><option value="fade-in">Fade in</option><option value="fade-out">Fade out</option><option value="dissolve">Fade in and out</option><option value="fade">Dip to black</option></select>', 'To cross-dissolve, put a clip on the upper video track so it overlaps the clip below, then use Fade in') +
        slider('transDur', 'Length (s)', 0.1, 3, 0.1, c.transDur || 0.5, '') + '<div class="small">Cross-dissolve: overlap this clip on an upper track with the clip below, then choose Fade in.</div></div>';
    }
    if (c.charId) {
      const ch = CB.chars.find(x => x.id === c.charId);
      if (ch) { const v = cvoice(ch); h += '<div class="sect"><h4>Character voice</h4><div class="small">' + esc(ch.name) + ' voice preset: <b>' + (v.voice === 'off' ? 'Off' : v.voice === 'female' ? 'Female' : 'Male') + ' ' + v.strength + '%</b></div><button id="applyVoice" class="wide" data-tip="Applies this voice to the audio clips that play at the same time as this character">Apply voice to overlapping audio</button></div>'; }
    }
    h += '<div class="sect actions"><button id="iSplit">Split</button><button id="iDup">Duplicate</button><button id="iDel" class="danger">Delete</button></div>';
    box.innerHTML = h;

    const set = (fn, key) => CB.mutate(fn, key + ':' + c.id);
    $$('[data-k]', box).forEach(el => {
      if (el.dataset.k.startsWith('t:')) return;
      const k = el.dataset.k, out = el.parentElement && $('output', el.parentElement);
      const ev = (el.type === 'range' || el.type === 'color') ? 'input' : 'change';
      if (el.tagName === 'SELECT') el.value = c[k] == null ? el.value : c[k];
      el.addEventListener(ev, () => {
        let v = el.type === 'checkbox' ? el.checked : (el.type === 'range' || el.type === 'number') ? parseFloat(el.value) : el.value;
        if (el.type === 'number' && !isFinite(v)) return;
        if (k === 'vol') v = v / 100; if (k === 'opacity') v = v / 100;
        if (out) out.textContent = (k === 'vol' || k === 'opacity' ? Math.round(v * 100) : v) + (k === 'speed' || k === 'zoom' || k === 'zoomEnd' ? 'x' : (['bright', 'contrast', 'sat', 'voiceStr'].includes(k) ? '%' : (k === 'vol' || k === 'opacity') ? '%' : ''));
        set(() => {
          if (k === 'speed') { const old = c.speed || 1; const srcLen = c.dur * old; c.speed = v; const a = CB.assetOf(c); let nd = srcLen / v; if (a && a.duration && (c.type === 'video' || c.type === 'audio')) nd = Math.min(nd, (a.duration - c.in) / v); c.dur = Math.max(0.1, nd); }
          else if (k === 'start') { c.start = CB.freeStart(c, c.track, Math.max(0, v), c.id); }
          else if (k === 'dur') { c.dur = Math.max(0.1, v); }
          else c[k] = v;
        }, k);
        if (k === 'start' || k === 'dur' || k === 'speed') { /* keep inspector numbers in step */ }
      });
    });
    $$('[data-t]', box).forEach(el => {
      const k = el.dataset.t; const ev = (el.type === 'color' || el.tagName === 'TEXTAREA') ? 'input' : 'change';
      if (el.tagName === 'SELECT') el.value = c.text[k];
      el.addEventListener(ev, () => { const v = el.type === 'checkbox' ? el.checked : el.value; set(() => { c.text[k] = v; }, 't' + k); if (el.type === 'checkbox' && (k === 'outline' || k === 'bg' || k === 'roll')) CB.renderInspector(); });
    });
    $$('[data-k^="t:"]', box).forEach(el => {
      const k = el.dataset.k.slice(2), out = $('output', el.parentElement);
      el.oninput = () => { const v = parseFloat(el.value); out.textContent = v + (k === 'size' ? '' : '%'); set(() => { c.text[k] = v; }, 't' + k); };
    });
    $$('#vseg button', box).forEach(b => b.onclick = () => { set(() => { c.voice = b.dataset.v; if (c.voice !== 'off' && (c.voiceStr == null)) c.voiceStr = 50; }, 'voice'); CB.renderInspector(); });
    $('#iSplit').onclick = () => CB.splitAt(); $('#iDup').onclick = () => CB.duplicateSel(); $('#iDel').onclick = () => CB.deleteSel(false);
    const av = $('#applyVoice'); if (av) av.onclick = () => {
      const ch = CB.chars.find(x => x.id === c.charId), v = cvoice(ch); let n = 0;
      CB.mutate(() => { S.p.clips.forEach(a => { if (a.type === 'audio' && a.start < c.start + c.dur && a.start + a.dur > c.start) { a.voice = v.voice; a.voiceStr = v.strength; n++; } }); });
      CB.toast(n ? 'Voice applied to ' + n + ' audio clip' + (n > 1 ? 's' : '') : 'No audio clips play at the same time as this character');
    };
  };

  // ---------- templates ----------
  CB.TEMPLATES = [
    { id: 'yt', name: 'YouTube Episode', aspect: '16:9', desc: 'Title card, intro space, lower third and an outro.', build() {
      const p = CB.newProject(); p.aspect = '16:9'; p.name = 'My Episode';
      const mk = (o) => Object.assign({ id: CB.uid('c'), in: 0, speed: 1, vol: 1, fadeIn: 0, fadeOut: 0, trans: 'none', transDur: 0.5, bright: 100, contrast: 100, sat: 100, look: 'none', zoom: 1, panX: 0, panY: 0, opacity: 1, fit: 'cover', voice: 'off', voiceStr: 50 }, o);
      p.clips.push(mk({ type: 'color', track: 'V1', start: 0, dur: 4, label: 'Title background', color: '#ff7fb0', color2: '#4d1c3e' }));
      p.clips.push(mk({ type: 'text', track: 'V2', start: 0.4, dur: 3.2, label: 'Episode title', trans: 'dissolve', text: Object.assign({}, TXT, { text: 'Episode 1\nYour title here', size: 110 }) }));
      p.clips.push(mk({ type: 'text', track: 'V2', start: 8, dur: 4, label: 'Lower third', trans: 'dissolve', text: Object.assign({}, TXT, { text: 'Name or topic', size: 44, y: 86, bg: true, shadow: false }) }));
      p.clips.push(mk({ type: 'color', track: 'V1', start: 12, dur: 4, label: 'Outro background', color: '#4d1c3e', color2: '#ff7fb0' }));
      p.clips.push(mk({ type: 'text', track: 'V2', start: 12.4, dur: 3.2, label: 'Outro', trans: 'dissolve', text: Object.assign({}, TXT, { text: 'Thanks for watching\nSee you next time', size: 86 }) }));
      return p; } },
    { id: 'tt', name: 'TikTok Vertical', aspect: '9:16', desc: 'Tall frame with a hook line and a caption area.', build() {
      const p = CB.newProject(); p.aspect = '9:16'; p.name = 'My Short';
      const mk = (o) => Object.assign({ id: CB.uid('c'), in: 0, speed: 1, vol: 1, fadeIn: 0, fadeOut: 0, trans: 'none', transDur: 0.5, bright: 100, contrast: 100, sat: 100, look: 'none', zoom: 1, panX: 0, panY: 0, opacity: 1, fit: 'cover', voice: 'off', voiceStr: 50 }, o);
      p.clips.push(mk({ type: 'color', track: 'V1', start: 0, dur: 10, label: 'Background', color: '#ff7fb0', color2: '#3a1030' }));
      p.clips.push(mk({ type: 'text', track: 'V2', start: 0.2, dur: 3, label: 'Hook', trans: 'dissolve', text: Object.assign({}, TXT, { text: 'Wait for it', size: 120, y: 22 }) }));
      p.clips.push(mk({ type: 'text', track: 'V2', start: 3, dur: 6, label: 'Caption', trans: 'dissolve', text: Object.assign({}, TXT, { text: 'Add your caption here', size: 64, y: 78, bg: true, shadow: false }) }));
      return p; } },
    { id: 'mv', name: 'Music Video Lyrics', aspect: '16:9', desc: 'Pink script lyric lines over a soft background.', build() {
      const p = CB.newProject(); p.aspect = '16:9'; p.name = 'My Music Video';
      const mk = (o) => Object.assign({ id: CB.uid('c'), in: 0, speed: 1, vol: 1, fadeIn: 0, fadeOut: 0, trans: 'none', transDur: 0.5, bright: 100, contrast: 100, sat: 100, look: 'none', zoom: 1, panX: 0, panY: 0, opacity: 1, fit: 'cover', voice: 'off', voiceStr: 50 }, o);
      p.clips.push(mk({ type: 'color', track: 'V1', start: 0, dur: 16, label: 'Background', color: '#2a1523', color2: '#d6336f' }));
      ['First lyric line goes here', 'Second line follows', 'Then the chorus begins', 'Sing it again'].forEach((l, i) => p.clips.push(mk({ type: 'text', track: 'V2', start: i * 4, dur: 3.8, label: 'Lyric ' + (i + 1), trans: 'dissolve', transDur: 0.5, text: Object.assign({}, TXT, { text: l, font: '"Brush Script MT", "Pacifico", cursive', size: 100, color: '#ffd6e6', outline: true, outlineColor: '#d6336f', bold: false, y: 55 }) })));
      return p; } },
    { id: 'cinema', name: 'Cinematic Short', aspect: '2.39:1', desc: 'Widescreen 2.39:1 with a teal and orange grade, grain, a title, credits and an end card.', build() {
      const p = CB.newProject(); p.aspect = '2.39:1'; p.name = 'My Short Film'; p.grade = CB.gradeFromLook('tealorange'); p.grade.mblur = 12;
      const mk = (o) => Object.assign({ id: CB.uid('c'), in: 0, speed: 1, vol: 1, fadeIn: 0, fadeOut: 0, trans: 'none', transDur: 0.5, bright: 100, contrast: 100, sat: 100, look: 'none', zoom: 1, panX: 0, panY: 0, opacity: 1, fit: 'cover', voice: 'off', voiceStr: 50 }, o);
      p.clips.push(mk({ type: 'color', track: 'V1', start: 0, dur: 6, label: 'Title background', color: '#16212a', color2: '#05080b' }));
      p.clips.push(mk({ type: 'text', track: 'V2', start: 0.6, dur: 4.8, label: 'Film title', trans: 'dissolve', transDur: 1, text: Object.assign({}, TXT, { text: 'YOUR FILM TITLE', font: 'Cinzel, Georgia, serif', size: 110, color: '#f4efe6', bold: false, spacing: 22, caps: true, shadow: false }) }));
      p.clips.push(mk({ type: 'color', track: 'V1', start: 20, dur: 14, label: 'Credits background', color: '#05080b', color2: '#05080b' }));
      p.clips.push(mk({ type: 'text', track: 'V2', start: 20, dur: 14, label: 'Credit roll', text: Object.assign({}, TXT, { text: '# Directed by\nYour name\n\n# Starring\nLead role | Actor name\nSupporting role | Actor name\n\n# Music\nSong title | Artist', font: 'Montserrat, Arial, sans-serif', size: 38, bold: false, spacing: 6, roll: true, shadow: false }) }));
      return p; } },
    { id: 'trailer', name: 'Trailer', aspect: '16:9', desc: 'Bold trailer title cards, a bleach bypass grade, heavy grain and vignette.', build() {
      const p = CB.newProject(); p.aspect = '16:9'; p.name = 'My Trailer'; p.grade = CB.gradeFromLook('bleach');
      const mk = (o) => Object.assign({ id: CB.uid('c'), in: 0, speed: 1, vol: 1, fadeIn: 0, fadeOut: 0, trans: 'none', transDur: 0.5, bright: 100, contrast: 100, sat: 100, look: 'none', zoom: 1, panX: 0, panY: 0, opacity: 1, fit: 'cover', voice: 'off', voiceStr: 50 }, o);
      p.clips.push(mk({ type: 'color', track: 'V1', start: 0, dur: 14, label: 'Dark background', color: '#14171a', color2: '#050607' }));
      ['THIS SUMMER', 'ONE STORY', 'NO TURNING BACK'].forEach((l, i) => p.clips.push(mk({ type: 'text', track: 'V2', start: i * 3.2 + 0.3, dur: 2.8, label: 'Card ' + (i + 1), trans: 'dissolve', transDur: 0.6, text: Object.assign({}, TXT, { text: l, font: '"Bebas Neue", Impact, sans-serif', size: 150, bold: false, spacing: 14, color: '#e9edf0', shadow: false }) })));
      p.clips.push(mk({ type: 'text', track: 'V2', start: 10, dur: 4, label: 'Title', trans: 'dissolve', transDur: 0.8, text: Object.assign({}, TXT, { text: 'YOUR TITLE', font: 'Cinzel, Georgia, serif', size: 130, bold: true, spacing: 20, color: '#ffffff', shadow: false }) }));
      return p; } },
    { id: 'blank', name: 'Blank 16:9', aspect: '16:9', desc: 'An empty project with two video and two audio tracks.', build() { return CB.newProject(); } }
  ];
  CB.openTemplates = function () {
    const b = CB.modal('<h3>Templates</h3><p class="small">Pick a starting point. Your current project is kept in the restore points.</p><div class="tgrid">' +
      CB.TEMPLATES.map(t => '<button class="tcard" data-id="' + t.id + '"><div class="tprev ' + t.id + ' a' + t.aspect.replace(/[:.]/g, 'x') + '"></div><b>' + t.name + '</b><small>' + t.aspect + ' &middot; ' + t.desc + '</small></button>').join('') + '</div>', { cls: 'wide' });
    $$('.tcard', b).forEach(el => el.onclick = async () => {
      const t = CB.TEMPLATES.find(x => x.id === el.dataset.id);
      if (S.p.clips.length) { CB.autosave(); }
      CB.closeModal();
      await CB.loadProject(Object.assign(t.build(), { assets: Array.from(S.assets.values()).map(CB.metaOf).filter(a => !a.src) }), { quiet: true });
      CB.fitZoom(); CB.toast(t.name + ' loaded. Double-click the text clips to change them.');
    });
  };

  // ---------- tour ----------
  const STEPS = [
    ['#btnImport', 'Import your media', 'Bring in video, audio and pictures from your device. Nothing is uploaded anywhere.'],
    ['#tlbox', 'Build on the timeline', 'Drag clips to move them, pull the edges to trim, press S to split at the playhead. Use the video and audio tracks to layer.'],
    ['#stageWrap', 'Preview', 'Press Space to play. Drag the playhead or the scrub bar to move around.'],
    ['#right', 'Fine tune', 'Select a clip to change volume, speed, colour, fades, transitions and the voice converter.'],
    ['.tab[data-pane="chars"]', 'Characters', 'Drag Coffeebreak characters and outfit sketches onto the timeline, or upload your own drawings.'],
    ['.tab[data-pane="grade"]', 'Grade like a film', 'Pick a film look, then fine tune with colour wheels, curves, a LUT, grain, glow and light leaks. The picture shape menu has 2.39:1 and 1.85:1 cinema shapes.'],
    ['#btnExport', 'Export', 'One click exports your film. Open the settings cog for 4K, 24 to 60 fps and Master quality. Keep this tab open while it records.']
  ];
  CB.startTour = function (i) {
    i = i || 0; const t = $('#tour');
    if (i >= STEPS.length) { t.hidden = true; t.innerHTML = ''; localStorage.setItem('cbfs_toured', '1'); return; }
    const [sel, title, text] = STEPS[i]; const el = $(sel); if (el && sel.startsWith('.tab')) el.click();
    const r = el ? el.getBoundingClientRect() : { left: 100, top: 100, width: 200, height: 40, bottom: 140 };
    t.hidden = false;
    const bw = 300; let bx = Math.min(window.innerWidth - bw - 12, Math.max(12, r.left)), by = r.bottom + 12;
    if (by + 190 > window.innerHeight) by = Math.max(12, r.top - 200);
    t.innerHTML = '<div class="tback"></div><div class="thole" style="left:' + (r.left - 4) + 'px;top:' + (r.top - 4) + 'px;width:' + (r.width + 8) + 'px;height:' + (r.height + 8) + 'px"></div>' +
      '<div class="tbox" style="left:' + bx + 'px;top:' + by + 'px;width:' + bw + 'px"><small>Step ' + (i + 1) + ' of ' + STEPS.length + '</small><h4>' + title + '</h4><p>' + text + '</p><div class="mrow"><button id="tSkip">Skip</button><button id="tNext" class="primary">' + (i === STEPS.length - 1 ? 'Done' : 'Next') + '</button></div></div>';
    $('#tNext').onclick = () => CB.startTour(i + 1); $('#tSkip').onclick = () => CB.startTour(99);
  };
})(window.CB);
