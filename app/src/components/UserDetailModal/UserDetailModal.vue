<script setup lang="ts">
import ProfileDetails from '@/components/ProfileDetails/ProfileDetails.vue';
import ProfileRoles from '@/components/ProfileRoles/ProfileRoles.vue';
import UserAvatar from '@/components/UserAvatar/UserAvatar.vue';
import { IonContent, IonIcon, IonModal } from '@ionic/vue';
import type { User } from '@shared';
import { AppButton, iconClose } from '@shared';
import { computed } from 'vue';

interface Props {
  isOpen: boolean;
  user: User | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  'edit-details': [];
  'edit-roles': [];
  remove: [user: User];
}>();

const userHandle = computed(() => {
  if (props.user?.username) return `#${props.user.username.replace(/^#/, '')}`;
  if (props.user?.email) return `#${props.user.email.split('@')[0]}`;
  if (props.user?.name) return `#${props.user.name.toLowerCase().replace(/\s+/g, '')}`;
  return '#usuari';
});
</script>

<template>
  <ion-modal :is-open="isOpen && !!user" class="c-user-detail-modal" @did-dismiss="emit('close')">
    <ion-content class="c-user-detail-modal__content">
      <div v-if="user" class="c-user-detail-modal__inner">
        <!-- Cyan Hero Header igual que ProfilePage -->
        <header class="c-profile-header">
          <div class="c-profile-header__top">
            <div class="c-profile-header__text">
              <h1 id="user-modal-title" class="c-profile-header__title">
                {{ user.is_pending ? 'Invitació pendent' : 'Dades personals' }}
              </h1>
              <p class="c-profile-header__handle">{{ userHandle }}</p>
            </div>

            <button type="button" class="c-profile-header__logout" aria-label="Tancar" @click="emit('close')">
              <ion-icon :icon="iconClose" aria-hidden="true" />
            </button>
          </div>

          <div class="c-profile-header__avatar-wrapper">
            <UserAvatar :src="user.avatar" :alt="user.name" size="xl" />
          </div>
        </header>

        <!-- Components reutilitzats exactament iguals per a registrats i pendents -->
        <ProfileDetails :user="user" :editable="true" @edit="emit('edit-details')" />

        <ProfileRoles :user="user" :editable="true" @edit="emit('edit-roles')" />

        <section class="c-user-detail-modal__security-section">
          <AppButton
            type="button"
            variant="outline-primary"
            class="c-user-detail-modal__action-btn"
            @click="emit('remove', user)"
          >
            {{ user.is_pending ? 'Cancel·lar autorització' : 'ELIMINAR USUARI' }}
          </AppButton>
        </section>
      </div>
    </ion-content>
  </ion-modal>
</template>

<style lang="scss" src="./UserDetailModal.scss"></style>
