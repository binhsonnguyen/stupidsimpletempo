import {
    rotaryDialContainerElement,
    labelLayerElement,
    tickMarkLayerElement,
    dialTrackBorderLayerElement,
    startStopButtonElement,
    appVersionElement
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

    const trackBorderWidth = 5
    const radiusContentEquivalent = (layerWidth / 2) - trackBorderWidth

    const rotationOriginYForTicks = radiusContentEquivalent - config.TICK_INITIAL_TOP_OFFSET
    const radiusForLabels = radiusContentEquivalent - config.TICK_INITIAL_TOP_OFFSET - config.TICK_LARGE_HEIGHT - 10

    const marks = []

    // 1. Thêm vạch và nhãn "0 BPM" (tượng trưng)
    marks.push({
        bpm: config.BPM_VALUE_FOR_0_DEG_MARK,
        angle: config.ANGLE_FOR_0_BPM_MARK,
        type: 'large',
        needsLabel: true
    })

    // 2. Thêm vạch và nhãn cho MIN_SCALE_BPM
    marks.push({
        bpm: config.MIN_SCALE_BPM,
        angle: config.ANGLE_FOR_MIN_SCALE_BPM_MARK,
        type: 'large',
        needsLabel: true
    })

    // 3. Tính toán và thêm các vạch/nhãn trung gian giữa MIN_SCALE_BPM và MAX_SCALE_BPM
    const bpmScaleRange = config.MAX_SCALE_BPM - config.MIN_SCALE_BPM
    const angleScaleRange = config.ANGLE_FOR_MAX_SCALE_BPM_MARK - config.ANGLE_FOR_MIN_SCALE_BPM_MARK
    let effectiveDegreesPerBpmOnScale = 0

    if (bpmScaleRange > 0 && angleScaleRange !== 0) { // Đảm bảo khoảng hợp lệ để nội suy
        effectiveDegreesPerBpmOnScale = angleScaleRange / bpmScaleRange
    } else if (bpmScaleRange === 0 && angleScaleRange === 0) {
        // MIN và MAX là cùng một điểm, không cần vạch trung gian
    } else {
        console.warn("Kiểm tra lại cấu hình thang đo BPM trong config.js (khoảng BPM hoặc khoảng góc có vấn đề).")
    }

    if (bpmScaleRange > 0 && effectiveDegreesPerBpmOnScale !== 0) { // Chỉ vẽ vạch trung gian nếu có khoảng và có tỷ lệ hợp lệ
        // Vòng lặp từ điểm 5 BPM đầu tiên SAU MIN_SCALE_BPM, cho đến điểm 5 BPM cuối cùng TRƯỚC MAX_SCALE_BPM
        for (let bpmValue = config.MIN_SCALE_BPM + 5; bpmValue < config.MAX_SCALE_BPM; bpmValue += 5) {
            const angle = config.ANGLE_FOR_MIN_SCALE_BPM_MARK +
                (bpmValue - config.MIN_SCALE_BPM) * effectiveDegreesPerBpmOnScale

            const isLargeTick = (bpmValue % 10 === 0)
            const type = isLargeTick ? 'large' : 'small'

            // Các nhãn cho 60, 80, ... nhưng không trùng với MIN hoặc MAX đã được gán nhãn
            const needsLabelForIntermediate = isLargeTick &&
                bpmValue >= 60 &&
                (bpmValue % 20 === 0)
            // Không cần kiểm tra !== MIN/MAX vì vòng lặp đã loại trừ chúng

            marks.push({ bpm: bpmValue, angle: angle, type: type, needsLabel: needsLabelForIntermediate })
        }
    }

    // 4. Thêm vạch và nhãn cho MAX_SCALE_BPM (chỉ khi nó khác MIN_SCALE_BPM)
    if (config.MAX_SCALE_BPM !== config.MIN_SCALE_BPM || config.ANGLE_FOR_MAX_SCALE_BPM_MARK !== config.ANGLE_FOR_MIN_SCALE_BPM_MARK) {
        marks.push({
            bpm: config.MAX_SCALE_BPM,
            angle: config.ANGLE_FOR_MAX_SCALE_BPM_MARK,
            type: 'large',
            needsLabel: true
        })
    }

    // --- PHẦN DEBUG DOT (Giữ lại nếu bạn vẫn cần) ---
    // console.log('Kích thước Container (W, H):', layerWidth, layerHeight)
    // console.log('Tọa độ tâm Container (X, Y):', layerCenterX, layerCenterY)
    // const centerDot = document.createElement('div')
    // centerDot.id = 'debugCenterDot'
    // centerDot.style.position = 'absolute'
    // centerDot.style.width = '1px'
    // centerDot.style.height = '1px'
    // centerDot.style.backgroundColor = 'lime'
    // if (isNaN(layerCenterX) || isNaN(layerCenterY) || layerWidth === 0) {
    //     console.error('Lỗi tính toán tâm Container!')
    //     centerDot.style.left = '10px'
    //     centerDot.style.top = '10px'
    // } else {
    //     centerDot.style.left = `${layerCenterX}px`
    //     centerDot.style.top = `${layerCenterY}px`
    // }
    // centerDot.style.zIndex = '9999'
    // if (rotaryDialContainerElement) {
    //     rotaryDialContainerElement.appendChild(centerDot)
    // }
    // console.log('Đã thêm debugCenterDot (1px) vào DOM (con của container).')
    // --- KẾT THÚC PHẦN DEBUG DOT ---

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
            console.warn('displayAppVersion nhận được phiên bản không xác định hoặc rỗng.')
        }
    } else {
        console.error('Không tìm thấy phần tử appVersionElement trong DOM.')
    }
}