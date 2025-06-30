<!-- src/lib/components/Header.svelte -->

<header class="d-flex justify-content-center app-header">
	<picture>
		<source srcset="/images/logo.webp" type="image/webp" />
		<img
			class="app-logo"
			src="/images/logo.png"
			alt="Stupid Simple Tempo Logo"
			fetchpriority="high"
			width="750"
			height="128"
		/>
	</picture>
</header>

<style>
    .app-header {
        padding: 15px 0;
    }

    .app-logo {
        filter: invert(1);
        mix-blend-mode: screen;
        max-height: 40px;
        width: auto;
        height: auto;
    }
</style>
