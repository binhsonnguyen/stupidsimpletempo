// src/lib/state/firstInteractionStore.ts
import { writable } from 'svelte/store';

const { subscribe, update } = writable<boolean>(false);

function recordFirstInteraction() {
	update((hasInteracted) => {
		if (!hasInteracted) {
			return true;
		}
		return hasInteracted;
	});
}

export const firstInteractionStore = {
	subscribe,
	recordFirstInteraction
};