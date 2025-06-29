<!-- src/routes/+page.svelte -->
<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import MainContentWrapper from '$lib/components/MainContentWrapper.svelte';
	import Dial from '$lib/components/dial/Dial.svelte';
	import TimeSignatureSwitcher from '$lib/components/time-signature/TimeSignatureSwitcher.svelte';

	const pageTitle = 'Tempo';
	const pageDescription =
		'Stupid Simple Tempo - A Free Online Metronome - A clean, simple, and accurate online metronome for musicians. Set tempo, time signature, and subdivisions with ease. No ads, no clutter. Just tempo.';
	const canonicalUrl = 'https://stupidsimpletempo.com';
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:title" content="Stupid Simple Tempo" />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	 <meta property="og:image" content="{canonicalUrl}/images/preview.png" />
</svelte:head>

<Header />

<main class="flex-grow-1 d-flex align-items-center justify-content-center">
	<MainContentWrapper>
		<div class="content-stack">
			<Dial />
			<div class="notation-container">
				<TimeSignatureSwitcher />
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