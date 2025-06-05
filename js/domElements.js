// js/domElements.js

export const rotaryDialContainerElement = document.getElementById('rotaryDialContainer')
export const startStopButtonElement = document.getElementById('startStopButton')
export const rotaryKnobElement = document.getElementById('rotaryKnob')

// Tham chiếu đến các layer mới
export const labelLayerElement = document.getElementById('labelLayer')
export const tickMarkLayerElement = document.getElementById('tickMarkLayer')
export const dialTrackBorderLayerElement = document.getElementById('dialTrackBorderLayer')

// rotaryDialTrackElement cũ (nếu có) không còn được sử dụng trực tiếp với ý nghĩa cũ nữa,
// vai trò của nó đã được chia cho 3 layer trên.
// Nếu bạn vẫn dùng ID "rotaryDialTrack" cho một trong các layer mới này (ví dụ dialTrackBorderLayer),
// thì hãy đảm bảo tên biến tương ứng.
// Dựa trên HTML mới, chúng ta dùng các ID mới cho các layer.