// sw.js 

const PRECACHE = 'precache-v3'
const PRECACHE_LIST = [
  './offline.html'
]
const RUNTIME = 'runtime-v1'
const expectedCaches = [PRECACHE, RUNTIME]


self.oninstall = (event) => {
  event.waitUntil(
    caches.open(PRECACHE)
    .then(cache => cache.addAll(PRECACHE_LIST))
    .then(self.skipWaiting())
    .catch(err => console.log(err))
  )
}

self.onactivate = (event) => {
  // delete any caches unexpected for migration.
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(key => !expectedCaches.includes(key))
        .map(key => caches.delete(key))
    ))
  )
}

self.onfetch = (event) => {
  // Fastest-while-revalidate 
  const cached = caches.match(event.request);
  const fixedUrl = `${event.request.url}?${Date.now()}`;
  const fetched = fetch(fixedUrl, {cache: "no-store"});
  const fetchedCopy = fetched.then(resp => resp.clone());
  console.log(`fetch ${fixedUrl}`)
  
  // Call respondWith() with whatever we get first.
  // If the fetch fails (e.g disconnected), wait for the cache.
  // If there’s nothing in cache, wait for the fetch. 
  // If neither yields a response, return offline pages.
  event.respondWith(
    Promise.race([fetched.catch(_ => cached), cached])
      .then(resp => resp || fetched)
      .catch(_ => caches.match('offline.html'))
  );

  // Update the cache with the version we fetched (only for ok status)
  event.waitUntil(
    Promise.all([fetchedCopy, caches.open(RUNTIME)])
      .then(([response, cache]) => response.ok && cache.put(event.request, response))
      .catch(_ => {/* eat any errors */})
  );
}


