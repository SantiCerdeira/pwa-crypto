const cacheName = 'pwa-crypto-files';
const assets = ['/',
                'index.html',
                'css/styles.css', 
                'js/main.js', 
                'img/bitcoin-ilustracion.png',
                'img/bitcoin-opacidad.png',
                'img/bitcoin.png',
                'img/logo-crypto.png',
                'img/moonbirds-opacidad.jpg',
                'img/moonbirds.jpeg',
                'img/metaverso-opacidad.png',
                'img/metaverso.jpeg',
                'img/nfts.jpeg',
                'img/nfts-opacidad.jpg',
                'img/onefootball-opacidad.jpg',
                'img/onefootball.jpeg',
                'img/otherside-opacidad.png',
                'img/otherside.png',
                'img/qatar-opacidad.jpg',
                'img/qatar.jpeg',
                'img/robinhood-opacidad.png',
                'img/robinhood.png',
                'img/bnb.png',
                'img/cardano.png',
                'img/dogecoin.png',
                'img/ethereum.png',
                'img/polkadot.png',
                'img/polygon.png',
                'img/solana-ilustracion.svg',
                'img/solana-opacidad.jpg',
                'img/solana.jpeg',
                'img/xrp.png',
            ];


self.addEventListener('install', event => { 
    self.skipWaiting(); 
    event.waitUntil(
        caches
             .open(cacheName)
             .then(cache => {
                 cache.addAll(assets);
             })
    );
});



//Caché dinámico

self.addEventListener('fetch', event =>{
    event.respondWith(
        caches
            .match(event.request)
            .then(res =>{
                if (res) {
                    // console.log(event.request, 'En cache');
                    return res;
                }
                // console.log(event.request, 'No estan cache');
                let requestToCache = event.request.clone();
                return fetch(requestToCache)
                .then(response => {
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    let responseToCache = response.clone();
                    caches
                        .open(cacheName)
                        .then (cache => {
                            cache.put(requestToCache, responseToCache);
                        })
                    return response;
                });
            })
    )
})


self.addEventListener('push', function(pushEvent) {
    let title = pushEvent.data.text();
    let options = {
        body: 'Nueva noticia en CryptoWorld',
        icon: 'img/logo-crypto.png',
        vibrate: [300,100,300],
        data: {id:1},
        actions: [
            {'action': '1', 'title': 'Ver noticia', 'img': 'img/logo-crypto.png' },
            {'action': '2', 'title': 'Ver más tarde', 'img': 'img/logo-crypto.png' }
            ]
    }
    pushEvent.waitUntil(self.registration.showNotification(title,options));
})

self.addEventListener('notificationclick', function(notificationEvent) {
    if (notificationEvent.action === '1') {
        clients.openWindow('http://localhost/ajax/PWA1/index.html');
    } else if(notificationEvent.action === '2') {
        // console.log('No abrió la noticia');
    }
    notificationEvent.notification.close;
})


