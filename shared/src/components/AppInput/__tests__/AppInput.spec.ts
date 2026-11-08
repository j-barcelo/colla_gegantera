import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppInput from '../AppInput.vue';

describe('AppInput.vue', () => {
  it('emits update:modelValue on typing', async () => {
    const wrapper = mount(AppInput, {
      props: {
        id: 'test-input',
        modelValue: '',
      },
    });

    const input = wrapper.find('input');
    await input.setValue('nou text');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['nou text']);
  });

  it('displays external error message and marks input invalid', () => {
    const wrapper = mount(AppInput, {
      props: {
        id: 'test-error',
        error: 'Camp obligatori',
      },
    });

    expect(wrapper.text()).toContain('Camp obligatori');
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
  });

  it('executes validator and sets internal error on blur', async () => {
    const validator = (val: string) => (!val ? 'El valor és buit' : '');
    const wrapper = mount(AppInput, {
      props: {
        id: 'validator-test',
        validator,
      },
    });

    const input = wrapper.find('input');
    await input.trigger('blur');

    expect(wrapper.text()).toContain('El valor és buit');
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
  });

  it('toggles password visibility when type is password', async () => {
    const wrapper = mount(AppInput, {
      props: {
        id: 'pwd',
        type: 'password',
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('type')).toBe('password');

    const toggleBtn = wrapper.find('[data-testid="toggle-password-visibility"]');
    expect(toggleBtn.exists()).toBe(true);

    await toggleBtn.trigger('click');
    expect(wrapper.find('input').attributes('type')).toBe('text');

    await toggleBtn.trigger('click');
    expect(wrapper.find('input').attributes('type')).toBe('password');
  });
});
