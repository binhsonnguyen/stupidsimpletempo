<!-- src/lib/components/Dial.svelte -->

<script>
    import Drum from './Drum.svelte';
    import DialLabels from "$lib/components/DialLabels.svelte";
    import DialTickMark from "$lib/components/DialTickMark.svelte";
    import DialTrackBorder from "$lib/components/DialTrackBorder.svelte";

    // --- STATE (Trạng thái do Dial quản lý) ---

    let isRunning = false;
    /**
     * Góc xoay của các layer, tính bằng độ.
     * Đây là state quan trọng nhất điều khiển giao diện.
     */
    let rotationAngle = 0;

    // --- LOGIC (Các hàm xử lý sự kiện) ---

    function handleToggle() {
        console.log('Metronome on toggle');
        isRunning = !isRunning;
    }

    // Các hàm xử lý kéo-thả sẽ được phát triển ở đây.
    // Chúng sẽ tính toán và cập nhật giá trị `rotationAngle`.
    function handleDragStart(event) {
        console.log('Drag started on Dial');
        // TODO: Logic để bắt đầu theo dõi thao tác kéo
    }
</script>

<div
        class="dial-area-wrapper"
        on:mousedown={handleDragStart}
        on:touchstart={handleDragStart}
>
    <div class="dial-container-outer">
        <div id="rotaryDialContainer" class="rotary-dial-container">
            <DialLabels rotationAngle="{rotationAngle}"/>
            <DialTickMark rotationAngle="{rotationAngle}"/>
            <DialTrackBorder/>

            <!-- Mặt trống -->
            <Drum {isRunning} onToggle={handleToggle} />
        </div>
    </div>
</div>

<style>
    .dial-area-wrapper {
        flex-grow: 1;
        min-height: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: grab;
        transition: min-height 0.35s ease-in-out;
        /* Quan trọng: Ngăn các hành vi mặc định của trình duyệt khi kéo */
        touch-action: none;
        user-select: none;
    }

    .dial-area-wrapper:active {
        cursor: grabbing;
    }

    .dial-container-outer {
        flex-shrink: 0;
        width: 300px;
        height: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .rotary-dial-container {
        position: relative;
        width: 250px;
        height: 250px;
        border-radius: 50%;
    }
</style>