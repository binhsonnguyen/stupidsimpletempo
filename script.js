window.addEventListener('DOMContentLoaded', () => {
    const bpmInputElement = document.getElementById('bpm')
    const bpmDisplayElement = document.getElementById('bpm-display')
    const startStopButton = document.getElementById('startStopBtn')
    const visualBeatElement = document.querySelector('.visual-beat')
    const beatsPerMeasureSelectElement = document.getElementById('beatsPerMeasure')

    let audioContextInstance
    let currentBeatInMeasure = 0
    let beatsPerMeasureValue = 4
    let currentBpm = 120
    let isMetronomeRunning = false
    let schedulerTimerId = null
    let nextNoteTimestamp = 0.0
    const schedulerRunIntervalMs = 25.0
    const audioScheduleLookaheadSeconds = 0.1

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

    function scheduleAudioNote(beatNumber, time) {
        const oscillatorNode = audioContextInstance.createOscillator()
        const gainControlNode = audioContextInstance.createGain()

        oscillatorNode.connect(gainControlNode)
        gainControlNode.connect(audioContextInstance.destination)

        const accentFrequency = 880
        const regularFrequency = 440
        const accentGain = 0.8
        const regularGain = 0.5
        const noteDurationSeconds = 0.05

        if (beatNumber % beatsPerMeasureValue === 0) {
            oscillatorNode.frequency.setValueAtTime(accentFrequency, time)
            gainControlNode.gain.setValueAtTime(accentGain, time)
        } else {
            oscillatorNode.frequency.setValueAtTime(regularFrequency, time)
            gainControlNode.gain.setValueAtTime(regularGain, time)
        }

        oscillatorNode.start(time)
        oscillatorNode.stop(time + noteDurationSeconds)

        setTimeout(() => renderVisualBeat(beatNumber), (time - audioContextInstance.currentTime) * 1000)
    }

    function audioScheduler() {
        while (nextNoteTimestamp < audioContextInstance.currentTime + audioScheduleLookaheadSeconds && isMetronomeRunning) {
            scheduleAudioNote(currentBeatInMeasure, nextNoteTimestamp)

            const secondsPerBeat = 60.0 / currentBpm
            nextNoteTimestamp += secondsPerBeat

            currentBeatInMeasure++
            if (currentBeatInMeasure >= beatsPerMeasureValue) {
                currentBeatInMeasure = 0
            }
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
        currentBeatInMeasure = 0
        nextNoteTimestamp = audioContextInstance.currentTime + 0.05
        audioScheduler()
        startStopButton.textContent = 'Dừng'
        startStopButton.style.backgroundColor = '#e74c3c'
    }

    function stopMetronome() {
        if (!isMetronomeRunning) return
        isMetronomeRunning = false
        clearTimeout(schedulerTimerId)
        startStopButton.textContent = 'Bắt đầu'
        startStopButton.style.backgroundColor = '#3498db'
        visualBeatElement.classList.remove('active', 'accent')
    }

    function renderVisualBeat(beatNumber) {
        visualBeatElement.classList.remove('active', 'accent')
        void visualBeatElement.offsetWidth

        if (beatNumber % beatsPerMeasureValue === 0) {
            visualBeatElement.classList.add('accent')
        } else {
            visualBeatElement.classList.add('active')
        }
    }

    startStopButton.addEventListener('click', () => {
        if (!audioContextInstance) {
            if (!initializeAudioContext()) return
        }

        if (isMetronomeRunning) {
            stopMetronome()
        } else {
            startMetronome()
        }
    })

    bpmInputElement.addEventListener('input', () => {
        const newBpmValue = parseInt(bpmInputElement.value)
        const minBpm = 20
        const maxBpm = 300
        if (newBpmValue >= minBpm && newBpmValue <= maxBpm) {
            currentBpm = newBpmValue
            bpmDisplayElement.textContent = currentBpm
        }
    })
    bpmDisplayElement.textContent = bpmInputElement.value

    beatsPerMeasureSelectElement.addEventListener('change', () => {
        beatsPerMeasureValue = parseInt(beatsPerMeasureSelectElement.value)
        if (!isMetronomeRunning) {
            currentBeatInMeasure = 0
        }
    })
    beatsPerMeasureValue = parseInt(beatsPerMeasureSelectElement.value)
})