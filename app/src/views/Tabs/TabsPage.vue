<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar/UserAvatar.vue';
import { IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { useAuth } from '@shared/composables/useAuth';
import { homeOutline, imagesOutline, statsChartOutline } from 'ionicons/icons';

const { user } = useAuth();
</script>

<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>

      <ion-tab-bar slot="bottom" class="c-app-tab-bar" aria-label="Navegació principal de l'aplicació">
        <ion-tab-button tab="tab1" href="/tabs/tab1" class="c-app-tab-bar__item">
          <ion-icon aria-hidden="true" :icon="homeOutline" />
          <ion-label>Inici</ion-label>
          <span class="c-app-tab-bar__indicator" aria-hidden="true"></span>
        </ion-tab-button>

        <ion-tab-button tab="publications" href="/tabs/tab1" class="c-app-tab-bar__item">
          <ion-icon aria-hidden="true" :icon="statsChartOutline" />
          <ion-label>Publicacions</ion-label>
          <span class="c-app-tab-bar__indicator" aria-hidden="true"></span>
        </ion-tab-button>

        <ion-tab-button tab="gallery" href="/tabs/tab1" class="c-app-tab-bar__item">
          <ion-icon aria-hidden="true" :icon="imagesOutline" />
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
