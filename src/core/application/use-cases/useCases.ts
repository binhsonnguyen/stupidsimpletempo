// /src/core/application/use-cases/useCases.ts
import { Metronome } from '../../domain/metronome';
import { Beat } from '../../domain/beat';
import { BeatSignature } from '../../domain/beatSequenceFactory';

interface AudioServiceInterface {
    playSequence: (params: {
        getBpm: () => number;
        isRunning: () => boolean;
        beatSequence: Beat; // Sử dụng kiểu Beat đã import
    }) => void;
    stop: () => void;
    // Thêm các phương thức khác nếu có
}

interface WakeLockServiceInterface {
    request: () => Promise<void> | void; // request có thể trả về Promise hoặc không
    release: () => void;
}

// Kiểu cho hàm createBeatSequence
type CreateBeatSequenceFunction = (signature: BeatSignature) => Beat;

// Kiểu cho đối tượng config (điều chỉnh nếu cần)
interface ConfigInterface {
    // Định nghĩa các thuộc tính của config ở đây
    // Ví dụ: defaultBpm?: number;
    [key: string]: any; // Cho phép các thuộc tính khác nếu chưa rõ
}

// Kiểu cho các tham số đầu vào của createUseCases
interface CreateUseCasesParams {
    metronome: Metronome;
    audioService: AudioServiceInterface;
    wakeLockService: WakeLockServiceInterface;
    config: ConfigInterface; // Sử dụng ConfigInterface
    createBeatSequence: CreateBeatSequenceFunction;
}

// Kiểu cho đối tượng trả về từ createUseCases
export interface UseCasesInterface {
    toggleMetronome: () => void;
    changeBpm: (bpm: number) => void;
}

export function createUseCases({
                                   metronome,
                                   audioService,
                                   wakeLockService,
                                   // config, // config không được sử dụng trong hàm, có thể bỏ qua nếu không cần thiết cho kiểu
                                   createBeatSequence,
                               }: CreateUseCasesParams): UseCasesInterface {
    /**
     * Bật hoặc tắt máy đếm nhịp.
     */
    function toggleMetronome(): void {
        metronome.toggle();

        if (metronome.isRunning) {
            const getBpm = (): number => metronome.bpm;
            const isRunning = (): boolean => metronome.isRunning;

            // 1. Dùng "nhà máy" để tạo ra chuỗi nhịp cơ bản
            const beatSequence: Beat = createBeatSequence('basic'); // Chỉ định kiểu cho beatSequence

            // 2. Cung cấp chuỗi nhịp này cho audioService
            audioService.playSequence({
                getBpm,
                isRunning,
                beatSequence,
            });

            // wakeLockService.request() có thể là async, nhưng ở đây không await
            // Nếu nó trả về Promise, bạn có thể muốn xử lý lỗi hoặc bỏ qua
            const requestPromise = wakeLockService.request();
            if (requestPromise instanceof Promise) {
                requestPromise.catch(err => console.warn('WakeLock request failed:', err));
            }

        } else {
            audioService.stop();
            wakeLockService.release();
        }
    }

    function changeBpm(bpm: number): void {
        metronome.bpm = bpm;
    }

    return {
        toggleMetronome,
        changeBpm,
    };
}