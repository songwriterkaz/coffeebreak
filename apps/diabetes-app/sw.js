/* Coffeebreak service worker: caches the app for offline use. Version bump = new cache. */
var PREFIX='cb-diabetes-',V=PREFIX+'v1';
var FILES=['./','./index.html','./manifest.webmanifest','./logo.png','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(V).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k.indexOf(PREFIX)===0&&k!==V}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET'||req.url.indexOf(self.location.origin)!==0)return;
  e.respondWith(caches.open(V).then(function(c){
    return c.match(req,{ignoreSearch:true}).then(function(hit){
      var net=fetch(req).then(function(res){if(res&&res.ok)c.put(req,res.clone());return res}).catch(function(){return hit||c.match('./index.html')});
      return hit||net;
    });
  }));
});
