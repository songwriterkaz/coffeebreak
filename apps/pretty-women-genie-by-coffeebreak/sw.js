var C="cb-genie-v1";
var FILES=["./","index.html","manifest.json","logo.png","icons/icon-192.png","icons/icon-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(FILES);}));self.skipWaiting();});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x===C?false:true;}).map(function(x){return caches.delete(x);}));}));self.clients.claim();});
self.addEventListener("fetch",function(e){if(e.request.method==="GET"){e.respondWith(fetch(e.request).catch(function(){return caches.match(e.request);}));}});
