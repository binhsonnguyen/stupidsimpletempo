import {WoodblockSoundLibrary} from "./woodblockSoundLibrary";

let audioContext = null
const soundCache = new Map()
const soundLib = new WoodblockSoundLibrary();

function getSoundLib() {
    return soundLib
}

function init (options) {
    if (!options.audioContext) {
        console.error('SoundFactory.init thất bại: thiếu audioContext.')
        return
    }
    audioContext = options.audioContext
}

export const soundFactory = {
    init,
    getSoundLib
}