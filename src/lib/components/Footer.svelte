<!-- src/lib/components/Footer.svelte -->

<script lang="ts">
	const version = __APP_VERSION__;
	const author = __APP_AUTHOR__;

	const currentYear = new Date().getFullYear();
</script>

<footer class="mt-auto text-center bg-black bg-opacity-10 app-footer">
	v{version} &copy;{currentYear} {author}
</footer>

<style>
    .app-footer {
        padding: 10px 0;
        color: #6c757d;
        font-size: 0.75em;
        user-select: text;
        -webkit-user-select: text;
    }
</style>