<script>
    import '../styles/theme.scss';
</script>

<slot />

<style global>
    html, body {
        height: 100%;
        margin: 0;
        overscroll-behavior: none;
        touch-action: none;
    }

    body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
    }

</style>
