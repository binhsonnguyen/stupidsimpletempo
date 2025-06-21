<!-- src/lib/components/Header.svelte -->

<header class="d-flex justify-content-center app-header">
    <img
            class="app-logo"
            src="/images/logo.png"
            alt="Stupid Simple Tempo Logo"
    />
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
    }
</style>