// ZP Digital service worker: makes the site installable and shows the page shell when offline.
// Pages are always fetched from the network first, so new uploads show up at once. Data still needs internet.
const V='zp-v1',SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET'||r.headers.has('range'))return;
 const u=new URL(r.url);if(u.origin!==location.origin)return;
 if(/\.(mp4|webm)$/i.test(u.pathname))return;
 e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
});
