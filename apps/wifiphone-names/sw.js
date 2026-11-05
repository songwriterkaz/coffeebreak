const K='cbnames-v1-qr3',F=['./','index.html','logo.webp','icon.png','manifest.webmanifest','peerjs.min.js','cbassist.js','cbreport.js','qrcode.min.js','jsQR.js','cbscan-ios.js','cbscan-ios.css'];
self.oninstall=e=>{self.skipWaiting();e.waitUntil(caches.open(K).then(c=>c.addAll(F)).catch(()=>{}))};
self.onactivate=e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('cbnames')&&x!=K).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
self.onfetch=e=>{if(e.request.method!='GET')return;e.respondWith(fetch(e.request).then(n=>{if(n.ok){const c=n.clone();caches.open(K).then(k=>k.put(e.request,c))}return n}).catch(()=>caches.match(e.request,{ignoreSearch:true})))};
