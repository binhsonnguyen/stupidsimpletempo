import { StartButton } from './startButton.js'

describe('StartButton Component', () => {
    let buttonElement
    let startButton

    // Hàm beforeEach sẽ chạy trước mỗi test case
    beforeEach(() => {
        // Tạo một phần tử button giả trong DOM ảo của Jest
        document.body.innerHTML = '<button id="test-button"></button>'
        buttonElement = document.getElementById('test-button')
    })

    test('phải khởi tạo thành công với một phần tử DOM', () => {
        startButton = new StartButton({ element: buttonElement })
        // Kiểm tra xem component có giữ đúng tham chiếu đến phần tử DOM không
        expect(startButton.element).toBe(buttonElement)
    })

    test('phải cập nhật class CSS đúng khi gọi setState', () => {
        startButton = new StartButton({ element: buttonElement })

        startButton.setState('on')
        expect(buttonElement.classList.contains('on')).toBe(true)
        expect(buttonElement.classList.contains('off')).toBe(false)

        startButton.setState('off')
        expect(buttonElement.classList.contains('off')).toBe(true)
        expect(buttonElement.classList.contains('on')).toBe(false)

        startButton.setState('loading')
        expect(buttonElement.classList.contains('loading')).toBe(true)
    })

    test('phải gọi callback onTap khi người dùng click', () => {
        // jest.fn() tạo ra một hàm giả (mock function) để chúng ta có thể theo dõi
        const onTapMock = jest.fn()

        startButton = new StartButton({
            element: buttonElement,
            onTap: onTapMock // Truyền hàm giả vào làm callback
        })

        // Giả lập một sự kiện click
        buttonElement.click()

        // Kiểm tra xem hàm giả của chúng ta đã được gọi hay chưa
        expect(onTapMock).toHaveBeenCalled()
        expect(onTapMock).toHaveBeenCalledTimes(1)
    })
})