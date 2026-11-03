<script setup lang="ts">
import { materialPaths, resolveStorageUrl } from '@shared';
import defaultAvatar from '@shared/assets/images/default-avatar.svg';
import { computed, ref } from 'vue';

interface Props {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'xl';
  editable?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  alt: 'Fotografia de perfil',
  size: 'xl',
  editable: false,
  disabled: false,
});

const emit = defineEmits<{
  selectFile: [file: File];
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);

const resolvedSrc = computed(() => resolveStorageUrl(props.src) || defaultAvatar);

const openFilePicker = (): void => {
  if (props.disabled) return;
  fileInputRef.value?.click();
};

const onFileChange = (event: Event): void => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';

  if (file) emit('selectFile', file);
};

defineExpose({
  openFilePicker,
});
</script>

<template>
  <div class="c-user-avatar" :class="`c-user-avatar--${size}`">
    <img :src="resolvedSrc" :alt="alt" class="c-user-avatar__img" />

    <template v-if="editable">
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="u-visually-hidden"
        aria-label="Seleccionar fotografia de perfil"
        :disabled="disabled"
        @change="onFileChange"
      />
      <button
        type="button"
        class="c-user-avatar__edit-badge"
        aria-label="Canviar la fotografia de perfil"
        :disabled="disabled"
        @click="openFilePicker"
      >
        <svg class="c-user-avatar__edit-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path :d="materialPaths.edit" />
        </svg>
      </button>
    </template>
  </div>
</template>

<style lang="scss" src="./UserAvatar.scss"></style>
