window.addEventListener('DOMContentLoaded', () => {
    const rotaryDialContainerElement = document.getElementById('rotaryDialContainer')
    const rotaryDialTrackElement = document.getElementById('rotaryDialTrack')
    // rotaryKnobElement không cần tham chiếu trực tiếp trong JS nếu nó chỉ là phần tử con của track và xoay cùng track
    const startStopButtonElement = document.getElementById('startStopButton')

    let audioContextInstance
    let currentBpm = 120
    const minBpm = 20
    const maxBpm = 300 // Mặc dù vạch chỉ đến 200, logic điều khiển có thể cho phép cao hơn
    let isMetronomeRunning = false
    let schedulerTimerId = null
    let nextNoteTimestamp = 0.0

    const schedulerRunIntervalMs = 25.0
    const audioScheduleLookaheadSeconds = 0.1

    let isDraggingDial = false
    let previousAngle = 0
    let currentDialRotation = 0 // Độ xoay trực quan của dial track (và knob)

    // Hằng số cho vạch chia
    const DEGREES_PER_BPM_VISUAL = 1.2 // 240 độ / 200 BPM (từ 0 đến 200)

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

    function getAngleFromEvent(clientX, clientY) {
        const rect = rotaryDialContainerElement.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        // Điều chỉnh để 0 độ ở trên cùng (12 giờ) và tăng theo chiều kim đồng hồ
        const angleRad = Math.atan2(clientX - centerX, centerY - clientY) // Đảo y - centerY và x - centerX, sau đó điều chỉnh
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
        previousAngle = getAngleFromEvent(clientX, clientY)
    }

    function handleDialInteractionMove(event) {
        if (!isDraggingDial) return
        event.preventDefault()

        const clientX = event.touches ? event.touches[0].clientX : event.clientX
        const clientY = event.touches ? event.touches[0].clientY : event.clientY
        const currentAngle = getAngleFromEvent(clientX, clientY)

        let deltaAngle = currentAngle - previousAngle

        if (Math.abs(deltaAngle) > 180) { // Xử lý khi xoay qua mốc 0/360 độ
            deltaAngle = deltaAngle > 0 ? deltaAngle - 360 : deltaAngle + 360
        }

        // Điều chỉnh độ nhạy của vòng xoay BPM
        // Ví dụ: Mỗi 3 độ xoay thay đổi 1 BPM
        const sensitivityFactor = 3
        const bpmChange = Math.round(deltaAngle / sensitivityFactor)

        if (bpmChange !== 0) {
            let newBpm = currentBpm + bpmChange
            newBpm = Math.max(minBpm, Math.min(maxBpm, newBpm))

            if (newBpm !== currentBpm) {
                currentBpm = newBpm
                // Không còn updateBpmDisplay()
            }

            // Cập nhật góc xoay trực quan của dial track
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

    function createTickMarks() {
        const track = rotaryDialTrackElement
        const radiusContentBox = (track.offsetWidth / 2) - 5 // Bán kính vùng nội dung (trừ border)
        const tickInitialTopOffset = 5 // px, khoảng cách từ mép trong của track đến đỉnh vạch
        const rotationOriginY = radiusContentBox - tickInitialTopOffset

        const marks = []

        // Vạch lớn "0 BPM" (tham chiếu) tại 12h
        marks.push({ bpm: 0, angle: 0, type: 'large' })

        // Vạch lớn 40 BPM
        marks.push({ bpm: 40, angle: 40 * DEGREES_PER_BPM_VISUAL, type: 'large' })

        // Các vạch từ 45 BPM đến 200 BPM
        for (let bpmValue = 45; bpmValue <= 200; bpmValue += 5) {
            const angle = bpmValue * DEGREES_PER_BPM_VISUAL
            const type = (bpmValue % 10 === 0) ? 'large' : 'small'
            marks.push({ bpm: bpmValue, angle: angle, type: type })
        }

        marks.forEach(markInfo => {
            const tickElement = document.createElement('div')
            tickElement.classList.add('tick')

            let translateXValue = '-1px' // Mặc định cho vạch nhỏ (rộng 2px)
            if (markInfo.type === 'large') {
                tickElement.classList.add('large-tick')
                translateXValue = '-1.5px' // Cho vạch lớn (rộng 3px)
            } else {
                tickElement.classList.add('small-tick')
            }

            // CSS đã định nghĩa các thuộc tính cơ bản (top, width, height, background-color)
            // Giờ chỉ cần đặt transform-origin và transform (rotate)
            tickElement.style.transformOrigin = `50% ${rotationOriginY}px`
            tickElement.style.transform = `translateX(${translateXValue}) rotate(${markInfo.angle}deg)`

            track.appendChild(tickElement)
        })
    }

    // --- Khởi tạo & Gắn sự kiện ---
    updateDialVisual() // Đặt dial ở vị trí ban đầu (0 độ)
    startStopButtonElement.classList.add('off') // Trạng thái ban đầu là tắt
    createTickMarks() // Gọi hàm tạo vạch chia

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