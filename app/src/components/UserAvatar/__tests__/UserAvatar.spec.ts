import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import UserAvatar from '../UserAvatar.vue';

describe('UserAvatar.vue', () => {
  it('renders avatar with default image when src is not provided', () => {
    const wrapper = mount(UserAvatar, {
      props: {
        alt: 'Usuari Joan',
      },
    });

    const img = wrapper.find('img');
    expect(img.attributes('alt')).toBe('Usuari Joan');
    expect(img.attributes('src')).toBeTruthy();
  });

  it('renders custom image src when provided', () => {
    const wrapper = mount(UserAvatar, {
      props: {
        src: 'https://cdn.colla.cat/avatar.jpg',
        size: 'sm',
      },
    });

    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe('https://cdn.colla.cat/avatar.jpg');
  });

  it('shows editable button and file input when editable prop is true', async () => {
    const wrapper = mount(UserAvatar, {
      props: {
        editable: true,
      },
    });

    const fileInput = wrapper.find('input[type="file"]');
    const editButton = wrapper.find('[data-testid="edit-avatar-badge"]');

    expect(fileInput.exists()).toBe(true);
    expect(editButton.exists()).toBe(true);
  });

  it('emits selectFile event when a file is selected', async () => {
    const wrapper = mount(UserAvatar, {
      props: {
        editable: true,
      },
    });

    const fileInput = wrapper.find('input[type="file"]');
    const dummyFile = new File(['image-content'], 'avatar.png', { type: 'image/png' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [dummyFile],
      writable: true,
    });

    await fileInput.trigger('change');

    expect(wrapper.emitted('selectFile')?.[0]).toEqual([dummyFile]);
  });
});
