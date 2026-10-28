<script setup lang="ts">
import { AppAlert, AppButton, AppInput, useForm, VALIDATION_MESSAGES, validators } from '@shared';
import logoCollaUrl from '@shared/assets/images/logo-colla.svg';
import { computed, onMounted, ref } from 'vue';

interface Props {
  action: string;
  csrfToken: string;
  initialOld?: Record<string, string>;
  initialErrors?: Record<string, string[]>;
}

const props = withDefaults(defineProps<Props>(), {
  initialOld: () => ({}),
  initialErrors: () => ({}),
});

const step = ref<1 | 2>(1);
const isSubmitting = ref(false);
const formRef = ref<HTMLFormElement | null>(null);

const dbConnection = ref(props.initialOld.db_connection || 'sqlite');
const dbHost = ref(props.initialOld.db_host || '127.0.0.1');
const dbPort = ref(props.initialOld.db_port || (dbConnection.value === 'pgsql' ? '5432' : '3306'));
const dbDatabase = ref(props.initialOld.db_database || 'colla_gegantera');
const dbUsername = ref(props.initialOld.db_username || 'root');
const dbPassword = ref('');

const adminName = ref(props.initialOld.admin_name || '');
const adminSurname = ref(props.initialOld.admin_surname || '');
const adminEmail = ref(props.initialOld.admin_email || '');
const adminPassword = ref('');
const adminPasswordConfirmation = ref('');

const requiresServer = computed(() => dbConnection.value === 'mysql' || dbConnection.value === 'pgsql');

const {
  errors: step1Errors,
  generalError: step1GeneralError,
  registerInput: registerStep1Input,
  validate: validateStep1,
} = useForm(['db_host', 'db_port', 'db_database', 'db_username', 'db_password'] as const);

const {
  errors: step2Errors,
  generalError: step2GeneralError,
  registerInput: registerStep2Input,
  validate: validateStep2,
  validateFieldIfTouched: validateStep2FieldIfTouched,
} = useForm(['admin_name', 'admin_surname', 'admin_email', 'admin_password', 'admin_password_confirmation'] as const);

const activeGeneralError = computed(() => step1GeneralError.value || step2GeneralError.value);

const validateRequired = validators.required();
const validateName = validators.required(VALIDATION_MESSAGES.nameRequired);
const validateEmail = validators.email(VALIDATION_MESSAGES.emailRequired);
const validatePassword = validators.password();
const validateConfirmation = validators.passwordConfirmation(() => adminPassword.value);

const onConnectionChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement;
  dbConnection.value = target.value;

  if (dbPort.value === '3306' || dbPort.value === '5432') {
    dbPort.value = dbConnection.value === 'pgsql' ? '5432' : '3306';
  }
};

const onPasswordChange = (): void => {
  validateStep2FieldIfTouched('admin_password_confirmation');
};

const goToStep2 = (): void => {
  if (requiresServer.value && !validateStep1()) return;
  step.value = 2;
};

const handleSubmit = (): void => {
  if (!validateStep2()) return;
  isSubmitting.value = true;
  formRef.value?.submit();
};

onMounted(() => {
  const errEntries = Object.entries(props.initialErrors);
  if (errEntries.length === 0) return;

  if (props.initialErrors.db_connection?.[0]) {
    step1GeneralError.value = props.initialErrors.db_connection[0];
  }

  for (const key of ['db_host', 'db_port', 'db_database', 'db_username', 'db_password'] as const) {
    if (props.initialErrors[key]?.[0]) {
      step1Errors[key] = props.initialErrors[key][0];
    }
  }

  let hasStep2Error = false;
  for (const key of [
    'admin_name',
    'admin_surname',
    'admin_email',
    'admin_password',
    'admin_password_confirmation',
  ] as const) {
    if (props.initialErrors[key]?.[0]) {
      step2Errors[key] = props.initialErrors[key][0];
      hasStep2Error = true;
    }
  }

  const hasStep1Error = Boolean(
    props.initialErrors.db_connection ||
      props.initialErrors.db_host ||
      props.initialErrors.db_port ||
      props.initialErrors.db_database ||
      props.initialErrors.db_username,
  );

  if (hasStep2Error && !hasStep1Error) step.value = 2;
});
</script>

<template>
  <section class="c-install__body" aria-labelledby="install-heading">
    <header class="c-install__header">
      <figure class="c-install__brand">
        <img :src="logoCollaUrl" alt="Colla Gegantera" class="c-install__logo" width="300" height="125" />
        <figcaption class="u-visually-hidden">Colla Gegantera</figcaption>
      </figure>
      <p class="c-install__step-indicator">
        Pas {{ step }} de 2 — {{ step === 1 ? 'Base de dades' : 'Compte administrador' }}
      </p>
    </header>

    <AppAlert v-if="activeGeneralError" variant="danger">
      {{ activeGeneralError }}
    </AppAlert>

    <form
      ref="formRef"
      class="c-install__form"
      method="POST"
      :action="action"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <input type="hidden" name="_token" :value="csrfToken" />

      <div v-show="step === 1" class="c-install__step">
        <div class="c-input">
          <label for="db-connection" class="u-visually-hidden">Motor de base de dades</label>
          <div class="c-input__row">
            <select
              id="db-connection"
              name="db_connection"
              class="c-input__control"
              :value="dbConnection"
              @change="onConnectionChange"
            >
              <option value="sqlite">SQLite (Recomanat)</option>
              <option value="mysql">MySQL / MariaDB</option>
              <option value="pgsql">PostgreSQL</option>
            </select>
          </div>
        </div>

        <template v-if="requiresServer">
          <AppInput
            id="db-host"
            :ref="registerStep1Input('db_host')"
            v-model="dbHost"
            v-model:error="step1Errors.db_host"
            type="text"
            name="db_host"
            label="Servidor (Host)"
            placeholder="Servidor (ex: 127.0.0.1)"
            :validator="validateRequired"
          />

          <AppInput
            id="db-port"
            :ref="registerStep1Input('db_port')"
            v-model="dbPort"
            v-model:error="step1Errors.db_port"
            type="number"
            name="db_port"
            label="Port"
            placeholder="Port (ex: 3306)"
            :validator="validateRequired"
          />

          <AppInput
            id="db-database"
            :ref="registerStep1Input('db_database')"
            v-model="dbDatabase"
            v-model:error="step1Errors.db_database"
            type="text"
            name="db_database"
            label="Nom de la base de dades"
            placeholder="Nom de la base de dades"
            :validator="validateRequired"
          />

          <AppInput
            id="db-username"
            :ref="registerStep1Input('db_username')"
            v-model="dbUsername"
            v-model:error="step1Errors.db_username"
            type="text"
            name="db_username"
            label="Usuari de la base de dades"
            placeholder="Usuari de la base de dades"
            :validator="validateRequired"
          />

          <AppInput
            id="db-password"
            :ref="registerStep1Input('db_password')"
            v-model="dbPassword"
            v-model:error="step1Errors.db_password"
            type="password"
            name="db_password"
            label="Contrasenya de la base de dades"
            placeholder="Contrasenya de la base de dades (opcional)"
          />
        </template>

        <div class="c-install__actions">
          <AppButton type="button" variant="outline-light" @click="goToStep2"> SEGÜENT </AppButton>
        </div>
      </div>

      <div v-show="step === 2" class="c-install__step">
        <AppInput
          id="admin-name"
          :ref="registerStep2Input('admin_name')"
          v-model="adminName"
          v-model:error="step2Errors.admin_name"
          type="text"
          name="admin_name"
          label="Nom"
          placeholder="Nom"
          :disabled="isSubmitting"
          :validator="validateName"
        />

        <AppInput
          id="admin-surname"
          :ref="registerStep2Input('admin_surname')"
          v-model="adminSurname"
          v-model:error="step2Errors.admin_surname"
          type="text"
          name="admin_surname"
          label="Cognoms"
          placeholder="Cognoms"
          :disabled="isSubmitting"
        />

        <AppInput
          id="admin-email"
          :ref="registerStep2Input('admin_email')"
          v-model="adminEmail"
          v-model:error="step2Errors.admin_email"
          type="email"
          name="admin_email"
          autocomplete="email"
          label="Correu electrònic"
          placeholder="Correu electrònic"
          :disabled="isSubmitting"
          :validator="validateEmail"
        />

        <AppInput
          id="admin-password"
          :ref="registerStep2Input('admin_password')"
          v-model="adminPassword"
          v-model:error="step2Errors.admin_password"
          type="password"
          name="admin_password"
          autocomplete="new-password"
          label="Contrasenya (mínim 8 caràcters)"
          placeholder="Contrasenya (mínim 8 caràcters)"
          :disabled="isSubmitting"
          :validator="validatePassword"
          @update:model-value="onPasswordChange"
        />

        <AppInput
          id="admin-password-confirmation"
          :ref="registerStep2Input('admin_password_confirmation')"
          v-model="adminPasswordConfirmation"
          v-model:error="step2Errors.admin_password_confirmation"
          type="password"
          name="admin_password_confirmation"
          autocomplete="new-password"
          label="Confirma la contrasenya"
          placeholder="Confirma la contrasenya"
          :disabled="isSubmitting"
          :validator="validateConfirmation"
        />

        <div class="c-install__actions">
          <AppButton type="button" variant="outline-light" :disabled="isSubmitting" @click="step = 1">
            ENRERE
          </AppButton>

          <AppButton type="submit" variant="outline-light" :disabled="isSubmitting">
            {{ isSubmitting ? 'INSTAL·LANT...' : 'INSTAL·LAR' }}
          </AppButton>
        </div>
      </div>
    </form>
  </section>
</template>

<style lang="scss" src="./InstallWizard.scss"></style>
