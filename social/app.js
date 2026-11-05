/* Coffeebreak Social Live. (c) Karen Elizabeth O'Brien (Coffeebreak). All rights reserved. */
(function () {
  "use strict";
  var LIVE = "https://cb-social-live.coffeebreaks.workers.dev";
  var API = (/(netlify\.app|coffeebreaks\.workers\.dev)$/.test(location.hostname) || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) ? "" : LIVE;
  var main = document.getElementById("main");
  var S = { token: localStorage.getItem("cbsl_token") || "", me: null, follows: [], blocked: [] };
  var pollT = null;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function toast(m) { var t = document.getElementById("toast"); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 2600); }
  function ago(t) { var s = (Date.now() - t) / 1000; if (s < 60) return "just now"; if (s < 3600) return Math.floor(s / 60) + "m"; if (s < 86400) return Math.floor(s / 3600) + "h"; if (s < 604800) return Math.floor(s / 86400) + "d"; return new Date(t).toLocaleDateString(); }
  function mediaUrl(id) { return API + "/api/media/" + encodeURIComponent(id); }
  function av(name, avatar, big) { return '<span class="av' + (big ? " big" : "") + '">' + (avatar ? '<img src="' + mediaUrl(avatar) + '" alt="">' : esc((name || "?").charAt(0))) + "</span>"; }

  function api(path, opt) {
    opt = opt || {};
    var h = {}; if (S.token) h.authorization = "Bearer " + S.token;
    var body = opt.body;
    if (body && !(body instanceof ArrayBuffer) && !(body instanceof Blob)) { h["content-type"] = "application/json"; body = JSON.stringify(body); }
    else if (body) h["content-type"] = "application/octet-stream";
    return fetch(API + "/api/" + path, { method: opt.method || (body ? "POST" : "GET"), headers: h, body: body }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.status === 401 && S.token && path !== "login") { signOut(true); }
        if (!r.ok) throw new Error(d.error || "Something went wrong, please try again");
        return d;
      });
    });
  }
  function setToken(d) { S.token = d.token; localStorage.setItem("cbsl_token", d.token); S.me = d.me; }
  function signOut(quiet) { S.token = ""; S.me = null; localStorage.removeItem("cbsl_token"); drawWho(); if (!quiet) toast("Signed out"); }
  function loadMe() {
    if (!S.token) return Promise.resolve();
    return api("me").then(function (d) { S.me = d.me; S.follows = d.follows; S.blocked = d.blocked; }).catch(function () {});
  }
  function drawWho() {
    var w = document.getElementById("who");
    w.innerHTML = S.me ? '<a href="#me">@' + esc(S.me.handle) + "</a>" : '<a href="#join">Sign up or sign in</a>';
  }
  function needSignIn(msg) {
    return '<div class="card center"><p>' + esc(msg || "Sign up or sign in to join in.") + '</p><a class="btn" href="#join">Sign up or sign in</a></div>';
  }

  /* ---------- uploads ---------- */
  function kindOf(f) { var t = (f.type || "").toLowerCase(); if (/^image\//.test(t)) return "image"; if (/^video\//.test(t)) return "video"; if (/^audio\//.test(t)) return "audio"; return ""; }
  function shrinkImage(file) {
    if (file.type === "image/gif" && file.size <= 3 * 1024 * 1024) return Promise.resolve(file);
    return new Promise(function (ok, bad) {
      var img = new Image(); var u = URL.createObjectURL(file);
      img.onload = function () {
        var max = 1600, w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h));
        var c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        c.toBlob(function (b) { b ? ok(b) : bad(new Error("Could not read that picture")); }, "image/jpeg", 0.85);
      };
      img.onerror = function () { bad(new Error("Could not read that picture")); };
      img.src = u;
    });
  }
  function upload(file, onProg) {
    var kind = kindOf(file);
    if (!kind) return Promise.reject(new Error("Please choose a picture, video or music file"));
    var prep = kind === "image" ? shrinkImage(file) : Promise.resolve(file);
    return prep.then(function (blob) {
      var type = (blob.type || file.type).toLowerCase();
      return api("media", { body: { kind: kind, type: type, size: blob.size, name: file.name } }).then(function (st) {
        var n = 0;
        function next() {
          if (n >= st.chunks) return api("media/" + st.id + "/done", { body: {} });
          var part = blob.slice(n * st.chunk, Math.min(blob.size, (n + 1) * st.chunk));
          return api("media/" + st.id + "/" + n, { method: "PUT", body: part }).then(function () { n++; onProg && onProg(n / st.chunks); return next(); });
        }
        return next();
      });
    });
  }

  /* ---------- posts ---------- */
  function linkify(t) { return esc(t).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener nofollow ugc">$1</a>'); }
  function postHtml(p) {
    var mine = S.me && p.by === S.me.handle, liked = S.me && (p.likes || []).indexOf(S.me.handle) >= 0;
    var m = (p.media || []).map(function (x) {
      if (x.kind === "image") return '<img loading="lazy" src="' + mediaUrl(x.id) + '" alt="Picture posted by @' + esc(p.by) + '">';
      if (x.kind === "video") return '<video controls playsinline preload="metadata" src="' + mediaUrl(x.id) + '"></video>';
      return '<div class="song">&#127925; ' + esc(x.name || "Music") + '<audio controls preload="none" src="' + mediaUrl(x.id) + '"></audio></div>';
    }).join("");
    var reps = (p.replies || []).map(function (r) {
      var del = S.me && (r.by === S.me.handle || mine || S.me.admin) ? ' <button class="btn small ghost" data-unreply="' + esc(r.id) + '" data-post="' + esc(p.id) + '">Delete</button>' : "";
      return '<div class="r"><a href="#u/' + esc(r.by) + '">' + esc(r.name) + "</a> " + linkify(r.text) + ' <span class="meta">' + ago(r.t) + "</span>" + del + "</div>";
    }).join("");
    return '<article class="card post" id="p-' + esc(p.id) + '"><div class="who"><a href="#u/' + esc(p.by) + '">' + av(p.name, p.avatar) + '</a><div class="grow"><a href="#u/' + esc(p.by) + '"><b>' + esc(p.name) + '</b><small>@' + esc(p.by) + " &middot; " + ago(p.t) + "</small></a></div></div>" +
      (p.text ? '<div class="text">' + linkify(p.text) + "</div>" : "") + (m ? '<div class="media">' + m + "</div>" : "") +
      '<div class="acts"><button data-like="' + esc(p.id) + '" class="' + (liked ? "on" : "") + '">&#9829; ' + (p.likes || []).length + '</button><button data-reply="' + esc(p.id) + '">Reply ' + (p.replies || []).length + "</button>" +
      (mine || (S.me && S.me.admin) ? '<button data-del="' + esc(p.id) + '">Delete</button>' : '<button data-report="' + esc(p.id) + '" data-by="' + esc(p.by) + '">Report</button>') + "</div>" +
      (reps ? '<div class="replies">' + reps + "</div>" : "") + '<form class="replyf" data-post="' + esc(p.id) + '" hidden><div class="row"><input type="text" class="grow" maxlength="300" placeholder="Write a reply" aria-label="Reply"><button class="btn small">Send</button></div></form></article>';
  }
  function bindPosts(root, reload) {
    root.onclick = function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.like) { if (!S.me) return (location.hash = "#join"); api("posts/" + b.dataset.like + "/like", { body: {} }).then(function (d) { replacePost(d.post); }).catch(function (er) { toast(er.message); }); }
      else if (b.dataset.reply) { if (!S.me) return (location.hash = "#join"); var f = root.querySelector('.replyf[data-post="' + b.dataset.reply + '"]'); f.hidden = !f.hidden; if (!f.hidden) f.querySelector("input").focus(); }
      else if (b.dataset.del) { if (confirm("Delete this post?")) api("posts/" + b.dataset.del, { method: "DELETE" }).then(function () { var el = document.getElementById("p-" + b.dataset.del); el && el.remove(); toast("Post deleted"); }).catch(function (er) { toast(er.message); }); }
      else if (b.dataset.unreply) { api("posts/" + b.dataset.post + "/unreply", { body: { id: b.dataset.unreply } }).then(function (d) { replacePost(d.post); }).catch(function (er) { toast(er.message); }); }
      else if (b.dataset.report) { if (!S.me) return (location.hash = "#join"); var why = prompt("Why are you reporting this post?"); if (why) api("report", { body: { post: b.dataset.report, user: b.dataset.by, reason: why } }).then(function () { toast("Thanks, Coffeebreak will review it"); }).catch(function (er) { toast(er.message); }); }
    };
    root.onsubmit = function (e) {
      var f = e.target.closest(".replyf"); if (!f) return; e.preventDefault();
      var i = f.querySelector("input"); if (!i.value.trim()) return;
      api("posts/" + f.dataset.post + "/reply", { body: { text: i.value } }).then(function (d) { replacePost(d.post); }).catch(function (er) { toast(er.message); });
    };
  }
  function replacePost(p) { var el = document.getElementById("p-" + p.id); if (!el) return; var tmp = document.createElement("div"); tmp.innerHTML = postHtml(p); el.replaceWith(tmp.firstChild); }
  function loadPosts(box, by) {
    var next = null;
    function more() {
      var q = "posts?" + (by ? "by=" + encodeURIComponent(by) + "&" : "") + (next ? "before=" + encodeURIComponent(next) : "");
      var btn = box.querySelector(".more"); if (btn) btn.remove();
      return api(q).then(function (d) {
        var list = box.querySelector(".list");
        if (!d.posts.length && !list.children.length) { list.innerHTML = '<div class="empty">' + (by ? "No posts yet." : "No posts yet. Be the first to post.") + "</div>"; return; }
        list.insertAdjacentHTML("beforeend", d.posts.map(postHtml).join(""));
        next = d.next;
        if (next) { var m = document.createElement("button"); m.className = "btn ghost more"; m.textContent = "Load more"; m.onclick = more; box.appendChild(m); }
      }).catch(function (er) { box.querySelector(".list").innerHTML = '<div class="empty">' + esc(er.message) + "</div>"; });
    }
    box.innerHTML = '<div class="list"></div>'; bindPosts(box); return more();
  }

  /* ---------- views ---------- */
  function vFeed() {
    var comp = S.me ? '<form class="card" id="comp"><label class="f" for="ptext">Share something</label><textarea id="ptext" rows="3" maxlength="500" placeholder="What is on your mind, ' + esc(S.me.name) + '?"></textarea>' +
      '<div class="chips" id="files"></div><div class="prog" id="prog" hidden><i></i></div>' +
      '<div class="row"><label class="attach">&#128247; Picture<input type="file" accept="image/jpeg,image/png,image/gif,image/webp" data-k="image"></label><label class="attach">&#127916; Video<input type="file" accept="video/mp4,video/webm,video/quicktime" data-k="video"></label><label class="attach">&#127925; Music<input type="file" accept="audio/*" data-k="audio"></label><span class="grow"></span><button class="btn" id="pbtn">Post</button></div>' +
      '<p class="meta">Pictures, videos up to 60 MB and music up to 30 MB. Only post things you made or have the right to share.</p><p class="err" id="perr"></p></form>'
      : '<div class="card center"><h1>Welcome to Coffeebreak Social</h1><p>A real social space by Coffeebreak. Sign up free to post words, pictures, videos and music, follow people and send private messages.</p><a class="btn" href="#join">Sign up or sign in</a></div>';
    main.innerHTML = comp + '<h2>Latest posts</h2><div id="feedbox"></div>';
    loadPosts(document.getElementById("feedbox"));
    if (!S.me) return;
    var files = [], f = document.getElementById("comp");
    function drawFiles() { document.getElementById("files").innerHTML = files.map(function (x, i) { return '<span class="chip">' + esc(x.name) + ' <button type="button" data-rm="' + i + '" aria-label="Remove">&#10005;</button></span>'; }).join(""); }
    f.addEventListener("change", function (e) { var i = e.target; if (!i.files || !i.files[0]) return; if (files.length >= 4) { toast("Up to 4 files per post"); } else files.push(i.files[0]); i.value = ""; drawFiles(); });
    f.addEventListener("click", function (e) { var b = e.target.closest("[data-rm]"); if (b) { files.splice(+b.dataset.rm, 1); drawFiles(); } });
    f.onsubmit = function (e) {
      e.preventDefault(); var text = document.getElementById("ptext").value, btn = document.getElementById("pbtn"), err = document.getElementById("perr"), pg = document.getElementById("prog");
      if (!text.trim() && !files.length) { err.textContent = "Write something or add a file first"; return; }
      btn.disabled = true; err.textContent = ""; var ids = [], k = 0;
      pg.hidden = !files.length;
      function step() {
        if (k >= files.length) return Promise.resolve();
        return upload(files[k], function (fr) { pg.firstChild.style.width = Math.round(((k + fr) / files.length) * 100) + "%"; }).then(function (d) { ids.push(d.id); k++; return step(); });
      }
      step().then(function () { return api("posts", { body: { text: text, media: ids } }); }).then(function () { toast("Posted"); vFeed(); })
        .catch(function (er) { err.textContent = er.message; btn.disabled = false; pg.hidden = true; });
    };
  }
  function vJoin() {
    if (S.me) { location.hash = "#feed"; return; }
    main.innerHTML = '<div class="card"><div class="tabs"><button class="on" data-t="up">Sign up</button><button data-t="in">Sign in</button></div>' +
      '<form id="fup"><h1>Join Coffeebreak Social</h1><label class="f" for="un">Your name</label><input type="text" id="un" maxlength="40" autocomplete="name" required>' +
      '<label class="f" for="uh">Username (3 to 20 letters, numbers or _)</label><input type="text" id="uh" maxlength="20" autocomplete="username" autocapitalize="none" required>' +
      '<label class="f" for="up">Password (at least 8 characters)</label><input type="password" id="up" minlength="8" autocomplete="new-password" required>' +
      '<p><label><input type="checkbox" id="ua"> I am 16 or older and I agree to the community rules at the bottom of this page</label></p><button class="btn">Create my account</button><p class="err" id="eup"></p></form>' +
      '<form id="fin" hidden><h1>Welcome back</h1><label class="f" for="ih">Username</label><input type="text" id="ih" autocomplete="username" autocapitalize="none" required><label class="f" for="ip">Password</label><input type="password" id="ip" autocomplete="current-password" required><p></p><button class="btn">Sign in</button><p class="err" id="ein"></p></form></div>';
    main.querySelector(".tabs").onclick = function (e) { var b = e.target.closest("button"); if (!b) return; main.querySelectorAll(".tabs button").forEach(function (x) { x.classList.toggle("on", x === b); }); document.getElementById("fup").hidden = b.dataset.t !== "up"; document.getElementById("fin").hidden = b.dataset.t !== "in"; };
    document.getElementById("fup").onsubmit = function (e) {
      e.preventDefault(); var setup = /[?&]setup=([^&]+)/.exec(location.search);
      api("signup", { body: { name: document.getElementById("un").value, handle: document.getElementById("uh").value, password: document.getElementById("up").value, agree: document.getElementById("ua").checked, setupCode: setup ? decodeURIComponent(setup[1]) : "" } })
        .then(function (d) { setToken(d); return loadMe(); }).then(function () { drawWho(); toast("Welcome to Coffeebreak Social"); location.hash = "#feed"; }).catch(function (er) { document.getElementById("eup").textContent = er.message; });
    };
    document.getElementById("fin").onsubmit = function (e) {
      e.preventDefault();
      api("login", { body: { handle: document.getElementById("ih").value, password: document.getElementById("ip").value } })
        .then(function (d) { setToken(d); return loadMe(); }).then(function () { drawWho(); location.hash = "#feed"; }).catch(function (er) { document.getElementById("ein").textContent = er.message; });
    };
  }
  function personHtml(u) {
    var me = S.me && S.me.handle === u.handle, f = S.follows.indexOf(u.handle) >= 0;
    return '<div class="person"><a href="#u/' + esc(u.handle) + '">' + av(u.name, u.avatar) + '</a><div class="grow"><a href="#u/' + esc(u.handle) + '" style="color:inherit;text-decoration:none"><b>' + esc(u.name) + '</b> <small class="meta">@' + esc(u.handle) + "</small></a>" + (u.bio ? '<div class="meta">' + esc(u.bio) + "</div>" : "") + "</div>" +
      (me ? '<span class="meta">You</span>' : '<button class="btn small ' + (f ? "ghost" : "") + '" data-follow="' + esc(u.handle) + '">' + (f ? "Following" : "Follow") + '</button><a class="btn small ghost" href="#dm/' + esc(u.handle) + '">Message</a>') + "</div>";
  }
  function bindFollow(root, after) {
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-follow]"); if (!b) return; if (!S.me) { location.hash = "#join"; return; }
      api("follow/" + b.dataset.follow, { body: {} }).then(function (d) {
        var h = b.dataset.follow; S.follows = d.following ? S.follows.concat(h) : S.follows.filter(function (x) { return x !== h; });
        b.textContent = d.following ? "Following" : "Follow"; b.classList.toggle("ghost", d.following); after && after();
      }).catch(function (er) { toast(er.message); });
    });
  }
  function vPeople() {
    main.innerHTML = '<h1>People on Coffeebreak Social</h1><input type="search" id="pq" placeholder="Search by name or username" aria-label="Search people"><div class="card" id="plist"><p class="muted">Loading...</p></div>';
    var box = document.getElementById("plist"); bindFollow(box);
    function load() {
      api("people?q=" + encodeURIComponent(document.getElementById("pq").value)).then(function (d) {
        box.innerHTML = d.people.length ? '<p class="meta">' + d.total + (d.total === 1 ? " member" : " members") + "</p>" + d.people.map(personHtml).join("") : '<div class="empty">' + (d.total ? "Nobody matches that search." : "No members yet. Sign up and be the first.") + "</div>";
      }).catch(function (er) { box.innerHTML = '<div class="empty">' + esc(er.message) + "</div>"; });
    }
    var t; document.getElementById("pq").oninput = function () { clearTimeout(t); t = setTimeout(load, 300); }; load();
  }
  function vUser(h) {
    main.innerHTML = '<p class="muted">Loading...</p>';
    api("users/" + encodeURIComponent(h)).then(function (d) {
      var u = d.user;
      main.innerHTML = '<div class="card"><div class="who">' + av(u.name, u.avatar, true) + '<div class="grow"><h1 style="margin:0">' + esc(u.name) + '</h1><small>@' + esc(u.handle) + " &middot; joined " + new Date(u.joined).toLocaleDateString() + '</small></div></div>' + (u.bio ? '<p class="text">' + esc(u.bio) + "</p>" : "") +
        '<p class="meta"><b>' + u.followers + "</b> followers &middot; <b>" + u.following + "</b> following</p>" +
        (S.me && S.me.handle === u.handle ? '<a class="btn ghost small" href="#me">Edit my profile</a>' : '<div class="row"><button class="btn small ' + (S.follows.indexOf(u.handle) >= 0 ? "ghost" : "") + '" data-follow="' + esc(u.handle) + '">' + (S.follows.indexOf(u.handle) >= 0 ? "Following" : "Follow") + '</button><a class="btn small ghost" href="#dm/' + esc(u.handle) + '">Message</a>' + (S.me ? '<button class="btn small ghost" id="blk">' + (S.blocked.indexOf(u.handle) >= 0 ? "Unblock" : "Block") + "</button>" : "") + "</div>") +
        '</div><h2>Posts</h2><div id="ubox"></div>';
      bindFollow(main.querySelector(".card"));
      var bk = document.getElementById("blk"); if (bk) bk.onclick = function () { api("block/" + u.handle, { body: {} }).then(function (r) { S.blocked = r.blocked ? S.blocked.concat(u.handle) : S.blocked.filter(function (x) { return x !== u.handle; }); toast(r.blocked ? "Blocked" : "Unblocked"); vUser(h); }).catch(function (er) { toast(er.message); }); };
      loadPosts(document.getElementById("ubox"), u.handle);
    }).catch(function (er) { main.innerHTML = '<div class="empty">' + esc(er.message) + "</div>"; });
  }
  function vMessages() {
    if (!S.me) { main.innerHTML = needSignIn("Sign up or sign in to send private messages."); return; }
    main.innerHTML = '<h1>Messages</h1><div class="card" id="clist"><p class="muted">Loading...</p></div>';
    function load() {
      api("dm").then(function (d) {
        var box = document.getElementById("clist"); if (!box) return;
        box.innerHTML = d.conversations.length ? d.conversations.map(function (c) { return '<a class="conv" href="#dm/' + esc(c.with) + '">' + av(c.name) + '<div class="grow"><b>' + esc(c.name) + '</b> <small class="meta">@' + esc(c.with) + " &middot; " + ago(c.t) + '</small><div class="meta">' + (c.fromMe ? "You: " : "") + esc(c.last) + "</div></div>" + (c.unread ? '<span class="badge">' + c.unread + "</span>" : "") + "</a>"; }).join("")
          : '<div class="empty">No messages yet. Find someone in People and tap Message.</div>';
        setUnread(d.unread);
      }).catch(function () {});
    }
    load(); pollT = setInterval(load, 10000);
  }
  function vDM(h) {
    if (!S.me) { main.innerHTML = needSignIn("Sign up or sign in to send private messages."); return; }
    main.innerHTML = '<p class="muted">Loading...</p>'; var last = "";
    function load(first) {
      return api("dm/" + encodeURIComponent(h)).then(function (d) {
        if (first) {
          main.innerHTML = '<div class="card"><div class="who"><a href="#u/' + esc(d.with.handle) + '">' + av(d.with.name, d.with.avatar) + '</a><div class="grow"><b>' + esc(d.with.name) + '</b><small>@' + esc(d.with.handle) + ' &middot; private chat</small></div><a class="btn small ghost" href="#messages">Back</a></div></div>' +
            '<div class="card"><div class="thread" id="thr"></div><form id="dmf" class="row" style="margin-top:8px"><input type="text" class="grow" id="dmi" maxlength="1000" placeholder="Write a message" aria-label="Message"><button class="btn small">Send</button></form><p class="err" id="dme"></p></div>';
          document.getElementById("dmf").onsubmit = function (e) {
            e.preventDefault(); var i = document.getElementById("dmi"); if (!i.value.trim()) return;
            api("dm/" + encodeURIComponent(h), { body: { text: i.value } }).then(function () { i.value = ""; load(); }).catch(function (er) { document.getElementById("dme").textContent = er.message; });
          };
        }
        var thr = document.getElementById("thr"); if (!thr) return;
        var sig = d.messages.length + ":" + (d.messages.length ? d.messages[d.messages.length - 1].id : "");
        if (sig === last) return; last = sig;
        thr.innerHTML = d.messages.length ? d.messages.map(function (m) { return '<div class="bubble' + (m.from === S.me.handle ? " me" : "") + '">' + linkify(m.text) + "<small>" + ago(m.t) + "</small></div>"; }).join("") : '<div class="empty">Say hello to ' + esc(d.with.name) + ".</div>";
        thr.scrollTop = thr.scrollHeight;
      }).catch(function (er) { if (first) main.innerHTML = '<div class="empty">' + esc(er.message) + "</div>"; });
    }
    load(true); pollT = setInterval(load, 5000);
  }
  function vMe() {
    if (!S.me) { location.hash = "#join"; return; }
    var u = S.me;
    main.innerHTML = '<div class="card"><div class="who">' + av(u.name, u.avatar, true) + '<div class="grow"><h1 style="margin:0">' + esc(u.name) + '</h1><small>@' + esc(u.handle) + '</small><p class="meta"><b>' + u.followers + "</b> followers &middot; <b>" + u.following + '</b> following</p></div></div><div class="row"><a class="btn small ghost" href="#u/' + esc(u.handle) + '">See my public profile and posts</a><button class="btn small ghost" id="so">Sign out</button></div></div>' +
      '<form class="card" id="pf"><h2>Edit profile</h2><label class="f" for="mn">Name</label><input type="text" id="mn" maxlength="40" value="' + esc(u.name) + '"><label class="f" for="mb">Bio</label><textarea id="mb" rows="2" maxlength="200">' + esc(u.bio) + '</textarea>' +
      '<div class="row" style="margin-top:8px"><label class="attach">&#128247; Change profile picture<input type="file" id="mav" accept="image/jpeg,image/png,image/webp,image/gif"></label>' + (u.avatar ? '<button type="button" class="btn small ghost" id="rmav">Remove picture</button>' : "") + '<span class="grow"></span><button class="btn">Save</button></div><p class="err" id="pe"></p></form>' +
      '<form class="card" id="pwf"><h2>Change password</h2><label class="f" for="op">Current password</label><input type="password" id="op" autocomplete="current-password" required><label class="f" for="np">New password</label><input type="password" id="np" minlength="8" autocomplete="new-password" required><p></p><button class="btn ghost">Change password</button><p class="err" id="pwe"></p></form>' +
      '<form class="card" id="delf"><h2>Delete my account</h2><p class="meta">This removes your profile, posts, pictures, videos, music and messages for good.</p><label class="f" for="dp">Type your password to confirm</label><input type="password" id="dp" autocomplete="current-password" required><p></p><button class="btn danger">Delete my account</button><p class="err" id="de"></p></form>' +
      (u.admin ? '<div class="card"><h2>Reports</h2><div id="reps"><p class="muted">Loading...</p></div></div>' : "");
    document.getElementById("so").onclick = function () { signOut(); location.hash = "#feed"; };
    document.getElementById("pf").onsubmit = function (e) { e.preventDefault(); api("me", { method: "PATCH", body: { name: document.getElementById("mn").value, bio: document.getElementById("mb").value } }).then(function (d) { S.me = d.me; drawWho(); toast("Saved"); vMe(); }).catch(function (er) { document.getElementById("pe").textContent = er.message; }); };
    document.getElementById("mav").onchange = function (e) { var f = e.target.files[0]; if (!f) return; document.getElementById("pe").textContent = "Uploading..."; upload(f).then(function (d) { return api("me", { method: "PATCH", body: { avatar: d.id } }); }).then(function (d) { S.me = d.me; toast("Picture updated"); vMe(); }).catch(function (er) { document.getElementById("pe").textContent = er.message; }); };
    var rm = document.getElementById("rmav"); if (rm) rm.onclick = function () { api("me", { method: "PATCH", body: { avatar: null } }).then(function (d) { S.me = d.me; vMe(); }).catch(function (er) { toast(er.message); }); };
    document.getElementById("pwf").onsubmit = function (e) { e.preventDefault(); api("me", { method: "PATCH", body: { password: document.getElementById("op").value, newPassword: document.getElementById("np").value } }).then(function (d) { setToken(d); toast("Password changed"); vMe(); }).catch(function (er) { document.getElementById("pwe").textContent = er.message; }); };
    document.getElementById("delf").onsubmit = function (e) { e.preventDefault(); if (!confirm("Delete your account and everything you posted?")) return; api("me", { method: "DELETE", body: { password: document.getElementById("dp").value } }).then(function () { signOut(true); toast("Your account has been deleted"); location.hash = "#feed"; }).catch(function (er) { document.getElementById("de").textContent = er.message; }); };
    if (u.admin) api("admin/reports").then(function (d) {
      var box = document.getElementById("reps");
      box.innerHTML = d.reports.length ? d.reports.map(function (r) { return '<div class="person"><div class="grow"><b>@' + esc(r.user) + '</b> reported by @' + esc(r.by) + ' <span class="meta">' + ago(r.t) + "</span><div>" + esc(r.reason) + '</div></div><button class="btn small ghost" data-ban="' + esc(r.user) + '">Suspend or restore</button><button class="btn small ghost" data-clear="' + esc(r.id) + '">Clear</button></div>'; }).join("") : '<div class="empty">No reports.</div>';
      box.onclick = function (e) { var b = e.target.closest("button"); if (!b) return; if (b.dataset.ban) api("admin/ban/" + b.dataset.ban, { body: {} }).then(function (r) { toast(r.banned ? "Suspended" : "Restored"); }).catch(function (er) { toast(er.message); }); if (b.dataset.clear) api("admin/clear-report/" + b.dataset.clear, { body: {} }).then(vMe); };
    }).catch(function () {});
  }
  function setUnread(n) { var u = document.getElementById("unread"); u.hidden = !n; u.textContent = n; }

  function route() {
    clearInterval(pollT); if (window.CBTools) window.CBTools.cleanup(); if (!/^#?tools/.test(location.hash)) document.title = "Coffeebreak Social Live";
    var h = location.hash.replace(/^#/, "") || "feed", parts = h.split("/"), r = parts[0];
    document.querySelectorAll(".bottom-nav a").forEach(function (a) { a.classList.toggle("on", a.dataset.r === (r === "u" || r === "join" ? "" : r === "dm" ? "messages" : r)); });
    if (r === "join") vJoin(); else if (r === "people") vPeople(); else if (r === "messages") vMessages(); else if (r === "dm" && parts[1]) vDM(decodeURIComponent(parts[1])); else if (r === "u" && parts[1]) vUser(decodeURIComponent(parts[1])); else if (r === "me") vMe(); else if (r === "tools" && window.CBTools) { window.CBTools.render(document.getElementById("main"), parts); return; } else vFeed();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  loadMe().then(function () { drawWho(); route(); if (S.me) { api("dm").then(function (d) { setUnread(d.unread); }).catch(function () {}); setInterval(function () { if (S.me) api("dm").then(function (d) { setUnread(d.unread); }).catch(function () {}); }, 30000); } });
})();
