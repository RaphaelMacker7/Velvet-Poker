/* Velvet Poker : service worker (installation + chargement hors ligne de l'interface) */
const V='velvet-v5',CORE=['./','index.html','manifest.webmanifest','icon-512.png','apple-touch-icon.png','favicon-48.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  if(r.cache==='no-store'||r.cache==='reload')return;
  const u=new URL(r.url);
  if(u.pathname.includes('/peerjs')||u.protocol==='ws:'||u.protocol==='wss:')return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(x=>{if(x.ok&&!x.redirected){const cp=x.clone();caches.open(V).then(c=>c.put('index.html',cp))}return x})
      .catch(()=>caches.match('index.html',{ignoreSearch:true}).then(x=>x||caches.match('./'))));
    return}
  const same=u.origin===location.origin,cdn=/(^|\.)(jsdelivr\.net|googleapis\.com|gstatic\.com)$/.test(u.hostname);
  if(!same&&!cdn)return;
  e.respondWith(caches.match(r,{ignoreSearch:same}).then(h=>{
    const n=fetch(r).then(x=>{if(x&&(x.ok||x.type==='opaque')){const cp=x.clone();caches.open(V).then(c=>c.put(r,cp))}return x}).catch(()=>h);
    return h||n}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c)return c.focus()}return self.clients.openWindow('./')}))});
