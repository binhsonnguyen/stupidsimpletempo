// --- Import các module cốt lõi ---

// Domain
import { Metronome } from './domain/metronome.js'
import { createUseCases } from './domain/useCases.js'
import { createBeatSequence } from './domain/beatSequenceFactory.js'

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

// --- Khởi tạo các đối tượng gốc ---

const metronome = new Metronome({
    initialBpm: config.MIN_SCALE_BPM,
    minBpm: config.MIN_SCALE_BPM,
    maxBpm: config.MAX_SCALE_BPM
})

const useCases = createUseCases({
    metronome,
    audioService,
    wakeLockService,
    config,
    createBeatSequence
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
    wakeLockService
}

// --- Thực hiện các kết nối ban đầu ---
presenter.initializePresenter(dependencies)