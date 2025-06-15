export function registerServiceWorker() {
    navigator.serviceWorker
        .register(new URL('../services/sw.js', import.meta.url))
        .then(() => {
            console.log('Service worker has been registered.')
        })
}