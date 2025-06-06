export function toggleMetronome(metronome, audioService, wakeLockService) {
    metronome.toggle()

    if (metronome.isRunning) {
        audioService.start(metronome.bpm)
        wakeLockService.request()
    } else {
        audioService.stop()
        wakeLockService.release()
    }
}

export function changeBpmFromAngle(metronome, angleOnDial, config) {
    let newBpmCandidate
    const roundedAngle = Math.round(angleOnDial)

    const {
        ANGLE_FOR_0_BPM_MARK,
        ANGLE_FOR_MIN_SCALE_BPM_MARK,
        ANGLE_FOR_MAX_SCALE_BPM_MARK,
        MIN_SCALE_BPM,
        MAX_SCALE_BPM
    } = config

    if (roundedAngle === ANGLE_FOR_0_BPM_MARK || (roundedAngle === 360 && ANGLE_FOR_0_BPM_MARK === 0)) {
        return
    }

    if (angleOnDial > ANGLE_FOR_0_BPM_MARK && angleOnDial < ANGLE_FOR_MIN_SCALE_BPM_MARK) {
        newBpmCandidate = MIN_SCALE_BPM
    } else if (angleOnDial >= ANGLE_FOR_MIN_SCALE_BPM_MARK && angleOnDial <= ANGLE_FOR_MAX_SCALE_BPM_MARK) {
        const bpmScaleRange = MAX_SCALE_BPM - MIN_SCALE_BPM
        const angleScaleRange = ANGLE_FOR_MAX_SCALE_BPM_MARK - ANGLE_FOR_MIN_SCALE_BPM_MARK

        if (angleScaleRange === 0) {
            newBpmCandidate = MIN_SCALE_BPM
        } else {
            const percentageInAngleRange = (angleOnDial - ANGLE_FOR_MIN_SCALE_BPM_MARK) / angleScaleRange
            const calculatedBpm = MIN_SCALE_BPM + percentageInAngleRange * bpmScaleRange
            newBpmCandidate = Math.round(calculatedBpm)
        }
    } else {
        newBpmCandidate = MAX_SCALE_BPM
    }

    metronome.setBpm(newBpmCandidate)
}