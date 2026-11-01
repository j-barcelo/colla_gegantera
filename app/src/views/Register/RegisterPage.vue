<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  ApiError,
  AppAlert,
  AppButton,
  AppInput,
  FORM_MESSAGES,
  useForm,
  useNotification,
  VALIDATION_MESSAGES,
  validators,
} from '@shared';
import { useAuth } from '@shared/composables/useAuth';
import { alertCircleOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { register, isLoading } = useAuth();
const { notify } = useNotification();

const name = ref('');
const surname = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');

const { errors, generalError, registerInput, validate, validateFieldIfTouched, handleServerErrors } = useForm(
  ['name', 'surname', 'email', 'password', 'password_confirmation'] as const,
  { fallbackMessage: FORM_MESSAGES.registerFallback },
);

const validateName = validators.required(VALIDATION_MESSAGES.nameRequired);
const validateSurname = validators.required(VALIDATION_MESSAGES.surnameRequired);
const validateEmail = validators.email(VALIDATION_MESSAGES.userRequired);
const validatePassword = validators.password();
const validateConfirmation = validators.passwordConfirmation(() => password.value);

const onPasswordChange = (): void => {
  validateFieldIfTouched('password_confirmation');
};

const handleRegister = async (): Promise<void> => {
  if (!validate()) return;

  try {
    await register({
      name: name.value.trim(),
      surname: surname.value.trim(),
      email: email.value.trim(),
      password: password.value,
      password_confirmation: passwordConfirmation.value,
      device_name: 'Ionic App',
    });

    await router.push('/tabs/tab1');
  } catch (err: unknown) {
    handleServerErrors(err);

    if (err instanceof ApiError && err.errors?.email) {
      const emailMsg = err.errors.email[0] || '';
      if (emailMsg.toLowerCase().includes('autoritzat')) {
        errors.email = 'Correu no autoritzat.';
        notify({
          title: 'Registre no autoritzat',
          message:
            'Aquest correu no està a la llista d’admissions de la colla. Contacta amb un administrador per habilitar el teu registre.',
          variant: 'danger',
          duration: 5000,
        });
      }
    }
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
              :ref="registerInput('name')"
              v-model="name"
              v-model:error="errors.name"
              type="text"
              name="name"
              label="Nom"
              placeholder="Nom"
              :disabled="isLoading"
              :validator="validateName"
            />

            <AppInput
              id="register-surname"
              :ref="registerInput('surname')"
              v-model="surname"
              v-model:error="errors.surname"
              type="text"
              name="surname"
              label="Cognoms"
              placeholder="Cognoms"
              :disabled="isLoading"
              :validator="validateSurname"
            />

            <AppInput
              id="register-email"
              :ref="registerInput('email')"
              v-model="email"
              v-model:error="errors.email"
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
              :ref="registerInput('password')"
              v-model="password"
              v-model:error="errors.password"
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
              :ref="registerInput('password_confirmation')"
              v-model="passwordConfirmation"
              v-model:error="errors.password_confirmation"
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
