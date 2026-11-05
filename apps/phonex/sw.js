const C='cbphonex-v1-s1';const SHELL=['./','./cbsimple.js','./simple-init.js','./index.html','./app.js','./app.css','./setup.html','./manifest.webmanifest','./cb-logo.jpg','./cbphone.jpg','./icon-192.png','./icon-512.png','./assets/trystero.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin||r.headers.get('range'))return;
 e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{if(res.ok&&!/\.mp3$/i.test(r.url)){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match('./index.html'))))});
