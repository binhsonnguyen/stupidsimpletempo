import {dependencies} from "../../container";

export function wakeLockServiceRequest() {
    if (dependencies.metronome.isRunning && document.visibilityState === 'visible') {
        dependencies.wakeLockService.request().then(() => { })
    }
}