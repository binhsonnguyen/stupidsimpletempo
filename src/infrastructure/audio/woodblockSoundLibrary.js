import * as Tone from 'tone';

const WOODBLOCK_SOUND_PATH = new URL('/src/assets/sound/woodblock.wav', import.meta.url);


export class WoodblockSoundLibrary {
    /**
     * Khởi tạo SoundLibrary và tải trước file âm thanh accent.
     */
    constructor() {
        this.accentPlayer = new Tone.Player({
            onload: () => {
                console.log(`SoundLibrary: File âm thanh '${WOODBLOCK_SOUND_PATH}' đã được tải.`);
            },
            onerror: (error) => {
                console.error(`SoundLibrary: Lỗi khi tải file âm thanh '${WOODBLOCK_SOUND_PATH}':`, error);
            }
        }).toDestination(); // Kết nối player tới đầu ra âm thanh chính
        this.accentPlayer.load(WOODBLOCK_SOUND_PATH);
    }

    /**
     * Phát file âm thanh accent.
     * @param {number} [when] - Thời điểm để phát âm thanh (giây, theo Tone.now() hoặc thời gian tuyệt đối).
     *                           Nếu không cung cấp, âm thanh sẽ phát ngay lập tức.
     * @param {number} [gain=1.0] - Cường độ âm thanh (tuyến tính, từ 0 đến 1). Mặc định là 1.0.
     */
    play(when, gain = 1.0) {
        if (!this.accentPlayer) {
            console.error('SoundLibrary: accentPlayer chưa được khởi tạo.');
            return;
        }

        if (!this.accentPlayer.loaded) {
            console.warn(`SoundLibrary: File accent '${WOODBLOCK_SOUND_PATH}' chưa tải xong. Âm thanh sẽ phát sau khi tải.`);
            // Tone.Player.start() sẽ tự động đợi file tải xong nếu chưa.
        }

        const playbackTime = when !== undefined ? when : Tone.now();
        // Đảm bảo gain là giá trị dương hợp lệ cho việc chuyển đổi sang dB
        const targetLinearGain = Math.max(0.00001, gain);
        const targetVolumeDb = Tone.gainToDb(targetLinearGain);

        // Lên lịch thay đổi âm lượng cho player tại thời điểm phát
        this.accentPlayer.volume.setValueAtTime(targetVolumeDb, playbackTime);

        // Bắt đầu phát âm thanh
        try {
            console.log('playbackTime', playbackTime)
            this.accentPlayer.start(playbackTime);
        } catch (e) {
            console.error(`SoundLibrary: Lỗi khi phát âm thanh accent:`, e);
        }
    }

    /**
     * Giải phóng tài nguyên đã sử dụng bởi Tone.Player.
     */
    dispose() {
        if (this.accentPlayer && !this.accentPlayer.disposed) {
            this.accentPlayer.dispose();
            console.log('SoundLibrary: accentPlayer đã được giải phóng.');
        }
    }
}

// Ví dụ sử dụng (giả sử AudioContext đã được mở khóa):
//
// async function main() {
//     await Tone.start(); // Cần tương tác người dùng để AudioContext chạy
//     console.log('AudioContext đã sẵn sàng.');
//
//     const soundLib = new SoundLibrary();
//
//     // Chờ một chút để file có thể tải (hoặc dựa vào onload callback)
//     setTimeout(() => {
//         // Phát ngay lập tức với âm lượng 0.8
//         console.log('Phát accent ngay lập tức.');
//         soundLib.playAccent(undefined, 0.8);
//
//         // Lên lịch phát sau 2 giây với âm lượng mặc định (1.0)
//         const scheduledTime = Tone.now() + 2.0;
//         console.log(`Lên lịch phát accent lúc: ${scheduledTime}`);
//         soundLib.playAccent(scheduledTime);
//
//         // Lên lịch phát sau 4 giây với âm lượng 0.5
//         const anotherScheduledTime = Tone.now() + 4.0;
//         console.log(`Lên lịch phát accent lúc: ${anotherScheduledTime} với gain 0.5`);
//         soundLib.playAccent(anotherScheduledTime, 0.5);
//
//     }, 1000); // Đợi 1 giây ví dụ
//
//     // Để dọn dẹp khi không cần nữa (ví dụ khi component unmount)
//     // setTimeout(() => soundLib.dispose(), 10000);
// }
//
// // Gọi main() sau khi người dùng tương tác, ví dụ click nút:
// // document.getElementById('myButton').addEventListener('click', main);
