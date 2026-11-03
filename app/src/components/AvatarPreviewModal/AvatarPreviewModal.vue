<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar/UserAvatar.vue';
import { IonContent, IonIcon, IonModal } from '@ionic/vue';
import { AppAlert, AppButton, iconClose } from '@shared';

interface Props {
  isOpen: boolean;
  previewUrl: string;
  altText?: string;
  isLoading?: boolean;
  errorMessage?: string;
}

withDefaults(defineProps<Props>(), {
  altText: 'Previsualització de la imatge de perfil',
  isLoading: false,
  errorMessage: '',
});

const emit = defineEmits<{
  'update:isOpen': [value: boolean];
  close: [];
  'change-file': [];
  confirm: [];
}>();

const handleClose = (): void => {
  emit('update:isOpen', false);
  emit('close');
};
</script>

<template>
  <ion-modal :is-open="isOpen" class="c-avatar-preview-modal" @did-dismiss="handleClose">
    <ion-content class="c-avatar-preview-modal__content">
      <div class="c-avatar-preview-modal__inner">
        <header class="c-avatar-preview-modal__header">
          <h2 id="avatar-modal-title" class="c-avatar-preview-modal__title">Previsualització de la imatge</h2>
          <button type="button" class="c-avatar-preview-modal__close" aria-label="Tancar" @click="handleClose">
            <ion-icon :icon="iconClose" aria-hidden="true" />
          </button>
        </header>

        <div class="c-avatar-preview-modal__body">
          <AppAlert v-if="errorMessage" variant="danger">
            {{ errorMessage }}
          </AppAlert>

          <div class="c-avatar-preview-modal__preview-wrap">
            <UserAvatar :src="previewUrl" :alt="altText" size="xl" />
            <AppButton type="button" variant="outline-light" :disabled="isLoading" @click="emit('change-file')">
              Triar una altra imatge
            </AppButton>
          </div>

          <div class="c-avatar-preview-modal__actions">
            <AppButton type="button" variant="outline-light" :disabled="isLoading" @click="handleClose">
              Cancel·lar
            </AppButton>
            <AppButton type="button" variant="outline-light" :disabled="isLoading" @click="emit('confirm')">
              {{ isLoading ? 'Desant...' : 'Desar imatge' }}
            </AppButton>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<style lang="scss" src="./AvatarPreviewModal.scss"></style>

