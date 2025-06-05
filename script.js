window.addEventListener('DOMContentLoaded', () => {
    const rotaryDialContainerElement = document.getElementById('rotaryDialContainer')
    const rotaryDialTrackElement = document.getElementById('rotaryDialTrack')
    const startStopButtonElement = document.getElementById('startStopButton')
    // const bpmValueElement = document.getElementById('bpmValueElement') // BIẾN NÀY KHÔNG CÒN NỮA

    let audioContextInstance
    let currentBpm = 120 // Giá trị BPM ban đầu vẫn được giữ lại và điều chỉnh
    const minBpm = 20
    const maxBpm = 300
    let isMetronomeRunning = false
    let schedulerTimerId = null
    let nextNoteTimestamp = 0.0

    const schedulerRunIntervalMs = 25.0
    const audioScheduleLookaheadSeconds = 0.1

    let isDraggingDial = false
    let previousAngle = 0
    let currentDialRotation = 0

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

    // function updateBpmDisplay() { // HÀM NÀY KHÔNG CÒN NỮA
    //     bpmValueElement.textContent = currentBpm
    // }

    function updateDialVisual() {
        rotaryDialTrackElement.style.transform = `rotate(${currentDialRotation}deg)`
    }

    function playClickSound(time) {
        if (!audioContextInstance) return

        const oscillatorNode = audioContextInstance.createOscillator()
        const gainControlNode = audioContextInstance.createGain()

        oscillatorNode.connect(gainControlNode)
        gainControlNode.connect(audioContextInstance.destination)

        oscillatorNode.type = 'sine'
        oscillatorNode.frequency.setValueAtTime(660, time)
        gainControlNode.gain.setValueAtTime(0.6, time)

        oscillatorNode.start(time)
        oscillatorNode.stop(time + 0.03)
    }

    function audioScheduler() {
        while (nextNoteTimestamp < audioContextInstance.currentTime + audioScheduleLookaheadSeconds && isMetronomeRunning) {
            playClickSound(nextNoteTimestamp)
            // Logic tính toán secondsPerBeat vẫn sử dụng currentBpm
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
        const angleRad = Math.atan2(clientY - centerY, clientX - centerX) + Math.PI / 2
        let angleDeg = angleRad * 180 / Math.PI
        if (angleDeg < 0) {
            angleDeg += 360
        }
        return angleDeg
    }

    function handleDialInteractionStart(event) {
        event.preventDefault()
        isDraggingDial = true
        rotaryDialContainerElement.style.cursor = 'grabbing'
        const clientX = event.touches ? event.touches[0].clientX : event.clientX
        const clientY = event.touches ? event.touches[0].clientY : event.clientY
        previousAngle = getAngle(clientX, clientY)
    }

    function handleDialInteractionMove(event) {
        if (!isDraggingDial) return
        event.preventDefault()

        const clientX = event.touches ? event.touches[0].clientX : event.clientX
        const clientY = event.touches ? event.touches[0].clientY : event.clientY
        const currentAngle = getAngle(clientX, clientY)

        let deltaAngle = currentAngle - previousAngle

        if (Math.abs(deltaAngle) > 180) {
            deltaAngle = deltaAngle > 0 ? deltaAngle - 360 : deltaAngle + 360
        }

        const sensitivityFactor = 3
        const bpmChange = Math.round(deltaAngle / sensitivityFactor)

        if (bpmChange !== 0) {
            let newBpm = currentBpm + bpmChange
            newBpm = Math.max(minBpm, Math.min(maxBpm, newBpm))

            if (newBpm !== currentBpm) {
                currentBpm = newBpm
                // updateBpmDisplay() // Lệnh gọi hàm này đã bị xóa
            }

            currentDialRotation += deltaAngle
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
    // updateBpmDisplay() // Lệnh gọi hàm này đã bị xóa
    updateDialVisual()
    startStopButtonElement.classList.add('off')

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

    rotaryDialContainerElement.addEventListener('mousedown', handleDialInteractionStart)
    document.addEventListener('mousemove', handleDialInteractionMove)
    document.addEventListener('mouseup', handleDialInteractionEnd)

    rotaryDialContainerElement.addEventListener('touchstart', handleDialInteractionStart, { passive: false })
    document.addEventListener('touchmove', handleDialInteractionMove, { passive: false })
    document.addEventListener('touchend', handleDialInteractionEnd)
    document.addEventListener('touchcancel', handleDialInteractionEnd)
})