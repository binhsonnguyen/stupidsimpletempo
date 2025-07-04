<!-- src/lib/components/settings/CheckboxPill.svelte -->

<script lang="ts">
	let {
		id,
		name,
		value,
		label,
		checked = false,
		onchange
	} = $props<{
		id: string;
		name: string;
		value: string;
		label: string;
		checked?: boolean;
		onchange?: (event: Event) => void;
	}>();

	const isCircle = $derived(label.length === 1);
</script>

<div class="pill-option">
	<input
		type="checkbox"
		{id}
		{name}
		{value}
		{checked}
		{onchange}
	/>
	<label class="pill-label" class:is-circle={isCircle} for={id} data-text={label}>
		<span>{label}</span>
	</label>
</div>

<style lang="scss">
  @use '$lib/styles/variables';

  .pill-option {
    position: relative;
    font-size: 0.9rem;
    user-select: none;

    input[type='checkbox'] {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .pill-label {
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

      &.is-circle {
        --pill-size: 34px;
        width: var(--pill-size);
        height: var(--pill-size);
        padding: 0;
      }
    }
  }

  input[type='checkbox']:checked + .pill-label {
    background-color: variables.$primary-color;
    color: variables.$base-background;
    border-color: variables.$base-border-active;
  }

  input[type='checkbox']:checked + .pill-label span {
    font-weight: 600;
  }
</style>