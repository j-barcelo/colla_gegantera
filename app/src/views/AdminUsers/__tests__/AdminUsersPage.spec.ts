import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminUsersPage from '../AdminUsersPage.vue';

const navigateMock = vi.fn();
vi.mock('@ionic/vue', async () => {
  const actual = await vi.importActual('@ionic/vue');
  return {
    ...actual,
    useIonRouter: () => ({
      navigate: navigateMock,
    }),
    createGesture: () => ({
      enable: vi.fn(),
      destroy: vi.fn(),
    }),
  };
});

describe('AdminUsersPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountAdminUsersPage = () =>
    mount(AdminUsersPage, {
      global: {
        stubs: {
          'ion-page': { template: '<div><slot /></div>' },
          'ion-header': { template: '<header><slot /></header>' },
          'ion-toolbar': { template: '<div><slot /></div>' },
          'ion-buttons': { template: '<div><slot /></div>' },
          'ion-button': {
            template:
              '<button :data-testid="$attrs[\'data-testid\']" :aria-label="$attrs[\'aria-label\']"><slot /></button>',
          },
          'ion-content': { template: '<main><slot /></main>' },
          'ion-icon': true,
          AdminUsersSection: true,
        },
      },
    });

  it('navigates back to home on back button click and renders AdminUsersSection', async () => {
    const wrapper = mountAdminUsersPage();

    expect(wrapper.findComponent({ name: 'AdminUsersSection' }).exists()).toBe(true);

    const backBtn = wrapper.find('[data-testid="back-btn"]');
    await backBtn.trigger('click');

    expect(navigateMock).toHaveBeenCalledWith('/tabs/home', 'back', 'pop', expect.anything());
  });
});
