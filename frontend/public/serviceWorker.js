console.log("Service Worker carregado");

this.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
});

this.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
});

this.addEventListener('fetch', (event) => {
  console.log('Service Worker: Interceptando requisições...');
  event.respondWith(fetch(event.request));
});
