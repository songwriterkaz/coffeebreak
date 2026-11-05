const C='cbsim-v18-q1',F=['./','./index.html','./app.js','./cbcall.js','./cbplus.js','./e000.js','./peerjs.min.js','./qrcode.min.js','./cbqrlink.js','./logo.png','./icon-192.png','./icon-512.png','./manifest.webmanifest','./leaflet.js','./leaflet.css','./wifi.js','./jsqr.js','./local.js','./guest.js','./phones.js','./ext.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim().then(()=>self.clients.matchAll()).then(cs=>cs.forEach(c=>c.postMessage('wake')))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request,{ignoreSearch:true})))});
