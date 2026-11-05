const C='cb-mega-studio-v2';const F=['index.html','app.js','presets.js','cleaner.js','wordlists.js','logo.png','manifest.json','icon-192.png','icon-512.png','filein.js'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(F)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&e.request.url.includes('/ffmpeg/')){const c2=res.clone();caches.open(C).then(c=>c.put(e.request,c2))}return res}))));
