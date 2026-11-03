<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar/UserAvatar.vue';
import { IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { iconHome, iconHomeFilled, iconPhotoLibrary, iconPhotoLibraryFilled } from '@shared';
import { useAuth } from '@shared/composables/useAuth';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const { user } = useAuth();
const route = useRoute();
const currentTab = ref('home');

watch(
  () => route.path,
  (path) => {
    if (path.includes('/tabs/profile')) {
      currentTab.value = 'profile';
    } else if (path.includes('/tabs/gallery')) {
      currentTab.value = 'gallery';
    } else {
      currentTab.value = 'home';
    }
  },
  { immediate: true },
);

const onTabChange = (event: { tab: string }) => {
  currentTab.value = event.tab;
};
</script>

<template>
  <ion-page>
    <ion-tabs @ion-tabs-did-change="onTabChange">
      <ion-router-outlet></ion-router-outlet>

      <ion-tab-bar slot="bottom" class="c-app-tab-bar" aria-label="Navegació principal de l'aplicació">
        <ion-tab-button tab="home" href="/tabs/home" class="c-app-tab-bar__item">
          <ion-icon aria-hidden="true" :icon="currentTab === 'home' ? iconHomeFilled : iconHome" />
          <ion-label>Inici</ion-label>
          <span class="c-app-tab-bar__indicator" aria-hidden="true"></span>
        </ion-tab-button>

        <ion-tab-button tab="gallery" href="/tabs/home" class="c-app-tab-bar__item">
          <ion-icon aria-hidden="true" :icon="currentTab === 'gallery' ? iconPhotoLibraryFilled : iconPhotoLibrary" />
          <ion-label>Galeria</ion-label>
          <span class="c-app-tab-bar__indicator" aria-hidden="true"></span>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile" class="c-app-tab-bar__item">
          <UserAvatar :src="user?.avatar" alt="Foto de perfil" size="sm" class="c-app-tab-bar__avatar" />
          <ion-label>Tu</ion-label>
          <span class="c-app-tab-bar__indicator" aria-hidden="true"></span>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<style lang="scss" src="./TabsPage.scss"></style>
