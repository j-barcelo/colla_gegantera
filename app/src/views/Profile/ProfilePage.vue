<script setup lang="ts">
import AvatarPreviewModal from '@/components/AvatarPreviewModal/AvatarPreviewModal.vue';
import ChangePasswordModal from '@/components/ChangePasswordModal/ChangePasswordModal.vue';
import EditUserModal from '@/components/EditUserModal/EditUserModal.vue';
import ProfileDetails from '@/components/ProfileDetails/ProfileDetails.vue';
import ProfileRoles from '@/components/ProfileRoles/ProfileRoles.vue';
import ProfileSecurity from '@/components/ProfileSecurity/ProfileSecurity.vue';
import UserAvatar from '@/components/UserAvatar/UserAvatar.vue';
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import type { UpdatePasswordData, UpdateProfileData } from '@shared';
import { ApiError, AppAlert, FORM_MESSAGES, optimizeAvatarToWebp, useNotification, validators } from '@shared';
import { useAuth } from '@shared/composables/useAuth';
import { alertCircleOutline, logOutOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { user, token, isLoading, fetchUser, updateProfile, updatePassword, updateAvatar, logout } = useAuth();
const { notify } = useNotification();

const showEditModal = ref(false);
const showPasswordModal = ref(false);
const showAvatarModal = ref(false);
const avatarComponentRef = ref<InstanceType<typeof UserAvatar> | null>(null);
const pendingAvatarFile = ref<File | null>(null);
const avatarPreviewUrl = ref('');

const avatarError = ref('');
const profileError = ref('');
const passwordError = ref('');

const handleProfileServerError = (err: unknown): void => {
  if (err instanceof ApiError && err.errors) {
    const firstMsg = Object.values(err.errors)[0]?.[0];
    profileError.value = firstMsg || FORM_MESSAGES.profileUpdateFallback;
  } else if (err instanceof Error) {
    profileError.value = err.message;
  } else {
    profileError.value = FORM_MESSAGES.profileUpdateFallback;
  }
};

const handlePasswordServerError = (err: unknown): void => {
  if (err instanceof ApiError && err.errors) {
    const firstMsg = Object.values(err.errors)[0]?.[0];
    passwordError.value = firstMsg || FORM_MESSAGES.passwordUpdateFallback;
  } else if (err instanceof Error) {
    passwordError.value = err.message;
  } else {
    passwordError.value = FORM_MESSAGES.passwordUpdateFallback;
  }
};

onMounted(async () => {
  if (token.value && !user.value) {
    await fetchUser();
  }
});

onIonViewWillEnter(async () => {
  if (token.value) await fetchUser();
});

const userHandle = computed(() => {
  if (user.value?.username) return `#${user.value.username.replace(/^#/, '')}`;
  if (user.value?.email) return `#${user.value.email.split('@')[0]}`;
  if (user.value?.name) return `#${user.value.name.toLowerCase().replace(/\s+/g, '')}`;
  return '#usuari';
});

const validateAvatarFile = validators.avatarFile();

const clearAvatarPreview = (): void => {
  if (avatarPreviewUrl.value) {
    URL.revokeObjectURL(avatarPreviewUrl.value);
    avatarPreviewUrl.value = '';
  }
  pendingAvatarFile.value = null;
};

const triggerAvatarSelection = (): void => {
  avatarError.value = '';
  avatarComponentRef.value?.openFilePicker();
};

const handleAvatarSelected = async (file: File): Promise<void> => {
  avatarError.value = '';

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

  try {
    await updateAvatar(pendingAvatarFile.value);
    clearAvatarPreview();
    showAvatarModal.value = false;
    notify({ title: 'Fotografia de perfil', message: FORM_MESSAGES.avatarUpdateSuccess, variant: 'primary' });
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
  profileError.value = '';
  showEditModal.value = true;
};

const cancelEditing = (): void => {
  profileError.value = '';
  showEditModal.value = false;
};

const saveProfile = async (data: UpdateProfileData): Promise<void> => {
  try {
    await updateProfile(data);
    showEditModal.value = false;
    notify({ title: 'Dades personals', message: FORM_MESSAGES.profileUpdateSuccess, variant: 'primary' });
  } catch (err: unknown) {
    handleProfileServerError(err);
  }
};

const openPasswordModal = (): void => {
  passwordError.value = '';
  showPasswordModal.value = true;
};

const closePasswordModal = (): void => {
  passwordError.value = '';
  showPasswordModal.value = false;
};

const handlePasswordChange = async (data: UpdatePasswordData): Promise<void> => {
  passwordError.value = '';
  try {
    await updatePassword(data);
    showPasswordModal.value = false;
    notify({ title: 'Modificar contrasenya', message: FORM_MESSAGES.passwordUpdateSuccess, variant: 'primary' });
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
        <ProfileDetails :user="user" :editable="true" @edit="startEditing">
          <template v-if="avatarError" #alerts>
            <AppAlert variant="danger">
              <template #icon>
                <ion-icon :icon="alertCircleOutline" aria-hidden="true" />
              </template>
              {{ avatarError }}
            </AppAlert>
          </template>
        </ProfileDetails>

        <!-- Roles & Permissions Section (Full Cyan Background) -->
        <ProfileRoles :user="user" :editable="false" />

        <!-- Security / Password Section (Black Background) -->
        <ProfileSecurity :disabled="isLoading" @change-password="openPasswordModal" />

        <!-- Modal d'edició de dades personals -->
        <EditUserModal
          v-model:is-open="showEditModal"
          :user="user"
          :is-saving="isLoading"
          :error-message="profileError"
          @close="cancelEditing"
          @save="saveProfile"
        />

        <!-- Modal de canvi de contrasenya -->
        <ChangePasswordModal
          v-model:is-open="showPasswordModal"
          :is-saving="isLoading"
          :error-message="passwordError"
          @close="closePasswordModal"
          @save="handlePasswordChange"
        />

        <!-- Modal de previsualització d'avatar -->
        <AvatarPreviewModal
          v-model:is-open="showAvatarModal"
          :preview-url="avatarPreviewUrl"
          :alt-text="`Previsualització de la imatge de ${user?.name || 'usuari'}`"
          :is-loading="isLoading"
          :error-message="avatarError"
          @close="cancelAvatarPreview"
          @change-file="triggerAvatarSelection"
          @confirm="confirmAvatarUpload"
        />
      </main>
    </ion-content>
  </ion-page>
</template>

<style lang="scss" src="./ProfilePage.scss"></style>
