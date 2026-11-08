import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '../LoginPage.vue';

const pushMock = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('LoginPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const mountLoginPage = () =>
    mount(LoginPage, {
      global: {
        stubs: {
          'ion-page': { template: '<div><slot /></div>' },
          'ion-content': { template: '<div><slot /></div>' },
          'ion-icon': true,
          'router-link': true,
        },
      },
    });

  it('renders login form elements properly', () => {
    const wrapper = mountLoginPage();

    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.find('#login-email').exists()).toBe(true);
    expect(wrapper.find('#login-password').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('prevents submission when fields are empty', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountLoginPage();
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(wrapper.find('#login-email').attributes('aria-invalid')).toBe('true');
  });

  it('successfully logs in and navigates to home page', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        token: 'token-test',
        user: { id: 1, name: 'Joan', email: 'joan@colla.cat' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountLoginPage();

    await wrapper.find('#login-email').setValue('joan@colla.cat');
    await wrapper.find('#login-password').setValue('Password123!');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/tabs/home');
  });

  it('shows error alert on invalid credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        message: 'Les credencials són incorrectes.',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountLoginPage();

    await wrapper.find('#login-email').setValue('joan@colla.cat');
    await wrapper.find('#login-password').setValue('WrongPassword!');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    const alert = wrapper.findComponent({ name: 'AppAlert' });
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('Les credencials són incorrectes.');
  });
});
