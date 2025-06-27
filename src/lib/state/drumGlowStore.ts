// src/lib/state/drumGlowStore.ts

import { writable, derived, type Readable } from 'svelte/store';
import {
	COLOR_GREEN_RGB,
	GLOW_ALPHA_STATIC,
	GLOW_SPREAD_STATIC,
	GLOW_SPREAD_PULSE_MAX,
	SPREAD_OFFSET
} from '$lib/config/chromaConstants';

type RawGlowState = {
	rgb: string;
	alpha: number;
	spread: number;
};

export type DrumGlowState = RawGlowState & {
	baseIntensity: number;
};

const rawGlowStore = writable<RawGlowState>({
	rgb: COLOR_GREEN_RGB,
	alpha: GLOW_ALPHA_STATIC,
	spread: GLOW_SPREAD_STATIC
});

const derivedGlowStore = derived<typeof rawGlowStore, DrumGlowState>(
	rawGlowStore,
	($rawGlow) => {
		const adjustedSpread = $rawGlow.spread + SPREAD_OFFSET;
		const adjustedMaxSpread = GLOW_SPREAD_PULSE_MAX + SPREAD_OFFSET;
		const spreadFactor = adjustedMaxSpread > 0 ? adjustedSpread / adjustedMaxSpread : 0;

		const calculatedIntensity = spreadFactor * $rawGlow.alpha;

		return {
			...$rawGlow,
			baseIntensity: calculatedIntensity
		};
	}
);

export const drumGlowStore = {
	subscribe: derivedGlowStore.subscribe,
	setGlow: (rawState: RawGlowState) => {
		rawGlowStore.set(rawState);
	}
};