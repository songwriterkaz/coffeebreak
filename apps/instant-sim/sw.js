var C='cbinstant-v2-gfm1',A=['./','index.html','app.js','peerjs.min.js','qrcode.min.js','jsQR.js','logo.png','icon.png','icon-512.png','manifest.webmanifest'];
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(C).then(function(c){return c.addAll(A)}).catch(function(){}))});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',function(e){var r=e.request;if(r.method!='GET'||new URL(r.url).origin!=location.origin)return;
e.respondWith(fetch(r).then(function(res){var cp=res.clone();caches.open(C).then(function(c){c.put(r,cp)});return res}).catch(function(){return caches.match(r,{ignoreSearch:true}).then(function(m){return m||caches.match('index.html')})}))});

self.addEventListener('activate',function(e){var keep=(typeof C!=='undefined'&&C)||(typeof CACHE!=='undefined'&&CACHE)||(typeof K!=='undefined'&&K)||(typeof V!=='undefined'&&V)||'';if(!keep)return;var stem=String(keep).replace(/-gfm1$/,'');e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==keep&&k.indexOf(stem)===0}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
