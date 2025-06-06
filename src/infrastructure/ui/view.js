import {
    rotaryDialContainerElement,
    labelLayerElement,
    tickMarkLayerElement,
    dialTrackBorderLayerElement,
    startStopButtonElement,
    appVersionElement,
    arcLayerElement
} from './domElements.js'
import * as config from '../config.js'

export function updateDialVisual(rotationAngle) {
    const transformValue = `rotate(${rotationAngle}deg)`
    if (labelLayerElement) {
        labelLayerElement.style.transform = transformValue
    }
    if (tickMarkLayerElement) {
        tickMarkLayerElement.style.transform = transformValue
    }
    if (dialTrackBorderLayerElement) {
        dialTrackBorderLayerElement.style.transform = transformValue
    }
    if (arcLayerElement) {
        arcLayerElement.style.transform = transformValue
    }
}

export function setButtonState(state) {
    if (!startStopButtonElement) return

    startStopButtonElement.classList.remove('on', 'off', 'loading')

    if (state === 'loading') {
        startStopButtonElement.classList.add('loading')
    } else if (state === true) {
        startStopButtonElement.classList.add('on')
    } else {
        startStopButtonElement.classList.add('off')
    }
}

export function createTickMarks() {
    if (!rotaryDialContainerElement || !tickMarkLayerElement || !labelLayerElement) return

    const referenceElementForSize = rotaryDialContainerElement
    const layerWidth = referenceElementForSize.offsetWidth
    const layerHeight = referenceElementForSize.offsetHeight
    const layerCenterX = layerWidth / 2
    const layerCenterY = layerHeight / 2
    const trackBorderWidth = 5
    const radiusContentEquivalent = (layerWidth / 2) - trackBorderWidth
    const rotationOriginYForTicks = radiusContentEquivalent - config.TICK_INITIAL_TOP_OFFSET
    const radiusForLabels = radiusContentEquivalent - config.TICK_INITIAL_TOP_OFFSET - config.TICK_LARGE_HEIGHT - 10

    const marks = []

    marks.push({
        bpm: config.BPM_VALUE_FOR_0_DEG_MARK,
        angle: config.ANGLE_FOR_0_BPM_MARK,
        type: 'large',
        needsLabel: true
    })

    marks.push({
        bpm: config.MIN_SCALE_BPM,
        angle: config.ANGLE_FOR_MIN_SCALE_BPM_MARK,
        type: 'large',
        needsLabel: true
    })

    const bpmScaleRange = config.MAX_SCALE_BPM - config.MIN_SCALE_BPM
    const angleScaleRange = config.ANGLE_FOR_MAX_SCALE_BPM_MARK - config.ANGLE_FOR_MIN_SCALE_BPM_MARK
    let effectiveDegreesPerBpmOnScale = 0

    if (bpmScaleRange > 0 && angleScaleRange !== 0) {
        effectiveDegreesPerBpmOnScale = angleScaleRange / bpmScaleRange
    } else if (!(bpmScaleRange === 0 && angleScaleRange === 0)) {
        console.warn("Kiểm tra lại cấu hình thang đo BPM trong config.js.")
    }

    if (bpmScaleRange > 0 && effectiveDegreesPerBpmOnScale !== 0) {
        for (let bpmValue = config.MIN_SCALE_BPM + 5; bpmValue < config.MAX_SCALE_BPM; bpmValue += 5) {
            const angle = config.ANGLE_FOR_MIN_SCALE_BPM_MARK +
                (bpmValue - config.MIN_SCALE_BPM) * effectiveDegreesPerBpmOnScale
            const isLargeTick = (bpmValue % 10 === 0)
            const type = isLargeTick ? 'large' : 'small'
            const needsLabelForIntermediate = isLargeTick &&
                bpmValue >= 60 &&
                (bpmValue % 20 === 0)
            marks.push({ bpm: bpmValue, angle: angle, type: type, needsLabel: needsLabelForIntermediate })
        }
    }

    if (config.MAX_SCALE_BPM !== config.MIN_SCALE_BPM || config.ANGLE_FOR_MAX_SCALE_BPM_MARK !== config.ANGLE_FOR_MIN_SCALE_BPM_MARK) {
        marks.push({
            bpm: config.MAX_SCALE_BPM,
            angle: config.ANGLE_FOR_MAX_SCALE_BPM_MARK,
            type: 'large',
            needsLabel: true
        })
    }

    marks.forEach(markInfo => {
        const tickElement = document.createElement('div')
        tickElement.classList.add('tick')

        let translateXValueForTick
        if (markInfo.type === 'large') {
            tickElement.classList.add('large-tick')
            tickElement.style.width = `${config.TICK_LARGE_WIDTH}px`
            tickElement.style.height = `${config.TICK_LARGE_HEIGHT}px`
            translateXValueForTick = `-${config.TICK_LARGE_WIDTH / 2}px`
        } else {
            tickElement.classList.add('small-tick')
            tickElement.style.width = `${config.TICK_SMALL_WIDTH}px`
            tickElement.style.height = `${config.TICK_SMALL_HEIGHT}px`
            translateXValueForTick = `-${config.TICK_SMALL_WIDTH / 2}px`
        }

        tickElement.style.top = `${config.TICK_INITIAL_TOP_OFFSET}px`
        tickElement.style.transformOrigin = `50% ${rotationOriginYForTicks}px`
        tickElement.style.transform = `translateX(${translateXValueForTick}) rotate(${markInfo.angle}deg)`
        if (tickMarkLayerElement) {
            tickMarkLayerElement.appendChild(tickElement)
        }

        if (markInfo.needsLabel) {
            const labelElement = document.createElement('div')
            labelElement.className = 'bpm-label'
            labelElement.textContent = markInfo.bpm.toString()
            const angleRad = (markInfo.angle - 90) * (Math.PI / 180)
            const labelX = layerCenterX + radiusForLabels * Math.cos(angleRad)
            const labelY = layerCenterY + radiusForLabels * Math.sin(angleRad)
            labelElement.style.left = `${labelX}px`
            labelElement.style.top = `${labelY}px`
            labelElement.style.transform = `translate(-50%, -50%) rotate(${markInfo.angle}deg)`
            if (labelLayerElement) {
                labelLayerElement.appendChild(labelElement)
            }
        }
    })
}

export function displayAppVersion(version) {
    if (appVersionElement) {
        if (typeof version !== 'undefined' && version) {
            appVersionElement.textContent = version
        } else {
            appVersionElement.textContent = 'N/A'
        }
    }
}
