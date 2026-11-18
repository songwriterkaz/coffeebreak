var C='cbip-v1-gfm1';
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(['./','./index.html'])}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',function(e){if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(function(r){return r||fetch(e.request).catch(function(){return caches.match('./index.html')})}))});

self.addEventListener('activate',function(e){var keep=(typeof C!=='undefined'&&C)||(typeof CACHE!=='undefined'&&CACHE)||(typeof K!=='undefined'&&K)||(typeof V!=='undefined'&&V)||'';if(!keep)return;var stem=String(keep).replace(/-gfm1$/,'');e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==keep&&k.indexOf(stem)===0}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
