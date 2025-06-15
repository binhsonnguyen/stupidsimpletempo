import {logger} from "../logger";

let sentinel = null

export const wakeLockService = {
    async request () {
        logger.log('request wakeLock')
        if ('wakeLock' in navigator && sentinel === null) {
            try {
                sentinel = await navigator.wakeLock.request('screen')
                sentinel.addEventListener('release', () => {
                    sentinel = null
                })
            } catch (err) {
                console.error(`${err.name}, ${err.message}`)
            }
        }
    },

    async release () {
        logger.log('release wakeLock')
        if (sentinel) {
            await sentinel.release()
            sentinel = null
        }
    }
}