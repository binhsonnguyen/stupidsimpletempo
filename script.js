window.addEventListener('DOMContentLoaded', () => {
    const rotaryDialContainerElement = document.getElementById('rotaryDialContainer')
    const rotaryDialTrackElement = document.getElementById('rotaryDialTrack')
    // const rotaryKnobElement = document.getElementById('rotaryKnob') // Hiện tại knob nằm trên track và xoay cùng track
    const startStopButtonElement = document.getElementById('startStopButton')
    const bpmValueElement = document.getElementById('bpmValueElement')

    let audioContextInstance
    let currentBpm = 120
    const minBpm = 20
    const maxBpm = 300
    let isMetronomeRunning = false
    let schedulerTimerId = null
    let nextNoteTimestamp = 0.0

    const schedulerRunIntervalMs = 25.0
    const audioScheduleLookaheadSeconds = 0.1

    let isDraggingDial = false
    let previousAngle = 0
    let currentDialRotation = 0 // Tổng độ xoay của dial visual

    function initializeAudioContext() {
        if (!audioContextInstance) {
            audioContextInstance = new (window.AudioContext || window.webkitAudioContext)()
            if (!audioContextInstance) {
                alert("Trình duyệt của bạn không hỗ trợ Web Audio API.")
                return false
            }
        }
        return true
    }

    function updateBpmDisplay() {
        bpmValueElement.textContent = currentBpm
    }

    function updateDialVisual() {
        rotaryDialTrackElement.style.transform = `rotate(${currentDialRotation}deg)`
    }

    function playClickSound(time) {
        if (!audioContextInstance) return

        const oscillatorNode = audioContextInstance.createOscillator()
        const gainControlNode = audioContextInstance.createGain()

        oscillatorNode.connect(gainControlNode)
        gainControlNode.connect(audioContextInstance.destination)

        oscillatorNode.type = 'sine' // Âm thanh click cơ bản
        oscillatorNode.frequency.setValueAtTime(660, time) // Tần số click
        gainControlNode.gain.setValueAtTime(0.6, time) // Âm lượng

        oscillatorNode.start(time)
        oscillatorNode.stop(time + 0.03) // Độ dài tiếng click rất ngắn
    }

    function audioScheduler() {
        while (nextNoteTimestamp < audioContextInstance.currentTime + audioScheduleLookaheadSeconds && isMetronomeRunning) {
            playClickSound(nextNoteTimestamp)
            const secondsPerBeat = 60.0 / currentBpm
            nextNoteTimestamp += secondsPerBeat
        }
        if (isMetronomeRunning) {
            schedulerTimerId = setTimeout(audioScheduler, schedulerRunIntervalMs)
        }
    }

    function startMetronome() {
        if (isMetronomeRunning) return
        if (!audioContextInstance && !initializeAudioContext()) return

        if (audioContextInstance.state === 'suspended') {
            audioContextInstance.resume()
        }

        isMetronomeRunning = true
        nextNoteTimestamp = audioContextInstance.currentTime + 0.05
        audioScheduler()
        startStopButtonElement.classList.remove('off')
        startStopButtonElement.classList.add('on')
    }

    function stopMetronome() {
        if (!isMetronomeRunning) return
        isMetronomeRunning = false
        clearTimeout(schedulerTimerId)
        startStopButtonElement.classList.remove('on')
        startStopButtonElement.classList.add('off')
    }

    function getAngle(clientX, clientY) {
        const rect = rotaryDialContainerElement.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        // Math.atan2 trả về giá trị trong khoảng -PI đến PI.
        // Chúng ta muốn 0-360 độ, với 0 ở trên cùng.
        const angleRad = Math.atan2(clientY - centerY, clientX - centerX) + Math.PI / 2
        let angleDeg = angleRad * 180 / Math.PI
        if (angleDeg < 0) {
            angleDeg += 360
        }
        return angleDeg
    }

    function handleDialInteractionStart(event) {
        event.preventDefault() // Ngăn hành vi mặc định như cuộn trang
        isDraggingDial = true
        rotaryDialContainerElement.style.cursor = 'grabbing'
        const clientX = event.touches ? event.touches[0].clientX : event.clientX
        const clientY = event.touches ? event.touches[0].clientY : event.clientY
        previousAngle = getAngle(clientX, clientY)
        // Không cần lưu initialBpm nữa, thay đổi sẽ là tương đối
    }

    function handleDialInteractionMove(event) {
        if (!isDraggingDial) return
        event.preventDefault()

        const clientX = event.touches ? event.touches[0].clientX : event.clientX
        const clientY = event.touches ? event.touches[0].clientY : event.clientY
        const currentAngle = getAngle(clientX, clientY)

        let deltaAngle = currentAngle - previousAngle

        // Xử lý việc xoay qua mốc 0/360 độ
        if (Math.abs(deltaAngle) > 180) { // Nếu thay đổi góc quá lớn, có thể là do xoay qua mốc
            deltaAngle = deltaAngle > 0 ? deltaAngle - 360 : deltaAngle + 360
        }

        // Điều chỉnh độ nhạy: mỗi độ xoay thay đổi bao nhiêu BPM
        // Ví dụ: 3 độ xoay = 1 BPM
        const sensitivityFactor = 3
        const bpmChange = Math.round(deltaAngle / sensitivityFactor)

        if (bpmChange !== 0) {
            let newBpm = currentBpm + bpmChange
            newBpm = Math.max(minBpm, Math.min(maxBpm, newBpm)) // Giới hạn BPM

            if (newBpm !== currentBpm) {
                currentBpm = newBpm
                updateBpmDisplay()
            }

            // Cập nhật vị trí xoay của dial visual
            currentDialRotation += deltaAngle // Xoay dial visual một cách tương đối
            updateDialVisual()
        }
        previousAngle = currentAngle
    }

    function handleDialInteractionEnd() {
        if (!isDraggingDial) return
        isDraggingDial = false
        rotaryDialContainerElement.style.cursor = 'grab'
    }

    // --- Khởi tạo & Gắn sự kiện ---
    updateBpmDisplay()
    updateDialVisual() // Đặt dial ở vị trí ban đầu
    startStopButtonElement.classList.add('off') // Trạng thái ban đầu là tắt

    startStopButtonElement.addEventListener('click', () => {
        if (!audioContextInstance) {
            if (!initializeAudioContext()) return
        }
        if (isMetronomeRunning) {
            stopMetronome()
        } else {
            startMetronome()
        }
    })

    // Sự kiện cho vòng xoay BPM
    rotaryDialContainerElement.addEventListener('mousedown', handleDialInteractionStart)
    document.addEventListener('mousemove', handleDialInteractionMove) // Lắng nghe trên document để kéo mượt hơn
    document.addEventListener('mouseup', handleDialInteractionEnd)

    rotaryDialContainerElement.addEventListener('touchstart', handleDialInteractionStart, { passive: false })
    document.addEventListener('touchmove', handleDialInteractionMove, { passive: false }) // passive: false để preventDefault hoạt động
    document.addEventListener('touchend', handleDialInteractionEnd)
    document.addEventListener('touchcancel', handleDialInteractionEnd)

})