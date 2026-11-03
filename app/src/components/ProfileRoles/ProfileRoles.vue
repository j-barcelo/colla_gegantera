<script setup lang="ts">
import { materialPaths } from '@shared';
import type { User, UserRole } from '@shared/types/auth';
import { computed } from 'vue';

interface Props {
  user?: User | null;
  editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  editable: false,
});

const emit = defineEmits<{
  'update:role': [role: UserRole];
  edit: [];
}>();

const DEFAULT_ROLE_LABELS: Record<UserRole, string[]> = {
  admin: ['Administració'],
  member: ['Portadors'],
};

const assignedRoles = computed<string[]>(() => {
  const user = props.user;
  if (!user) return [];
  if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles;
  return (user.role && DEFAULT_ROLE_LABELS[user.role]) ?? [];
});
</script>

<template>
  <section class="c-profile-roles" aria-labelledby="roles-heading">
    <div class="c-profile-roles__header">
      <h2 id="roles-heading" class="c-profile-roles__title">Rols i permisos</h2>

      <button
        v-if="editable"
        type="button"
        class="c-profile-roles__edit-btn"
        aria-label="Modificar rols"
        @click="emit('edit')"
      >
        <svg class="c-profile-roles__edit-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path :d="materialPaths.edit" />
        </svg>
      </button>
    </div>

    <ul v-if="assignedRoles.length > 0" class="c-profile-roles__list">
      <li v-for="role in assignedRoles" :key="role" class="c-profile-roles__item">
        {{ role }}
      </li>
    </ul>
    <p v-else class="c-profile-roles__empty">Sense rols assignats</p>
  </section>
</template>

<style lang="scss" src="./ProfileRoles.scss"></style>
