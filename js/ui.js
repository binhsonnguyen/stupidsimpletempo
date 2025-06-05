// js/ui.js

import {
    rotaryDialContainerElement, // Cần để tính tâm chung nếu các layer không tự lấy offsetWidth
    labelLayerElement,
    tickMarkLayerElement,
    dialTrackBorderLayerElement,
    startStopButtonElement
} from './domElements.js'
import * as config from './config.js'

export function updateDialVisual(rotationAngle) {
    // Xoay các layer cần thiết
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
    // Giả sử tất cả các layer (label, tick, border) có cùng kích thước với container
    // và tâm của chúng trùng với tâm container.
    // Lấy kích thước từ một trong các layer hoặc container để tính tâm.
    // Vì các layer con (labelLayer, tickMarkLayer) được đặt width/height 100% so với container,
    // offsetWidth của chúng sẽ bằng offsetWidth của container.
    const referenceElementForSize = rotaryDialContainerElement // Hoặc labelLayerElement, tickMarkLayerElement

    const layerWidth = referenceElementForSize.offsetWidth
    const layerHeight = referenceElementForSize.offsetHeight

    const layerCenterX = layerWidth / 2
    const layerCenterY = layerHeight / 2

    // Bán kính để đặt các nhãn và điểm gốc xoay cho vạch, tính từ tâm của layer
    // config.TICK_INITIAL_TOP_OFFSET là khoảng cách từ mép trên của layer đến đỉnh vạch/nhãn
    const rotationOriginYForTicks = layerCenterY - config.TICK_INITIAL_TOP_OFFSET
    const radiusForLabels = layerCenterY - config.TICK_INITIAL_TOP_OFFSET - config.TICK_LARGE_HEIGHT - 10

    const marks = []
    marks.push({ bpm: 0, angle: 0, type: 'large', needsLabel: true })
    marks.push({ bpm: 40, angle: 40 * config.DEGREES_PER_BPM_VISUAL, type: 'large', needsLabel: true })

    for (let bpmValue = 45; bpmValue <= 200; bpmValue += 5) {
        const angle = bpmValue * config.DEGREES_PER_BPM_VISUAL
        const isLargeTick = (bpmValue % 10 === 0)
        const type = isLargeTick ? 'large' : 'small'
        const needsLabelForRange = isLargeTick && bpmValue >= 60 && (bpmValue % 20 === 0)
        marks.push({ bpm: bpmValue, angle: angle, type: type, needsLabel: needsLabelForRange })
    }

    marks.forEach(markInfo => {
        // --- Tạo Vạch Chia ---
        const tickElement = document.createElement('div')
        tickElement.classList.add('tick') // CSS: position: absolute; left: 50%;

        let translateXValueForTick
        if (markInfo.type === 'large') {
            tickElement.classList.add('large-tick') // CSS: background-color
            tickElement.style.width = `${config.TICK_LARGE_WIDTH}px`
            tickElement.style.height = `${config.TICK_LARGE_HEIGHT}px`
            translateXValueForTick = `-${config.TICK_LARGE_WIDTH / 2}px`
        } else {
            tickElement.classList.add('small-tick') // CSS: background-color
            tickElement.style.width = `${config.TICK_SMALL_WIDTH}px`
            tickElement.style.height = `${config.TICK_SMALL_HEIGHT}px`
            translateXValueForTick = `-${config.TICK_SMALL_WIDTH / 2}px`
        }

        tickElement.style.top = `${config.TICK_INITIAL_TOP_OFFSET}px`
        tickElement.style.transformOrigin = `50% ${rotationOriginYForTicks}px`
        tickElement.style.transform = `translateX(${translateXValueForTick}) rotate(${markInfo.angle}deg)`
        if (tickMarkLayerElement) { // Thêm vào layer vạch chia
            tickMarkLayerElement.appendChild(tickElement)
        }


        // --- Tạo Nhãn BPM (nếu cần) ---
        if (markInfo.needsLabel) {
            const labelElement = document.createElement('div')
            labelElement.className = 'bpm-label' // CSS: position: absolute, font, color, text-align etc.
            labelElement.textContent = markInfo.bpm.toString()

            const angleRad = (markInfo.angle - 90) * (Math.PI / 180)

            // labelX, labelY giờ đây được tính từ tâm của layer chứa nó
            const labelX = layerCenterX + radiusForLabels * Math.cos(angleRad)
            const labelY = layerCenterY + radiusForLabels * Math.sin(angleRad)

            labelElement.style.left = `${labelX}px`
            labelElement.style.top = `${labelY}px`
            labelElement.style.transform = `translate(-50%, -50%) rotate(${markInfo.angle}deg)`

            if (labelLayerElement) { // Thêm vào layer nhãn
                labelLayerElement.appendChild(labelElement)
            }
        }
    })
}