import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AvatarPreviewModal from '../AvatarPreviewModal.vue';

describe('AvatarPreviewModal.vue', () => {
  const mountModal = (props = {}) =>
    mount(AvatarPreviewModal, {
      props: {
        isOpen: true,
        previewUrl: 'blob:http://localhost/test-preview',
        ...props,
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
          UserAvatar: {
            name: 'UserAvatar',
            template: '<div data-testid="user-avatar" :data-src="src" :data-alt="alt" />',
            props: ['src', 'alt', 'size'],
          },
          AppAlert: {
            name: 'AppAlert',
            template: '<div role="alert"><slot /></div>',
          },
          AppButton: {
            name: 'AppButton',
            template:
              '<button :data-testid="$attrs[\'data-testid\']" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['disabled'],
          },
        },
      },
    });

  it('renders modal content with preview and actions', () => {
    const wrapper = mountModal();

    expect(wrapper.find('#avatar-modal-title').exists()).toBe(true);
    const avatar = wrapper.findComponent({ name: 'UserAvatar' });
    expect(avatar.props('src')).toBe('blob:http://localhost/test-preview');
    expect(wrapper.find('[data-testid="change-file-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="confirm-save-btn"]').exists()).toBe(true);
  });

  it('displays error message when provided', () => {
    const wrapper = mountModal({ errorMessage: 'Error de càrrega' });

    expect(wrapper.find('[role="alert"]').text()).toBe('Error de càrrega');
  });

  it('emits change-file on clicking change image button', async () => {
    const wrapper = mountModal();
    const changeBtn = wrapper.find('[data-testid="change-file-btn"]');

    expect(changeBtn.exists()).toBe(true);
    await changeBtn.trigger('click');

    expect(wrapper.emitted('change-file')).toBeTruthy();
  });

  it('emits confirm on clicking save button', async () => {
    const wrapper = mountModal();
    const saveBtn = wrapper.find('[data-testid="confirm-save-btn"]');

    expect(saveBtn.exists()).toBe(true);
    await saveBtn.trigger('click');

    expect(wrapper.emitted('confirm')).toBeTruthy();
  });

  it('emits close and update:isOpen on close button click', async () => {
    const wrapper = mountModal();
    const closeBtn = wrapper.find('[data-testid="close-modal-btn"]');

    await closeBtn.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('update:isOpen')?.[0]).toEqual([false]);
  });

  it('shows loading state when isLoading is true', () => {
    const wrapper = mountModal({ isLoading: true });

    const buttons = wrapper.findAllComponents({ name: 'AppButton' });
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((btn) => {
      expect(btn.props('disabled')).toBe(true);
    });
  });
});
