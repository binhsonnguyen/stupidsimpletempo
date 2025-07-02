<!-- src/lib/components/settings/RadioPill.svelte -->

<script lang="ts">
	export let id: string;
	export let name: string;
	export let value: string;
	export let label: string;
	export let group: string;

	export let onPillClick: ((value: string) => void) | undefined = undefined;

	function handleClick() {
		if (onPillClick) {
			onPillClick(value);
		}
	}
</script>

<div class="radio-option" on:click={handleClick}>
	<input type="radio" {id} {name} {value} bind:group />
	<label class="radio-label" for={id} data-text={label}>
		<span>{label}</span>
	</label>
</div>

<style lang="scss">
  @use '$lib/styles/variables';

  .radio-option {
    position: relative;
    font-size: 0.9rem;

    input[type='radio'] {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .radio-label {
      position: relative;
      display: inline-block;
      padding: 5px 18px;
      border: 1px solid variables.$base-border;
      border-radius: 999px;
      background-color: transparent;
      color: variables.$base-forefront;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      text-transform: lowercase;
      user-select: none;

      &:hover {
        background-color: variables.$base-background-hover;
        color: variables.$base-forefront;
      }

      &::before {
        content: attr(data-text);
        display: block;
        font-weight: 600;
        visibility: hidden;
      }

      span {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: font-weight 0.1s;
      }
    }
  }

  input[type='radio']:checked + .radio-label {
    background-color: variables.$primary-color;
    color: variables.$base-background;
    border-color: variables.$base-border-active;
  }

  input[type='radio']:checked + .radio-label span {
    font-weight: 600;
  }
</style>