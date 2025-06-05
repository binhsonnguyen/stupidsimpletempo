// js/ui.js

import {
    rotaryDialContainerElement,
    labelLayerElement,
    tickMarkLayerElement,
    dialTrackBorderLayerElement,
    startStopButtonElement
} from './domElements.js'
import * as config from './config.js'

export function updateDialVisual(rotationAngle) {
    if (labelLayerElement) {
        labelLayerElement.style.transform = `rotate(${rotationAngle}deg)`
    }
    if (tickMarkLayerElement) {
        tickMarkLayerElement.style.transform = `rotate(${rotationAngle}deg)`
    }
    if (dialTrackBorderLayerElement) {
        dialTrackBorderLayerElement.style.transform = `rotate(${rotationAngle}deg)`
    }
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
    const referenceElementForSize = rotaryDialContainerElement

    const layerWidth = referenceElementForSize.offsetWidth
    const layerHeight = referenceElementForSize.offsetHeight

    const layerCenterX = layerWidth / 2
    const layerCenterY = layerHeight / 2

    const trackBorderWidth = 5 // Giả sử border của dialTrackBorderLayer là 5px
    const radiusContentEquivalent = (layerWidth / 2) - trackBorderWidth // Bán kính tương đương vùng nội dung

    const rotationOriginYForTicks = radiusContentEquivalent - config.TICK_INITIAL_TOP_OFFSET
    const radiusForLabels = radiusContentEquivalent - config.TICK_INITIAL_TOP_OFFSET - config.TICK_LARGE_HEIGHT - 10

    const marks = []

    marks.push({
        bpm: config.BPM_VALUE_AT_0_DEG_MARK,
        angle: config.ANGLE_FOR_0_BPM_MARK,
        type: 'large',
        needsLabel: true
    })
    marks.push({
        bpm: config.BPM_VALUE_AT_40_DEG_MARK,
        angle: config.ANGLE_FOR_40_BPM_MARK,
        type: 'large',
        needsLabel: true
    })

    const bpmScaleStart = config.BPM_VALUE_AT_40_DEG_MARK
    const bpmScaleEnd = config.BPM_VALUE_AT_200_DEG_MARK
    const angleScaleStart = config.ANGLE_FOR_40_BPM_MARK
    const angleScaleEnd = config.ANGLE_FOR_200_BPM_MARK

    const bpmRange = bpmScaleEnd - bpmScaleStart
    const angleRange = angleScaleEnd - angleScaleStart
    let effectiveDegreesPerBpmOnScale = 0
    if (bpmRange !== 0) {
        effectiveDegreesPerBpmOnScale = angleRange / bpmRange
    }

    for (let bpmValue = bpmScaleStart + 5; bpmValue < bpmScaleEnd; bpmValue += 5) {
        const angle = angleScaleStart + (bpmValue - bpmScaleStart) * effectiveDegreesPerBpmOnScale
        const isLargeTick = (bpmValue % 10 === 0)
        const type = isLargeTick ? 'large' : 'small'
        const needsLabelForRange = isLargeTick && bpmValue >= 60 && (bpmValue % 20 === 0)
        marks.push({ bpm: bpmValue, angle: angle, type: type, needsLabel: needsLabelForRange })
    }

    marks.push({
        bpm: config.BPM_VALUE_AT_200_DEG_MARK,
        angle: config.ANGLE_FOR_200_BPM_MARK,
        type: 'large',
        needsLabel: true
    })

    // --- PHẦN DEBUG (Nếu bạn vẫn muốn giữ lại) ---
    console.log('Kích thước Container (W, H):', layerWidth, layerHeight)
    console.log('Tọa độ tâm Container (X, Y):', layerCenterX, layerCenterY)
    const centerDot = document.createElement('div')
    centerDot.id = 'debugCenterDot'
    centerDot.style.position = 'absolute'
    centerDot.style.width = '1px'
    centerDot.style.height = '1px'
    centerDot.style.backgroundColor = 'lime'
    if (isNaN(layerCenterX) || isNaN(layerCenterY) || layerWidth === 0) {
        console.error('Lỗi tính toán tâm Container!')
        centerDot.style.left = '10px'
        centerDot.style.top = '10px'
    } else {
        centerDot.style.left = `${layerCenterX}px`
        centerDot.style.top = `${layerCenterY}px`
    }
    centerDot.style.zIndex = '9999'
    if (rotaryDialContainerElement) {
        rotaryDialContainerElement.appendChild(centerDot)
    }
    console.log('Đã thêm debugCenterDot (1px) vào DOM (con của container).')
    // --- KẾT THÚC PHẦN DEBUG ---

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