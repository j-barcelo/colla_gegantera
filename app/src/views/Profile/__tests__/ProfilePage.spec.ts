import { ApiError } from '@shared';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import ProfilePage from '../ProfilePage.vue';

const pushMock = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const userMock = ref({
  id: 1,
  name: 'Joan',
  surname: 'Geganter',
  email: 'joan@colla.cat',
  username: 'joan_gegant',
  roles: [{ id: 1, name: 'Portadors' }],
});

const logoutMock = vi.fn();
const fetchUserMock = vi.fn().mockResolvedValue({});
const updateProfileMock = vi.fn().mockResolvedValue({});
const updatePasswordMock = vi.fn().mockResolvedValue({});
const updateAvatarMock = vi.fn().mockResolvedValue({});
const openFilePickerMock = vi.fn();

vi.mock('@shared/composables/useAuth', () => ({
  useAuth: () => ({
    user: userMock,
    token: ref('token-abc'),
    isLoading: ref(false),
    fetchUser: fetchUserMock,
    logout: logoutMock,
    updateProfile: updateProfileMock,
    updatePassword: updatePasswordMock,
    updateAvatar: updateAvatarMock,
  }),
}));

const notifyMock = vi.fn();
const optimizeAvatarMock = vi.fn();

vi.mock('@shared', async () => {
  const actual = await vi.importActual('@shared');
  return {
    ...actual,
    useNotification: () => ({
      notify: notifyMock,
    }),
    optimizeAvatarToWebp: (f: File) => optimizeAvatarMock(f),
  };
});

describe('ProfilePage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    optimizeAvatarMock.mockResolvedValue({
      file: new File(['fake-webp'], 'avatar.webp', { type: 'image/webp' }),
      previewUrl: 'blob:http://localhost/fake-webp',
    });
  });

  const mountProfilePage = () =>
    mount(ProfilePage, {
      global: {
        stubs: {
          'ion-page': { template: '<div><slot /></div>' },
          'ion-content': { template: '<div><slot /></div>' },
          'ion-icon': true,
          UserAvatar: {
            name: 'UserAvatar',
            template: '<div />',
            methods: {
              openFilePicker: openFilePickerMock,
            },
            emits: ['select-file'],
          },
          ProfileDetails: {
            name: 'ProfileDetails',
            template: '<div><slot name="alerts" /></div>',
            emits: ['edit'],
          },
          ProfileRoles: {
            name: 'ProfileRoles',
            template: '<div />',
          },
          ProfileSecurity: {
            name: 'ProfileSecurity',
            template: '<div />',
            emits: ['changePassword'],
          },
          EditUserModal: {
            name: 'EditUserModal',
            template: '<div />',
            props: ['isOpen', 'errorMessage'],
            emits: ['save', 'close'],
          },
          ChangePasswordModal: {
            name: 'ChangePasswordModal',
            template: '<div />',
            props: ['isOpen', 'errorMessage'],
            emits: ['save', 'close'],
          },
          AvatarPreviewModal: {
            name: 'AvatarPreviewModal',
            template: '<div />',
            props: ['isOpen', 'errorMessage'],
            emits: ['confirm', 'close', 'change-file'],
          },
          AppAlert: {
            name: 'AppAlert',
            template: '<div role="alert"><slot /></div>',
          },
        },
      },
    });

  it('renders user profile details and handle', () => {
    const wrapper = mountProfilePage();

    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.text()).toContain('#joan_gegant');
    expect(wrapper.findComponent({ name: 'UserAvatar' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'ProfileDetails' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'ProfileRoles' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'ProfileSecurity' }).exists()).toBe(true);
  });

  it('executes logout and redirects to login page', async () => {
    const wrapper = mountProfilePage();

    const logoutBtn = wrapper.find('[data-testid="logout-btn"]');
    expect(logoutBtn.exists()).toBe(true);

    await logoutBtn.trigger('click');
    await flushPromises();

    expect(logoutMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('opens and saves profile through edit modal', async () => {
    const wrapper = mountProfilePage();

    // Trigger edit from ProfileDetails
    const profileDetails = wrapper.findComponent({ name: 'ProfileDetails' });
    await profileDetails.vm.$emit('edit');
    const editModal = wrapper.findComponent({ name: 'EditUserModal' });
    expect(editModal.props('isOpen')).toBe(true);

    // Save profile
    await editModal.vm.$emit('save', { name: 'Nou Nom', surname: 'Nou Cognom' });
    await flushPromises();

    expect(updateProfileMock).toHaveBeenCalledWith({ name: 'Nou Nom', surname: 'Nou Cognom' });
    expect(notifyMock).toHaveBeenCalled();
    expect(editModal.props('isOpen')).toBe(false);
  });

  it('opens and saves password through change password modal', async () => {
    const wrapper = mountProfilePage();

    // Trigger change password from ProfileSecurity
    const security = wrapper.findComponent({ name: 'ProfileSecurity' });
    await security.vm.$emit('changePassword');
    const pwdModal = wrapper.findComponent({ name: 'ChangePasswordModal' });
    expect(pwdModal.props('isOpen')).toBe(true);

    // Save password
    await pwdModal.vm.$emit('save', {
      current_password: 'old',
      password: 'new',
      password_confirmation: 'new',
    });
    await flushPromises();

    expect(updatePasswordMock).toHaveBeenCalled();
    expect(notifyMock).toHaveBeenCalled();
    expect(pwdModal.props('isOpen')).toBe(false);
  });

  it('handles avatar file selection, preview modal and confirm upload', async () => {
    const wrapper = mountProfilePage();
    const avatarComponent = wrapper.findComponent({ name: 'UserAvatar' });

    const file = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
    await avatarComponent.vm.$emit('select-file', file);
    await flushPromises();

    expect(optimizeAvatarMock).toHaveBeenCalledWith(file);
    const avatarModal = wrapper.findComponent({ name: 'AvatarPreviewModal' });
    expect(avatarModal.props('isOpen')).toBe(true);

    // Confirm upload
    await avatarModal.vm.$emit('confirm');
    await flushPromises();

    expect(updateAvatarMock).toHaveBeenCalled();
    expect(notifyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Fotografia de perfil',
      }),
    );
    expect(avatarModal.props('isOpen')).toBe(false);
  });

  it('handles avatar validation error for invalid file type', async () => {
    const wrapper = mountProfilePage();
    const avatarComponent = wrapper.findComponent({ name: 'UserAvatar' });

    const invalidFile = new File(['plain text'], 'document.txt', { type: 'text/plain' });
    await avatarComponent.vm.$emit('select-file', invalidFile);
    await flushPromises();

    expect(optimizeAvatarMock).not.toHaveBeenCalled();
    expect(wrapper.find('[role="alert"]').text()).toContain('JPG, PNG o WebP');
  });

  it('handles profile update errors properly', async () => {
    const wrapper = mountProfilePage();
    await wrapper.findComponent({ name: 'ProfileDetails' }).vm.$emit('edit');
    const editModal = wrapper.findComponent({ name: 'EditUserModal' });

    // 1. ApiError with validation message
    const apiError = new ApiError('Validation error', 422, {
      name: ['El nom és obligatori'],
    });
    updateProfileMock.mockRejectedValueOnce(apiError);

    await editModal.vm.$emit('save', { name: '', surname: 'Cognom' });
    await flushPromises();

    expect(editModal.props('errorMessage')).toBe('El nom és obligatori');

    // 2. Cancel editing resets error and closes modal
    await editModal.vm.$emit('close');
    await flushPromises();
    expect(editModal.props('isOpen')).toBe(false);

    // 3. Generic error
    await wrapper.findComponent({ name: 'ProfileDetails' }).vm.$emit('edit');
    updateProfileMock.mockRejectedValueOnce(new Error('Network offline'));
    await editModal.vm.$emit('save', { name: 'A', surname: 'B' });
    await flushPromises();
    expect(editModal.props('errorMessage')).toBe('Network offline');
  });

  it('handles password change errors properly', async () => {
    const wrapper = mountProfilePage();
    await wrapper.findComponent({ name: 'ProfileSecurity' }).vm.$emit('changePassword');
    const pwdModal = wrapper.findComponent({ name: 'ChangePasswordModal' });

    // 1. ApiError with validation error
    const apiError = new ApiError('Validation error', 422, {
      current_password: ['La contrasenya actual no és correcta'],
    });
    updatePasswordMock.mockRejectedValueOnce(apiError);

    await pwdModal.vm.$emit('save', {
      current_password: 'wrong',
      password: 'new',
      password_confirmation: 'new',
    });
    await flushPromises();

    expect(pwdModal.props('errorMessage')).toBe('La contrasenya actual no és correcta');

    // 2. Cancel closes modal
    await pwdModal.vm.$emit('close');
    await flushPromises();
    expect(pwdModal.props('isOpen')).toBe(false);
  });

  it('handles avatar upload errors and modal cancellation', async () => {
    const wrapper = mountProfilePage();
    const avatarComponent = wrapper.findComponent({ name: 'UserAvatar' });

    const file = new File(['image'], 'photo.png', { type: 'image/png' });
    await avatarComponent.vm.$emit('select-file', file);
    await flushPromises();

    const avatarModal = wrapper.findComponent({ name: 'AvatarPreviewModal' });
    expect(avatarModal.props('isOpen')).toBe(true);

    // Trigger change-file
    await avatarModal.vm.$emit('change-file');
    expect(openFilePickerMock).toHaveBeenCalled();

    // Api error on upload
    const apiError = new ApiError('Validation error', 422, {
      avatar: ['La mida de la imatge és massa gran'],
    });
    updateAvatarMock.mockRejectedValueOnce(apiError);

    await avatarModal.vm.$emit('confirm');
    await flushPromises();

    expect(avatarModal.props('errorMessage')).toBe('La mida de la imatge és massa gran');

    // Cancel avatar preview
    await avatarModal.vm.$emit('close');
    await flushPromises();
    expect(avatarModal.props('isOpen')).toBe(false);
  });
});
