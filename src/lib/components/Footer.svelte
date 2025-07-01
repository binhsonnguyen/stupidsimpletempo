<!-- src/lib/components/Footer.svelte -->

<script lang="ts">
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons';

	const version = __APP_VERSION__;
	const author = __APP_AUTHOR__;

	const currentYear = new Date().getFullYear();
</script>

<footer class="mt-auto text-center bg-black bg-opacity-10 app-footer">
	<span>v{version} &copy;{currentYear} {author}</span>
	<a href="/settings" class="settings-link" aria-label="Application Settings">
		<FontAwesomeIcon icon={faScrewdriverWrench} />
	</a>
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
    right: 20px;
    top: 50%;
    transform: translateY(-50%);

    color: inherit;
    font-size: 1.3em;
    opacity: 0.6;
    transition: opacity 0.2s ease-in-out,
    transform 0.2s ease-in-out;

    &:hover {
      opacity: 1;
      transform: translateY(-50%) rotate(15deg);
    }
  }
</style>