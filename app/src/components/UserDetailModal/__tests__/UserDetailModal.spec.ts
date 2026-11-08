import type { User } from '@shared/types/auth';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import UserDetailModal from '../UserDetailModal.vue';

describe('UserDetailModal.vue', () => {
  const activeUser: User = {
    id: 10,
    name: 'Llorenç',
    username: 'llorenc99',
    email: 'llorenc@colla.cat',
    role: 'member',
    is_pending: false,
  };

  const pendingUser: User = {
    id: 11,
    name: 'Nou Membre',
    email: 'nou@colla.cat',
    role: 'member',
    is_pending: true,
  };

  const mountModal = (user: User | null, isOpen = true) =>
    mount(UserDetailModal, {
      props: {
        isOpen,
        user,
      },
      global: {
        stubs: {
          'ion-modal': {
            name: 'IonModal',
            template: '<div v-if="isOpen" class="ion-modal-stub"><slot /></div>',
            props: ['isOpen'],
          },
          'ion-content': { template: '<div><slot /></div>' },
          'ion-icon': true,
          UserAvatar: true,
          ProfileDetails: {
            name: 'ProfileDetails',
            template: '<div />',
            props: ['user', 'editable'],
            emits: ['edit'],
          },
          ProfileRoles: {
            name: 'ProfileRoles',
            template: '<div />',
            props: ['user', 'editable'],
            emits: ['edit'],
          },
          AppButton: {
            name: 'AppButton',
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    });

  it('renders modal with active user details and handle', () => {
    const wrapper = mountModal(activeUser);

    expect(wrapper.find('#user-modal-title').text()).toBe('Dades personals');
    expect(wrapper.text()).toContain('#llorenc99');
    expect(wrapper.findComponent({ name: 'AppButton' }).text()).toBe('ELIMINAR USUARI');
  });

  it('renders pending user header and cancel authorization button', () => {
    const wrapper = mountModal(pendingUser);

    expect(wrapper.find('#user-modal-title').text()).toBe('Invitació pendent');
    expect(wrapper.text()).toContain('#nou');
    expect(wrapper.findComponent({ name: 'AppButton' }).text()).toBe('Cancel·lar autorització');
  });

  it('emits close event on close button click', async () => {
    const wrapper = mountModal(activeUser);
    const closeBtn = wrapper.find('[data-testid="close-modal-btn"]');

    await closeBtn.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('forwards edit-details event from ProfileDetails', async () => {
    const wrapper = mountModal(activeUser);
    const profileDetails = wrapper.findComponent({ name: 'ProfileDetails' });

    await profileDetails.vm.$emit('edit');
    expect(wrapper.emitted('edit-details')).toBeTruthy();
  });

  it('forwards edit-roles event from ProfileRoles', async () => {
    const wrapper = mountModal(activeUser);
    const profileRoles = wrapper.findComponent({ name: 'ProfileRoles' });

    await profileRoles.vm.$emit('edit');
    expect(wrapper.emitted('edit-roles')).toBeTruthy();
  });

  it('emits remove event with user on action button click', async () => {
    const wrapper = mountModal(activeUser);
    const actionBtn = wrapper.findComponent({ name: 'AppButton' });

    await actionBtn.trigger('click');
    expect(wrapper.emitted('remove')).toBeTruthy();
    expect(wrapper.emitted('remove')?.[0]).toEqual([activeUser]);
  });
});
