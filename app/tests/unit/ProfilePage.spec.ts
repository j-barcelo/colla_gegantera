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
const mockLogout = vi.fn();

vi.mock('@shared/composables/useAuth', () => ({
  useAuth: () => ({
    user: computed(() => mockUser.value),
    token: computed(() => mockToken.value),
    isLoading: computed(() => mockIsLoading.value),
    fetchUser: mockFetchUser,
    updateProfile: mockUpdateProfile,
    updatePassword: mockUpdatePassword,
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
});
