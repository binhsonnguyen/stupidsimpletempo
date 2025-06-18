// /src/infrastructure/audio/soundFactory.ts
import { WoodblockSoundLibrary } from "./woodblockSoundLibrary"; // Giả sử woodblockSoundLibrary.ts export class này

let audioContext: AudioContext | null = null;

const soundCache = new Map(); // Để lại là Map<any, any> nếu chưa rõ mục đích

const soundLib = new WoodblockSoundLibrary();

interface InitOptions {
    audioContext: AudioContext; // Hoặc kiểu AudioContext cụ thể bạn đang dùng
}

function getSoundLib(): WoodblockSoundLibrary {
    return soundLib;
}

function init(options: InitOptions): void {
    if (!options.audioContext) {
        console.error('SoundFactory.init thất bại: thiếu audioContext.');
        return;
    }
    audioContext = options.audioContext;
}

export interface SoundFactoryInterface {
    init: (options: InitOptions) => void;
    getSoundLib: () => WoodblockSoundLibrary;
}

export const soundFactory: SoundFactoryInterface = {
    init,
    getSoundLib
};