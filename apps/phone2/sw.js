const C='cbphone-v3';const SHELL=['./','./index.html','./cb-mobile.js','./cb-mobile.css','./setup.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 if(r.headers.get('range'))return; // let audio streaming go to network
 e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{if(res.ok&&!/\.mp3$/i.test(r.url)){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match('./index.html'))))});
