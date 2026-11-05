const C='cbphone-diab-v1b-s1',F=['./','./cbsimple.js','./simple-init.js','index.html','app.js','ghost.js','diabetes.js','diabetes-girl.jpg','peerjs.min.js','logo.jpg','cb-fullscreen.js','manifest.webmanifest','icon-192.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).catch(()=>{})));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
