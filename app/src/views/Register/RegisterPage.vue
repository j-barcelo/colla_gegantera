<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { AppAlert, AppButton, AppInput } from '@shared';
import { useAuth } from '@shared/composables/useAuth';
import { ApiError } from '@shared/utils/api';
import { alertCircleOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { register, isLoading } = useAuth();

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');

const nameError = ref('');
const emailError = ref('');
const passwordError = ref('');
const confirmationError = ref('');
const generalError = ref('');

const nameInputRef = ref<InstanceType<typeof AppInput> | null>(null);
const emailInputRef = ref<InstanceType<typeof AppInput> | null>(null);
const passwordInputRef = ref<InstanceType<typeof AppInput> | null>(null);
const confirmationInputRef = ref<InstanceType<typeof AppInput> | null>(null);

const validateName = (val: string): string => {
  if (!val.trim()) return "Has d'especificar el teu nom complet";
  return '';
};

const validateEmail = (val: string): string => {
  const trimmed = val.trim();
  if (!trimmed) return 'No has especificat cap usuari';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return 'El format del correu no és vàlid';

  return '';
};

const validatePassword = (val: string): string => {
  if (val.length < 8) return 'La contrasenya ha de tenir com a mínim 8 caràcters';
  return '';
};

const validateConfirmation = (val: string): string => {
  if (!val) return 'Confirma la contrasenya';
  if (password.value !== val) return 'Les contrasenyes no coincideixen';
  return '';
};

const onPasswordChange = (): void => {
  confirmationInputRef.value?.validateIfTouched();
};

const validateForm = (): boolean => {
  const isNameValid = nameInputRef.value?.validate() ?? false;
  const isEmailValid = emailInputRef.value?.validate() ?? false;
  const isPasswordValid = passwordInputRef.value?.validate() ?? false;
  const isConfirmationValid = confirmationInputRef.value?.validate() ?? false;

  return isNameValid && isEmailValid && isPasswordValid && isConfirmationValid;
};

const handleServerErrors = (err: unknown): void => {
  if (!(err instanceof ApiError)) {
    generalError.value = "No s'ha pogut connectar amb el servidor.";
    return;
  }

  if (err.errors) {
    nameError.value = err.errors.name?.[0] || '';
    emailError.value = err.errors.email?.[0] || '';
    passwordError.value = err.errors.password?.[0] || '';
    return;
  }

  generalError.value = err.message || 'Error en completar el registre.';
};

const handleRegister = async () => {
  generalError.value = '';

  if (!validateForm()) return;

  try {
    await register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      password_confirmation: passwordConfirmation.value,
      device_name: 'Ionic App',
    });

    await router.push('/tabs/tab1');
  } catch (err: unknown) {
    handleServerErrors(err);
  }
};
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true" class="c-login-content">
      <main class="c-login c-login--register">
        <header class="c-login__header">
          <figure class="c-login__brand">
            <img
              src="@shared/assets/images/logo-colla.svg"
              alt="Colla Gegantera"
              class="c-login__logo"
              width="300"
              height="125"
            />
            <figcaption class="u-visually-hidden">Colla Gegantera - App de gestió interna</figcaption>
          </figure>
        </header>

        <section class="c-login__body" aria-labelledby="register-heading">
          <h1 id="register-heading" class="u-visually-hidden">Crear un nou compte a la Colla</h1>

          <!-- Global alert if registration failed -->
          <AppAlert v-if="generalError" variant="danger">
            <template #icon>
              <ion-icon :icon="alertCircleOutline" aria-hidden="true" />
            </template>
            {{ generalError }}
          </AppAlert>

          <form class="c-login__form" @submit.prevent="handleRegister">
            <AppInput
              id="register-name"
              ref="nameInputRef"
              v-model="name"
              v-model:error="nameError"
              type="text"
              name="name"
              autocomplete="name"
              label="Nom i cognoms"
              placeholder="Nom i cognoms"
              :disabled="isLoading"
              :validator="validateName"
            />

            <AppInput
              id="register-email"
              ref="emailInputRef"
              v-model="email"
              v-model:error="emailError"
              type="email"
              name="email"
              autocomplete="email"
              label="Usuari / Correu electrònic"
              placeholder="Correu electrònic"
              :disabled="isLoading"
              :validator="validateEmail"
            />

            <AppInput
              id="register-password"
              ref="passwordInputRef"
              v-model="password"
              v-model:error="passwordError"
              type="password"
              name="password"
              autocomplete="new-password"
              label="Contrasenya (mínim 8 caràcters)"
              placeholder="Contrasenya (mínim 8 caràcters)"
              :disabled="isLoading"
              :validator="validatePassword"
              @update:model-value="onPasswordChange"
            />

            <AppInput
              id="register-password-confirmation"
              ref="confirmationInputRef"
              v-model="passwordConfirmation"
              v-model:error="confirmationError"
              type="password"
              name="password_confirmation"
              autocomplete="new-password"
              label="Confirma la contrasenya"
              placeholder="Confirma la contrasenya"
              :disabled="isLoading"
              :validator="validateConfirmation"
            />

            <div class="c-login__links-row">
              <router-link to="/login" class="c-login__link"> Ja tens compte? Inicia sessió </router-link>
            </div>

            <div class="c-login__btn-wrap">
              <AppButton type="submit" variant="outline-light" :disabled="isLoading">
                {{ isLoading ? 'CREANT COMPTE...' : 'REGISTRAR-SE' }}
              </AppButton>
            </div>
          </form>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<style lang="scss" src="./RegisterPage.scss"></style>
