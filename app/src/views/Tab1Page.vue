<script setup lang="ts">
import ExploreContainer from '@/components/ExploreContainer.vue';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { useAuth } from '@shared/composables/useAuth';
import { logOutOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  await router.push('/login');
};
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
        <ion-buttons slot="end">
          <ion-button color="danger" @click="handleLogout">
            <ion-icon slot="start" :icon="logOutOutline" />
            Tancar sessió
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ExploreContainer name="Tab 1 page" />
    </ion-content>
  </ion-page>
</template>
