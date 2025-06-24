// src/lib/state/audioLoadingStore.ts

import { writable } from 'svelte/store';

export const isAudioLoading = writable<boolean>(true);