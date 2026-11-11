// ZP Digital service worker v2: installable app + offline page shell + offline intro video + cached photos.
// Pages are fetched from the network first, so new uploads show at once. Data is cached by the page itself (IndexedDB).
const V='zp-v2',IMG='zp-img',SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png','intro.mp4'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!==IMG).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
function span(rg,len){const m=/bytes=(\d*)-(\d*)/.exec(rg||'');if(!m)return null;let s=m[1]===''?0:+m[1],e=m[2]===''?len-1:+m[2];e=Math.min(e,len-1);return {s,e}}
async function media(r){const c=await caches.open(V);let m=await c.match(r.url);
 if(!m){try{const res=await fetch(r.url);if(!res.ok)return res;await c.put(r.url,res.clone());m=res}catch(x){return new Response('',{status:504})}}
 const rg=r.headers.get('range');if(!rg)return m;
 const buf=await m.clone().arrayBuffer(),p=span(rg,buf.byteLength);if(!p)return m;
 return new Response(buf.slice(p.s,p.e+1),{status:206,statusText:'Partial Content',headers:{'Content-Type':'video/mp4','Content-Range':'bytes '+p.s+'-'+p.e+'/'+buf.byteLength,'Content-Length':String(p.e-p.s+1),'Accept-Ranges':'bytes'}})}
async function photo(r){const c=await caches.open(IMG),hit=await c.match(r.url);
 const net=fetch(r.url,{mode:'cors'}).then(res=>{if(res&&res.ok)c.put(r.url,res.clone());return res}).catch(()=>null);
 return hit||await net||new Response('',{status:504})}
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin===location.origin&&/\.(mp4|webm)$/i.test(u.pathname)){e.respondWith(media(r));return}
 if(u.hostname.endsWith('.supabase.co')&&u.pathname.includes('/storage/v1/object/public/')&&r.destination==='image'){e.respondWith(photo(r));return}
 if(u.origin!==location.origin||r.headers.has('range'))return;
 e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
});
