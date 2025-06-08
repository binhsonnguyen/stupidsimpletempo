let panelElement = null
let isVisible = false

function show () {
    if (isVisible || !panelElement) return
    panelElement.classList.add('visible')
    isVisible = true
}

function hide () {
    if (!isVisible || !panelElement) return
    panelElement.classList.remove('visible')
    isVisible = false
}

function toggle () {
    if (isVisible) {
        hide()
    } else {
        show()
    }
}

function init (options) {
    if (!options.panelElement) {
        console.error('panelService.init thất bại: thiếu panelElement.')
        return
    }
    panelElement = options.panelElement
}

export const panelService = {
    init,
    show,
    hide,
    toggle
}