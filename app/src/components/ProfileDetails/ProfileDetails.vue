<script setup lang="ts">
import { AppButton, materialPaths } from '@shared';
import type { User } from '@shared/types/auth';
import { computed } from 'vue';

interface Props {
  user?: User | null;
  editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  editable: true,
});

const emit = defineEmits<{
  edit: [];
}>();

const firstName = computed(() => {
  if (props.user?.name) {
    if (props.user.surname) return props.user.name;
    const parts = props.user.name.trim().split(/\s+/);
    return parts[0] || '';
  }
  return '';
});

const lastName = computed(() => {
  if (props.user?.surname) return props.user.surname;
  const fullName = props.user?.name || '';
  const parts = fullName.trim().split(/\s+/);
  return parts.slice(1).join(' ');
});
</script>

<template>
  <section class="c-profile-details" aria-labelledby="profile-data-heading">
    <h2 id="profile-data-heading" class="u-visually-hidden">Dades de contacte</h2>

    <slot name="alerts" />

    <div class="c-profile-details__info">
      <p class="c-profile-details__name">
        <strong class="c-profile-details__first-name">{{ firstName }}</strong> {{ lastName }}
      </p>
      <p class="c-profile-details__item"><span class="c-profile-details__prefix">+34</span> {{ user?.phone || '—' }}</p>
      <p class="c-profile-details__item">
        {{ user?.email || '—' }}
      </p>
      <p class="c-profile-details__item">
        <span class="c-profile-details__prefix">c/</span> {{ user?.address || '—' }}
      </p>

      <div v-if="editable" class="c-profile-details__actions">
        <AppButton
          type="button"
          variant="outline-primary"
          class="c-profile-details__edit-btn"
          aria-label="Editar dades personals"
          @click="emit('edit')"
        >
          <span>EDITAR</span>
          <svg class="c-profile-details__edit-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path :d="materialPaths.edit" />
          </svg>
        </AppButton>
      </div>
    </div>
  </section>
</template>

<style lang="scss" src="./ProfileDetails.scss"></style>
