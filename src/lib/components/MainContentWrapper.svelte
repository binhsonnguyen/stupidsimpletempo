<!-- src/lib/components/MainContentWrapper.svelte -->

<script>
</script>

<div class="main-controlls-wrapper">
	<slot />
</div>

<style>
    .main-controlls-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
        width: 100%;
        padding: 0 15px;
    }
</style>