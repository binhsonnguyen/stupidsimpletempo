export class StartButton {
    /**
     * @param {object} options
     * @param {HTMLElement} options.element - Phần tử DOM của nút bấm.
     * @param {function} [options.onTap] - Hàm callback để thực thi khi được nhấn.
     */
    constructor ({ element, onTap = () => {} }) {
        if (!element) {
            throw new Error('StartButton component yêu cầu có một element.')
        }

        this.element = element
        this.onTap = onTap

        this._setupListeners()
    }

    // Phương thức "private" để cài đặt các trình lắng nghe sự kiện
    _setupListeners () {
        this.element.addEventListener('click', (event) => {
            this.onTap(event)
        })

        // Thêm 'touchstart' để phản hồi nhanh hơn trên mobile
        this.element.addEventListener('touchstart', (event) => {
            // Ngăn hành vi mặc định và "ghost click" có thể xảy ra trên mobile
            event.preventDefault()
            this.onTap(event)
        }, { passive: false })
    }

    /**
     * Thiết lập trạng thái giao diện của nút bấm.
     * @param {'on' | 'off' | 'loading' | 'error'} newState
     */
    setState (newState) {
        if (!this.element) return

        // Xóa tất cả các class trạng thái có thể có trước khi thêm class mới
        this.element.classList.remove('on', 'off', 'loading', 'error')

        if (['on', 'off', 'loading', 'error'].includes(newState)) {
            this.element.classList.add(newState)
        }
    }
}