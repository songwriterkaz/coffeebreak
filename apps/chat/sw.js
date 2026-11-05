var C='cbchat-v6',SHELL=['./','index.html','peerjs.min.js','lame.min.js','logo.jpg','icon-180.png','icon-192.png','icon-512.png','manifest.webmanifest','tracks/lyrics.json'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(SHELL)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==C}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){var r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin||u.pathname.indexOf('/.netlify')===0)return;
 var nav=r.mode==='navigate';
 e.respondWith(fetch(r).then(function(res){if(res.ok){var cp=res.clone();caches.open(C).then(function(c){c.put(nav?'index.html':r,cp)})}return res}).catch(function(){return caches.match(nav?'index.html':r,{ignoreSearch:true}).then(function(m){return m||caches.match(r,{ignoreSearch:true})})}))});
