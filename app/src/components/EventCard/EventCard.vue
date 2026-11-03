<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { AppButton, iconLocationOn, iconSchedule, materialPaths } from '@shared';

interface Props {
  title: string;
  dayNumber: string | number;
  monthName: string;
  location: string;
  time: string;
  confirmed?: boolean;
  attendeesCount?: number;
  carriersCount?: number;
  musiciansCount?: number;
}

withDefaults(defineProps<Props>(), {
  confirmed: false,
  attendeesCount: 0,
  carriersCount: 0,
  musiciansCount: 0,
});

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'click-details'): void;
  (e: 'toggle-status'): void;
}>();
</script>

<template>
  <article class="c-event-card" @click="emit('click')">
    <h2 class="c-event-card__title">{{ title }}</h2>

    <div class="c-event-card__main">
      <button
        type="button"
        class="c-event-card__status"
        :class="confirmed ? 'c-event-card__status--confirmed' : 'c-event-card__status--pending'"
        :aria-label="
          confirmed
            ? 'Assistència confirmada. Prem per canviar estat'
            : 'Pendent de confirmació. Prem per confirmar assistència'
        "
        @click.stop="emit('toggle-status')"
      >
        <svg
          v-if="confirmed"
          class="c-event-card__check-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path :d="materialPaths.check" />
        </svg>
        <svg
          v-else
          class="c-event-card__dash-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path :d="materialPaths.remove" />
        </svg>
      </button>

      <div class="c-event-card__date">
        <span class="c-event-card__day">{{ dayNumber }}</span>
        <span class="c-event-card__month">{{ monthName }}</span>
      </div>

      <div class="c-event-card__meta">
        <div class="c-event-card__meta-item">
          <ion-icon :icon="iconLocationOn" aria-hidden="true" />
          <span>{{ location }}</span>
        </div>
        <div class="c-event-card__meta-item">
          <ion-icon :icon="iconSchedule" aria-hidden="true" />
          <span>{{ time }}</span>
        </div>
      </div>
    </div>

    <div class="c-event-card__footer">
      <div class="c-event-card__attendance">
        <p class="c-event-card__count">
          Han confirmat <strong>{{ attendeesCount }} persones</strong>
        </p>
        <p class="c-event-card__roles">{{ carriersCount }} Portadors &nbsp; {{ musiciansCount }} Músics</p>
      </div>

      <AppButton
        type="button"
        variant="outline-light"
        class="c-event-card__details-btn"
        aria-label="Veure més detalls"
        @click.stop="emit('click-details')"
      >
        + DETALLS
      </AppButton>
    </div>
  </article>
</template>

<style lang="scss" src="./EventCard.scss"></style>
