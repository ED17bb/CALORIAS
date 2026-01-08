// Service Worker Básico para permitir instalación
self.addEventListener('install', (event) => {
    console.log('CaloTrack Service Worker: Instalado');
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    console.log('CaloTrack Service Worker: Activo');
  });
  
  self.addEventListener('fetch', (event) => {
    // Estrategia básica: responder con la red
    event.respondWith(fetch(event.request));
  });