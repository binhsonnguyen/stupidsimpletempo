// /src/container.js

// Domain
import { Metronome } from './domain/metronome.js'
import { createUseCases } from './domain/useCases.js'
import { createBeatSequence } from './domain/beatSequenceFactory.js'

// Application
import * as state from './application/state.js'
import * as presenter from './application/presenter.js'

// Infrastructure
import * as config from './infrastructure/config.js'
import { dom, initDomElements } from './infrastructure/ui/domElements.js'
import * as audioService from './infrastructure/audio/audioService.js'
import { wakeLockService } from './infrastructure/services/wakeLockService.js'

// UI Components
import { StartButton } from './infrastructure/ui/components/StartButton.js'
import { Dial } from './infrastructure/ui/components/Dial.js'

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