import { Metronome } from './domain/metronome.js'
import * as useCases from './domain/useCases.js'
import * as state from './application/state.js'
import { initializeController } from './application/controller.js'
import * as presenter from './application/presenter.js'
import * as config from './infrastructure/config.js'
import * as dom from './infrastructure/ui/domElements.js'
import * as view from './infrastructure/ui/view.js'
import * as audioService from './infrastructure/audio/audioService.js'
import { APP_VERSION } from './version.js'

const metronome = new Metronome({
    initialBpm: config.MIN_SCALE_BPM,
    minBpm: config.MIN_SCALE_BPM,
    maxBpm: config.MAX_SCALE_BPM
})

const wakeLockService = {
    sentinel: null,
    async request() {
        if ('wakeLock' in navigator && this.sentinel === null) {
            try {
                this.sentinel = await navigator.wakeLock.request('screen')
                this.sentinel.addEventListener('release', () => {
                    this.sentinel = null
                })
            } catch (err) {
                console.error(`${err.name}, ${err.message}`)
            }
        }
    },
    async release() {
        if (this.sentinel) {
            await this.sentinel.release()
            this.sentinel = null
        }
    }
}

const dependencies = {
    metronome,
    useCases,
    state,
    config,
    dom,
    view,
    presenter,
    audioService,
    wakeLockService
}

presenter.initializePresenter(dependencies)
initializeController(dependencies)

window.addEventListener('DOMContentLoaded', () => {
    audioService.initializeAudioContext()
    presenter.renderInitialUi(APP_VERSION, state.currentDialRotation)

    document.addEventListener('visibilitychange', () => {
        if (metronome.isRunning && document.visibilityState === 'visible') {
            wakeLockService.request()
        }
    })
})