const K='cbsim-tiny-v1-r1',F=['./cbassist.js','./cbreport.js','./cbcode.js','./','index.html','logo.webp','icon.png','manifest.webmanifest','https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'];
self.oninstall=e=>{self.skipWaiting();e.waitUntil(caches.open(K).then(c=>c.addAll(F)).catch(()=>{}))};
self.onactivate=e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('cbsim-tiny')&&x!=K).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
self.onfetch=e=>{if(e.request.method!='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n.ok){const c=n.clone();caches.open(K).then(k=>k.put(e.request,c))}return n})))};
