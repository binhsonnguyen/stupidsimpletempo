// /src/container.ts

// Domain
import { Metronome } from './core/domain/metronome';
import { createUseCases, UseCasesInterface } from './core/application/use-cases/useCases'; // Import hàm và interface
import { BeatSignature, createBeatSequence } from './core/domain/beatSequenceFactory'; // Import hàm và type
import { Beat } from './core/domain/beat'; // Cần kiểu Beat cho AudioServiceModule

// Application
import * as state from './application/state'; // Vẫn là JS, cần định nghĩa interface
import * as presenter from './application/presenter'; // Vẫn là JS, cần định nghĩa interface

// Infrastructure
import * as config from './infrastructure/config'; // Import module config
import { dom, initDomElements } from './ui/domElements'; // Import object dom và hàm initDomElements
import * as audioService from './infrastructure/audio/audioService'; // Import module audioService
import { wakeLockService, WakeLockServiceInterface } from './infrastructure/services/wakeLockService'; // Import object và interface

// UI Components
import { StartButton } from './ui/components/startButton'; // Import class StartButton
import { Dial } from './ui/components/dial'; // Import class Dial

// --- Định nghĩa Interfaces cho các Module/Objects được đưa vào container ---

// Placeholder cho module state - Cần định nghĩa interface chính xác dựa trên nội dung của src/application/state.ts
interface StateModule {
    [key: string]: any; // Thay thế bằng các thuộc tính/phương thức thực tế của state
}

// Interface cho module presenter - Dựa trên cách sử dụng trong main.ts và giả định các export khác
// Interface này cần bao gồm cả các thuộc tính mà main.ts thêm vào đối tượng dependencies
// trước khi truyền cho các phương thức của presenter.
interface PresenterModule {
    initializePresenter: (deps: DependenciesWithUIComponents) => void; // Sử dụng interface mở rộng
    renderInitialUi: (deps: DependenciesWithUIComponents, version: string) => void; // Sử dụng interface mở rộng
    [key: string]: any; // Thay thế bằng các export thực tế của presenter
}

// Interface cho module config - Dựa trên các export trong config.ts
interface ConfigModule {
    SCHEDULER_RUN_INTERVAL_MS: number;
    AUDIO_SCHEDULE_LOOKAHEAD_SECONDS: number;
    ANGLE_FOR_0_BPM_MARK: number;
    ANGLE_FOR_MIN_SCALE_BPM_MARK: number;
    ANGLE_FOR_MAX_SCALE_BPM_MARK: number;
    MIN_SCALE_BPM: number;
    MAX_SCALE_BPM: number;
    OSCILLATOR_CONFIGS: { [key: string]: string };
    BEAT_OSCILLATOR_TYPE: string;
    ACCENT_BEAT_NOTE: string;
    ACCENT_BEAT_GAIN: number;
    REGULAR_BEAT_NOTE: string;
    REGULAR_BEAT_GAIN: number;
    DIAL_TICK_NOTE: string;
    DIAL_TICK_GAIN: number;
    DIAL_TICK_OSCILLATOR_TYPE: string;
    // Thêm bất kỳ export nào khác từ config.ts
}

// Interface cho object dom - Dựa trên cách sử dụng trong main.ts và giả định các export khác
interface DomElements {
    startStopButtonElement: Nullable<HTMLElement>;
    rotaryDialContainerElement: Nullable<HTMLElement>;
    labelLayerElement: Nullable<HTMLElement>;
    tickMarkLayerElement: Nullable<HTMLElement>;
    dialTrackBorderLayerElement: Nullable<HTMLElement>;
    arcLayerElement: Nullable<HTMLElement>;
    [key: string]: any; // Thay thế bằng các export thực tế của domElements.ts
}

// Interface cho module audioService - Dựa trên các export trong audioService.ts
interface AudioServiceModule {
    init: () => Promise<void>;
    playSequence: (params: {
        getBpm: () => number;
        isRunning: () => boolean;
        beatSequence: Beat;
    }) => boolean;
    stop: () => void;
    playAccentSound: (params: { gain?: number; when?: number; }) => boolean;
    [key: string]: any; // Thay thế bằng các export thực tế của audioService.ts
}

// --- Định nghĩa Interface chính cho đối tượng Dependencies (như được export từ container.ts) ---

export interface Dependencies {
    // Domain
    metronome: Metronome; // Instance của class Metronome
    useCases: UseCasesInterface; // Object được trả về bởi createUseCases
    createBeatSequence: (signature: BeatSignature) => Beat; // Hàm createBeatSequence

    // Application
    state: StateModule; // Object module state
    presenter: PresenterModule; // Object module presenter

    // Infrastructure
    config: ConfigModule; // Object module config
    dom: DomElements; // Object 'dom' được export từ domElements.ts
    initDomElements: () => Promise<void>; // Hàm 'initDomElements' được export từ domElements.ts
    audioService: AudioServiceModule; // Object module audioService
    wakeLockService: WakeLockServiceInterface; // Object 'wakeLockService' được export từ wakeLockService.ts

    // UI Components (các class constructor)
    components: {
        StartButton: typeof StartButton; // Constructor của class StartButton
        Dial: typeof Dial; // Constructor của class Dial
    };
}

// --- Định nghĩa một interface mở rộng cho Dependencies, bao gồm các thuộc tính được thêm vào trong main.ts ---
// Interface này được sử dụng bởi các thành phần (như Presenter) nhận đối tượng dependencies sau khi main.ts đã thêm các component UI vào.
interface DependenciesWithUIComponents extends Dependencies {
    startButton?: StartButton; // Instance của StartButton, được thêm vào trong main.ts
    dial?: Dial; // Instance của Dial, được thêm vào trong main.ts
}


// --- Khởi tạo và Export Dependencies ---

const metronome = new Metronome({
    initialBpm: config.MIN_SCALE_BPM,
    minBpm: config.MIN_SCALE_BPM,
    maxBpm: config.MAX_SCALE_BPM
});

// Các tham số truyền vào createUseCases đã được định kiểu trong useCases.ts
// Đảm bảo các object/module được truyền vào khớp với kiểu mong đợi.
const useCases = createUseCases({
    metronome, // Kiểu Metronome
    audioService, // Kiểu AudioServiceModule
    wakeLockService, // Kiểu WakeLockServiceInterface
    config, // Kiểu ConfigModule
    createBeatSequence // Kiểu (signature: BeatSignature) => Beat
});

export const dependencies: Dependencies = {
    // Domain
    metronome,
    useCases,
    createBeatSequence, // Bao gồm cả hàm createBeatSequence trong dependencies

    // Application
    // Ép kiểu tạm thời nếu state.ts và presenter.ts chưa được chuyển đổi hoặc định kiểu đầy đủ
    state: state as StateModule,
    presenter: presenter as PresenterModule,

    // Infrastructure
    config,
    dom,
    initDomElements,
    audioService,
    wakeLockService,

    // UI Components (các class constructor)
    components: {
        StartButton,
        Dial
    }
    // Các thuộc tính startButton và dial không được thêm vào đối tượng dependencies tại đây,
    // chúng được thêm vào sau trong main.ts. Chúng được đánh dấu là tùy chọn (?)
    // trong interface DependenciesWithUIComponents.
};