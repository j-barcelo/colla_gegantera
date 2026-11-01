<script setup lang="ts">
import { useNotification } from '../../composables/useNotification';
import AppNotification from './AppNotification.vue';

const { notifications, dismissNotification } = useNotification();
</script>

<template>
  <aside class="c-notification-host" aria-label="Notificacions">
    <TransitionGroup name="c-notification-transition" tag="div" class="c-notification-host__list">
      <AppNotification
        v-for="item in notifications"
        :id="item.id"
        :key="item.id"
        :title="item.title"
        :message="item.message"
        :duration="item.duration"
        :variant="item.variant"
        @close="dismissNotification(item.id)"
      />
    </TransitionGroup>
  </aside>
</template>

<style lang="scss" src="./AppNotificationHost.scss"></style>
