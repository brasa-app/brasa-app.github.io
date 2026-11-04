// Service worker mínimo: hace la web instalable como app. Los datos siempre se piden a la red.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(
    fetch(e.request).catch(
      () =>
        new Response(
          '<meta name="viewport" content="width=device-width"><p style="font-family:sans-serif;text-align:center;margin-top:40vh">Sin conexión. Vuelve a abrir Brasa cuando tengas internet.</p>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
        ),
    ),
  );
});
