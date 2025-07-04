<!-- src/lib/components/Footer.svelte -->

<script lang="ts">
	import Icon from '$lib/components/icons/Icon.svelte';
	import { page } from '$app/stores';

	const version = __APP_VERSION__;
	const author = __APP_AUTHOR__;
	const currentYear = new Date().getFullYear();

	let isAnimating = false;

	$: ({ href, iconName, ariaLabel } =
		$page.url.pathname === '/settings'
			? { href: '/', iconName: 'home', ariaLabel: 'Back to Metronome' }
			: { href: '/settings', iconName: 'sliders', ariaLabel: 'Application Settings' });

	function handleClick() {
		isAnimating = true;
	}

	function handleAnimationEnd() {
		isAnimating = false;
	}
</script>

<footer class="mt-auto text-center bg-black bg-opacity-10 app-footer">
	<span class="author-credit">
		v{version} &copy;{currentYear}
		<picture>
			<source srcset="/images/flg-vn-192.webp" type="image/webp" />
			<img src="/images/flg-vn-192.png" alt="Vietnamese Flag" class="flag-image" />
		</picture>
		{author}
	</span>

	{#key $page.url.pathname}
		<a
			{href}
			class="settings-link"
			class:is-animating={isAnimating}
			aria-label={ariaLabel}
			on:click={handleClick}
			on:animationend={handleAnimationEnd}
		>
			<Icon name={iconName} />
		</a>
	{/key}
</footer>

<style lang="scss">
  @use '$lib/styles/variables';

  @keyframes icon-click-wobble {
    0% {
      transform: translateY(-50%) rotate(0deg);
    }
    30% {
      transform: translateY(-50%) rotate(20deg);
    }
    60% {
      transform: translateY(-50%) rotate(-10deg);
    }
    100% {
      transform: translateY(-50%) rotate(0deg);
    }
  }

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

  .author-credit {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
  }

  .flag-image {
    height: 1em;
    width: auto;
    border-radius: 2px;
    display: block;
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
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 1;
    }

    &.is-animating {
      animation: icon-click-wobble 0.4s ease-in-out;
    }
  }
</style>