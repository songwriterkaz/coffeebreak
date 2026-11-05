'use strict';
(function(CB){
  const S = CB.S, $ = CB.$;
  const H264 = ['video/mp4;codecs=avc1.640034,mp4a.40.2', 'video/mp4;codecs=avc1.640033,mp4a.40.2', 'video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4;codecs=h264,aac'];
  const VP9W = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp9'];
  const AV1W = ['video/webm;codecs=av01.0.12M.08,opus', 'video/webm;codecs=av01,opus', 'video/webm;codecs=av1,opus'];
  const WEBM = VP9W.concat(['video/webm;codecs=vp8,opus', 'video/webm']);
  const ok = (m) => { try { return window.MediaRecorder && MediaRecorder.isTypeSupported(m); } catch (e) { return false; } };
  CB.exportSupport = () => { const h = H264.find(ok) || null; return { mp4h264: h, mp4: h || (ok('video/mp4') ? 'video/mp4' : null), webm: WEBM.find(ok) || null, vp9: VP9W.find(ok) || null, av1: AV1W.find(ok) || null }; };
  CB.EXP_QUALITY = { draft: { name: 'Draft', bpp: 0.07, min: 3e6, audio: 128000 }, standard: { name: 'Standard', bpp: 0.14, min: 5e6, audio: 192000 }, high: { name: 'High', bpp: 0.25, min: 8e6, audio: 256000 }, master: { name: 'Master', bpp: 0.45, min: 16e6, audio: 320000 } };
  CB.expOpts = Object.assign({ fmt: 'auto', res: 1080, fps: 30, q: 'high' }, JSON.parse(localStorage.getItem('cbfs_exp2') || '{}'));
  CB.exportBitrate = (W, H, fps, q) => { const Q = CB.EXP_QUALITY[q] || CB.EXP_QUALITY.high; return Math.round(Math.max(Q.min, Math.min(120e6, W * H * fps * Q.bpp))); };
  const mimeFor = (fmt, sup) => fmt === 'h264' ? sup.mp4h264 : fmt === 'mp4' ? (sup.mp4 || sup.webm) : fmt === 'webm' ? sup.webm : fmt === 'vp9' ? sup.vp9 : fmt === 'av1' ? sup.av1 : (sup.mp4h264 || sup.vp9 || sup.webm || sup.mp4);
  let job = null;

  CB.exportOptions = function () {
    const sup = CB.exportSupport(), o = CB.expOpts;
    const opt = (v, l, on) => '<option value="' + v + '"' + (on ? '' : ' disabled') + '>' + l + (on ? '' : ' (not in this browser)') + '</option>';
    const b = CB.modal('<h3>Export settings</h3>' +
      '<div class="irow"><label>Format</label><select id="xFmt"><option value="auto">Best available (recommended)</option>' + opt('h264', 'MP4 H.264 (plays everywhere)', !!sup.mp4h264) + opt('mp4', 'MP4', !!sup.mp4) + opt('vp9', 'WebM VP9 (high quality)', !!sup.vp9) + opt('av1', 'WebM AV1 (smallest files)', !!sup.av1) + opt('webm', 'WebM', !!sup.webm) + '</select></div>' +
      '<div class="irow"><label>Size</label><select id="xRes"><option value="480">480p</option><option value="720">720p HD</option><option value="1080">1080p Full HD</option><option value="1440">1440p QHD</option><option value="2160">2160p 4K UHD</option></select></div>' +
      '<div class="irow"><label>Frame rate</label><select id="xFps"><option value="24">24 fps cinema</option><option value="25">25 fps</option><option value="30">30 fps</option><option value="60">60 fps smooth</option></select></div>' +
      '<div class="irow"><label>Quality</label><select id="xQ"><option value="draft">Draft (small)</option><option value="standard">Standard</option><option value="high">High</option><option value="master">Master (highest bitrate)</option></select></div>' +
      '<p class="small" id="xInfo"></p><p class="small" id="xWarn"></p>' +
      '<p class="small">' + (sup.mp4h264 ? '' : 'This browser cannot make H.264 MP4, so Best available gives you WebM VP9. Choosing MP4 gives an MP4 file with VP9 video, which plays in Chrome, Edge and Firefox but not in every app. ') + 'Export records your film in real time, so a 2 minute film takes about 2 minutes. Keep this tab open and focused on a fast computer for 4K or 60 fps. ProRes cannot be made inside a browser. Master uses the highest bitrate this browser allows for H.264 or VP9, which suits editing and archiving.</p>' +
      '<div class="mrow"><button id="xCancel">Close</button><button id="xGo" class="primary">Export now</button></div>', { cls: 'small' });
    $('#xFmt', b).value = o.fmt; $('#xRes', b).value = o.res; $('#xFps', b).value = o.fps; $('#xQ', b).value = o.q;
    const read = () => ({ fmt: $('#xFmt', b).value, res: +$('#xRes', b).value, fps: +$('#xFps', b).value, q: $('#xQ', b).value });
    const info = () => {
      const x = read(), d = CB.dims(x.res), br = CB.exportBitrate(d.W, d.H, x.fps, x.q), tot = CB.total();
      $('#xInfo', b).innerHTML = '<b>' + d.W + ' x ' + d.H + '</b> at ' + x.fps + ' fps, about <b>' + (br / 1e6).toFixed(0) + ' Mbps</b> video' + (tot ? ', roughly ' + ((br + CB.EXP_QUALITY[x.q].audio) * tot / 8 / 1048576).toFixed(0) + ' MB for this film' : '');
      const heavy = d.W * d.H * x.fps; let w = '';
      if (heavy > 3840 * 2160 * 30) w = '4K at 60 fps is very demanding. Only a fast computer will keep up in real time, and the export will tell you if frames were missed.';
      else if (d.W * d.H >= 2560 * 1440) w = 'Large sizes need a fast computer. Because export runs in real time, the export will tell you if any frames were missed.';
      if (CB.gradeActive(S.p.grade) && !CB.makeGrader().ok()) w += ' Colour grading is not available in this browser and will be skipped.';
      $('#xWarn', b).textContent = w;
    };
    ['xFmt', 'xRes', 'xFps', 'xQ'].forEach(id => $('#' + id, b).onchange = info); info();
    const save = () => { CB.expOpts = read(); localStorage.setItem('cbfs_exp2', JSON.stringify(CB.expOpts)); };
    $('#xCancel', b).onclick = () => { save(); CB.closeModal(); };
    $('#xGo', b).onclick = () => { save(); CB.closeModal(); CB.exportFilm(); };
  };

  CB.exportFilm = async function () {
    if (S.exporting) return;
    const total = CB.total();
    if (total <= 0) { CB.toast('Add something to the timeline before exporting'); return; }
    if (!window.MediaRecorder) { CB.modal('<h3>Export not available</h3><p>This browser cannot record video. Please use the latest Chrome, Edge or Firefox on a laptop.</p>', { cls: 'small' }); return; }
    const sup = CB.exportSupport(), o = CB.expOpts;
    let mime = mimeFor(o.fmt, sup) || mimeFor('auto', sup);
    if (!mime) { CB.modal('<h3>Export not available</h3><p>No supported video format was found in this browser.</p>', { cls: 'small' }); return; }
    const isMp4 = mime.startsWith('video/mp4');
    CB.pause(); await CB.audio.resume();
    S.exporting = true; const saveT = S.t; CB.emit('transport');
    const { W, H } = CB.dims(o.res), fps = o.fps;
    const cvs = document.createElement('canvas'); cvs.width = W; cvs.height = H; const g = cvs.getContext('2d');
    const gr = CB.gradeActive(S.p.grade) ? CB.makeGrader() : null; let gradeUsed = !!(gr && gr.ok()), drawn = 0;
    const prev = $('#preview'), pg = prev.getContext('2d');
    const box = CB.modal('<h3>Exporting your film</h3><p class="small" id="xMsg">Getting ready...</p><div class="bar"><i id="xBar"></i></div><div class="mrow"><button id="xStop">Cancel</button></div>', { cls: 'small', onclose: () => { if (job) job.cancel = true; } });
    const msg = $('#xMsg', box), bar = $('#xBar', box);
    let recorder = null, worker = null, wurl = null, nodes = [];
    job = { cancel: false };
    $('#xStop', box).onclick = () => { job.cancel = true; };
    const cleanup = () => {
      try { if (recorder && recorder.state !== 'inactive') recorder.stop(); } catch (e) {}
      if (worker) { worker.terminate(); URL.revokeObjectURL(wurl); }
      CB.audio.stopNodes(nodes); CB.syncVideos(0, false);
      S.exporting = false; S.t = saveT; job = null; CB.emit('transport'); CB.emit('seek');
    };
    try {
      msg.textContent = 'Preparing media...';
      if (document.fonts && document.fonts.ready) { await CB.preloadFonts(); await document.fonts.ready; }
      await CB.prepareVideos();
      S.p.clips.forEach(c => { if (c.type === 'video' || c.type === 'audio') CB.audio.bufferFor(c); });
      CB.syncVideos(0, false); await new Promise(r => setTimeout(r, 400));
      const actx = CB.audio.ctx();
      const dest = actx.createMediaStreamDestination();
      const stream = cvs.captureStream(fps);
      dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
      const chunks = [];
      recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: CB.exportBitrate(W, H, fps, o.q), audioBitsPerSecond: (CB.EXP_QUALITY[o.q] || CB.EXP_QUALITY.high).audio });
      recorder.onerror = (e) => console.error('rec error', e.error && e.error.message); recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      const stopped = new Promise(res => { recorder.onstop = res; });
      const keep = actx.createConstantSource(); keep.offset.value = 0; keep.connect(dest); keep.start(); nodes.push(keep);
      recorder.start(1000);
      const start = actx.currentTime + 0.1;
      nodes = nodes.concat(CB.audio.schedule(S.p.clips, S.p.tracks, 0, start, [dest]));
      msg.textContent = 'Recording ' + CB.fmt(total, 0) + ' of film. Keep this tab open.';
      const tail = 0.4;
      await new Promise((resolve) => {
        const src = 'let id;onmessage=e=>{clearInterval(id);if(e.data>0)id=setInterval(()=>postMessage(1),e.data);}';
        wurl = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        worker = new Worker(wurl); worker.postMessage(1000 / fps);
        let busy = false;
        worker.onmessage = () => {
          if (busy) return; busy = true;
          try {
            const t = Math.max(0, actx.currentTime - start);
            S.t = Math.min(t, total);
            if (t < total - 0.05) CB.syncVideos(t, t > 0);
            CB.renderFrame(g, W, H, Math.min(t, total - 0.001), gr); drawn++;
            pg.drawImage(cvs, 0, 0, prev.width, prev.height);
            const pc = Math.min(100, Math.round(100 * t / total)); bar.style.width = pc + '%'; msg.textContent = 'Recording ' + pc + ' percent. Keep this tab open.';
            if (job.cancel || t >= total + tail) resolve();
          } catch (e) { console.error(e); } finally { busy = false; }
        };
      });
      const cancelled = job.cancel;
      worker.terminate(); worker = null;
      msg.textContent = 'Finishing the file...'; await new Promise(r => setTimeout(r, 900));
      recorder.stop(); await stopped;
      if (gr) gr.dispose();
      cleanup();
      if (cancelled) { CB.closeModal && CB.closeModal(); CB.toast('Export cancelled'); return; }
      const blob = new Blob(chunks, { type: mime.split(';')[0] });
      if (!blob.size) throw new Error('No video was recorded. This computer could not keep up at this size. Try 720p or 1080p, a lower frame rate, or turn off grain and glow');
      const eff = drawn / (total + tail), codec = (mime.match(/codecs=([^,;]+)/) || [0, 'default'])[1];
      const note = eff < fps * 0.9 ? '<p class="small warn">This computer averaged ' + eff.toFixed(1) + ' frames per second while recording, below the ' + fps + ' you chose, so motion may look choppy. Try 1080p, a lower frame rate or the Standard quality.</p>' : '<p class="small">Recorded ' + W + ' x ' + H + ' at ' + fps + ' fps, ' + codec + ', about ' + (CB.exportBitrate(W, H, fps, o.q) / 1e6).toFixed(0) + ' Mbps.</p>';
      const name = CB.safeName(S.p.name) + (isMp4 ? '.mp4' : '.webm');
      CB.download(blob, name);
      CB.lastExport = { blob, name, mime, size: blob.size, W, H, fps, drawn, eff, grade: gradeUsed };
      const url = URL.createObjectURL(blob);
      CB.modal('<h3>Your film is ready</h3><p>' + CB.esc(name) + ' (' + (blob.size / 1048576).toFixed(1) + ' MB) has been downloaded. If nothing appeared, use the button below.</p>' + note + '<div class="mrow"><a class="btn primary" id="xAgain" href="' + url + '" download="' + CB.esc(name) + '">Download again</a><button id="xDone">Close</button></div>', { cls: 'small' });
      $('#xDone').onclick = () => CB.closeModal();
    } catch (e) {
      console.error(e); try { cleanup(); } catch (e2) {}
      CB.modal('<h3>Export stopped</h3><p>Something went wrong while exporting: ' + CB.esc(e.message || e) + '. Your project is safe. Try a smaller size or the other format.</p><div class="mrow"><button id="xOk" class="primary">OK</button></div>', { cls: 'small' });
      $('#xOk').onclick = () => CB.closeModal();
    }
  };
})(window.CB);
