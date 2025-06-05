import { rotaryDialTrackElement, startStopButtonElement } from './domElements.js'
import * as config from './config.js'

export function updateDialVisual(rotationAngle) {
    rotaryDialTrackElement.style.transform = `rotate(${rotationAngle}deg)`
}

export function setButtonState(isRunning) {
    if (isRunning) {
        startStopButtonElement.classList.remove('off')
        startStopButtonElement.classList.add('on')
    } else {
        startStopButtonElement.classList.remove('on')
        startStopButtonElement.classList.add('off')
    }
}

export function createTickMarks() {
    const track = rotaryDialTrackElement
    const radiusContentBox = (track.offsetWidth / 2) - 5 // Giả sử border 5px
    const rotationOriginY = radiusContentBox - config.TICK_INITIAL_TOP_OFFSET

    const marks = []
    marks.push({ bpm: 0, angle: 0, type: 'large' })
    marks.push({ bpm: 40, angle: 40 * config.DEGREES_PER_BPM_VISUAL, type: 'large' })

    for (let bpmValue = 45; bpmValue <= 200; bpmValue += 5) {
        const angle = bpmValue * config.DEGREES_PER_BPM_VISUAL
        const type = (bpmValue % 10 === 0) ? 'large' : 'small'
        marks.push({ bpm: bpmValue, angle: angle, type: type })
    }

    marks.forEach(markInfo => {
        const tickElement = document.createElement('div')
        tickElement.classList.add('tick') // Class chung cho position: absolute, left: 50%

        let translateXValue

        if (markInfo.type === 'large') {
            tickElement.classList.add('large-tick') // Dùng class này chủ yếu cho background-color
            tickElement.style.width = `${config.TICK_LARGE_WIDTH}px`
            tickElement.style.height = `${config.TICK_LARGE_HEIGHT}px`
            translateXValue = `-${config.TICK_LARGE_WIDTH / 2}px`
        } else {
            tickElement.classList.add('small-tick') // Dùng class này chủ yếu cho background-color
            tickElement.style.width = `${config.TICK_SMALL_WIDTH}px`
            tickElement.style.height = `${config.TICK_SMALL_HEIGHT}px`
            translateXValue = `-${config.TICK_SMALL_WIDTH / 2}px`
        }

        // Đặt vị trí top từ config
        tickElement.style.top = `${config.TICK_INITIAL_TOP_OFFSET}px`

        // Đặt transform-origin và transform
        tickElement.style.transformOrigin = `50% ${rotationOriginY}px`
        tickElement.style.transform = `translateX(${translateXValue}) rotate(${markInfo.angle}deg)`

        track.appendChild(tickElement)
    })
}