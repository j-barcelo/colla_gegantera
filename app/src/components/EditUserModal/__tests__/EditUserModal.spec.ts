import type { User } from '@shared/types/auth';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import EditUserModal from '../EditUserModal.vue';

describe('EditUserModal.vue', () => {
  const mockUser: User = {
    id: 1,
    name: 'Antoni',
    surname: 'Rosselló',
    email: 'antoni@colla.cat',
    phone: '600123456',
    address: 'Carrer Gran 5',
    role: 'member',
  };

  const mountModal = (props = {}) =>
    mount(EditUserModal, {
      props: {
        isOpen: true,
        user: mockUser,
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
            props: ['modelValue', 'label', 'disabled', 'validator', 'id', 'type', 'name', 'autocomplete'],
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

  it('pre-fills fields with user data', () => {
    const wrapper = mountModal();

    expect(wrapper.find('#edit-user-title').text()).toMatch(/dades personals/i);
    expect(wrapper.find<HTMLInputElement>('#edit-user-name').element.value).toBe('Antoni');
    expect(wrapper.find<HTMLInputElement>('#edit-user-surname').element.value).toBe('Rosselló');
    expect(wrapper.find<HTMLInputElement>('#edit-user-email').element.value).toBe('antoni@colla.cat');
    expect(wrapper.find<HTMLInputElement>('#edit-user-phone').element.value).toBe('600123456');
    expect(wrapper.find<HTMLInputElement>('#edit-user-address').element.value).toBe('Carrer Gran 5');
  });

  it('emits save with updated data when form is submitted', async () => {
    const wrapper = mountModal();

    await wrapper.find('#edit-user-name').setValue('Bernat');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted('save')).toBeTruthy();
    expect(wrapper.emitted('save')?.[0]).toEqual([
      {
        name: 'Bernat',
        surname: 'Rosselló',
        email: 'antoni@colla.cat',
        phone: '600123456',
        address: 'Carrer Gran 5',
      },
    ]);
  });

  it('shows error if required fields are missing on submit', async () => {
    const wrapper = mountModal({
      user: { id: 1, name: '', surname: '', email: '', role: 'member' },
    });

    await wrapper.find('form').trigger('submit.prevent');
    const alert = wrapper.find('[role="alert"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toBe('El nom és obligatori.');
  });

  it('emits close and update:isOpen on cancel button', async () => {
    const wrapper = mountModal();
    const cancelBtn = wrapper.find('[data-testid="cancel-btn"]');

    expect(cancelBtn.exists()).toBe(true);
    await cancelBtn.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('update:isOpen')?.[0]).toEqual([false]);
  });

  it('displays loading state and external error', () => {
    const wrapper = mountModal({ isSaving: true, errorMessage: 'Error de servidor' });

    expect(wrapper.find('[role="alert"]').text()).toBe('Error de servidor');
    expect(wrapper.find<HTMLButtonElement>('[data-testid="save-btn"]').element.disabled).toBe(true);
  });
});
