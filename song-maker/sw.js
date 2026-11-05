const C='cbsong-v1',F=["./", "./app.js", "./engine.js", "./icon-192.png", "./icon-512.png", "./index.html", "./logo.png", "./manifest.webmanifest", "./songgen.js", "./theme.css"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request,{ignoreSearch:true})))});
