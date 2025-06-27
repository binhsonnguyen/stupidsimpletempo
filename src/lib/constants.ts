export const VALID_DIVISIONS = [1, 2, 3, 4, 6, 8] as const;
export type Division = typeof VALID_DIVISIONS[number];
export const MAX_BEATS = 8;

export const VALID_BEAT_INTERVALS = ['1m', '2n', '4n', '8n', '16n', '8t'] as const;
export type BeatInterval = (typeof VALID_BEAT_INTERVALS)[number];