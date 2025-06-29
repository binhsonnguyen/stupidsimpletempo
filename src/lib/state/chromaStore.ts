// src/lib/state/chromaStore.ts

import { writable, derived, type Readable } from 'svelte/store';
import {
	COLOR_OFF_RGB,
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

export type GlowState = RawGlowState & {
	baseIntensity: number;
};

function createGlowStore(initialState: RawGlowState) {
	const rawGlowStore = writable<RawGlowState>(initialState);

	const derivedGlowStore = derived<typeof rawGlowStore, GlowState>(rawGlowStore, ($rawGlow) => {
		const adjustedSpread = $rawGlow.spread + SPREAD_OFFSET;
		const adjustedMaxSpread = GLOW_SPREAD_PULSE_MAX + SPREAD_OFFSET;
		const spreadFactor = adjustedMaxSpread > 0 ? adjustedSpread / adjustedMaxSpread : 0;
		const calculatedIntensity = spreadFactor * $rawGlow.alpha;

		return {
			...$rawGlow,
			baseIntensity: calculatedIntensity
		};
	});

	return {
		subscribe: derivedGlowStore.subscribe,
		setGlow: (rawState: RawGlowState) => {
			rawGlowStore.set(rawState);
		},
		turnOff: () => {
			rawGlowStore.set(initialState);
		}
	};
}

export const drumGlowStore = createGlowStore({
	rgb: COLOR_OFF_RGB,
	alpha: GLOW_ALPHA_STATIC,
	spread: GLOW_SPREAD_STATIC
});

export const dialGlowStore = createGlowStore({
	rgb: COLOR_OFF_RGB,
	alpha: GLOW_ALPHA_STATIC,
	spread: GLOW_SPREAD_STATIC
});
