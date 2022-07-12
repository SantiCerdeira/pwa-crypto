window.addEventListener('DOMContentLoaded', function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(function(registration) {
                // console.log('SW registrado correctamente', registration)
            })
            .catch(function(err) {
                // console.log('SW no registrado', err)
            })
    };

const d = document;
const divPrincipal = d.getElementById('main');
const home = d.getElementById('home');
const spanHome = home.firstElementChild;
const noticias = d.getElementById('noticias');
const spanNoticias = noticias.firstElementChild;
const valores = d.getElementById('valores');
const spanValores = valores.firstElementChild;
const perfil = d.getElementById('perfil');
const spanPerfil = perfil.firstElementChild;
const cryptosFav = [];

let onlineStatus = () => {
    // console.log(navigator.onLine);
}

window.addEventListener('online', onlineStatus);
window.addEventListener('offline', onlineStatus);

let eventInstall;
let divInstall = d.getElementById('instalador');
let divCompartir = d.getElementById('compartir');


let installApp = () => {
    if(eventInstall) {
        eventInstall.prompt();
        eventInstall.userChoice
            .then(res => {
                if(res.outcome == 'accepted') {
                    divInstall.style.display = 'none';
                } 
            })
    }
}

let showInstallButton = () => {
    if(divInstall.style.display != 'none') {
        divInstall.style.className = ('d-flex btn btn-white fs-4 text-center mb-2 col-12 col-xl-6 p-3 mx-0 instalador');
        divInstall.addEventListener('click', installApp);
    }
}

window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    eventInstall = e;
    showInstallButton();
});

if (divCompartir != undefined) {
    divCompartir.addEventListener('click', e => {
        let infoShare = {
            title: 'CryptoWorld',
            text: 'Mantenete informado sobre todas las noticias del mundo crypto',
            url: 'http://localhost/ajax/PWA1/index.html'
        }

        navigator
            .share(infoShare)
            .then(res => {
                // console.log(res);
            })
            .catch(err => {
                // console.log(err);
            })
    })
}

if (window.Notification && window.Notification !== 'denied') {
    setTimeout(() => {
        Notification.requestPermission()
    }, 3000);
}


// Indexed DB

let db;
let openRequest = indexedDB.open('dbNoticias', 1);
openRequest.onsuccess = function(e) {
    db = e.target.result;
}
openRequest.onupgradeneeded = function(e) {
    db = e.target.result;
    
    var storeRequest = db.createObjectStore('noticias', {
        keyPath: 'id',
        autoIncrement: 'true'
    });
    var storeRequest2 = db.createObjectStore('cryptos', {
        keyPath: 'id',
        autoIncrement: 'true'
    });

    storeRequest.createIndex('idx_titulo', 'titulo', {unique: true});
    storeRequest2.createIndex('idx_nombre', 'nombre', {unique: true});

    storeRequest.transaction.oncomplete = function(e) {
    };

    openRequest.onerror = function(e) {
    }
}

let arrayNoticias = [];

fetch ('api/noticias.json')
.then(res => res.json())
.then(noticias => {
    for (let noticia of noticias){
        titulo = noticia.titulo;
        categoria = noticia.categoria;
        imagen = noticia.imagen;
        imagenOpacidad = noticia.imagenOpacidad;
        sinopsis = noticia.sinopsis;
        texto = noticia.texto;
        leido = noticia.leido;
        arrayNoticias.push(noticia);
    }
})

let arrayCryptos = [];

fetch ('api/cryptos.json')
.then(res => res.json())
.then(cryptos => {
    for (let crypto of cryptos){
        nombre = crypto.nombre;
        precio = crypto.precio;
        imagen = crypto.imagen;
        capMercado = crypto.capMercado;
        favorito = crypto.favorito;
        arrayCryptos.push(crypto);
    }
})



    function Agregar() {
        let tx = db.transaction('noticias', 'readwrite');
        let store = tx.objectStore('noticias');
        for (let noticia of arrayNoticias) {
            let addRequest = store.add(noticia);

            addRequest.onsuccess=function(e){
            }  

            addRequest.onerror=function(e){
            }
        }
    }

    function Recorrer() {
        let tx = db.transaction('noticias', 'readonly');
        let store = tx.objectStore('noticias');

        let tituloSeccion = d.createElement ('h1')
        tituloSeccion.innerHTML = 'Últimas noticias acerca del mundo crypto';
        tituloSeccion.className = ('fs-1 text-center my-5')
        divPrincipal.append(tituloSeccion)
        let divNoticias = d.createElement('div');
        divNoticias.className = ('d-flex row justify-content-around my-5 mx-0')
        store.openCursor().onsuccess = function(event) {
            if(event.target.result!=null) {
                let noticias =  event.target.result.value;
                if(noticias) {
                    let divContenedor = d.createElement('div');
                    divContenedor.style.cssText = ('box-shadow: 0px 0px 15px black; border-radius: 5px;')
                    divContenedor.className = ('col-10 col-xl-5 m-0 fs-5 p-5');
                    divContenedor.style.backgroundImage = (`url(${noticias.imagenOpacidad})`)
                    divContenedor.style.backgroundImage.opacity = ('0.5')
                    divContenedor.style.backgroundRepeat = (`no-repeat`)
                    divContenedor.style.backgroundSize = (`cover`)
                    divContenedor.style.backgroundPosition = (`center center`);
                    divContenedor.style.position = ('relative');
                    let titulo = d.createElement('h3');
                    titulo.innerHTML = noticias.titulo;
                    titulo.className = ('fw-bold my-auto mt-4 fs-2 text-light sombra')
                    divContenedor.append(titulo);
                    let leido = d.createElement('button');
                    leido.style.cssText = ('position: absolute; top: 0; right: 0; margin: 2%; box-shadow: 2px 2px 2px black; padding: 1%')
                    leido.innerHTML = 'Leído';
                    let icono = d.createElement('ion-icon')
                    icono.name = ('close-outline')
                    icono.className = ('my-auto')
                    leido.append(icono)
                    if (noticias.leido == true) {
                        leido.className = ('btn violeta text-light d-flex justify-content-between');
                        icono.name = ('checkmark-outline')
                        divContenedor.style.boxShadow = ('none')
                        divContenedor.className = ('col-10 col-xl-5 m-5 fs-5 p-5 opacidad');
                    } else {
                        leido.className = ('btn btn-light text-dark d-flex justify-content-between')
                        divContenedor.style.boxShadow = ('0px 0px 15px black')
                        divContenedor.className = ('col-10 col-xl-5 m-5 fs-5 p-5');
                    }
                        leido.addEventListener('click', function(){
                            let tx = db.transaction('noticias', 'readwrite');
                            let store = tx.objectStore('noticias');
                            let putRequest = store.put({
                                id: noticias.id,
                                titulo: noticias.titulo,
                                categoria: noticias.categoria,
                                imagen: noticias.imagen,
                                imagenOpacidad: noticias.imagenOpacidad,
                                sinopsis : noticias.sinopsis, 
                                texto: noticias.texto,
                                leido: !noticias.leido
                            });
                            if (noticias.leido === false) {
                                icono.name = ('checkmark-outline')
                                leido.className = ('btn violeta text-light d-flex justify-content-between')
                                divContenedor.style.boxShadow = ('none')
                                divContenedor.className = ('col-10 col-xl-5 m-5 fs-5 p-5 opacidad');
                                noticias.leido = true;
                            } else {
                                icono.name = ('close-outline')
                                leido.className = ('btn btn-light text-dark d-flex justify-content-between');
                                divContenedor.style.boxShadow = ('0px 0px 15px black')
                                divContenedor.className = ('col-10 col-xl-5 m-5 fs-5 p-5');
                                noticias.leido = false;
                            }
                        })
                        
                    divContenedor.append(leido)
                    if (noticias.leido == true) {
                        divContenedor.className = ('col-10 col-xl-5 m-5 fs-5 p-5 opacidad');
                    } else {
                        divContenedor.className = ('col-10 col-xl-5 m-5 fs-5 p-5');
                    }
                        titulo.addEventListener('click', function(e){
                            let modal = d.createElement('div')
                            modal.id = ('modal')
                            modal.className = ('modal mx-auto my-auto');
                            let divModal = d.createElement('div')
                            divModal.className = ('bg-light p-5 border border-rounded d-flex flex-column align-items-center')
                            divModal.style.maxWidth = ('80%')
                            divModal.style.maxHeight = ('100%')
                            divModal.style.overflow = ('scroll')
                            divModal.style.position = ('relative')
                            let cerrar = d.createElement('a');
                            cerrar.className = ('cerrar');
                            cerrar.style.cssText = ('position: absolute; top: 0; right: 0; padding: 3%; text-decoration: none; font-size: 1.2rem; color: black;')
                            cerrar.style.cursor = ('pointer')
                            cerrar.innerHTML = ('X');
                            cerrar.addEventListener ('click', (e) => {
                                d.getElementById('modal').remove();
                            })
                            divModal.append(cerrar);
                            let imgModal = d.createElement('img')
                            imgModal.src = noticias.imagen
                            imgModal.style.cssText = ('max-width: 100%; max-height: 50%; margin:1rem auto');
                            divModal.append(imgModal);
                            let tituloModal = d.createElement('h3')
                            tituloModal.innerHTML = noticias.titulo
                            tituloModal.className = ('fs-3 fw-bold my-2')
                            divModal.append(tituloModal);
                            let categoria = d.createElement('p');
                            categoria.innerHTML = `Categoría: ${noticias.categoria}`;
                            categoria.className = ('text-start fw-bold fs-4')
                            divModal.append(categoria)
                            let textoModal = d.createElement('p')
                            textoModal.innerHTML = noticias.texto;
                            textoModal.className = ('fs-4 my-3')
                            divModal.append(textoModal);
                            modal.append(divModal)
                            divPrincipal.append(modal);
                        })
                    divNoticias.append(divContenedor);
                    divPrincipal.append(divNoticias)
                    event.target.result.continue();
                }
            }
        }
    }

    function AgregarCryptos() {
        let tx = db.transaction('cryptos', 'readwrite');
        let store = tx.objectStore('cryptos');
        for (let crypto of arrayCryptos) {
            let addRequest = store.add(crypto);

            addRequest.onsuccess=function(event){
            }  

            addRequest.onerror=function(e){
            }
        }
    }

    function RecorrerCryptos() {
        let tx = db.transaction('cryptos', 'readonly');
        let store = tx.objectStore('cryptos');

        let tituloSeccion = d.createElement('h1');
        tituloSeccion.innerHTML = 'Criptomonedas';
        tituloSeccion.className = ('text-center my-5 fs-1')
        divPrincipal.append(tituloSeccion);
        let divCryptos = d.createElement('div')
        divCryptos.className = ('d-flex row justify-content-around my-5 mx-0');
        store.openCursor().onsuccess = function(event) {
            if(event.target.result!=null) {
                let cryptos = event.target.result.value;
                    if (cryptos) {
                        let divContenedor = d.createElement('div');
                        divContenedor.className = ('d-flex flex-row justify-content-around col-10 col-xl-3 mx-2 my-4 fs-5 p-4 bg-light rounded ');
                        divContenedor.style.boxShadow = ('0px 0px 10px gray');
                        divContenedor.style.borderRadius = ('5px')
                        let div1 = d.createElement('div');
                        div1.className = ('d-flex flex-column col-4')
                        let titulo = d.createElement('h4');
                        titulo.className = ('text-center fs-3')
                        titulo.innerHTML = cryptos.nombre;
                        div1.append(titulo);
                        let imagen = d.createElement('img');
                        imagen.src = cryptos.imagen;
                        imagen.style.cssText = ('width: 90%; height: 90%; margin: auto')
                        div1.append(imagen);
                        divContenedor.append(div1)
                        let div2 = d.createElement('div');
                        div2.className = ('d-flex flex-column justify-content-center col-7')
                        let precio = d.createElement('p');
                        precio.className = ('text-center fw-bold fs-3')
                        precio.innerHTML = `$${cryptos.precio}`;
                        div2.append(precio);
                        let favorito = d.createElement('button');
                        favorito.innerHTML = 'Agregar a favoritos';
                        favorito.className = ('btn btn-dark p-2');
                        div2.append(favorito)
                        divContenedor.append(div2)
                        if (cryptos.favorito == false) {
                            favorito.className = ('btn btn-dark p-2');
                        } else {
                            favorito.innerHTML = 'Eliminar de favoritos';
                            favorito.className = ('btn btn-light border border-dark border-3');
                        }
                            favorito.addEventListener('click', function(){
                                let indiceCrypto = cryptosFav.indexOf(cryptos)
                                let tx = db.transaction('cryptos', 'readwrite');
                                let store = tx.objectStore('cryptos');
                                let putRequest = store.put({
                                    id: cryptos.id,
                                    nombre: cryptos.nombre,
                                    precio: cryptos.precio,
                                    imagen: cryptos.imagen,
                                    capMercado: cryptos.capMercado, 
                                    favorito: !cryptos.favorito
                                });
                                if (cryptos.favorito === false) {
                                    favorito.innerHTML = 'Eliminar de favoritos';
                                    favorito.className = ('btn btn-light border border-dark border-3');
                                    cryptos.favorito = true;
                                } else {
                                    favorito.innerHTML = 'Agregar a favoritos';
                                    favorito.className = ('btn btn-dark p-2');
                                    cryptosFav.splice(indiceCrypto, 1)
                                    cryptos.favorito = false;
                                }
                            })                   
                            titulo.addEventListener('click', function(){
                                let modal = d.createElement('div')
                                modal.id = ('modal')
                                modal.className = ('modal mx-auto my-auto');
                                let divModal = d.createElement('div')
                                divModal.className = ('d-flex flex-column bg-light p-5 border border-rounded my-auto')
                                divModal.style.maxWidth = ('80%')
                                divModal.style.maxHeight = ('80%')
                                divModal.style.position = ('relative')
                                let cerrar = d.createElement('a');
                                cerrar.className = ('cerrar');
                                cerrar.style.cssText = ('position: absolute; top: 0; right: 0; padding: 3%; text-decoration: none; font-size: 1.2rem; color: black;')
                                cerrar.innerHTML = ('X');
                                cerrar.style.cursor = ('pointer')
                                cerrar.addEventListener ('click', (e) => {
                                    d.getElementById('modal').remove();
                                })
                                divModal.append(cerrar);
                                let tituloModal = d.createElement('h3')
                                tituloModal.innerHTML = cryptos.nombre
                                tituloModal.className = ('fs-1 text-center fw-bold my-2')
                                divModal.append(tituloModal);
                                let imgModal = d.createElement('img')
                                imgModal.src = cryptos.imagen
                                imgModal.style.cssText = ('max-width: 70%; max-height: 70%;')
                                imgModal.className = ('mx-auto my-4')
                                divModal.append(imgModal);
                                let precioModal = d.createElement('p')
                                precioModal.innerHTML = `$${cryptos.precio}`;
                                precioModal.className = ('fs-2 fw-bold my-3 text-center')
                                divModal.append(precioModal);
                                let capMercado = d.createElement('p')
                                capMercado.innerHTML = `Capitalización de mercado:$${cryptos.capMercado}`;
                                capMercado.className = ('fs-4 fw-bold my-3 text-center')
                                divModal.append(capMercado);
                                modal.append(divModal)
                                divPrincipal.append(modal);
                            })
                        divCryptos.append(divContenedor)
                        event.target.result.continue(); 
                        }
                }
            divPrincipal.append(divCryptos);
        }
    }

    function RecorrerFavoritas() {
        let tx = db.transaction('cryptos', 'readonly');
        let store = tx.objectStore('cryptos');

        let tituloSeccion = d.createElement('h1');
        tituloSeccion.innerHTML = 'Mis criptomonedas favoritas';
        tituloSeccion.className = ('text-center my-5 fs-1')
        divPrincipal.append(tituloSeccion);
        let divCryptosFav = d.createElement('div')
        divCryptosFav.className = ('d-flex row justify-content-around my-5 mx-0');
        let cantidadFavoritas = 0;
        let cantidadContadas = 0;
        let divContador = d.createElement('div');
        divContador.className = ('d-flex flex-column')
        let contador = d.createElement('p');
        contador.innerHTML = `Tenés ${cantidadFavoritas} criptomonedas marcadas como favoritas`;
        contador.className = ('text-center fs-3 my-4 fw-bold')
        divPrincipal.append(contador);
        store.openCursor().onsuccess = function(event) {
            if(event.target.result!=null) {
                let cryptos = event.target.result.value;
                if (cryptos){
                    if (cryptos.favorito === true) {
                        cryptosFav.push(cryptos)
                        cantidadFavoritas++;
                    }
                    cantidadContadas++;
                }
                contador.innerHTML = `Tenés ${cantidadFavoritas} criptomonedas marcadas como favoritas`;

                let contenidoVacio = function() {
                    if (cantidadFavoritas == 0 && cantidadContadas == 9) {
                        divPrincipal.innerHTML = '';
                        let tituloSeccion = d.createElement('h1');
                        tituloSeccion.innerHTML = 'Mis criptomonedas favoritas';
                        tituloSeccion.className = ('text-center my-5 fs-1')
                        divPrincipal.append(tituloSeccion);
                        let divVacio = d.createElement('div')
                        divVacio.className = ('d-flex flex-column')
                        let vacio = d.createElement('p');
                        vacio.innerHTML = 'Aún no has guardado como favorita ninguna criptomoneda'
                        vacio.className = ('text-center fs-3 my-4 fw-bold')
                        divVacio.append(vacio)
                        let boton = d.createElement('button');
                        boton.innerHTML = 'Lista de criptomonedas';
                        boton.style.maxWidth = ('50%')
                        boton.style.margin = ('auto')
                        boton.className = ('btn violeta text-white sombraBoton fs-4 p-3 text-center');
                        boton.addEventListener('click', function() {
                            divPrincipal.innerHTML = '';
                            spanPerfil.className = ('icon');
                            spanHome.className = ('icon ');
                            spanValores.className = ('icon active');
                            RecorrerCryptos();
                        })
                        divVacio.append(boton)
                        divPrincipal.append(divVacio)
                    }
                }
                contenidoVacio();

                if(event.target.result!=null) {
                    if (cryptos) {
                        if (cryptos.favorito === true) {
                        let divContenedor = d.createElement('div');
                        divContenedor.className = ('d-flex flex-row justify-content-around col-10 col-xl-3 mx-2 my-4 fs-5 p-4 bg-light rounded ');
                        divContenedor.style.boxShadow = ('0px 0px 10px gray');
                        divContenedor.style.borderRadius = ('5px')
                        let div1 = d.createElement('div');
                        div1.className = ('d-flex flex-column col-4')
                        let nombre = d.createElement('h4');
                        nombre.className = ('text-center fs-3')
                        nombre.innerHTML = cryptos.nombre;
                        div1.append(nombre);
                        let imagen = d.createElement('img');
                        imagen.src = cryptos.imagen;
                        imagen.style.cssText = ('width: 90%; height: 90%; margin: auto')
                        div1.append(imagen);
                        divContenedor.append(div1)
                        let div2 = d.createElement('div');
                        div2.className = ('d-flex flex-column justify-content-center col-7')
                        let precio = d.createElement('p');
                        precio.className = ('text-center fw-bold fs-3')
                        precio.innerHTML = `$${cryptos.precio}`;
                        div2.append(precio);
                        let favorito = d.createElement('button');
                        favorito.innerHTML = 'Agregar a favoritos';
                        favorito.className = ('btn btn-dark p-2');
                        div2.append(favorito)
                        divContenedor.append(div2)
                        if (cryptos.favorito == false) {
                            favorito.className = ('btn btn-dark p-2');
                        } else {
                            favorito.innerHTML = 'Eliminar de favoritos';
                            favorito.className = ('btn btn-light border border-dark border-3');
                        }
                            favorito.addEventListener('click', function() {
                                let indiceCrypto = cryptosFav.indexOf(cryptos)
                                cryptosFav.splice(indiceCrypto, 1)
                                divContenedor.remove();
                                let tx = db.transaction('cryptos', 'readwrite');
                                let store = tx.objectStore('cryptos');
                                    let putRequest = store.put({
                                        id: cryptos.id,
                                        nombre: cryptos.nombre,
                                        precio: cryptos.precio,
                                        imagen: cryptos.imagen,
                                        capMercado: cryptos.capMercado, 
                                        favorito: false
                                    });
                                cantidadFavoritas--;
                                contador.innerHTML = `Tenés ${cantidadFavoritas} criptomonedas marcadas como favoritas`;
                                contenidoVacio();
                            })
                            nombre.addEventListener('click', function(){
                                let modal = d.createElement('div')
                                modal.id = ('modal')
                                modal.className = ('modal mx-auto my-auto');
                                let divModal = d.createElement('div')
                                divModal.className = ('d-flex flex-column bg-light p-5 border border-rounded my-auto')
                                divModal.style.maxWidth = ('80%')
                                divModal.style.maxHeight = ('80%')
                                divModal.style.position = ('relative')
                                let cerrar = d.createElement('a');
                                cerrar.className = ('cerrar');
                                cerrar.style.cssText = ('position: absolute; top: 0; right: 0; padding: 3%; text-decoration: none; font-size: 1.2rem; color: black;')
                                cerrar.innerHTML = ('X');
                                cerrar.style.cursor = ('pointer')
                                cerrar.addEventListener ('click', (e) => {
                                    d.getElementById('modal').remove();
                                })
                                divModal.append(cerrar);
                                let tituloModal = d.createElement('h3')
                                tituloModal.innerHTML = cryptos.nombre
                                tituloModal.className = ('fs-1 text-center fw-bold my-2')
                                divModal.append(tituloModal);
                                let imgModal = d.createElement('img')
                                imgModal.src = cryptos.imagen
                                imgModal.style.cssText = ('max-width: 70%; max-height: 70%;')
                                imgModal.className = ('mx-auto my-4')
                                divModal.append(imgModal);
                                let precioModal = d.createElement('p')
                                precioModal.innerHTML = `$${cryptos.precio}`;
                                precioModal.className = ('fs-2 fw-bold my-3 text-center')
                                divModal.append(precioModal);
                                let capMercado = d.createElement('p')
                                capMercado.innerHTML = `Capitalización de mercado:$${cryptos.capMercado}`;
                                capMercado.className = ('fs-4 fw-bold my-3 text-center')
                                divModal.append(capMercado);
                                modal.append(divModal)
                                divPrincipal.append(modal);
                                })
                        divCryptosFav.append(divContenedor)
                        }
                        event.target.result.continue();
                    }
                }
                divPrincipal.append(divCryptosFav);
            }
        }
    }


// NAVEGACIÓN

    let divBotones = d.createElement('div');
    divBotones.className = ('d-flex row justify-content-around')
    let tituloBotones = d.createElement('h1');
    tituloBotones.innerHTML = 'Bienvenido/a a CryptoWorld!';
    tituloBotones.className = ('fs-1 text-center my-5');
    divBotones.append(tituloBotones);


    let mostrarNoticias = function(){
        divPrincipal.innerHTML = '';
        Agregar()
        Recorrer();
        spanPerfil.className = ('icon');
        spanHome.className = ('icon');
        spanNoticias.className = ('icon active');
        spanValores.className = ('icon');
    }

    let mostrarCryptos = function() {
        divPrincipal.innerHTML = '';
        AgregarCryptos()
        RecorrerCryptos();
        apiCrypto();
        spanPerfil.className = ('icon');
        spanHome.className = ('icon ');
        spanNoticias.className = ('icon');
        spanValores.className = ('icon active');
    }

    let mostrarPerfil= function() {
        divPrincipal.innerHTML = '';
        RecorrerFavoritas();
        spanPerfil.className = ('icon active');
        spanNoticias.className = ('icon');
        spanHome.className = ('icon');
        spanValores.className = ('icon');
    }
    
    let verNoticias = d.createElement('button');
    verNoticias.className = ('col-10 col-lg-5 col-xl-3 btn p-5 fs-3 text-center my-3 botonesInicio')
    verNoticias.innerHTML = 'Ver Noticias'
    verNoticias.addEventListener('click', function() {
        mostrarNoticias()
    })
    divBotones.append(verNoticias);


    let verCryptos = d.createElement('button');
    verCryptos.className = ('col-10 col-lg-5 col-xl-3 btn p-5 fs-3 text-center my-3 botonesInicio')
    verCryptos.innerHTML = 'Ver Criptomonedas'
    verCryptos.addEventListener('click', function() {
        mostrarCryptos();
    })
    divBotones.append(verCryptos);


    let verPerfil = d.createElement('button');
    verPerfil.className = ('col-10 col-xl-3 btn p-5 fs-3 text-center my-3 botonesInicio')
    verPerfil.innerHTML = 'Ver mi perfil'
    verPerfil.addEventListener('click', function() {
        mostrarPerfil();
    })
    divBotones.append(verPerfil);

    divPrincipal.append(divBotones);
    spanHome.className = ('icon active');


    let mostrarHome= function() {
        divPrincipal.innerHTML = '';
        divPrincipal.append(divBotones);
        spanPerfil.className = ('icon');
        spanNoticias.className = ('icon');
        spanHome.className = ('icon active');
        spanValores.className = ('icon');
    }

    home.addEventListener('click', function () {
        mostrarHome();
    })

    noticias.addEventListener('click', function () {
        mostrarNoticias();
    })

    valores.addEventListener('click', function () {
        mostrarCryptos();
    })

    perfil.addEventListener('click', function () {
        mostrarPerfil();
    })  
    


    let apiCrypto = () => {
        if(this.navigator.onLine) {
            fetch ('https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest?CMC_PRO_API_KEY=85f27387-0802-4c95-b0be-151b317afdb5')
            .then (res=> res.json())
            .then (datos => {
            let informacion = d.createElement('div');
            informacion.className = ('d-flex justify-content-around row mx-0 mb-5')
            let titulo = d.createElement('h2')
            titulo.innerHTML = ('Datos del mercado:');
            titulo.className = ('text-center')
            informacion.append(titulo)
            let dato1 = d.createElement('div');
            dato1.className = ('col-10 col-xl-5 m-5 fs-5 p-4 violeta text-light rounded');
            dato1.style.boxShadow = ('0px 0px 10px black')
            let volumen24 = d.createElement('p');
            volumen24.innerHTML = `Cantidad de criptomonedas activas: ${datos.data.active_cryptocurrencies}`;
            volumen24.className = ('text-center fw-bold fs-3')
            dato1.append(volumen24)
            informacion.append(dato1)
            let dato2 = d.createElement('div');
            dato2.className = ('col-10 col-xl-5 m-5 fs-5 p-4 violeta text-light rounded');
            dato2.style.boxShadow = ('0px 0px 10px black')
            let exchanges = d.createElement('p');
            exchanges.innerHTML = `Cantidad exchanges de criptomonedas activos: ${datos.data.active_exchanges}`;
            exchanges.className = ('text-center fw-bold fs-3')
            dato2.append(exchanges)
            informacion.append(dato2)
            let dato3 = d.createElement('div');
            dato3.className = ('col-10 col-xl-5 m-5 fs-5 p-4 violeta text-light rounded');
            dato3.style.boxShadow = ('0px 0px 10px black')
            let dominanciaBit = d.createElement('p');
            dominanciaBit.innerHTML = `Dominancia de Bitcoin en el mercado: ${datos.data.btc_dominance.toFixed(2)}%`;
            dominanciaBit.className = ('text-center fw-bold fs-3')
            dato3.append(dominanciaBit)
            informacion.append(dato3)
            let dato4 = d.createElement('div');
            dato4.className = ('col-10 col-xl-5 m-5 fs-5 p-4 violeta text-light rounded');
            dato4.style.boxShadow = ('0px 0px 10px black')
            let dominanciaEth = d.createElement('p');
            dominanciaEth.innerHTML = `Dominancia de Ethereum en el mercado: ${datos.data.eth_dominance.toFixed(2)}%`;
            dominanciaEth.className = ('text-center fw-bold fs-3')
            dato4.append(dominanciaEth)
            informacion.append(dato4)
            divPrincipal.append(informacion)
        })
        } else {
            let informacionOffline = d.createElement('div');
            informacionOffline.className = ('d-flex justify-content-around row mx-0 mb-5')
            let titulo = d.createElement('h2')
            titulo.innerHTML = ('Datos del mercado:');
            titulo.className = ('text-center');
            informacionOffline.append(titulo);
            let offline = d.createElement('h3')
            offline.innerHTML = ('Necesitas tener conexión a internet para acceder a esta información');
            offline.className = ('text-center mb-5');
            informacionOffline.append(offline);
            divPrincipal.append(informacionOffline);
        }
    }

});