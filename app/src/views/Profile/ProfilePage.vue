<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar/UserAvatar.vue';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  ApiError,
  AppAlert,
  AppButton,
  AppInput,
  FORM_MESSAGES,
  optimizeAvatarToWebp,
  useForm,
  VALIDATION_MESSAGES,
  validators,
} from '@shared';
import { useAuth } from '@shared/composables/useAuth';
import { alertCircleOutline, closeOutline, logOutOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { user, token, isLoading, fetchUser, updateProfile, updatePassword, updateAvatar, logout } = useAuth();

const showEditModal = ref(false);
const showPasswordModal = ref(false);
const showAvatarModal = ref(false);
const avatarComponentRef = ref<InstanceType<typeof UserAvatar> | null>(null);
const pendingAvatarFile = ref<File | null>(null);
const avatarPreviewUrl = ref('');

const profileSuccess = ref('');
const passwordSuccess = ref('');
const avatarError = ref('');

const editForm = ref({
  name: '',
  surname: '',
  phone: '',
  email: '',
  address: '',
});

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const {
  errors: editErrors,
  generalError: profileError,
  registerInput: registerEditInput,
  resetErrors: resetEditErrors,
  validate: validateEditForm,
  handleServerErrors: handleProfileServerError,
} = useForm(['name', 'surname', 'phone', 'email', 'address'] as const, {
  fallbackMessage: FORM_MESSAGES.profileUpdateFallback,
});

const {
  errors: passwordErrors,
  generalError: passwordError,
  registerInput: registerPasswordInput,
  resetErrors: resetPasswordErrors,
  validate: validatePasswordForm,
  validateFieldIfTouched: validatePasswordFieldIfTouched,
  handleServerErrors: handlePasswordServerError,
} = useForm(['current_password', 'password', 'password_confirmation'] as const, {
  fallbackMessage: FORM_MESSAGES.passwordUpdateFallback,
});

onMounted(async () => {
  if (token.value && !user.value) {
    await fetchUser();
  }
});

const userHandle = computed(() => {
  if (user.value?.username) return `#${user.value.username.replace(/^#/, '')}`;
  if (user.value?.email) return `#${user.value.email.split('@')[0]}`;
  if (user.value?.name) return `#${user.value.name.toLowerCase().replace(/\s+/g, '')}`;
  return '#usuari';
});

const firstName = computed(() => {
  if (user.value?.surname) return user.value.name || '';
  const fullName = user.value?.name || '';
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || '';
});

const lastName = computed(() => {
  if (user.value?.surname) return user.value.surname;
  const fullName = user.value?.name || '';
  const parts = fullName.trim().split(/\s+/);
  return parts.slice(1).join(' ');
});

const validateName = validators.required(VALIDATION_MESSAGES.nameRequired);
const validateSurname = validators.required(VALIDATION_MESSAGES.surnameRequired);
const validatePhone = validators.phone();
const validateEmail = validators.email();
const validateOldPassword = validators.required(VALIDATION_MESSAGES.currentPasswordRequired);
const validateNewPassword = validators.password();
const validateConfirmPassword = validators.passwordConfirmation(
  () => newPassword.value,
  VALIDATION_MESSAGES.newPasswordConfirmRequired,
);
const validateAvatarFile = validators.avatarFile();

const onNewPasswordChange = (): void => {
  validatePasswordFieldIfTouched('password_confirmation');
};

const clearAvatarPreview = (): void => {
  if (avatarPreviewUrl.value) {
    URL.revokeObjectURL(avatarPreviewUrl.value);
    avatarPreviewUrl.value = '';
  }
  pendingAvatarFile.value = null;
};

const triggerAvatarSelection = (): void => {
  avatarError.value = '';
  profileSuccess.value = '';
  avatarComponentRef.value?.openFilePicker();
};

const handleAvatarSelected = async (file: File): Promise<void> => {
  avatarError.value = '';
  profileSuccess.value = '';

  const validationError = validateAvatarFile(file);
  if (validationError) {
    avatarError.value = validationError;
    return;
  }

  try {
    clearAvatarPreview();
    const optimized = await optimizeAvatarToWebp(file);
    pendingAvatarFile.value = optimized.file;
    avatarPreviewUrl.value = optimized.previewUrl;
    showAvatarModal.value = true;
  } catch (err: unknown) {
    avatarError.value = err instanceof Error ? err.message : FORM_MESSAGES.avatarUpdateFallback;
  }
};

const cancelAvatarPreview = (): void => {
  clearAvatarPreview();
  avatarError.value = '';
  showAvatarModal.value = false;
};

const confirmAvatarUpload = async (): Promise<void> => {
  if (!pendingAvatarFile.value) return;

  avatarError.value = '';
  profileSuccess.value = '';

  try {
    await updateAvatar(pendingAvatarFile.value);
    clearAvatarPreview();
    showAvatarModal.value = false;
    profileSuccess.value = FORM_MESSAGES.avatarUpdateSuccess;
  } catch (err: unknown) {
    if (err instanceof ApiError && err.errors?.avatar?.[0]) {
      avatarError.value = err.errors.avatar[0];
    } else if (err instanceof Error && err.message) {
      avatarError.value = err.message;
    } else {
      avatarError.value = FORM_MESSAGES.avatarUpdateFallback;
    }
  }
};

const startEditing = (): void => {
  profileSuccess.value = '';
  resetEditErrors();
  editForm.value = {
    name: firstName.value,
    surname: lastName.value,
    phone: user.value?.phone || '',
    email: user.value?.email || '',
    address: user.value?.address || '',
  };
  showEditModal.value = true;
};

const cancelEditing = (): void => {
  resetEditErrors();
  showEditModal.value = false;
};

const saveProfile = async (): Promise<void> => {
  profileSuccess.value = '';

  if (!validateEditForm()) return;

  try {
    await updateProfile({
      name: editForm.value.name.trim(),
      surname: editForm.value.surname.trim(),
      email: editForm.value.email.trim(),
      phone: editForm.value.phone.trim() || null,
      address: editForm.value.address.trim() || null,
    });
    showEditModal.value = false;
    profileSuccess.value = FORM_MESSAGES.profileUpdateSuccess;
  } catch (err: unknown) {
    handleProfileServerError(err);
  }
};

const openPasswordModal = (): void => {
  passwordSuccess.value = '';
  resetPasswordErrors();
  oldPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  showPasswordModal.value = true;
};

const closePasswordModal = (): void => {
  resetPasswordErrors();
  showPasswordModal.value = false;
};

const handlePasswordChange = async (): Promise<void> => {
  passwordSuccess.value = '';

  if (!validatePasswordForm()) return;

  try {
    await updatePassword({
      current_password: oldPassword.value,
      password: newPassword.value,
      password_confirmation: confirmPassword.value,
    });
    showPasswordModal.value = false;
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    passwordSuccess.value = FORM_MESSAGES.passwordUpdateSuccess;
  } catch (err: unknown) {
    handlePasswordServerError(err);
  }
};

const handleLogout = async (): Promise<void> => {
  await logout();
  await router.push('/login');
};
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <main class="c-profile-view">
        <!-- Cyan Hero Header -->
        <header class="c-profile-header">
          <div class="c-profile-header__top">
            <div class="c-profile-header__text">
              <h1 class="c-profile-header__title">Dades personals</h1>
              <p class="c-profile-header__handle">{{ userHandle }}</p>
            </div>

            <button type="button" class="c-profile-header__logout" aria-label="Tancar la sessió" @click="handleLogout">
              <ion-icon :icon="logOutOutline" aria-hidden="true" />
            </button>
          </div>

          <!-- Overlapping Avatar -->
          <div class="c-profile-header__avatar-wrapper">
            <UserAvatar
              ref="avatarComponentRef"
              :src="user?.avatar"
              :alt="`Fotografia de perfil de ${user?.name || 'usuari'}`"
              size="xl"
              editable
              :disabled="isLoading"
              @select-file="handleAvatarSelected"
            />
          </div>
        </header>

        <!-- Personal Details Section (White Background) -->
        <section class="c-profile-details" aria-labelledby="profile-data-heading">
          <h2 id="profile-data-heading" class="u-visually-hidden">Dades de contacte</h2>

          <AppAlert v-if="avatarError" variant="danger">
            <template #icon>
              <ion-icon :icon="alertCircleOutline" aria-hidden="true" />
            </template>
            {{ avatarError }}
          </AppAlert>

          <AppAlert v-if="profileSuccess" variant="primary">
            {{ profileSuccess }}
          </AppAlert>

          <AppAlert v-if="passwordSuccess" variant="primary">
            {{ passwordSuccess }}
          </AppAlert>

          <div class="c-profile-details__info">
            <p class="c-profile-details__name">
              <strong class="c-profile-details__first-name">{{ firstName }}</strong> {{ lastName }}
            </p>
            <p class="c-profile-details__item">
              <span class="c-profile-details__prefix">+34</span> {{ user?.phone || '—' }}
            </p>
            <p class="c-profile-details__item">
              {{ user?.email || '—' }}
            </p>
            <p class="c-profile-details__item">
              <span class="c-profile-details__prefix">c/</span> {{ user?.address || '—' }}
            </p>

            <div class="c-profile-details__actions">
              <AppButton
                type="button"
                variant="outline-primary"
                class="c-profile-details__edit-btn"
                aria-label="Editar dades personals"
                @click="startEditing"
              >
                <span>EDITAR</span>
                <svg class="c-profile-details__edit-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
                  <path d="M4 21h16" />
                </svg>
              </AppButton>
            </div>
          </div>
        </section>

        <!-- Roles & Permissions Section (Full Cyan Background) -->
        <section class="c-profile-roles" aria-labelledby="roles-heading">
          <h2 id="roles-heading" class="c-profile-roles__title">Rols i permisos</h2>

          <div class="c-profile-roles__grid">
            <div class="c-profile-roles__col">
              <p class="c-profile-roles__item">Administració</p>
              <p class="c-profile-roles__item">Xarxes socials</p>
            </div>
            <div class="c-profile-roles__col">
              <p class="c-profile-roles__item">Cap de colla</p>
              <p class="c-profile-roles__item">Portadors</p>
            </div>
          </div>
        </section>

        <!-- Security / Password Section (Black Background) -->
        <section class="c-profile-security" aria-label="Seguretat">
          <AppButton type="button" variant="outline-primary" class="c-profile-security__btn" @click="openPasswordModal">
            MODIFICAR CONTRASENYA
          </AppButton>
        </section>

        <!-- Full-Screen Edit Personal Details Modal -->
        <dialog
          v-if="showEditModal"
          open
          class="c-profile-modal c-profile-modal--primary"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
        >
          <header class="c-profile-modal__header">
            <h2 id="edit-modal-title" class="c-profile-modal__title">Editar dades personals</h2>
            <button type="button" class="c-profile-modal__close" aria-label="Tancar" @click="cancelEditing">
              <ion-icon :icon="closeOutline" aria-hidden="true" />
            </button>
          </header>

          <form class="c-profile-modal__form" @submit.prevent="saveProfile">
            <AppAlert v-if="profileError" variant="danger">
              {{ profileError }}
            </AppAlert>

            <AppInput
              id="edit-name"
              :ref="registerEditInput('name')"
              v-model="editForm.name"
              v-model:error="editErrors.name"
              type="text"
              name="name"
              label="Nom"
              placeholder="Nom"
              :disabled="isLoading"
              :validator="validateName"
            />

            <AppInput
              id="edit-surname"
              :ref="registerEditInput('surname')"
              v-model="editForm.surname"
              v-model:error="editErrors.surname"
              type="text"
              name="surname"
              label="Cognoms"
              placeholder="Cognoms"
              :disabled="isLoading"
              :validator="validateSurname"
            />

            <AppInput
              id="edit-phone"
              :ref="registerEditInput('phone')"
              v-model="editForm.phone"
              v-model:error="editErrors.phone"
              type="tel"
              name="phone"
              autocomplete="tel"
              label="Telèfon (sense prefix)"
              placeholder="Telèfon (sense prefix)"
              :disabled="isLoading"
              :validator="validatePhone"
            />

            <AppInput
              id="edit-email"
              :ref="registerEditInput('email')"
              v-model="editForm.email"
              v-model:error="editErrors.email"
              type="email"
              name="email"
              autocomplete="email"
              label="Correu electrònic"
              placeholder="Correu electrònic"
              :disabled="isLoading"
              :validator="validateEmail"
            />

            <AppInput
              id="edit-address"
              :ref="registerEditInput('address')"
              v-model="editForm.address"
              v-model:error="editErrors.address"
              type="text"
              name="address"
              label="Adreça"
              placeholder="Adreça"
              :disabled="isLoading"
            />

            <div class="c-profile-modal__actions">
              <AppButton type="button" variant="outline-light" :disabled="isLoading" @click="cancelEditing">
                Cancel·lar
              </AppButton>
              <AppButton type="submit" variant="outline-light" :disabled="isLoading">Desar canvis</AppButton>
            </div>
          </form>
        </dialog>

        <!-- Full-Screen Change Password Modal (Black Background) -->
        <dialog
          v-if="showPasswordModal"
          open
          class="c-profile-modal c-profile-modal--dark"
          aria-modal="true"
          aria-labelledby="password-modal-title"
        >
          <header class="c-profile-modal__header">
            <h2 id="password-modal-title" class="c-profile-modal__title">Modificar contrasenya</h2>
            <button type="button" class="c-profile-modal__close" aria-label="Tancar" @click="closePasswordModal">
              <ion-icon :icon="closeOutline" aria-hidden="true" />
            </button>
          </header>

          <form class="c-profile-modal__form" @submit.prevent="handlePasswordChange">
            <AppAlert v-if="passwordError" variant="danger">
              {{ passwordError }}
            </AppAlert>

            <AppInput
              id="old-pass"
              :ref="registerPasswordInput('current_password')"
              v-model="oldPassword"
              v-model:error="passwordErrors.current_password"
              type="password"
              name="current_password"
              autocomplete="current-password"
              label="Contrasenya actual"
              placeholder="Contrasenya actual"
              :disabled="isLoading"
              :validator="validateOldPassword"
            />

            <AppInput
              id="new-pass"
              :ref="registerPasswordInput('password')"
              v-model="newPassword"
              v-model:error="passwordErrors.password"
              type="password"
              name="password"
              autocomplete="new-password"
              label="Nova contrasenya (mínim 8 caràcters)"
              placeholder="Nova contrasenya (mínim 8 caràcters)"
              :disabled="isLoading"
              :validator="validateNewPassword"
              @update:model-value="onNewPasswordChange"
            />

            <AppInput
              id="confirm-pass"
              :ref="registerPasswordInput('password_confirmation')"
              v-model="confirmPassword"
              v-model:error="passwordErrors.password_confirmation"
              type="password"
              name="password_confirmation"
              autocomplete="new-password"
              label="Confirma la nova contrasenya"
              placeholder="Confirma la nova contrasenya"
              :disabled="isLoading"
              :validator="validateConfirmPassword"
            />

            <div class="c-profile-modal__actions">
              <AppButton type="button" variant="outline-light" :disabled="isLoading" @click="closePasswordModal">
                Cancel·lar
              </AppButton>
              <AppButton type="submit" variant="outline-primary" :disabled="isLoading">Desar contrasenya</AppButton>
            </div>
          </form>
        </dialog>

        <!-- Full-Screen Avatar WebP Preview Modal -->
        <dialog
          v-if="showAvatarModal"
          open
          class="c-profile-modal c-profile-modal--primary"
          aria-modal="true"
          aria-labelledby="avatar-modal-title"
        >
          <header class="c-profile-modal__header">
            <h2 id="avatar-modal-title" class="c-profile-modal__title">Previsualització de la imatge</h2>
            <button type="button" class="c-profile-modal__close" aria-label="Tancar" @click="cancelAvatarPreview">
              <ion-icon :icon="closeOutline" aria-hidden="true" />
            </button>
          </header>

          <form class="c-profile-modal__form" @submit.prevent="confirmAvatarUpload">
            <AppAlert v-if="avatarError" variant="danger">
              {{ avatarError }}
            </AppAlert>

            <div class="c-profile-modal__preview-wrap">
              <UserAvatar :src="avatarPreviewUrl" alt="Previsualització de la imatge de perfil" size="xl" />
              <AppButton type="button" variant="outline-light" :disabled="isLoading" @click="triggerAvatarSelection">
                Triar una altra imatge
              </AppButton>
            </div>

            <div class="c-profile-modal__actions">
              <AppButton type="button" variant="outline-light" :disabled="isLoading" @click="cancelAvatarPreview">
                Cancel·lar
              </AppButton>
              <AppButton type="submit" variant="outline-light" :disabled="isLoading">Desar imatge</AppButton>
            </div>
          </form>
        </dialog>
      </main>
    </ion-content>
  </ion-page>
</template>

<style lang="scss" src="./ProfilePage.scss"></style>
