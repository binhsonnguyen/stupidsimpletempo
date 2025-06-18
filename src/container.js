// /src/container.js

// Domain
import { Metronome } from './core/domain/metronome.ts'
import { createUseCases } from './core/application/use-cases/useCases.js'
import { createBeatSequence } from './core/domain/beatSequenceFactory.ts'

// Application
import * as state from './application/state.js'
import * as presenter from './application/presenter.js'

// Infrastructure
import * as config from './infrastructure/config.js'
import { dom, initDomElements } from './ui/domElements.ts'
import * as audioService from './infrastructure/audio/audioService.js'
import { wakeLockService } from './infrastructure/services/wakeLockService.js'

// UI Components
import { StartButton } from './ui/components/StartButton.js'
import { Dial } from './ui/components/Dial.js'

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

export const dependencies = {
    // Domain
    metronome,
    useCases,
    // Application
    state,
    presenter,
    // Infrastructure
    config,
    dom,
    initDomElements,
    audioService,
    wakeLockService,
    // UI Components
    components: {
        StartButton,
        Dial
    }
}