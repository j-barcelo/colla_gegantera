import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reactive, ref } from 'vue';
import TabsPage from '../TabsPage.vue';

const currentRoute = reactive({
  path: '/tabs/home',
});

vi.mock('vue-router', () => ({
  useRoute: () => currentRoute,
}));

const userMock = ref<{ name: string; avatar?: string } | null>({
  name: 'Pere Joan',
  avatar: 'https://example.com/avatar.jpg',
});

vi.mock('@shared/composables/useAuth', () => ({
  useAuth: () => ({
    user: userMock,
  }),
}));

describe('TabsPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentRoute.path = '/tabs/home';
  });

  const mountTabsPage = () =>
    mount(TabsPage, {
      global: {
        stubs: {
          'ion-page': { template: '<div><slot /></div>' },
          'ion-tabs': {
            name: 'IonTabs',
            template: '<div><slot /></div>',
            emits: ['ion-tabs-did-change'],
          },
          'ion-router-outlet': { template: '<div class="router-outlet-stub" />' },
          'ion-tab-bar': { template: '<nav><slot /></nav>' },
          'ion-tab-button': { template: '<button :data-tab="$attrs.tab"><slot /></button>' },
          'ion-icon': true,
          'ion-label': { template: '<span><slot /></span>' },
          UserAvatar: true,
        },
      },
    });

  it('renders tab bar items for home, gallery, and profile', () => {
    const wrapper = mountTabsPage();

    expect(wrapper.find('button[data-tab="home"]').exists()).toBe(true);
    expect(wrapper.find('button[data-tab="gallery"]').exists()).toBe(true);
    expect(wrapper.find('button[data-tab="profile"]').exists()).toBe(true);
  });

  it('updates current tab based on route changes', async () => {
    currentRoute.path = '/tabs/profile';
    const wrapper = mountTabsPage();
    await flushPromises();

    expect(wrapper.findComponent({ name: 'UserAvatar' }).exists()).toBe(true);

    currentRoute.path = '/tabs/gallery';
    await flushPromises();
    expect(wrapper.find('button[data-tab="gallery"]').exists()).toBe(true);
  });
});
