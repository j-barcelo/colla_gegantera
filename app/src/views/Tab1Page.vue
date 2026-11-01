<script setup lang="ts">
import ExploreContainer from '@/components/ExploreContainer.vue';
import { slideFromLeftTransition } from '@/utils/pageTransitions';
import {
  createGesture,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonToolbar,
  useIonRouter,
} from '@ionic/vue';
import { useAuth } from '@shared/composables/useAuth';
import { shieldCheckmarkOutline } from 'ionicons/icons';
import { onMounted, onUnmounted, ref } from 'vue';

const ionRouter = useIonRouter();
const { isAdmin } = useAuth();
const pageRef = ref<InstanceType<typeof IonPage> | null>(null);

let swipeGesture: ReturnType<typeof createGesture> | null = null;

const goToAdmin = () => {
  if (isAdmin.value) {
    ionRouter.navigate('/admin/users', 'forward', 'push', slideFromLeftTransition);
  }
};

onMounted(() => {
  const pageEl = (pageRef.value as unknown as { $el?: HTMLElement })?.$el ?? (pageRef.value as unknown as HTMLElement);
  if (pageEl) {
    swipeGesture = createGesture({
      el: pageEl,
      gestureName: 'swipe-to-admin',
      direction: 'x',
      threshold: 15,
      onEnd: (detail) => {
        // El dit es mou d'esquerra a dreta (deltaX positiu)
        if (isAdmin.value && detail.deltaX > 60) goToAdmin();
      },
    });
    swipeGesture.enable();
  }
});

onUnmounted(() => {
  swipeGesture?.destroy();
});
</script>

<template>
  <ion-page ref="pageRef" class="c-tab1">
    <ion-header class="ion-no-border">
      <ion-toolbar class="c-tab1__toolbar">
        <ion-buttons slot="start">
          <ion-button
            v-if="isAdmin"
            fill="clear"
            class="c-tab1__admin-btn"
            aria-label="Panell d'administració"
            @click="goToAdmin"
          >
            <ion-icon slot="icon-only" :icon="shieldCheckmarkOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ExploreContainer name="Pàgina d'inici" />
    </ion-content>
  </ion-page>
</template>

<style lang="scss" src="./Tab1Page.scss"></style>
