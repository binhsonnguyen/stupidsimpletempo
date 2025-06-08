/**
 * Lấy hướng màn hình hiện tại bằng cách so sánh chiều rộng và chiều cao của cửa sổ.
 * Đây là phương pháp đáng tin cậy nhất trên các trình duyệt.
 * @returns {'portrait'|'landscape'}
 */
function getOrientation () {
    // Nếu chiều cao lớn hơn chiều rộng -> màn hình dọc
    if (window.innerHeight > window.innerWidth) {
        return 'portrait'
    }
    // Ngược lại -> màn hình ngang
    return 'landscape'
}

function onOrientationChange (callback) {
    // Vẫn có thể giữ lại listener cho resize vì nó cũng sẽ hoạt động khi xoay màn hình
    window.addEventListener('resize', callback)

    // API mới vẫn hữu ích trên mobile
    if (window.screen.orientation) {
        window.screen.orientation.addEventListener('change', callback)
    }
}

export const orientationService = {
    get: getOrientation,
    onChange: onOrientationChange
}