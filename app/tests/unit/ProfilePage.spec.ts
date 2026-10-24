import ProfilePage from '@/views/Profile/ProfilePage.vue';
import type { User } from '@shared/types/auth';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockUser = ref<User | null>({
  id: 1,
  name: 'Miquel',
  surname: 'Pons Gomila',
  username: 'mponsgomila',
  email: 'miquelpons@gegantsinca.com',
  phone: '668 30 58 60',
  address: 'Jaume I nº33, Inca, Illes Balears',
});

const mockToken = ref<string | null>('test-token');
const mockIsLoading = ref(false);
const mockFetchUser = vi.fn();
const mockUpdateProfile = vi.fn();
const mockUpdatePassword = vi.fn();
const mockUpdateAvatar = vi.fn();
const mockLogout = vi.fn();
const mockOptimizeAvatarToWebp = vi.fn();

vi.mock('@shared', async () => {
  const actual = await vi.importActual<typeof import('@shared')>('@shared');
  return {
    ...actual,
    optimizeAvatarToWebp: (...args: Parameters<typeof actual.optimizeAvatarToWebp>) =>
      mockOptimizeAvatarToWebp(...args),
  };
});

vi.mock('@shared/composables/useAuth', () => ({
  useAuth: () => ({
    user: computed(() => mockUser.value),
    token: computed(() => mockToken.value),
    isLoading: computed(() => mockIsLoading.value),
    fetchUser: mockFetchUser,
    updateProfile: mockUpdateProfile,
    updatePassword: mockUpdatePassword,
    updateAvatar: mockUpdateAvatar,
    logout: mockLogout,
  }),
}));

describe('ProfilePage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.value = {
      id: 1,
      name: 'Miquel',
      surname: 'Pons Gomila',
      username: 'mponsgomila',
      email: 'miquelpons@gegantsinca.com',
      phone: '668 30 58 60',
      address: 'Jaume I nº33, Inca, Illes Balears',
    };
  });

  it('renders user personal data from auth state', () => {
    const wrapper = mount(ProfilePage);

    expect(wrapper.find('.c-profile-header__handle').text()).toBe('#mponsgomila');
    expect(wrapper.find('.c-profile-details__first-name').text()).toBe('Miquel');
    expect(wrapper.find('.c-profile-details__name').text()).toContain('Pons Gomila');
    expect(wrapper.text()).toContain('668 30 58 60');
    expect(wrapper.text()).toContain('miquelpons@gegantsinca.com');
    expect(wrapper.text()).toContain('Jaume I nº33, Inca, Illes Balears');
  });

  it('opens full-screen edit modal, blocks invalid submission, and submits updateProfile when valid', async () => {
    mockUpdateProfile.mockResolvedValueOnce({
      ...mockUser.value,
      name: 'Miquel Editat',
      surname: 'Pons Editat',
    });

    const wrapper = mount(ProfilePage);

    await wrapper.find('.c-profile-details__edit-btn').trigger('click');
    expect(wrapper.find('.c-profile-modal--primary').exists()).toBe(true);

    const nameInput = wrapper.find('#edit-name');
    const surnameInput = wrapper.find('#edit-surname');
    expect((nameInput.element as HTMLInputElement).value).toBe('Miquel');
    expect((surnameInput.element as HTMLInputElement).value).toBe('Pons Gomila');

    await nameInput.setValue('');
    await wrapper.find('.c-profile-modal--primary .c-profile-modal__form').trigger('submit.prevent');
    expect(mockUpdateProfile).not.toHaveBeenCalled();
    expect(wrapper.find('.c-profile-modal--primary .c-input--error').exists()).toBe(true);

    await nameInput.setValue('Miquel Editat');
    await surnameInput.setValue('Pons Editat');
    await wrapper.find('.c-profile-modal--primary .c-profile-modal__form').trigger('submit.prevent');
    await flushPromises();

    expect(mockUpdateProfile).toHaveBeenCalledWith({
      name: 'Miquel Editat',
      surname: 'Pons Editat',
      email: 'miquelpons@gegantsinca.com',
      phone: '668 30 58 60',
      address: 'Jaume I nº33, Inca, Illes Balears',
    });
    expect(wrapper.find('.c-profile-modal--primary').exists()).toBe(false);
  });

  it('opens full-screen dark password modal, blocks mismatched confirmation, and calls updatePassword when valid', async () => {
    mockUpdatePassword.mockResolvedValueOnce({ message: 'OK' });

    const wrapper = mount(ProfilePage);

    await wrapper.find('.c-profile-security__btn').trigger('click');
    expect(wrapper.find('.c-profile-modal--dark').exists()).toBe(true);

    await wrapper.find('#old-pass').setValue('current123');
    await wrapper.find('#new-pass').setValue('newpassword123');
    await wrapper.find('#confirm-pass').setValue('mismatch123');

    await wrapper.find('.c-profile-modal--dark .c-profile-modal__form').trigger('submit.prevent');
    expect(mockUpdatePassword).not.toHaveBeenCalled();
    expect(wrapper.find('.c-profile-modal--dark .c-input--error').exists()).toBe(true);

    await wrapper.find('#confirm-pass').setValue('newpassword123');
    await wrapper.find('.c-profile-modal--dark .c-profile-modal__form').trigger('submit.prevent');
    await flushPromises();

    expect(mockUpdatePassword).toHaveBeenCalledWith({
      current_password: 'current123',
      password: 'newpassword123',
      password_confirmation: 'newpassword123',
    });
    expect(wrapper.find('.c-profile-modal--dark').exists()).toBe(false);
  });

  it('calls logout and redirects to /login when logout button is clicked', async () => {
    mockLogout.mockResolvedValueOnce(undefined);

    const wrapper = mount(ProfilePage);

    await wrapper.find('.c-profile-header__logout').trigger('click');
    await flushPromises();

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('transforms valid selected avatar to WebP, displays preview modal, and uploads on confirm', async () => {
    const wrapper = mount(ProfilePage);
    const fileInput = wrapper.find('input[type="file"]');

    const invalidFile = new File(['bad'], 'doc.pdf', { type: 'application/pdf' });
    Object.defineProperty(fileInput.element, 'files', {
      value: [invalidFile],
      configurable: true,
    });
    await fileInput.trigger('change');
    await flushPromises();

    expect(mockOptimizeAvatarToWebp).not.toHaveBeenCalled();
    expect(mockUpdateAvatar).not.toHaveBeenCalled();
    expect(wrapper.find('.c-alert--danger').exists()).toBe(true);

    const validFile = new File(['img'], 'avatar.png', { type: 'image/png' });
    const transformedWebp = new File(['webp-img'], 'avatar.webp', { type: 'image/webp' });
    mockOptimizeAvatarToWebp.mockResolvedValueOnce({
      file: transformedWebp,
      previewUrl: 'blob:http://localhost/preview-webp',
    });
    mockUpdateAvatar.mockResolvedValueOnce({
      ...mockUser.value,
      avatar: '/storage/avatars/avatar.webp',
    });
    Object.defineProperty(fileInput.element, 'files', {
      value: [validFile],
      configurable: true,
    });
    await fileInput.trigger('change');
    await flushPromises();

    expect(mockOptimizeAvatarToWebp).toHaveBeenCalledWith(validFile);
    expect(wrapper.find('.c-profile-modal__preview-wrap .c-user-avatar__img').attributes('src')).toBe(
      'blob:http://localhost/preview-webp',
    );
    expect(mockUpdateAvatar).not.toHaveBeenCalled();

    await wrapper.find('.c-profile-modal .c-profile-modal__form').trigger('submit.prevent');
    await flushPromises();

    expect(mockUpdateAvatar).toHaveBeenCalledWith(transformedWebp);
    expect(wrapper.find('.c-profile-modal__preview-wrap').exists()).toBe(false);
    expect(wrapper.find('.c-alert--primary').exists()).toBe(true);
  });
});
