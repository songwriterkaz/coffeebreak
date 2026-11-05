const C='cbphone-bible-v1-s1',F=['./','./cbsimple.js','./simple-init.js','./simple-init-radio.js','index.html','app.js','ghost.js','radio.html','bible.js','kjv.js','wall0.jpg','wall1.jpg','wall4.jpg','wall10.jpg','peerjs.min.js','logo.jpg','cb-fullscreen.js','manifest.webmanifest','icon-192.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).catch(()=>{})));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
