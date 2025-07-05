// Versão do cache - altere para forçar atualização
const CACHE_VERSION = '1.0.1';
const CACHE_NAME = `indaiafibra-v${CACHE_VERSION}`;

// Adicione um timestamp para forçar a atualização de arquivos HTML e JS
const TIMESTAMP = new Date().getTime();

// Lista de recursos para cache
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  `/script.js?v=${TIMESTAMP}`, // Adiciona timestamp para forçar atualização
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Evento de instalação - armazena recursos em cache
self.addEventListener('install', event => {
  console.log(`[Service Worker] Instalando nova versão ${CACHE_VERSION}`);
  
  // Força a ativação imediata do service worker, sem esperar pelo reload
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Falha ao armazenar recursos em cache:', error);
      })
  );
});

// Evento de ativação - limpa caches antigos e toma controle imediatamente
self.addEventListener('activate', event => {
  console.log(`[Service Worker] Ativando nova versão ${CACHE_VERSION}`);
  
  // Toma controle de todas as páginas abertas imediatamente
  event.waitUntil(
    Promise.all([
      // Limpa caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log(`[Service Worker] Excluindo cache antigo: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Toma controle de todas as páginas abertas
      self.clients.claim()
    ])
  );
  
  // Notifica todas as janelas abertas sobre a atualização
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        version: CACHE_VERSION
      });
    });
  });
});

// Estratégia de cache: Network First para HTML e JS, Cache First para outros recursos
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Estratégia para arquivos HTML e JS - Network First
  if (event.request.url.endsWith('.html') || 
      event.request.url.endsWith('.js') || 
      event.request.url === self.location.origin + '/' ||
      url.pathname === '/') {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Armazena a resposta atualizada no cache
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // Se falhar, tenta buscar do cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Se não estiver no cache, retorna a página offline
              return caches.match('/index.html');
            });
        })
    );
  } 
  // Estratégia para outros recursos - Cache First
  else {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Retorna do cache, mas atualiza o cache em segundo plano
            const fetchPromise = fetch(event.request)
              .then(networkResponse => {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
              })
              .catch(() => {
                console.log('[Service Worker] Falha ao atualizar recurso em segundo plano');
              });
            
            // Retorna imediatamente do cache
            return cachedResponse;
          }
          
          // Se não estiver no cache, busca da rede
          return fetch(event.request)
            .then(response => {
              // Armazena a resposta no cache
              const clonedResponse = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, clonedResponse);
              });
              return response;
            });
        })
    );
  }
});

// Evento de mensagem - para comunicação com a página
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Envia a versão atual para a página
    event.source.postMessage({
      type: 'UPDATE_INFO',
      version: CACHE_VERSION
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync para dados offline
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Lógica de sincronização de dados offline
  return new Promise((resolve) => {
    console.log('[Service Worker] Sincronização em segundo plano concluída');
    resolve();
  });
}

// Notificações push
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do IndaiaFibra',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('IndaiaFibra', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

