import { Dial } from './dial.js'

describe('Dial Component', () => {
    let dialElement
    let labelLayer
    let tickMarkLayer
    // Thêm các layer khác nếu cần test kỹ hơn

    beforeEach(() => {
        // Tạo một cấu trúc DOM giả lập
        document.body.innerHTML = `
      <div id="dial-container">
        <div class="label-layer"></div>
        <div class="tick-mark-layer"></div>
      </div>
    `
        dialElement = document.getElementById('dial-container')
        labelLayer = dialElement.querySelector('.label-layer')
        tickMarkLayer = dialElement.querySelector('.tick-mark-layer')
    })

    test('phải khởi tạo đúng với phần tử DOM chính', () => {
        const dial = new Dial({ element: dialElement })
        expect(dial.element).toBe(dialElement)
    })

    test('phải có phương thức setRotation để cập nhật transform cho các layer', () => {
        // Để test phương thức này, ta cần truyền các layer vào constructor
        const dial = new Dial({
            element: dialElement,
            layers: [labelLayer, tickMarkLayer]
        })

        dial.setRotation(-90)

        expect(labelLayer.style.transform).toBe('rotate(-90deg)')
        expect(tickMarkLayer.style.transform).toBe('rotate(-90deg)')
    })
})