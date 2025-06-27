// src/lib/state/drumGlowStore.ts

import { writable } from 'svelte/store';
import {
	COLOR_GREEN_RGB,
	GLOW_ALPHA_STATIC,
	GLOW_SPREAD_STATIC
} from '$lib/config/chromaConstants';

export type DrumGlowState = {
	rgb: string;
	alpha: number;
	spread: number;
};

const initialState: DrumGlowState = {
	rgb: COLOR_GREEN_RGB,
	alpha: GLOW_ALPHA_STATIC,
	spread: GLOW_SPREAD_STATIC
};

export const drumGlowStore = writable<DrumGlowState>(initialState);