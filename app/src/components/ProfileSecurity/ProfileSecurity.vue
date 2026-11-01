<script setup lang="ts">
import { AppButton } from '@shared';

interface Props {
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  changePassword: [];
}>();
</script>

<template>
  <section class="c-profile-security" aria-label="Seguretat">
    <AppButton
      type="button"
      variant="outline-primary"
      class="c-profile-security__btn"
      :disabled="disabled"
      @click="emit('changePassword')"
    >
      MODIFICAR CONTRASENYA
    </AppButton>
  </section>
</template>

<style lang="scss" src="./ProfileSecurity.scss"></style>
