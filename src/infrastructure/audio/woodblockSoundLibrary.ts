// /src/infrastructure/audio/woodblockSoundLibrary.ts
import * as Tone from 'tone';
import woodblockSoundURL from 'url:../../assets/sound/woodblock.wav';

export class WoodblockSoundLibrary {
    private accentPlayer: Tone.Player;

    /**
     * Khởi tạo SoundLibrary và tải trước file âm thanh accent.
     */
    constructor() {
        this.accentPlayer = new Tone.Player({
            url: woodblockSoundURL,
            onload: () => {
                console.log(`WoodblockSoundLibrary: File âm thanh '${woodblockSoundURL}' đã được tải.`);
            },
            onerror: (error: any) => { // Thêm kiểu cho error
                console.error(`WoodblockSoundLibrary: Lỗi khi tải file âm thanh '${woodblockSoundURL}':`, error);
            }
        }).toDestination(); // Kết nối player tới đầu ra âm thanh chính
    }

    /**
     * Phát file âm thanh accent.
     * @param {number} [when] - Thời điểm để phát âm thanh (giây, theo Tone.now() hoặc thời gian tuyệt đối).
     *                           Nếu không cung cấp, âm thanh sẽ phát ngay lập tức.
     * @param {number} [gain=1.0] - Cường độ âm thanh (tuyến tính, từ 0 đến 1). Mặc định là 1.0.
     */
    public play(when?: number, gain: number = 1.0): void {
        if (!this.accentPlayer) {
            console.error('WoodblockSoundLibrary: accentPlayer chưa được khởi tạo.');
            return;
        }

        if (!this.accentPlayer.loaded) {
            console.warn(`WoodblockSoundLibrary: File accent '${woodblockSoundURL}' chưa tải xong. Âm thanh sẽ phát sau khi tải.`);
            // Tone.Player.start() sẽ tự động đợi file tải xong nếu chưa.
        }

        const playbackTime: number = when !== undefined ? when : Tone.now();
        // Đảm bảo gain là giá trị dương hợp lệ cho việc chuyển đổi sang dB
        const targetLinearGain: number = Math.max(0.00001, gain);
        const targetVolumeDb: number = Tone.gainToDb(targetLinearGain);

        // Lên lịch thay đổi âm lượng cho player tại thời điểm phát
        this.accentPlayer.volume.setValueAtTime(targetVolumeDb, playbackTime);

        // Bắt đầu phát âm thanh
        try {
            // console.log('playbackTime', playbackTime) // Bỏ comment nếu cần debug
            this.accentPlayer.start(playbackTime);
        } catch (e: any) { // Thêm kiểu cho e
            console.error(`WoodblockSoundLibrary: Lỗi khi phát âm thanh accent:`, e);
        }
    }

    /**
     * Giải phóng tài nguyên đã sử dụng bởi Tone.Player.
     */
    public dispose(): void {
        if (this.accentPlayer && !this.accentPlayer.disposed) {
            this.accentPlayer.dispose();
            console.log('WoodblockSoundLibrary: accentPlayer đã được giải phóng.');
        }
    }
}