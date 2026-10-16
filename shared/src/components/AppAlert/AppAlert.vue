<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'light';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
});

const alertClasses = computed(() => ['c-alert', `c-alert--${props.variant}`]);
</script>

<template>
  <div :class="alertClasses" role="alert">
    <div v-if="$slots.icon" class="c-alert__icon">
      <slot name="icon" />
    </div>
    <div class="c-alert__content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" src="./AppAlert.scss"></style>
