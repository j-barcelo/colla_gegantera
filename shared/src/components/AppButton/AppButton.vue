<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'outline-light';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'outline-light',
  type: 'button',
  disabled: false,
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const buttonClasses = computed(() => ['c-btn', `c-btn--${props.variant}`]);
</script>

<template>
  <button :type="type" :class="buttonClasses" :disabled="disabled" @click="emit('click', $event)">
    <slot />
  </button>
</template>

<style lang="scss" src="./AppButton.scss"></style>
