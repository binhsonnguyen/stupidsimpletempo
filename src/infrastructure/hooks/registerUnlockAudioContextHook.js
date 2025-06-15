export function registerUnlockAudioContextHook (ctx) {
    return new Promise((resolve) => {
        const b = document.body;
        const events = ["touchstart", "touchend", "mousedown", "keydown"];
        const unlock = () => {
            if (ctx.state === 'suspended') {
                ctx.resume().then(clean).then(resolve);
            } else {
                clean()
                resolve()
            }
        };
        const clean = () => { events.forEach(e => b.removeEventListener(e, unlock));};
        events.forEach(e => b.addEventListener(e, unlock, false));
    })
}