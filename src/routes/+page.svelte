<!-- src/routes/+page.svelte -->
<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import MainContentWrapper from '$lib/components/MainContentWrapper.svelte';
	import Dial from '$lib/components/dial/Dial.svelte';
	import TimeNotationSelector from '$lib/components/time-notation-selector/TimeNotationSelector.svelte';
</script>

<Header />

<main class="flex-grow-1 d-flex align-items-center justify-content-center">
	<MainContentWrapper>
		<div class="content-stack">
			<Dial />
			<div class="notation-container">
				<TimeNotationSelector />
			</div>
		</div>
	</MainContentWrapper>
</main>

<Footer />

<style>
    .content-stack {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    .notation-container {
        width: 100%;
        margin-top: 40px;
    }
</style>