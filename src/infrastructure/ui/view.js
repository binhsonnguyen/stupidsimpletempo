import { dom } from './domElements.js'
import * as config from '../config.js'

export function updateDialVisual (rotationAngle) {
    const transformValue = `rotate(${rotationAngle}deg)`
    if (dom.labelLayerElement) {
        dom.labelLayerElement.style.transform = transformValue
    }
    if (dom.tickMarkLayerElement) {
        dom.tickMarkLayerElement.style.transform = transformValue
    }
    if (dom.dialTrackBorderLayerElement) {
        dom.dialTrackBorderLayerElement.style.transform = transformValue
    }
    if (dom.arcLayerElement) {
        dom.arcLayerElement.style.transform = transformValue
    }
}

export function setButtonState (state) {
    if (!dom.startStopButtonElement) return

    dom.startStopButtonElement.classList.remove('on', 'off', 'loading', 'error')

    if (state === 'loading' || state === 'error') {
        dom.startStopButtonElement.classList.add(state)
    } else if (state === true) {
        dom.startStopButtonElement.classList.add('on')
    } else {
        dom.startStopButtonElement.classList.add('off')
    }
}

export function createTickMarks () {
    if (!dom.rotaryDialContainerElement || !dom.tickMarkLayerElement || !dom.labelLayerElement) return

    const referenceElementForSize = dom.rotaryDialContainerElement
    const layerWidth = referenceElementForSize.offsetWidth
    const layerHeight = referenceElementForSize.offsetHeight
    const layerCenterX = layerWidth / 2
    const layerCenterY = layerHeight / 2
    const trackBorderWidth = 5
    const radiusContentEquivalent = (layerWidth / 2) - trackBorderWidth
    const rotationOriginYForTicks = (layerHeight / 2) - config.TICK_INITIAL_TOP_OFFSET
    const radiusForLabels = radiusContentEquivalent - config.TICK_INITIAL_TOP_OFFSET - config.TICK_LARGE_HEIGHT - config.LABEL_OFFSET_FROM_TICK

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
        console.warn('Kiểm tra lại cấu hình thang đo BPM trong config.js.')
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
        if (dom.tickMarkLayerElement) {
            dom.tickMarkLayerElement.appendChild(tickElement)
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
            if (dom.labelLayerElement) {
                dom.labelLayerElement.appendChild(labelElement)
            }
        }
    })
}

export function displayAppVersion (version) {
    if (dom.appVersionElement) {
        if (typeof version !== 'undefined' && version) {
            dom.appVersionElement.textContent = version
        } else {
            dom.appVersionElement.textContent = 'N/A'
        }
    }
}