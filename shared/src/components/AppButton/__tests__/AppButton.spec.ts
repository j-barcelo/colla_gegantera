import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppButton from '../AppButton.vue';

describe('AppButton.vue', () => {
  it('renders default button with slot text', () => {
    const wrapper = mount(AppButton, {
      slots: {
        default: 'Entrar',
      },
    });

    expect(wrapper.text()).toBe('Entrar');
    expect(wrapper.attributes('type')).toBe('button');
    expect(wrapper.attributes('disabled')).toBeUndefined();
  });

  it('emits click event on user interaction', async () => {
    const wrapper = mount(AppButton);

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('sets disabled attribute and does not emit click when disabled', async () => {
    const wrapper = mount(AppButton, {
      props: {
        disabled: true,
      },
    });

    expect(wrapper.attributes('disabled')).toBeDefined();
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });
});
