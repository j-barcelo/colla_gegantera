import type { User } from '@shared';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import AdminUsersSection from '../AdminUsersSection.vue';

interface MockAlertButton {
  text?: string;
  handler?: (data?: unknown) => unknown | Promise<unknown>;
}

const alertCreateMock = vi.fn();
vi.mock('@ionic/vue', async () => {
  const actual = await vi.importActual('@ionic/vue');
  return {
    ...actual,
    alertController: {
      create: (opts: unknown) => alertCreateMock(opts),
    },
  };
});

const usersMock = ref<User[]>([]);
const totalUsersMock = ref<number>(0);
const isLoadingMock = ref<boolean>(false);
const errorMock = ref<string | null>(null);
const fetchUsersMock = vi.fn().mockResolvedValue([]);
const addAllowedEmailMock = vi.fn().mockResolvedValue({});
const updateUserMock = vi.fn().mockResolvedValue({ id: 1, name: 'Admin', role: 'admin' });
const removeUserOrInvitationMock = vi.fn().mockResolvedValue({});
const notifyMock = vi.fn();

vi.mock('@shared', async () => {
  const actual = await vi.importActual('@shared');
  return {
    ...actual,
    useAdminUsers: () => ({
      users: usersMock,
      totalUsers: totalUsersMock,
      isLoading: isLoadingMock,
      error: errorMock,
      fetchUsers: fetchUsersMock,
      addAllowedEmail: addAllowedEmailMock,
      updateUser: updateUserMock,
      removeUserOrInvitation: removeUserOrInvitationMock,
    }),
    useAuth: () => ({
      user: ref({ id: 1, name: 'Admin User', role: 'admin' }),
      syncCurrentUser: vi.fn(),
      fetchUser: vi.fn().mockResolvedValue({}),
    }),
    useNotification: () => ({
      notify: notifyMock,
    }),
  };
});

describe('AdminUsersSection.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isLoadingMock.value = false;
    errorMock.value = null;
    usersMock.value = [
      { id: 1, name: 'Admin', surname: 'User', email: 'admin@colla.cat', role: 'admin', is_pending: false },
      { id: 2, name: 'Pending', surname: null, email: 'pending@colla.cat', role: 'member', is_pending: true },
    ];
    totalUsersMock.value = 2;
  });

  const mountSection = () =>
    mount(AdminUsersSection, {
      global: {
        stubs: {
          UserAvatar: {
            name: 'UserAvatar',
            template: '<div class="user-avatar-stub" />',
          },
          UserDetailModal: {
            name: 'UserDetailModal',
            template: '<div />',
            props: ['isOpen', 'user'],
            emits: ['close', 'edit-details', 'edit-roles', 'remove'],
          },
          EditUserModal: {
            name: 'EditUserModal',
            template: '<div />',
            props: ['isOpen', 'user', 'isSaving', 'errorMessage'],
            emits: ['close', 'save', 'update:isOpen'],
          },
          IonSpinner: {
            name: 'IonSpinner',
            template: '<div role="status" />',
          },
          IonButton: {
            name: 'IonButton',
            template: '<button><slot /></button>',
          },
          IonIcon: true,
        },
      },
    });

  it('renders users list and counter', () => {
    const wrapper = mountSection();

    expect(wrapper.find('h2').exists()).toBe(true);
    expect(wrapper.find('.c-admin-users-section__count-value').text()).toBe('2');
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(2);
    expect(wrapper.text()).toContain('Admin');
  });

  it('renders loading state when isLoading is true', () => {
    isLoadingMock.value = true;
    const wrapper = mountSection();

    expect(wrapper.findComponent({ name: 'IonSpinner' }).exists()).toBe(true);
  });

  it('renders error state and retries on button click', async () => {
    errorMock.value = 'Failed to load';
    const wrapper = mountSection();

    expect(wrapper.text()).toContain('Failed to load');
    const retryBtn = wrapper.findAllComponents({ name: 'IonButton' }).find((b) => b.text().includes('Reintentar'));
    expect(retryBtn).toBeDefined();
    await retryBtn!.trigger('click');
    expect(fetchUsersMock).toHaveBeenCalled();
  });

  it('renders empty message when no users exist', () => {
    usersMock.value = [];
    const wrapper = mountSection();

    expect(wrapper.find('.c-admin-users-section__empty').exists()).toBe(true);
  });

  it('opens and closes user detail modal', async () => {
    const wrapper = mountSection();
    const firstUserBtn = wrapper.find('[data-testid="user-item-btn"]');
    await firstUserBtn.trigger('click');

    expect(wrapper.emitted('modal-open')).toBeTruthy();
    const detailModal = wrapper.findComponent({ name: 'UserDetailModal' });
    expect(detailModal.props('isOpen')).toBe(true);
    expect(detailModal.props('user')).toEqual(usersMock.value[0]);

    // Close modal via component emit
    await detailModal.vm.$emit('close');
    expect(detailModal.props('isOpen')).toBe(false);
  });

  it('handles add new user alert modal flow', async () => {
    const presentMock = vi.fn();
    alertCreateMock.mockResolvedValue({ present: presentMock });

    const wrapper = mountSection();
    const addBtn = wrapper.find('[data-testid="add-user-btn"]');
    expect(addBtn.exists()).toBe(true);
    await addBtn.trigger('click');

    expect(alertCreateMock).toHaveBeenCalled();
    expect(presentMock).toHaveBeenCalled();

    // Call alert handler
    const alertConfig = alertCreateMock.mock.calls[0][0];
    const enableButton = alertConfig.buttons.find((b: MockAlertButton) => b.text === 'Habilitar');
    const result = await enableButton.handler({ email: 'new@colla.cat' });

    expect(addAllowedEmailMock).toHaveBeenCalledWith('new@colla.cat');
    expect(result).toBe(true);
  });

  it('handles edit details and save user flow', async () => {
    const wrapper = mountSection();
    const firstUserBtn = wrapper.find('[data-testid="user-item-btn"]');
    await firstUserBtn.trigger('click');

    const detailModal = wrapper.findComponent({ name: 'UserDetailModal' });
    await detailModal.vm.$emit('edit-details');

    const editModal = wrapper.findComponent({ name: 'EditUserModal' });
    expect(editModal.props('isOpen')).toBe(true);

    await editModal.vm.$emit('save', { name: 'Admin', surname: 'Updated' });
    await flushPromises();

    expect(updateUserMock).toHaveBeenCalled();
    expect(notifyMock).toHaveBeenCalled();
  });

  it('handles edit roles and protects self admin role', async () => {
    const presentMock = vi.fn();
    alertCreateMock.mockResolvedValue({ present: presentMock });

    const wrapper = mountSection();
    const firstUserBtn = wrapper.find('[data-testid="user-item-btn"]');
    await firstUserBtn.trigger('click');

    const detailModal = wrapper.findComponent({ name: 'UserDetailModal' });
    await detailModal.vm.$emit('edit-roles');

    expect(alertCreateMock).toHaveBeenCalled();
    const alertConfig = alertCreateMock.mock.calls[0][0];
    const saveBtn = alertConfig.buttons.find((b: MockAlertButton) => b.text === 'Desar');

    // Attempt to remove admin role from self
    await saveBtn.handler(['Portadors']);
    expect(notifyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Acció no permesa',
      }),
    );

    // Save with admin role
    await saveBtn.handler(['Administració', 'Portadors']);
    await flushPromises();
    expect(updateUserMock).toHaveBeenCalled();
  });

  it('handles remove user and prevents self deletion', async () => {
    const presentMock = vi.fn();
    alertCreateMock.mockResolvedValue({ present: presentMock });

    const wrapper = mountSection();
    const detailModal = wrapper.findComponent({ name: 'UserDetailModal' });

    // Try deleting self (id 1)
    await detailModal.vm.$emit('remove', usersMock.value[0]);
    expect(notifyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Acció no permesa',
      }),
    );

    // Delete pending user (id 2)
    await detailModal.vm.$emit('remove', usersMock.value[1]);
    expect(alertCreateMock).toHaveBeenCalled();

    const alertConfig = alertCreateMock.mock.calls[0][0];
    const deleteBtn = alertConfig.buttons.find((b: MockAlertButton) => b.text === 'Eliminar');
    await deleteBtn.handler();
    await flushPromises();

    expect(removeUserOrInvitationMock).toHaveBeenCalledWith(2);
    expect(notifyMock).toHaveBeenCalled();
  });
});
