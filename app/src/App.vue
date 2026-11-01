<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { AppNotificationHost } from '@shared';
</script>

<template>
  <ion-app>
    <ion-router-outlet />
    <AppNotificationHost />
  </ion-app>
</template>
