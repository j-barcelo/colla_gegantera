import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ChangePasswordModal from '../ChangePasswordModal.vue';

describe('ChangePasswordModal.vue', () => {
  const mountModal = (props = {}) =>
    mount(ChangePasswordModal, {
      props: {
        isOpen: true,
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
          AppAlert: {
            name: 'AppAlert',
            template: '<div role="alert"><slot /></div>',
          },
          AppInput: {
            name: 'AppInput',
            template: `
              <div class="app-input-wrapper">
                <label :for="id">{{ label }}</label>
                <input
                  :id="id"
                  :name="name"
                  :value="modelValue"
                  :disabled="disabled"
                  @input="$emit('update:modelValue', $event.target.value)"
                />
              </div>
            `,
            props: ['modelValue', 'label', 'disabled', 'validator', 'id', 'type', 'name'],
            emits: ['update:modelValue'],
          },
          AppButton: {
            name: 'AppButton',
            template:
              '<button :data-testid="$attrs[\'data-testid\']" :type="type" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['type', 'disabled'],
          },
        },
      },
    });

  it('renders all password inputs and action buttons', () => {
    const wrapper = mountModal();

    expect(wrapper.find('#password-modal-title').text()).toMatch(/contrasenya/i);
    expect(wrapper.findAllComponents({ name: 'AppInput' })).toHaveLength(3);
    expect(wrapper.find('input[name="current_password"]').exists()).toBe(true);
    expect(wrapper.find('input[name="password"]').exists()).toBe(true);
    expect(wrapper.find('input[name="password_confirmation"]').exists()).toBe(true);
  });

  it('shows error if submitted with empty fields', async () => {
    const wrapper = mountModal();

    await wrapper.find('form').trigger('submit.prevent');
    const alert = wrapper.find('[role="alert"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toBe('La contrasenya actual és obligatòria.');
  });

  it('emits save event when valid passwords are submitted', async () => {
    const wrapper = mountModal();

    await wrapper.find('input[name="current_password"]').setValue('OldPassword123!');
    await wrapper.find('input[name="password"]').setValue('NewPassword123!');
    await wrapper.find('input[name="password_confirmation"]').setValue('NewPassword123!');

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted('save')).toBeTruthy();
    expect(wrapper.emitted('save')?.[0]).toEqual([
      {
        current_password: 'OldPassword123!',
        password: 'NewPassword123!',
        password_confirmation: 'NewPassword123!',
      },
    ]);
  });

  it('emits close and update:isOpen on cancel button', async () => {
    const wrapper = mountModal();
    const cancelBtn = wrapper.find('[data-testid="cancel-btn"]');

    expect(cancelBtn.exists()).toBe(true);
    await cancelBtn.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('update:isOpen')?.[0]).toEqual([false]);
  });

  it('shows external errorMessage and loading state when saving', () => {
    const wrapper = mountModal({ errorMessage: 'Contrasenya incorrecta', isSaving: true });

    expect(wrapper.find('[role="alert"]').text()).toBe('Contrasenya incorrecta');
    expect(wrapper.find<HTMLButtonElement>('[data-testid="save-btn"]').element.disabled).toBe(true);
  });
});
