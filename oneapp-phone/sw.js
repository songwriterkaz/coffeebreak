const K='cbsim-oneapp-v1',F=['./','index.html','app.js','logo.webp','icon.png','manifest.webmanifest','peerjs.min.js','qrcode.min.js','jsqr.js'];
self.oninstall=e=>{self.skipWaiting();e.waitUntil(caches.open(K).then(c=>c.addAll(F)).catch(()=>{}))};
self.onactivate=e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('cbsim-oneapp')&&x!=K).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
self.onfetch=e=>{if(e.request.method!='GET')return;e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(n=>{if(n.ok&&e.request.url.startsWith(self.location.origin)){const c=n.clone();caches.open(K).then(k=>k.put(e.request,c))}return n})))};
