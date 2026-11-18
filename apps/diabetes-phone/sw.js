const C='cbphone-diab-v1b-s1-gfm1',F=['./','./cbsimple.js','./simple-init.js','index.html','app.js','ghost.js','diabetes.js','diabetes-girl.jpg','peerjs.min.js','logo.jpg','cb-fullscreen.js','manifest.webmanifest','icon-192.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).catch(()=>{})));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});

self.addEventListener('activate',function(e){var keep=(typeof C!=='undefined'&&C)||(typeof CACHE!=='undefined'&&CACHE)||(typeof K!=='undefined'&&K)||(typeof V!=='undefined'&&V)||'';if(!keep)return;var stem=String(keep).replace(/-gfm1$/,'');e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==keep&&k.indexOf(stem)===0}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
