<script setup lang="ts">
import { IonContent, IonIcon, IonModal } from '@ionic/vue';
import { AppAlert, AppButton, AppInput, iconClose } from '@shared';
import type { UpdateProfileData, User } from '@shared/types/auth';
import { validators } from '@shared/utils/validators';
import { ref, watch } from 'vue';

interface Props {
  isOpen: boolean;
  user?: User | null;
  isSaving?: boolean;
  errorMessage?: string;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  isSaving: false,
  errorMessage: '',
  title: 'Editar dades personals',
});

const emit = defineEmits<{
  'update:isOpen': [value: boolean];
  close: [];
  save: [data: UpdateProfileData];
}>();

interface FormFields {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
}

const formData = ref<FormFields>({
  name: '',
  surname: '',
  email: '',
  phone: '',
  address: '',
});

const localError = ref('');

const validateName = validators.required('El nom és obligatori.');
const validateSurname = validators.required('Els cognoms són obligatoris.');
const validateEmail = validators.email();
const validatePhone = validators.phone();

const initFormData = (): void => {
  localError.value = '';
  if (!props.user) {
    formData.value = { name: '', surname: '', email: '', phone: '', address: '' };
    return;
  }

  formData.value = {
    name: props.user.name || '',
    surname: props.user.surname || '',
    email: props.user.email || '',
    phone: props.user.phone || '',
    address: props.user.address || '',
  };
};

watch(
  () => props.isOpen,
  (open) => {
    if (open) initFormData();
  },
  { immediate: true },
);

watch(
  () => props.user,
  () => {
    if (props.isOpen) initFormData();
  },
);

const handleClose = (): void => {
  emit('update:isOpen', false);
  emit('close');
};

const handleSubmit = (): void => {
  localError.value = '';

  const isPending = Boolean(props.user?.is_pending);
  const nameErr = isPending && !formData.value.name.trim() ? null : validateName(formData.value.name);
  const surnameErr = isPending && !formData.value.surname.trim() ? null : validateSurname(formData.value.surname);
  const emailErr = validateEmail(formData.value.email);
  const phoneErr = formData.value.phone ? validatePhone(formData.value.phone) : null;

  if (nameErr || surnameErr || emailErr || phoneErr) {
    localError.value = nameErr || surnameErr || emailErr || phoneErr || 'Revisa les dades del formulari.';
    return;
  }

  emit('save', {
    name: formData.value.name.trim(),
    surname: formData.value.surname.trim(),
    email: formData.value.email.trim(),
    phone: formData.value.phone.trim() || null,
    address: formData.value.address.trim() || null,
  });
};
</script>

<template>
  <ion-modal :is-open="isOpen" class="c-edit-user-modal" @did-dismiss="handleClose">
    <ion-content class="c-edit-user-modal__content">
      <div class="c-edit-user-modal__inner">
        <header class="c-edit-user-modal__header">
          <h2 id="edit-user-title" class="c-edit-user-modal__title">{{ title }}</h2>
          <button
            type="button"
            class="c-edit-user-modal__close"
            data-testid="close-modal-btn"
            aria-label="Tancar"
            @click="handleClose"
          >
            <ion-icon :icon="iconClose" aria-hidden="true" />
          </button>
        </header>

        <form class="c-edit-user-modal__form" @submit.prevent="handleSubmit">
          <AppAlert v-if="localError || errorMessage" variant="danger">
            {{ localError || errorMessage }}
          </AppAlert>

          <AppInput
            id="edit-user-name"
            v-model="formData.name"
            type="text"
            name="name"
            label="Nom"
            placeholder="Nom"
            :disabled="isSaving"
            :validator="validateName"
          />

          <AppInput
            id="edit-user-surname"
            v-model="formData.surname"
            type="text"
            name="surname"
            label="Cognoms"
            placeholder="Cognoms"
            :disabled="isSaving"
            :validator="validateSurname"
          />

          <AppInput
            id="edit-user-email"
            v-model="formData.email"
            type="email"
            name="email"
            autocomplete="email"
            label="Correu electrònic"
            placeholder="Correu electrònic"
            :disabled="isSaving"
            :validator="validateEmail"
          />

          <AppInput
            id="edit-user-phone"
            v-model="formData.phone"
            type="tel"
            name="phone"
            autocomplete="tel"
            label="Telèfon"
            placeholder="Telèfon"
            :disabled="isSaving"
            :validator="validatePhone"
          />

          <AppInput
            id="edit-user-address"
            v-model="formData.address"
            type="text"
            name="address"
            label="Adreça"
            placeholder="Adreça"
            :disabled="isSaving"
          />

          <div class="c-edit-user-modal__actions">
            <AppButton
              type="button"
              variant="outline-light"
              data-testid="cancel-btn"
              :disabled="isSaving"
              @click="handleClose"
            >
              Cancel·lar
            </AppButton>
            <AppButton type="submit" variant="outline-light" data-testid="save-btn" :disabled="isSaving">
              {{ isSaving ? 'Desant...' : 'Desar canvis' }}
            </AppButton>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-modal>
</template>

<style lang="scss" src="./EditUserModal.scss"></style>
