import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppAlert from '../AppAlert.vue';

describe('AppAlert.vue', () => {
  it('renders alert with accessible role and message', () => {
    const wrapper = mount(AppAlert, {
      slots: {
        default: 'Missatge d’alerta',
      },
    });

    expect(wrapper.attributes('role')).toBe('alert');
    expect(wrapper.text()).toContain('Missatge d’alerta');
  });

  it('renders icon slot when provided', () => {
    const wrapper = mount(AppAlert, {
      slots: {
        icon: '<span data-testid="alert-icon">!</span>',
        default: 'Alerta amb icona',
      },
    });

    expect(wrapper.find('[data-testid="alert-icon"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Alerta amb icona');
  });
});
