import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProfileSecurity from '../ProfileSecurity.vue';

describe('ProfileSecurity.vue', () => {
  const mountProfileSecurity = (props = {}) =>
    mount(ProfileSecurity, {
      props,
      global: {
        stubs: {
          AppButton: {
            name: 'AppButton',
            template:
              '<button :data-testid="$attrs[\'data-testid\']" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['disabled'],
          },
        },
      },
    });

  it('renders modify password button and emits changePassword on click', async () => {
    const wrapper = mountProfileSecurity();

    const button = wrapper.find('[data-testid="change-password-btn"]');
    expect(button.exists()).toBe(true);

    await button.trigger('click');
    expect(wrapper.emitted('changePassword')).toBeTruthy();
  });
});
