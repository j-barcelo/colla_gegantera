import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import HomePage from '../HomePage.vue';

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

const isAdminMock = ref(false);
vi.mock('@shared/composables/useAuth', () => ({ useAuth: () => ({ isAdmin: isAdminMock }) }));

describe('HomePage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isAdminMock.value = false;
  });

  const mountHomePage = () =>
    mount(HomePage, {
      global: {
        stubs: {
          'ion-page': { template: '<div><slot /></div>' },
          'ion-content': { template: '<div><slot /></div>' },
          'ion-icon': true,
          EventsList: true,
        },
      },
    });

  it('renders home header and default filter state', () => {
    const wrapper = mountHomePage();

    expect(wrapper.find('h1').text()).toMatch(/assistència/i);
    expect(wrapper.find('button[aria-haspopup="listbox"]').text()).toMatch(/tot/i);
    expect(wrapper.findComponent({ name: 'EventsList' }).exists()).toBe(true);
    expect(wrapper.find('button[aria-label="Panell d\'administració"]').exists()).toBe(false);
  });

  it('shows admin icon button and navigates to admin users when user is admin', async () => {
    isAdminMock.value = true;
    const wrapper = mountHomePage();

    const adminBtn = wrapper.find('button[aria-label="Panell d\'administració"]');
    expect(adminBtn.exists()).toBe(true);

    await adminBtn.trigger('click');
    expect(navigateMock).toHaveBeenCalledWith('/admin/users', 'forward', 'push', expect.anything());
  });

  it('toggles filter menu and selects a filter', async () => {
    const wrapper = mountHomePage();

    const filterBtn = wrapper.find('button[aria-haspopup="listbox"]');
    await filterBtn.trigger('click');

    const confirmedOption = wrapper.find('button[data-filter-id="confirmed"]');

    expect(confirmedOption.exists()).toBe(true);
    await confirmedOption.trigger('click');

    expect(wrapper.find('ul').exists()).toBe(false);
  });
});
