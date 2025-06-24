<script lang="ts">
	import '../styles/theme.scss';
	import { onDestroy } from 'svelte';
	import { BeatPlayer } from '$lib/audio/BeatPlayer';

	onDestroy(() => {
		BeatPlayer.disposeAll();
	});
</script>

<slot />
