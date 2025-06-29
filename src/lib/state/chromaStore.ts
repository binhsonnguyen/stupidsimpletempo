// src/lib/state/chromaStore.ts

import { writable, derived, type Readable } from 'svelte/store';
import { userInteractionStore } from './userInteractionFeedbackStore';
import {
	COLOR_OFF_RGB,
	GLOW_ALPHA_STATIC,
	GLOW_SPREAD_STATIC,
	GLOW_SPREAD_PULSE_MAX,
	SPREAD_OFFSET,
	GLOW_ALPHA_PULSE_MAX,
	COLOR_ON_RGB
} from '$lib/config/chromaConstants';

type RawGlowState = {
	rgb: string;
	alpha: number;
	spread: number;
};

export type GlowState = RawGlowState & {
	baseIntensity: number;
};

/**
 * Hàm trợ giúp tính toán GlowState đầy đủ (bao gồm cả baseIntensity)
 * từ một RawGlowState. Việc này giúp tập trung logic tính toán cường độ.
 * @param rawState Trạng thái thô với rgb, alpha, và spread.
 * @returns Đối tượng GlowState hoàn chỉnh.
 */
function calculateGlowState(rawState: RawGlowState): GlowState {
	const adjustedSpread = rawState.spread + SPREAD_OFFSET;
	const adjustedMaxSpread = GLOW_SPREAD_PULSE_MAX + SPREAD_OFFSET;
	const spreadFactor = adjustedMaxSpread > 0 ? adjustedSpread / adjustedMaxSpread : 0;
	const baseIntensity = spreadFactor * rawState.alpha;

	return {
		...rawState,
		baseIntensity
	};
}

function createGlowStore(initialState: RawGlowState) {
	const rawGlowStore = writable<RawGlowState>(initialState);
	const derivedGlowStore = derived(rawGlowStore, calculateGlowState);

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

// Định nghĩa trạng thái thô cho hiệu ứng phát sáng tối đa khi tương tác
const activeDialGlowState: RawGlowState = {
	rgb: COLOR_ON_RGB,
	alpha: GLOW_ALPHA_PULSE_MAX,
	spread: GLOW_SPREAD_PULSE_MAX
};

export const dialGlowStore = derived<
	[typeof drumGlowStore, typeof userInteractionStore],
	GlowState
>([drumGlowStore, userInteractionStore], ([$drumGlow, $isInteracting]) => {
	return $isInteracting ? calculateGlowState(activeDialGlowState) : $drumGlow;
});
