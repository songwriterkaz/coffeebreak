'use strict';
(function(CB){
  const S = CB.S, $ = CB.$;
  const FLAG = 'cbfs_open';
  window.addEventListener('error', e => { console.error('ERR', e.message); const s = $('#saveState'); try { CB.autosave(); } catch (x) {} });
  window.addEventListener('unhandledrejection', e => console.error('REJ', e.reason));

  function bar() {
    $('#projName').value = S.p.name; $('#selAspect').value = S.p.aspect; $('#chkWm').checked = !!S.p.watermark;
    $('#tlSnap').classList.toggle('on', S.snap);
    $('#btnUndo').disabled = !S.undo.length; $('#btnRedo').disabled = !S.redo.length;
  }
  function transport() { $('#btnPlay').innerHTML = S.playing ? '&#10074;&#10074;' : '&#9654;'; $('#btnPlay').setAttribute('aria-label', S.playing ? 'Pause' : 'Play'); }
  function timeUI() {
    const tot = CB.total();
    $('#timeLabel').textContent = CB.fmt(S.t, 2) + ' / ' + CB.fmt(tot, 2);
    const sc = $('#scrub'); if (document.activeElement !== sc) sc.value = tot ? Math.round(1000 * Math.min(1, S.t / tot)) : 0;
  }

  let rSel = null;
  const insp = () => { rSel = S.sel; CB.renderInspector(); };
  CB.on(w => {
    if (w === 'time' || w === 'seek') timeUI();
    if (w === 'transport') transport();
    if (w === 'full') { CB.sizePreview(); bar(); insp(); CB.renderMedia(); timeUI(); CB.tlLayout(); }
    if (w === 'change') { CB.sizePreview(); bar(); if (S.sel !== rSel) insp(); timeUI(); CB.renderMedia(); CB.releaseVideos(); }
    if (w === 'select') insp();
    if (w === 'media') CB.renderMedia();
  });

  async function init() {
    CB.initTabs(); CB.initTimeline(); CB.sizePreview(); CB.loop();
    CB.renderInspector(); CB.renderMedia(); CB.tlLayout();
    CB.setZoom(80);
    // buttons
    $('#btnImport').onclick = () => $('#fileMedia').click();
    $('#fileMedia').onchange = async (e) => { const as = await CB.importFiles(e.target.files); e.target.value = ''; if (as.length && S.p.clips.length === 0) as.forEach(a => { if (!a.bad) CB.addAssetClip(a, S.t); }); };
    $('#btnCharUpload').onclick = () => $('#fileChar').click();
    $('#fileChar').onchange = (e) => { CB.uploadCharacters(e.target.files); e.target.value = ''; };
    $('#addTitle').onclick = () => CB.addText('title'); $('#addLower').onclick = () => CB.addText('lower');
    $('#addLyric').onclick = () => CB.addText('lyric');
    $('#addCine').onclick = () => CB.addText('cine'); $('#addRoll').onclick = () => CB.addText('roll'); $('#addEnd').onclick = () => CB.addText('end'); $('#addSub').onclick = () => CB.addText('sub'); $('#addBg').onclick = () => CB.addBackground();
    $('#btnPlay').onclick = () => CB.togglePlay();
    $('#btnPrev').onclick = () => { CB.pause(); CB.seek(S.t - 1 / S.p.fps); }; $('#btnNext').onclick = () => { CB.pause(); CB.seek(S.t + 1 / S.p.fps); };
    $('#scrub').oninput = (e) => CB.seek(CB.total() * e.target.value / 1000);
    $('#vol').oninput = (e) => CB.audio.setVolume(e.target.value / 100);
    $('#tlSplit').onclick = () => CB.splitAt(); $('#tlDel').onclick = () => CB.deleteSel(false); $('#tlRipple').onclick = () => CB.deleteSel(true);
    $('#tlDup').onclick = () => CB.duplicateSel();
    $('#tlSnap').onclick = () => { S.snap = !S.snap; bar(); };
    $('#tlAddV').onclick = () => CB.addTrack('v'); $('#tlAddA').onclick = () => CB.addTrack('a');
    $('#tlZoomIn').onclick = () => CB.setZoom(S.pps * 1.3); $('#tlZoomOut').onclick = () => CB.setZoom(S.pps / 1.3); $('#tlFit').onclick = () => CB.fitZoom();
    $('#tlZoom').oninput = (e) => CB.setZoom(4 * Math.pow(600 / 4, e.target.value / 100));
    $('#btnUndo').onclick = () => CB.undo(); $('#btnRedo').onclick = () => CB.redo();
    $('#btnTour').onclick = () => CB.startTour(0);
    $('#btnTemplates').onclick = () => CB.openTemplates();
    $('#aboutLink').onclick = (e) => { e.preventDefault(); CB.modal('<h3>About and honest limits</h3><ul class="small lim"><li>Everything runs in your browser. Your media is never uploaded.</li><li>Export records your film in real time, so keep the tab open. A 2 minute film takes about 2 minutes.</li><li>Quality depends on your computer. 4K and 60 fps need a fast machine, and the export tells you if frames were missed.</li><li>Chrome and Edge make MP4 or WebM. Where H.264 is not offered you get VP9 or AV1 instead. WebM files carry no duration, which most players handle but some editors do not.</li><li>ProRes cannot be made in a browser. Master quality uses the highest bitrate the browser allows, which suits editing and archiving.</li><li>Colour grading needs WebGL2. It applies to the whole film, not one clip. Looks are original styles, not copies of any brand.</li><li>Motion blur blends neighbouring frames, so it is an approximation of a real shutter.</li><li>LUTs must be 3D .cube files.</li><li>The voice converter shifts pitch and tone and can sound rough beyond about six semitones.</li><li>Safari on iPhone and iPad has limited export support. Use Chrome, Edge or Firefox on a laptop.</li></ul><div class="mrow"><button id="abOk" class="primary">Close</button></div>', { cls: 'small' }); $('#abOk').onclick = () => CB.closeModal(); };
    $('#btnExport').onclick = () => CB.exportFilm(); $('#btnExportOpts').onclick = () => CB.exportOptions();
    $('#btnSave').onclick = () => { CB.downloadProject(); CB.toast('Saved and downloaded a project file'); };
    $('#btnOpen').onclick = openMenu;
    $('#fileProj').onchange = async (e) => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { await CB.loadProject(await f.text()); CB.fitZoom(); CB.toast('Project opened'); } catch (err) { CB.toast('That file is not a Coffeebreak project'); } };
    $('#btnNew').onclick = async () => { if (S.p.clips.length && !(await CB.confirm('Start a new project', 'Your current project is saved in the restore points. Start a new one?', 'New project'))) return; CB.autosave(); S.assets.clear(); await CB.loadProject(CB.newProject(), { quiet: true }); };
    $('#projName').oninput = (e) => CB.mutate(() => { S.p.name = e.target.value || 'My Film'; }, 'name');
    $('#selAspect').onchange = (e) => CB.mutate(() => { S.p.aspect = e.target.value; });
    $('#chkWm').onchange = (e) => CB.mutate(() => { S.p.watermark = e.target.checked; });
    // drag files in
    const main = document.body;
    ['dragover', 'drop'].forEach(n => document.addEventListener(n, e => { if (e.target.id === 'tl') return; e.preventDefault(); if (n === 'drop' && e.dataTransfer.files.length) CB.importFiles(e.dataTransfer.files); }));
    document.addEventListener('keydown', keys);
    $('#tlScroll').addEventListener('dblclick', () => { const c = CB.selClip(); if (c && c.type === 'text') { const t = $('#inspector textarea'); if (t) t.focus(); } });
    // tooltips: touch-friendly via title fallback
    initTips();
    await CB.loadChars();
    try { await CB.loadLuts(); } catch (e) {}
    CB.preloadFonts(); CB.renderGrade();
    // restore
    const prev = +localStorage.getItem(FLAG) || 0;
    const crashed = prev > 0 && (Date.now() - prev > 90000 || prev === 1);
    const beat = () => { try { localStorage.setItem(FLAG, String(Date.now())); } catch (e) {} };
    beat(); setInterval(beat, 5000);
    const had = await CB.restoreLast();
    if (had) { CB.fitZoom(); if (crashed) CB.modal('<h3>Welcome back</h3><p>Coffeebreak Film Studio closed unexpectedly last time. Your project was restored from the last auto-save. Older restore points are under Open.</p><div class="mrow"><button class="primary" id="wOk">Continue</button></div>', { cls: 'small' }), $('#wOk').onclick = () => CB.closeModal(); }
    else if (!localStorage.getItem('cbfs_toured')) setTimeout(() => CB.startTour(0), 600);
    window.addEventListener('pagehide', () => { try { CB.autosave(); } catch (e) {} localStorage.removeItem(FLAG); });
    window.addEventListener('beforeunload', () => { try { CB.autosave(); } catch (e) {} localStorage.removeItem(FLAG); });
    window.addEventListener('resize', () => CB.tlLayout());
    bar(); transport(); timeUI(); CB.ready = true;
    window.addEventListener('resize', () => CB.sizePreview());
  }

  function openMenu() {
    const bs = CB.backups().slice().reverse();
    const b = CB.modal('<h3>Open</h3><div class="mrow l"><button id="oFile" class="primary">Open a project file</button></div><h4>Restore points</h4><div class="small">The last few auto-saves of your work in this browser.</div><div id="oList"></div>', { cls: 'small' });
    $('#oFile', b).onclick = () => { CB.closeModal(); $('#fileProj').click(); };
    const l = $('#oList', b);
    if (!bs.length) l.innerHTML = '<div class="empty">No restore points yet.</div>';
    bs.forEach(x => { const d = document.createElement('div'); d.className = 'rp'; d.innerHTML = '<span>' + CB.esc(x.name) + ' &middot; ' + new Date(x.t).toLocaleString() + '</span><button class="mini">Restore</button>'; d.querySelector('button').onclick = async () => { CB.closeModal(); await CB.loadProject(x.js); CB.fitZoom(); CB.toast('Restored'); }; l.appendChild(d); });
  }

  function keys(e) {
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' && !['range', 'checkbox', 'button', 'color'].includes(e.target.type) || tag === 'textarea' || tag === 'select';
    const mod = e.ctrlKey || e.metaKey;
    if (!$('#modal').hidden && e.key === 'Escape') { CB.closeModal(); return; }
    if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); CB.downloadProject(); CB.toast('Saved and downloaded a project file'); return; }
    if (typing) return;
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? CB.redo() : CB.undo(); return; }
    if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); CB.redo(); return; }
    if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); CB.duplicateSel(); return; }
    if (mod) return;
    if (e.key === ' ') { e.preventDefault(); if (tag === 'button') e.target.blur(); CB.togglePlay(); }
    else if (e.key === 's' || e.key === 'S') { CB.splitAt(); }
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); CB.deleteSel(e.shiftKey); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); CB.pause(); CB.seek(S.t - (e.shiftKey ? 1 : 1 / S.p.fps)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); CB.pause(); CB.seek(S.t + (e.shiftKey ? 1 : 1 / S.p.fps)); }
    else if (e.key === 'Home') { CB.seek(0); $('#tlScroll').scrollLeft = 0; }
    else if (e.key === 'End') { CB.seek(CB.total()); }
    else if (e.key === '+' || e.key === '=') CB.setZoom(S.pps * 1.3);
    else if (e.key === '-') CB.setZoom(S.pps / 1.3);
  }

  function initTips() {
    const tip = document.createElement('div'); tip.id = 'tip'; document.body.appendChild(tip);
    let to;
    document.addEventListener('pointerover', e => {
      if (e.pointerType === 'touch') return;
      const el = e.target.closest && e.target.closest('[data-tip]'); clearTimeout(to);
      if (!el) { tip.classList.remove('show'); return; }
      to = setTimeout(() => {
        tip.textContent = el.getAttribute('data-tip'); tip.classList.add('show');
        const r = el.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
        let x = Math.min(window.innerWidth - tw - 8, Math.max(8, r.left + r.width / 2 - tw / 2)), y = r.bottom + 8;
        if (y + th > window.innerHeight - 4) y = r.top - th - 8;
        if (el.dataset.tipPos === 'right') { x = r.right + 8; y = r.top; }
        tip.style.left = x + 'px'; tip.style.top = y + 'px';
      }, 450);
    });
    document.addEventListener('pointerdown', () => { clearTimeout(to); tip.classList.remove('show'); });
  }
  window.addEventListener('DOMContentLoaded', init);
})(window.CB);
