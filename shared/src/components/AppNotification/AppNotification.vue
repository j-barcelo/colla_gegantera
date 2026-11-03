<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import type { NotificationVariant } from '../../composables/useNotification';
import { materialPaths } from '../../icons';

interface Props {
  id?: string;
  title?: string;
  message: string;
  duration?: number;
  variant?: NotificationVariant;
  dismissible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  id: '',
  title: '',
  duration: 4000,
  variant: 'dark',
  dismissible: true,
});

const emit = defineEmits<{
  close: [id: string];
}>();

let timer: ReturnType<typeof setTimeout> | null = null;
const isClosing = ref(false);

const handleClose = (): void => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  isClosing.value = true;
  emit('close', props.id);
};

onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      handleClose();
    }, props.duration);
  }
});

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<template>
  <output
    class="c-notification"
    :class="`c-notification--${variant}`"
    :style="{ '--notification-duration': `${duration}ms` }"
  >
    <div class="c-notification__body">
      <div class="c-notification__content">
        <h3 v-if="title" class="c-notification__title">{{ title }}</h3>
        <p class="c-notification__message">{{ message }}</p>
      </div>

      <button
        v-if="dismissible"
        type="button"
        class="c-notification__close"
        aria-label="Tancar notificació"
        @click="handleClose"
      >
        <svg class="c-notification__close-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path :d="materialPaths.close" />
        </svg>
      </button>
    </div>

    <div v-if="duration > 0" class="c-notification__progress-track">
      <div class="c-notification__progress-bar" />
    </div>
  </output>
</template>

<style lang="scss" src="./AppNotification.scss"></style>
