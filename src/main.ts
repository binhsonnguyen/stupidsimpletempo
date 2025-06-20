// /src/main.ts

// Import các giá trị và kiểu cần thiết
import { APP_VERSION } from './version.js'; // Giả định version.js export APP_VERSION: string
import {
    dependencies,
    Dependencies, // Import interface Dependencies từ container.ts
    DependenciesWithUIComponents, // Import interface mở rộng
    DomElements, // Import interface cho dom
    AudioServiceModule, // Import interface cho audioService
    UseCasesInterface, // Import interface cho useCases
    PresenterModule, // Import interface cho presenter
} from './container'; // container.ts đã được chuyển đổi
import * as controller from './ui/controllers/controller'; // controller.ts đã được chuyển đổi
import { logger, setUiLogElement } from "./infrastructure/logger";
import * as Tone from 'tone'; // Tone.js có typings riêng (@types/tone)
import { StartButton } from './ui/components/startButton'; // StartButton.ts đã được chuyển đổi
import { Dial } from './ui/components/dial'; // Dial.ts đã được chuyển đổi

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Destructure dependencies với kiểu rõ ràng
const {
    dom,
    components,
    presenter,
    useCases,
    audioService,
} = dependencies as Dependencies; // Ép kiểu đối tượng dependencies ban đầu

// Khai báo các biến trạng thái với kiểu
let audioContextInprogress: boolean = false;
let activeAudioUnlockPromise: Promise<void> | undefined = undefined;

// Lắng nghe sự kiện DOMContentLoaded để khởi tạo ứng dụng
window.addEventListener('DOMContentLoaded', () => {
    const uiLogElement = document.getElementById('log-output');

    // Nếu ở chế độ dev VÀ tìm thấy phần tử log
    if (IS_DEVELOPMENT && uiLogElement instanceof HTMLElement) {
        // Thiết lập logger để ghi log ra UI
        setUiLogElement(uiLogElement, true);
        // Hiển thị phần tử log
        uiLogElement.style.display = 'block';
        logger.log('Development mode detected. UI logging enabled.'); // Dòng log này sẽ xuất hiện trên cả console và UI
    } else {
        // Đảm bảo UI logging bị tắt nếu không ở chế độ dev hoặc không tìm thấy phần tử
        setUiLogElement(null, false);
        if (uiLogElement instanceof HTMLElement) {
            uiLogElement.style.display = 'none'; // Đảm bảo nó bị ẩn
        }
    }

    // Chuỗi Promise để khởi tạo tuần tự
    dependencies.initDomElements() // initDomElements trả về Promise<void>
        .then(() => initializeApp()) // initializeApp trả về void (hoặc Promise<void>)
        .then(() => {
            // Khởi tạo AudioService và bắt đầu quá trình unlock AudioContext
            // audioService.init() trả về Promise<void>
            audioService.init();
            activeAudioUnlockPromise = unlockAudioContext(); // unlockAudioContext trả về Promise<void>
            activeAudioUnlockPromise.catch((err: any) => { // Bắt lỗi nếu unlock ban đầu thất bại (ví dụ: không có tương tác người dùng)
                logger.warn('Initial audio unlock promise rejected or timed out (no user interaction?):', err);
            });
            // Trả về promise unlock để chuỗi tiếp tục sau khi unlock (hoặc thất bại)
            return activeAudioUnlockPromise;
        })
        .then(registerServiceWorker) // registerServiceWorker trả về Promise<void>
        .then(requestWakeLock) // requestWakeLock trả về Promise<void>
        .catch((error: any) => { // Bắt bất kỳ lỗi nào trong chuỗi khởi tạo
            logger.error("Error during app initialization chain:", error);
        });
});

/**
 * Khởi tạo các thành phần UI và kết nối chúng.
 */
function initializeApp(): void {
    logger.log('initializeApp');

    // Tạo instance StartButton và gán vào dependencies (mở rộng)
    // dependencies.startButton sẽ có kiểu StartButton | undefined
    (dependencies as DependenciesWithUIComponents).startButton = new components.StartButton({
        element: dom.startStopButtonElement,
        onTap: () => {
            const audioCtx = Tone.getContext(); // Tone.getContext() trả về Tone.Context | null
            if (!audioCtx) {
                logger.error('AudioContext is null when StartButton tapped.');
                return;
            }

            if (audioCtx.state === 'running') {
                // Nếu AudioContext đang chạy, xử lý tap ngay lập tức
                controller.handleButtonTap({ useCases, presenter }); // useCases và presenter có kiểu đã định nghĩa
            } else if (audioCtx.state === 'suspended') {
                // Nếu AudioContext bị suspended (thường trên mobile trước tương tác người dùng)
                logger.log('StartButton tapped while audio suspended. Awaiting initial unlock.');
                if (!audioContextInprogress) {
                    // Nếu chưa có quá trình unlock nào đang diễn ra, bắt đầu một quá trình mới
                    audioContextInprogress = true;
                    // Chờ promise unlock ban đầu hoàn thành
                    if (activeAudioUnlockPromise) { // Kiểm tra promise không undefined
                        activeAudioUnlockPromise
                            .then(() => {
                                logger.log('Mobile audio unlocked (awaited by StartButton). Handling tap.');
                                controller.handleButtonTap({ useCases, presenter });
                            })
                            .catch((err: any) => logger.error('Start button: Error awaiting initial audio unlock:', err))
                            .finally(() => {
                                audioContextInprogress = false;
                            });
                    } else {
                        logger.error('Start button: activeAudioUnlockPromise is undefined.');
                        audioContextInprogress = false;
                    }
                } else {
                    // Nếu quá trình unlock đã diễn ra (do tap trước đó hoặc DOMContentLoaded), chỉ chờ nó hoàn thành
                    if (activeAudioUnlockPromise) { // Kiểm tra promise không undefined
                        activeAudioUnlockPromise
                            .then(() => {
                                logger.log('Mobile audio unlock already in progress (awaited by other). Handling StartButton tap post-unlock.');
                                controller.handleButtonTap({ useCases, presenter });
                            })
                            .catch((err: any) => logger.error('Start button: Error chaining to active audio unlock:', err));
                    } else {
                        logger.error('Start button: activeAudioUnlockPromise is undefined while in progress.');
                    }
                }
            } else {
                // Xử lý các trạng thái khác của AudioContext nếu cần
                logger.warn(`StartButton tapped with AudioContext in state: ${audioCtx.state}. Handling tap.`);
                controller.handleButtonTap({ useCases, presenter });
            }
        }
    });

    // Tạo instance Dial và gán vào dependencies (mở rộng)
    // dependencies.dial sẽ có kiểu Dial | undefined
    (dependencies as DependenciesWithUIComponents).dial = new components.Dial({
        element: dom.rotaryDialContainerElement, // dom.rotaryDialContainerElement nên là HTMLElement
        layersToRotate: [
            dom.labelLayerElement,
            dom.tickMarkLayerElement,
            dom.dialTrackBorderLayerElement,
            dom.arcLayerElement
        ], // Các element này nên là HTMLElement | null
        onDialChangeToNewBpmValue: (newValue: number | undefined) => { // newValue có kiểu number | undefined
            controller.handleDialChanged({ useCases, presenter }, newValue);
        }
    });

    // Khởi tạo presenter với đối tượng dependencies đã được mở rộng
    // presenter.initializePresenter cần nhận DependenciesWithUIComponents
    presenter.initializePresenter(dependencies as DependenciesWithUIComponents);
    // Render UI ban đầu
    // presenter.renderInitialUi cần nhận DependenciesWithUIComponents và string
    presenter.renderInitialUi(dependencies as DependenciesWithUIComponents, APP_VERSION);
}

/**
 * Đăng ký Service Worker.
 * @returns Promise<void>
 */
function registerServiceWorker(): Promise<void> {
    return new Promise<void>(resolve => { // Thêm kiểu generic cho Promise
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // URL constructor cần được xử lý đúng kiểu trong TS
                // new URL('./infrastructure/services/sw.ts', import.meta.url)
                // navigator.serviceWorker.register trả về Promise<ServiceWorkerRegistration>
                navigator.serviceWorker
                    .register(new URL('./infrastructure/services/sw.ts', import.meta.url))
                    .then(() => {
                        logger.log('Service worker has been registered.');
                        resolve();
                    })
                    .catch((error: any) => { // Bắt lỗi đăng ký
                        logger.error('Service worker registration failed:', error);
                        resolve(); // Vẫn resolve để chuỗi Promise tiếp tục ngay cả khi đăng ký thất bại
                    });
            });
        } else {
            logger.log('Service worker not supported.');
            resolve(); // Resolve ngay nếu không hỗ trợ
        }
    });
}

/**
 * Yêu cầu Wake Lock khi ứng dụng hiển thị và metronome đang chạy.
 * @returns Promise<void>
 */
function requestWakeLock(): Promise<void> {
    return new Promise<void>(resolve => { // Thêm kiểu generic cho Promise
        // Lắng nghe sự kiện thay đổi trạng thái hiển thị của tài liệu
        document.addEventListener('visibilitychange', () => {
            // Kiểm tra nếu metronome đang chạy VÀ tài liệu đang hiển thị
            if (dependencies.metronome.isRunning && document.visibilityState === 'visible') {
                // Kiểm tra wakeLockService tồn tại và yêu cầu wake lock
                // dependencies.wakeLockService có kiểu WakeLockServiceInterface
                // !!dependencies.wakeLockService là redundant nếu kiểu đã đúng, nhưng không gây hại
                if (dependencies.wakeLockService) {
                    dependencies.wakeLockService.request() // request() trả về Promise<void>
                        .catch((err: any) => logger.warn("Wake lock request failed:", err)); // Bắt lỗi yêu cầu
                } else {
                    logger.warn("Wake lock service not available.");
                }
            }
        });
        resolve(); // Resolve ngay lập tức vì listener đã được thêm
    });
}

/**
 * Mở khóa (resume) AudioContext sau tương tác người dùng.
 * @returns Promise<void>
 */
function unlockAudioContext(): Promise<void> {
    const ctx = Tone.getContext(); // Tone.getContext() trả về Tone.Context | null
    if (!ctx) {
        // Trả về Promise bị reject nếu AudioContext là null
        return Promise.reject(new Error("AudioContext is null"));
    }

    // Nếu AudioContext đang suspended, tạo Promise chờ tương tác
    return ctx.state === 'suspended' ? new Promise<void>((resolve, reject) => { // Thêm kiểu generic cho Promise
        const b = document.body; // b có kiểu HTMLBodyElement
        // Mảng các tên sự kiện
        const events: (keyof DocumentEventMap)[] = ["touchstart", "touchend", "mousedown", "keydown"]; // Sử dụng keyof DocumentEventMap

        let hasUnlocked: boolean = false; // Biến cờ để đảm bảo chỉ xử lý một lần

        // Hàm xử lý sự kiện tương tác
        const unlock = (event: Event) => { // event có kiểu Event
            if (hasUnlocked) return;

            // Kiểm tra lại trạng thái AudioContext
            if (ctx.state === 'suspended') {
                // Gọi Tone.start() để resume AudioContext
                Tone.start() // Tone.start() trả về Promise<void>
                    .then(() => {
                        hasUnlocked = true;
                        logger.log('AudioContext resumed successfully by user interaction.');
                        clean(); // Xóa các listener sau khi thành công
                        resolve(); // Resolve Promise
                    })
                    .catch((err: any) => { // Bắt lỗi resume
                        hasUnlocked = true;
                        logger.error('AudioContext resume failed:', err);
                        clean(); // Xóa các listener ngay cả khi thất bại
                        reject(err); // Reject Promise
                    });
            } else {
                // Nếu trạng thái không còn suspended (ví dụ: đã được resume bởi nơi khác), chỉ cần resolve
                hasUnlocked = true;
                logger.log(`AudioContext already in state: ${ctx.state}. No resume needed or possible.`);
                clean(); // Xóa các listener
                resolve(); // Resolve Promise
            }
        };

        // Hàm dọn dẹp: xóa các event listener
        const clean = () => {
            events.forEach(e => b.removeEventListener(e, unlock, false));
        };

        // Thêm các event listener vào body
        events.forEach(e => b.addEventListener(e, unlock, false));

        logger.log('unlockAudioContext: Event listeners added to body to await user interaction.');

    }) : Promise.resolve(); // Nếu AudioContext không suspended, trả về Promise đã resolve ngay lập tức
}