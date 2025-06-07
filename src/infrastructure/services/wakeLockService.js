let sentinel = null

export const wakeLockService = {
    async request () {
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
        if (sentinel) {
            await sentinel.release()
            sentinel = null
        }
    }
}