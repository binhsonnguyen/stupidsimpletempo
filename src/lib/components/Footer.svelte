<!-- src/lib/components/Footer.svelte -->
<script>
	const currentYear = new Date().getFullYear();
</script>

<footer class="mt-auto text-center bg-black bg-opacity-10 app-footer">
	Stupid Simple Tempo ©{currentYear} Nguyen Binh Son
</footer>

<style>
	.app-footer {
		padding: 10px 0;
		color: #6c757d;
		font-size: 0.75em;
	}
</style>