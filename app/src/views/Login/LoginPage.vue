<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { AppAlert, AppButton, AppInput } from '@shared';
import { useAuth } from '@shared/composables/useAuth';
import { ApiError } from '@shared/utils/api';
import { alertCircleOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { login, isLoading } = useAuth();

const email = ref('');
const password = ref('');

const emailError = ref('');
const passwordError = ref('');
const generalError = ref('');

const emailInputRef = ref<InstanceType<typeof AppInput> | null>(null);
const passwordInputRef = ref<InstanceType<typeof AppInput> | null>(null);

const validateEmail = (val: string): string => {
  if (!val.trim()) return 'No has especificat cap usuari';
  return '';
};

const validatePassword = (val: string): string => {
  if (!val.trim()) return 'No has especificat cap contrasenya';
  return '';
};

const validateForm = (): boolean => {
  const isEmailValid = emailInputRef.value?.validate() ?? false;
  const isPasswordValid = passwordInputRef.value?.validate() ?? false;

  return isEmailValid && isPasswordValid;
};

const handleServerErrors = (err: unknown): void => {
  if (!(err instanceof ApiError)) {
    generalError.value = "No s'ha pogut connectar amb el servidor.";
    return;
  }

  if (err.errors) {
    const emailErrMsg = err.errors.email?.[0];
    if (
      emailErrMsg &&
      (emailErrMsg.includes('credentials') || emailErrMsg.includes('records') || emailErrMsg.includes('credencials'))
    ) {
      generalError.value = 'Les credencials introduïdes no són correctes.';
      return;
    }

    emailError.value = err.errors.email?.[0] || '';
    passwordError.value = err.errors.password?.[0] || '';
    return;
  }

  generalError.value = err.message || 'Les credencials introduïdes no són correctes.';
};

const handleLogin = async () => {
  generalError.value = '';

  if (!validateForm()) return;

  try {
    await login({
      email: email.value.trim(),
      password: password.value,
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
      <main class="c-login">
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

        <section class="c-login__body" aria-labelledby="login-heading">
          <h1 id="login-heading" class="u-visually-hidden">Iniciar sessió a la Colla</h1>

          <!-- Global alert if unexpected connection error -->
          <AppAlert v-if="generalError" variant="danger">
            <template #icon>
              <ion-icon :icon="alertCircleOutline" aria-hidden="true" />
            </template>
            {{ generalError }}
          </AppAlert>

          <form class="c-login__form" @submit.prevent="handleLogin">
            <AppInput
              id="login-email"
              ref="emailInputRef"
              v-model="email"
              v-model:error="emailError"
              type="email"
              name="email"
              autocomplete="email"
              label="Usuari"
              placeholder="Usuari"
              :disabled="isLoading"
              :validator="validateEmail"
            />

            <AppInput
              id="login-password"
              ref="passwordInputRef"
              v-model="password"
              v-model:error="passwordError"
              type="password"
              name="password"
              autocomplete="current-password"
              label="Contrasenya"
              placeholder="Contrasenya"
              :disabled="isLoading"
              :validator="validatePassword"
            />

            <div class="c-login__links-row">
              <a href="#recuperar" class="c-login__link" @click.prevent> No recordes la contrasenya? </a>
            </div>

            <div class="c-login__btn-wrap">
              <AppButton type="submit" variant="outline-light" :disabled="isLoading">
                {{ isLoading ? 'INICIANT SESSIÓ...' : 'INICIAR SESSIÓ' }}
              </AppButton>
            </div>

            <div class="c-login__footer-link">
              <router-link to="/register" class="c-login__link"> No tens compte? Registra't </router-link>
            </div>
          </form>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<style lang="scss" src="./LoginPage.scss"></style>
