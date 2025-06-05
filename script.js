window.addEventListener('DOMContentLoaded', () => {
    const bpmInput = document.getElementById('bpm');
    const bpmDisplay = document.getElementById('bpm-display');
    const startStopBtn = document.getElementById('startStopBtn');
    const visualBeat = document.querySelector('.visual-beat');
    const beatsPerMeasureSelect = document.getElementById('beatsPerMeasure');

    let audioContext;
    let currentBeatInMeasure = 0;
    let beatsPerMeasure = 4;
    let bpm = 120;
    let isRunning = false;
    let timerId = null; // Sẽ dùng cho việc lên lịch bằng setTimeout
    let nextNoteTime = 0.0; // Thời điểm nốt nhạc tiếp theo sẽ phát (trong AudioContext time)
    const lookahead = 25.0; // ms - Tần suất chạy hàm scheduler
    const scheduleAheadTime = 0.1; // seconds - Lên lịch trước bao xa

    // --- Khởi tạo AudioContext ---
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (!audioContext) {
                alert("Trình duyệt của bạn không hỗ trợ Web Audio API.");
                return false;
            }
        }
        return true;
    }

    // --- Lên lịch và phát âm thanh ---
    function scheduleNote(beatNumber, time) {
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Âm thanh cho phách mạnh (phách 1) và phách thường
        if (beatNumber % beatsPerMeasure === 0) { // Phách đầu tiên của ô nhịp
            osc.frequency.setValueAtTime(880, time); // A5
            gainNode.gain.setValueAtTime(0.8, time);
        } else { // Các phách khác
            osc.frequency.setValueAtTime(440, time); // A4
            gainNode.gain.setValueAtTime(0.5, time);
        }

        osc.start(time);
        osc.stop(time + 0.05); // Độ dài tiếng click

        // Cập nhật giao diện (gần với thời điểm âm thanh)
        setTimeout(() => updateVisualBeat(beatNumber), (time - audioContext.currentTime) * 1000);
    }

    function scheduler() {
        // Tiếp tục lên lịch các nốt nhạc khi chúng nằm trong cửa sổ thời gian dự kiến
        while (nextNoteTime < audioContext.currentTime + scheduleAheadTime && isRunning) {
            scheduleNote(currentBeatInMeasure, nextNoteTime);
            // Tính toán thời điểm nốt tiếp theo
            const secondsPerBeat = 60.0 / bpm;
            nextNoteTime += secondsPerBeat;

            // Tăng số đếm nhịp
            currentBeatInMeasure++;
            if (currentBeatInMeasure >= beatsPerMeasure) {
                currentBeatInMeasure = 0;
            }
        }
        if (isRunning) {
            timerId = setTimeout(scheduler, lookahead);
        }
    }

    // --- Điều khiển Metronome ---
    function startMetronome() {
        if (isRunning) return;
        if (!audioContext && !initAudio()) return; // Khởi tạo nếu chưa có
        if (audioContext.state === 'suspended') { // Người dùng cần tương tác để audio chạy
            audioContext.resume();
        }

        isRunning = true;
        currentBeatInMeasure = 0;
        nextNoteTime = audioContext.currentTime + 0.05; // Bắt đầu sau 1 khoảng trễ nhỏ
        scheduler(); // Bắt đầu vòng lặp lên lịch
        startStopBtn.textContent = 'Dừng';
        startStopBtn.style.backgroundColor = '#e74c3c';
    }

    function stopMetronome() {
        if (!isRunning) return;
        isRunning = false;
        clearTimeout(timerId);
        startStopBtn.textContent = 'Bắt đầu';
        startStopBtn.style.backgroundColor = '#3498db';
        visualBeat.classList.remove('active', 'accent');
    }

    // --- Cập nhật Giao diện ---
    function updateVisualBeat(beatNumber) {
        visualBeat.classList.remove('active', 'accent');
        // Thêm class active ngay lập tức để tạo hiệu ứng nhấp nháy
        void visualBeat.offsetWidth; // Trick để trigger reflow, cho phép animation chạy lại

        if (beatNumber % beatsPerMeasure === 0) {
            visualBeat.classList.add('accent');
        } else {
            visualBeat.classList.add('active');
        }
    }

    // --- Xử lý Sự kiện ---
    startStopBtn.addEventListener('click', () => {
        if (!audioContext) { // Đảm bảo AudioContext được tạo khi người dùng tương tác lần đầu
            if (!initAudio()) return;
        }

        if (isRunning) {
            stopMetronome();
        } else {
            startMetronome();
        }
    });

    bpmInput.addEventListener('input', () => {
        const newBpm = parseInt(bpmInput.value);
        if (newBpm >= 20 && newBpm <= 300) {
            bpm = newBpm;
            bpmDisplay.textContent = bpm;
            if (isRunning) { // Nếu đang chạy, cập nhật nhịp độ ngay
                // Việc thay đổi BPM khi đang chạy mượt mà hơn nếu không reset nextNoteTime
                // nhưng để đơn giản, ta có thể stop và start lại, hoặc chỉ cần điều chỉnh secondsPerBeat
                // trong vòng lặp scheduler (cần cẩn thận hơn).
                // Hiện tại, việc thay đổi BPM khi đang chạy sẽ có hiệu lực từ lần lên lịch tiếp theo.
            }
        }
    });
    bpmDisplay.textContent = bpmInput.value; // Hiển thị giá trị ban đầu

    beatsPerMeasureSelect.addEventListener('change', () => {
        beatsPerMeasure = parseInt(beatsPerMeasureSelect.value);
        if (!isRunning) { // Chỉ reset nếu không chạy để tránh lỗi
            currentBeatInMeasure = 0;
        }
    });
    beatsPerMeasure = parseInt(beatsPerMeasureSelect.value); // Lấy giá trị ban đầu
});