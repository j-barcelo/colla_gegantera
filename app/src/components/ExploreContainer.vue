<template>
  <div class="c-container">
    <img :src="gegantsImg" alt="Gegants de la Colla" class="c-container__img" width="220" height="220" />
    <h2>{{ name }}</h2>

    <div class="c-api-status">
      <strong>Connexió API Backend</strong>
      <p>{{ apiStatus }}</p>
      <small v-if="apiTimestamp">{{ apiTimestamp }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import gegantsImg from "@shared/assets/images/gegants.webp";
import { fetchApiMessage } from "@shared/utils/api";

defineProps({
  name: {
    type: String,
    default: "",
  },
});

interface MessageResponse {
  message: string;
  timestamp: string;
}

const apiStatus = ref("Connectant amb el backend...");
const apiTimestamp = ref("");

onMounted(async () => {
  try {
    const data = await fetchApiMessage();
    apiStatus.value = data.message;
    apiTimestamp.value = `Timestamp: ${data.timestamp}`;
  } catch (err: unknown) {
    apiStatus.value = "No s'ha pogut connectar amb l'API";
    console.error(err);
  }
});
</script>

<style scoped lang="scss">
@use '@shared/styles' as *;

.c-container {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  transform: translateY(-50%);
  text-align: center;

  &__img {
    margin-bottom: to-rem(16);
    border-radius: to-rem(16);
  }

  h2 {
    margin-bottom: to-rem(16);
    @include font('title-md');
  }

  .c-api-status {
    max-width: to-rem(360);
    padding: to-rem(16);
    margin: to-rem(16) auto 0;
    border: to-rem(1) solid var(--cl-border-light);
    border-radius: to-rem(6);

    strong {
      display: block;
      margin-bottom: to-rem(8);
      @include font('text-sm');
    }

    p {
      margin: 0;
      @include font('base');
    }

    small {
      display: block;
      margin-top: to-rem(4);
      color: var(--cl-text-muted);
      @include font('small');
    }
  }
}
</style>
