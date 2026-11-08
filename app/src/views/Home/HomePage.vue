<script setup lang="ts">
import EventsList from '@/components/EventsList/EventsList.vue';
import { slideFromLeftTransition } from '@/utils/pageTransitions';
import { createGesture, IonContent, IonIcon, IonPage, useIonRouter } from '@ionic/vue';
import { iconCalendar, iconFilterList, iconNotifications, iconVerifiedUser } from '@shared';
import { useAuth } from '@shared/composables/useAuth';
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';

const ionRouter = useIonRouter();
const { isAdmin } = useAuth();
const pageRef = ref<InstanceType<typeof IonPage> | null>(null);

let swipeGesture: ReturnType<typeof createGesture> | null = null;

const goToAdmin = () => {
  if (isAdmin.value) {
    ionRouter.navigate('/admin/users', 'forward', 'push', slideFromLeftTransition);
  }
};

const activeFilter = ref<'all' | 'confirmed' | 'pending'>('all');
const showFilterMenu = ref(false);

const filterOptions = [
  { id: 'all' as const, label: 'Veure tot' },
  { id: 'confirmed' as const, label: 'Només confirmats' },
  { id: 'pending' as const, label: 'Pendents de confirmació' },
];

const activeFilterLabel = computed(() => {
  return filterOptions.find((f) => f.id === activeFilter.value)?.label ?? 'Veure tot';
});

const selectFilter = (id: 'all' | 'confirmed' | 'pending') => {
  activeFilter.value = id;
  showFilterMenu.value = false;
};

onMounted(async () => {
  await nextTick();
  const pageEl = (pageRef.value as unknown as { $el?: HTMLElement })?.$el ?? (pageRef.value as unknown as HTMLElement);
  if (pageEl) {
    swipeGesture = createGesture({
      el: pageEl,
      gestureName: 'swipe-to-admin',
      direction: 'x',
      threshold: 15,
      gesturePriority: 40,
      canStart: () => isAdmin.value,
      onEnd: (detail) => {
        if (isAdmin.value && (detail.deltaX > 60 || (detail.deltaX > 30 && detail.velocityX > 0.3))) {
          goToAdmin();
        }
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
  <ion-page ref="pageRef" class="c-home-page">
    <header class="c-home-page__header">
      <div class="c-home-page__main">
        <h1 class="c-home-page__title">Confirmar assistència</h1>

        <div class="c-home-page__actions">
          <button
            v-if="isAdmin"
            type="button"
            class="c-home-page__admin-btn"
            aria-label="Panell d'administració"
            @click="goToAdmin"
          >
            <ion-icon :icon="iconVerifiedUser" aria-hidden="true" />
          </button>

          <button type="button" class="c-home-page__bell-btn" aria-label="Veure avisos i comunicats (1 nou)">
            <ion-icon :icon="iconNotifications" aria-hidden="true" />
            <span class="c-home-page__bell-badge" aria-hidden="true">1</span>
          </button>
        </div>
      </div>

      <div class="c-home-page__sub-bar">
        <button
          type="button"
          class="c-home-page__filter-btn"
          :aria-expanded="showFilterMenu"
          aria-haspopup="listbox"
          @click="showFilterMenu = !showFilterMenu"
        >
          <ion-icon :icon="iconFilterList" aria-hidden="true" />
          <span>{{ activeFilterLabel }}</span>
        </button>

        <button type="button" class="c-home-page__toggle-btn" aria-label="Vista de calendari">
          <ion-icon :icon="iconCalendar" aria-hidden="true" />
          <span class="c-home-page__cal-num" aria-hidden="true">04</span>
        </button>

        <ul v-if="showFilterMenu" class="c-home-page__menu">
          <li
            v-for="f in filterOptions"
            :key="f.id"
            class="c-home-page__menu-item"
            :class="{ 'c-home-page__menu-item--active': activeFilter === f.id }"
          >
            <button type="button" class="c-home-page__menu-btn" :data-filter-id="f.id" @click="selectFilter(f.id)">
              {{ f.label }}
            </button>
          </li>
        </ul>
      </div>
    </header>

    <ion-content :fullscreen="true" class="c-home-page__content">
      <EventsList />
    </ion-content>
  </ion-page>
</template>

<style lang="scss" src="./HomePage.scss"></style>
