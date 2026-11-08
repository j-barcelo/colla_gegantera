<script setup lang="ts">
import EditUserModal from '@/components/EditUserModal/EditUserModal.vue';
import UserAvatar from '@/components/UserAvatar/UserAvatar.vue';
import UserDetailModal from '@/components/UserDetailModal/UserDetailModal.vue';
import { alertController, IonButton, IonIcon, IonSpinner } from '@ionic/vue';
import type { UpdateProfileData, User } from '@shared';
import { iconFilterList, iconPersonAdd, useAdminUsers, useAuth, useNotification } from '@shared';
import { onMounted, ref, watch } from 'vue';

const emit = defineEmits<{
  'modal-open': [isOpen: boolean];
}>();

const { users, totalUsers, isLoading, error, fetchUsers, addAllowedEmail, updateUser, removeUserOrInvitation } =
  useAdminUsers();
const { user: authUser, syncCurrentUser, fetchUser: refreshAuthUser } = useAuth();
const { notify } = useNotification();

// Modal state
const showUserModal = ref<boolean>(false);
const showEditModal = ref<boolean>(false);
const selectedUser = ref<User | null>(null);
const isSaving = ref<boolean>(false);
const modalError = ref<string>('');

watch([showUserModal, showEditModal], () => {
  emit('modal-open', showUserModal.value || showEditModal.value);
});

const openUserModal = (user: User): void => {
  selectedUser.value = user;
  modalError.value = '';
  showEditModal.value = false;
  showUserModal.value = true;
};

const closeModal = (): void => {
  showUserModal.value = false;
  showEditModal.value = false;
  selectedUser.value = null;
  modalError.value = '';
};

const startEditing = (): void => {
  if (!selectedUser.value) return;
  modalError.value = '';
  showEditModal.value = true;
};

const cancelEditing = (): void => {
  showEditModal.value = false;
  modalError.value = '';
};

const COLLA_ROLE_OPTIONS = ['Administració', 'Cap de colla', 'Portadors', 'Músics', 'Xarxes socials'] as const;

const handleRolesChange = async (newRoles: string[]): Promise<void> => {
  if (!selectedUser.value) return;

  const isSelf = String(selectedUser.value.id) === String(authUser.value?.id);
  const hasAdmin = newRoles.includes('Administració') || newRoles.includes('admin');

  if (isSelf && !hasAdmin) {
    notify({
      title: 'Acció no permesa',
      message: 'No et pots treure el rol d’administrador a tu mateix.',
      variant: 'danger',
    });
    return;
  }

  const targetRole = hasAdmin ? 'admin' : 'member';

  try {
    const updated = await updateUser(selectedUser.value.id, {
      roles: newRoles,
      role: targetRole,
    });
    selectedUser.value = {
      ...selectedUser.value,
      ...updated,
      roles: newRoles,
      role: targetRole,
    };

    if (String(selectedUser.value.id) === String(authUser.value?.id)) {
      syncCurrentUser({ roles: newRoles, role: targetRole });
      await refreshAuthUser().catch(() => {});
    }

    const msg = 'Els rols de la colla s’han actualitzat correctament.';
    notify({ title: 'Rols actualitzats', message: msg, variant: 'primary' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al modificar els rols.';
    notify({ title: 'Error al modificar rols', message: msg, variant: 'danger' });
  }
};

const handleEditRole = async (): Promise<void> => {
  if (!selectedUser.value) return;

  const currentRoles = (() => {
    if (Array.isArray(selectedUser.value.roles) && selectedUser.value.roles.length > 0) {
      return selectedUser.value.roles;
    }
    if (selectedUser.value.role === 'admin') {
      return ['Administració'];
    }
    return ['Portadors'];
  })();

  const isSelf = String(selectedUser.value.id) === String(authUser.value?.id);

  const alert = await alertController.create({
    header: 'Modificar rols',
    subHeader: `Assigna els rols de la colla per a ${selectedUser.value.name}:`,
    inputs: COLLA_ROLE_OPTIONS.map((role) => ({
      type: 'checkbox',
      label: role,
      value: role,
      checked: currentRoles.includes(role),
      disabled: isSelf && role === 'Administració',
    })),
    buttons: [
      {
        text: 'Cancel·lar',
        role: 'cancel',
      },
      {
        text: 'Desar',
        handler: async (selectedRoles: string[]) => {
          if (Array.isArray(selectedRoles)) {
            await handleRolesChange(selectedRoles);
          }
        },
      },
    ],
  });

  await alert.present();
};

const handleAddNewUser = async (): Promise<void> => {
  const alert = await alertController.create({
    header: 'Habilitar nou usuari',
    subHeader: 'Introdueix el correu electrònic per permetre que es pugui registrar a la colla:',
    inputs: [
      {
        name: 'email',
        type: 'email',
        placeholder: 'correu@exemple.com',
      },
    ],
    buttons: [
      {
        text: 'Cancel·lar',
        role: 'cancel',
      },
      {
        text: 'Habilitar',
        handler: async (data: { email?: string }) => {
          const email = data.email?.trim();
          if (!email) return false;

          try {
            await addAllowedEmail(email);

            const msg = 'Correu autoritzat correctament. Ara ja es pot registrar.';
            notify({ title: 'Usuari autoritzat', message: msg, variant: 'primary' });
            return true;
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error a l'autoritzar el correu.";
            notify({ title: "Error a l'autoritzar", message, variant: 'danger' });
            return false;
          }
        },
      },
    ],
  });

  await alert.present();
};

const handleSaveUser = async (data: UpdateProfileData): Promise<void> => {
  if (!selectedUser.value) return;

  isSaving.value = true;
  modalError.value = '';

  try {
    const updated = await updateUser(selectedUser.value.id, { ...data, role: selectedUser.value.role });
    selectedUser.value = { ...selectedUser.value, ...updated };

    if (String(selectedUser.value.id) === String(authUser.value?.id)) {
      syncCurrentUser(updated);
      await refreshAuthUser().catch(() => {});
    }

    showEditModal.value = false;
    notify({ title: 'Dades personals', message: "Dades de l'usuari actualitzades correctament.", variant: 'primary' });
  } catch (err: unknown) {
    modalError.value = err instanceof Error ? err.message : "Error a l'actualitzar l'usuari.";
  } finally {
    isSaving.value = false;
  }
};

const handleRemoveUser = async (user: User): Promise<void> => {
  const isPending = Boolean(user.is_pending);

  if (!isPending && String(user.id) === String(authUser.value?.id)) {
    notify({
      title: 'Acció no permesa',
      message: 'No et pots eliminar a tu mateix.',
      variant: 'danger',
    });
    return;
  }

  const alert = await alertController.create({
    header: isPending ? 'Cancel·lar autorització' : 'Eliminar usuari',
    message: isPending
      ? `Vols cancel·lar l'autorització per al correu ${user.email}?`
      : `Vols eliminar l'usuari ${user.name}?`,
    buttons: [
      { text: 'Cancel·lar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          try {
            await removeUserOrInvitation(user.id);
            closeModal();
            notify({
              title: isPending ? 'Autorització cancel·lada' : 'Usuari eliminat',
              message: isPending
                ? 'S’ha cancel·lat l’autorització correctament.'
                : 'S’ha eliminat l’usuari correctament.',
              variant: 'primary',
            });
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error al processar la sol·licitud.';
            notify({ title: 'Error en la sol·licitud', message: msg, variant: 'danger' });
          }
        },
      },
    ],
  });

  await alert.present();
};

onMounted(async () => {
  await fetchUsers().catch(() => {
    // Error is handled in composable state
  });
});
</script>

<template>
  <div class="c-admin-users-section">
    <!-- Header de la secció -->
    <div class="c-admin-users-section__page-header">
      <h2 class="c-admin-users-section__main-title">Gestió d’usuaris</h2>
    </div>

    <!-- Subbarra amb filtres i comptador -->
    <section class="c-admin-users-section__subbar">
      <button type="button" class="c-admin-users-section__filter-indicator">
        <ion-icon :icon="iconFilterList" class="c-admin-users-section__filter-icon" />
        <span class="c-admin-users-section__filter-label">Veure tots</span>
      </button>
      <div class="c-admin-users-section__counter">
        <span class="c-admin-users-section__count-value">{{ totalUsers }}</span> usuaris
      </div>
    </section>

    <!-- Botó per afegir nou usuari -->
    <div class="c-admin-users-section__action-bar">
      <button type="button" class="c-admin-users-section__add-btn" data-testid="add-user-btn" @click="handleAddNewUser">
        <ion-icon :icon="iconPersonAdd" class="c-admin-users-section__add-icon" />
        <span>Afegir nou usuari</span>
      </button>
    </div>

    <!-- Llistat d'usuaris -->
    <section class="c-admin-users-section__list-section">
      <div v-if="isLoading" class="c-admin-users-section__loading">
        <ion-spinner name="crescent" />
      </div>

      <div v-else-if="error" class="c-admin-users-section__error">
        <p>{{ error }}</p>
        <ion-button fill="outline" size="small" @click="fetchUsers">Reintentar</ion-button>
      </div>

      <div v-else-if="users.length === 0" class="c-admin-users-section__empty">
        <p>No s'ha trobat cap usuari registrat.</p>
      </div>

      <ul v-else class="c-admin-users-section__list">
        <li v-for="user in users" :key="user.id" class="c-admin-users-section__item">
          <button
            type="button"
            class="c-admin-users-section__item-btn"
            data-testid="user-item-btn"
            :aria-label="`Consultar usuari ${user.name}`"
            @click="openUserModal(user)"
          >
            <UserAvatar :src="user.avatar" :alt="user.name" size="md" class="c-admin-users-section__avatar" />
            <div class="c-admin-users-section__info">
              <span class="c-admin-users-section__name">
                <strong class="c-admin-users-section__first-name">{{ user.name }}</strong>
                <span v-if="user.surname" class="c-admin-users-section__surname">{{ user.surname }}</span>
              </span>
              <span class="c-admin-users-section__email">{{ user.email }}</span>
            </div>
            <span v-if="user.is_pending" class="c-admin-users-section__badge c-admin-users-section__badge--pending"
              >Pendent</span
            >
            <span v-else-if="user.role === 'admin'" class="c-admin-users-section__badge">Admin</span>
          </button>
        </li>
      </ul>

      <div class="c-admin-users-section__footer">
        <button type="button" class="c-admin-users-section__footer-btn">
          <span class="c-admin-users-section__footer-text">Llista completa</span>
        </button>
      </div>
    </section>

    <!-- Modal de detall d'usuari -->
    <UserDetailModal
      :is-open="showUserModal"
      :user="selectedUser"
      @close="closeModal"
      @edit-details="startEditing"
      @edit-roles="handleEditRole"
      @remove="handleRemoveUser"
    />

    <!-- Modal d'edició de dades personals -->
    <EditUserModal
      v-model:is-open="showEditModal"
      :user="selectedUser"
      :is-saving="isSaving"
      :error-message="modalError"
      @close="cancelEditing"
      @save="handleSaveUser"
    />
  </div>
</template>

<style lang="scss" src="./AdminUsersSection.scss"></style>
