<!-- src/lib/components/Footer.svelte -->

<script lang="ts">
	import Icon from '$lib/components/icons/Icon.svelte';
	import { page } from '$app/stores';

	const version = __APP_VERSION__;
	const author = __APP_AUTHOR__;
	const currentYear = new Date().getFullYear();

	$: ({ href, iconName, ariaLabel } =
		$page.url.pathname === '/settings'
			? { href: '/', iconName: 'sliders', ariaLabel: 'Back to Metronome' }
			: { href: '/settings', iconName: 'home', ariaLabel: 'Application Settings' });
</script>

<footer class="mt-auto text-center bg-black bg-opacity-10 app-footer">
	<span>v{version} &copy;{currentYear} {author}</span>

	{#key $page.url.pathname}
		<a {href} class="settings-link" aria-label={ariaLabel}>
			<Icon name={iconName} />
		</a>
	{/key}
</footer>

<style lang="scss">
  @use '$lib/styles/variables';

  .app-footer {
    padding: 10px 0;
    color: variables.$base-forefront;
    font-size: 0.75em;
    user-select: text;
    -webkit-user-select: text;

    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .settings-link {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);

    display: flex;
    align-items: center;
    justify-content: center;

    color: inherit;
    font-size: 1.3em;
    opacity: 0.6;
    transition:
            opacity 0.2s ease-in-out,
            transform 0.2s ease-in-out;

    &:hover {
      opacity: 1;
      transform: translateY(-50%) rotate(15deg);
    }
  }
</style>