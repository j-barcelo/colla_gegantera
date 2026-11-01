<script setup lang="ts">
import AdminUsersSection from '@/components/AdminUsersSection/AdminUsersSection.vue';
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
import { arrowBackOutline } from 'ionicons/icons';
import { onMounted, onUnmounted, ref } from 'vue';

const ionRouter = useIonRouter();
const pageRef = ref<InstanceType<typeof IonPage> | null>(null);
const isModalOpen = ref(false);

const handleGoBack = (): void => {
  ionRouter.navigate('/tabs/tab1', 'back', 'pop', slideFromLeftTransition);
};

let backGesture: ReturnType<typeof createGesture> | null = null;

onMounted(() => {
  const pageEl = (pageRef.value as unknown as { $el?: HTMLElement })?.$el ?? (pageRef.value as unknown as HTMLElement);
  if (pageEl) {
    backGesture = createGesture({
      el: pageEl,
      gestureName: 'swipe-back-from-admin',
      direction: 'x',
      threshold: 20,
      onEnd: (detail) => {
        // El dit es mou cap a l'esquerra (deltaX negatiu)
        if (detail.deltaX < -70 && !isModalOpen.value) handleGoBack();
      },
    });
    backGesture.enable();
  }
});

onUnmounted(() => {
  backGesture?.destroy();
});
</script>

<template>
  <ion-page ref="pageRef" class="c-admin-page">
    <ion-header v-show="!isModalOpen" class="ion-no-border">
      <ion-toolbar class="c-admin-page__toolbar">
        <ion-buttons slot="start">
          <ion-button fill="clear" class="c-admin-page__back-btn" aria-label="Tornar a l'inici" @click="handleGoBack">
            <ion-icon slot="icon-only" :icon="arrowBackOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="c-admin-page__content">
      <AdminUsersSection @modal-open="isModalOpen = $event" />
    </ion-content>
  </ion-page>
</template>

<style lang="scss" src="./AdminUsersPage.scss"></style>
