<script setup lang="ts">
import { IonContent, IonIcon, IonModal } from '@ionic/vue';
import { AppAlert, AppButton, AppInput, iconClose } from '@shared';
import type { UpdatePasswordData } from '@shared/types/auth';
import { validators } from '@shared/utils/validators';
import { ref, watch } from 'vue';

interface Props {
  isOpen: boolean;
  isSaving?: boolean;
  errorMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isSaving: false,
  errorMessage: '',
});

const emit = defineEmits<{
  'update:isOpen': [value: boolean];
  close: [];
  save: [data: UpdatePasswordData];
}>();

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const localError = ref('');

const validateOldPassword = validators.required('La contrasenya actual és obligatòria.');
const validateNewPassword = validators.password();
const validateConfirmPassword = validators.passwordConfirmation(
  () => newPassword.value,
  'La confirmació de la contrasenya no coincideix.',
);

const resetForm = (): void => {
  oldPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  localError.value = '';
};

watch(
  () => props.isOpen,
  (open) => {
    if (open) resetForm();
  },
  { immediate: true },
);

const handleClose = (): void => {
  resetForm();
  emit('update:isOpen', false);
  emit('close');
};

const handleSubmit = (): void => {
  localError.value = '';

  const oldErr = validateOldPassword(oldPassword.value);
  const newErr = validateNewPassword(newPassword.value);
  const confirmErr = validateConfirmPassword(confirmPassword.value);

  if (oldErr || newErr || confirmErr) {
    localError.value = oldErr || newErr || confirmErr || 'Revisa les dades de la contrasenya.';
    return;
  }

  emit('save', {
    current_password: oldPassword.value,
    password: newPassword.value,
    password_confirmation: confirmPassword.value,
  });
};
</script>

<template>
  <ion-modal :is-open="isOpen" class="c-change-password-modal" @did-dismiss="handleClose">
    <ion-content class="c-change-password-modal__content">
      <div class="c-change-password-modal__inner">
        <header class="c-change-password-modal__header">
          <h2 id="password-modal-title" class="c-change-password-modal__title">Modificar contrasenya</h2>
          <button
            type="button"
            class="c-change-password-modal__close"
            data-testid="close-modal-btn"
            aria-label="Tancar"
            @click="handleClose"
          >
            <ion-icon :icon="iconClose" aria-hidden="true" />
          </button>
        </header>

        <form class="c-change-password-modal__form" @submit.prevent="handleSubmit">
          <AppAlert v-if="localError || errorMessage" variant="danger">
            {{ localError || errorMessage }}
          </AppAlert>

          <AppInput
            id="modal-old-pass"
            v-model="oldPassword"
            type="password"
            name="current_password"
            autocomplete="current-password"
            label="Contrasenya actual"
            placeholder="Contrasenya actual"
            :disabled="isSaving"
            :validator="validateOldPassword"
          />

          <AppInput
            id="modal-new-pass"
            v-model="newPassword"
            type="password"
            name="password"
            autocomplete="new-password"
            label="Nova contrasenya (mínim 8 caràcters)"
            placeholder="Nova contrasenya (mínim 8 caràcters)"
            :disabled="isSaving"
            :validator="validateNewPassword"
          />

          <AppInput
            id="modal-confirm-pass"
            v-model="confirmPassword"
            type="password"
            name="password_confirmation"
            autocomplete="new-password"
            label="Confirma la nova contrasenya"
            placeholder="Confirma la nova contrasenya"
            :disabled="isSaving"
            :validator="validateConfirmPassword"
          />

          <div class="c-change-password-modal__actions">
            <AppButton
              type="button"
              variant="outline-light"
              data-testid="cancel-btn"
              :disabled="isSaving"
              @click="handleClose"
            >
              Cancel·lar
            </AppButton>
            <AppButton type="submit" variant="outline-primary" data-testid="save-btn" :disabled="isSaving">
              {{ isSaving ? 'Desant...' : 'Desar contrasenya' }}
            </AppButton>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-modal>
</template>

<style lang="scss" src="./ChangePasswordModal.scss"></style>
