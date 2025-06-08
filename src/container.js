// --- Import tất cả các module trong ứng dụng ---

// Domain
import { Metronome } from './domain/metronome.js'
import * as useCases from './domain/useCases.js'

// Application
import * as state from './application/state.js'
import * as presenter from './application/presenter.js'
import { initializeController } from './application/controller.js'

// Infrastructure
import * as config from './infrastructure/config.js'
import { dom, initDomElements } from './infrastructure/ui/domElements.js'
import * as view from './infrastructure/ui/view.js'
import * as audioService from './infrastructure/audio/audioService.js'
import { wakeLockService } from './infrastructure/services/wakeLockService.js'
import { panelService } from './infrastructure/ui/panelService.js'
import { initializePullToReveal } from './infrastructure/ui/gestureService.js'

// --- Khởi tạo các đối tượng gốc ---

const metronome = new Metronome({
    initialBpm: config.MIN_SCALE_BPM,
    minBpm: config.MIN_SCALE_BPM,
    maxBpm: config.MAX_SCALE_BPM
})

// --- Lắp ráp và export đối tượng dependencies ---

export const dependencies = {
    // Domain
    metronome,
    useCases,
    // Application
    state,
    presenter,
    initializeController,
    // Infrastructure
    config,
    dom,
    initDomElements,
    view,
    audioService,
    wakeLockService,
    panelService,
    initializePullToReveal
}

// --- Thực hiện các kết nối ban đầu ---
presenter.initializePresenter(dependencies)