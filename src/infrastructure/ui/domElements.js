export const dom = {
    rotaryDialContainerElement: null,
    startStopButtonElement: null,
    rotaryKnobElement: null,
    labelLayerElement: null,
    tickMarkLayerElement: null,
    dialTrackBorderLayerElement: null,
    arcLayerElement: null,
    appVersionElement: null,
    dialAreaWrapperElement: null
}

export function initDomElements () {
    dom.rotaryDialContainerElement = document.getElementById('rotaryDialContainer')
    dom.startStopButtonElement = document.getElementById('startStopButton')
    dom.rotaryKnobElement = document.getElementById('rotaryKnob')
    dom.labelLayerElement = document.getElementById('labelLayer')
    dom.tickMarkLayerElement = document.getElementById('tickMarkLayer')
    dom.dialTrackBorderLayerElement = document.getElementById('dialTrackBorderLayer')
    dom.arcLayerElement = document.getElementById('arcLayer')
    dom.appVersionElement = document.getElementById('appVersion')
    dom.dialAreaWrapperElement = document.querySelector('.dial-area-wrapper')
}