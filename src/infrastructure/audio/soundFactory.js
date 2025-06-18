import {WoodblockSoundLibrary} from "./woodblockSoundLibrary";

let audioContext = null
const soundCache = new Map()
const soundLib = new WoodblockSoundLibrary();

/**
 * Lấy một đối tượng Sound từ cache hoặc tạo mới nếu chưa có.
 * @param {object} options - Các tùy chọn cho âm thanh.
 * @param {string} options.note - Nốt nhạc.
 * @param {string} options.oscillatorType - Dạng sóng.
 * @returns {Sound|null} - Đối tượng Sound tương ứng hoặc null nếu có lỗi.
 */
function getSound ({ note, oscillatorType }) {
    if (!audioContext) {
        console.error('SoundFactory chưa được khởi tạo với AudioContext.')
        return null
    }

    const cacheKey = `${note}-${oscillatorType}`

    // 1. Kiểm tra cache trước
    if (soundCache.has(cacheKey)) {
        return soundCache.get(cacheKey)
    }

    // 2. Nếu không có, tạo mới, lưu vào cache và trả về
    try {
        const newSound = new Sound({ note, oscillatorType })
        soundCache.set(cacheKey, newSound)
        return newSound
    } catch (e) {
        console.error(`Không thể tạo âm thanh cho key ${cacheKey}:`, e)
        return null
    }
}

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
    getSound,
    getSoundLib
}