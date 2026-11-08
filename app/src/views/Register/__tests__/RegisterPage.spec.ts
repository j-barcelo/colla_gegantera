import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterPage from '../RegisterPage.vue';

const pushMock = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('RegisterPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const mountRegisterPage = () =>
    mount(RegisterPage, {
      global: {
        stubs: {
          'ion-page': { template: '<div><slot /></div>' },
          'ion-content': { template: '<div><slot /></div>' },
          'ion-icon': true,
          'router-link': true,
        },
      },
    });

  it('renders register form elements properly', () => {
    const wrapper = mountRegisterPage();

    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.find('#register-name').exists()).toBe(true);
    expect(wrapper.find('#register-surname').exists()).toBe(true);
    expect(wrapper.find('#register-email').exists()).toBe(true);
    expect(wrapper.find('#register-password').exists()).toBe(true);
    expect(wrapper.find('#register-password-confirmation').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('prevents submission when fields are empty', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountRegisterPage();
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(wrapper.find('#register-name').attributes('aria-invalid')).toBe('true');
  });

  it('successfully registers and navigates to home page', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        token: 'registered-token',
        user: { id: 2, name: 'Pere', email: 'pere@colla.cat' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountRegisterPage();

    await wrapper.find('#register-name').setValue('Pere');
    await wrapper.find('#register-surname').setValue('Martí');
    await wrapper.find('#register-email').setValue('pere@colla.cat');
    await wrapper.find('#register-password').setValue('Password123!');
    await wrapper.find('#register-password-confirmation').setValue('Password123!');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/tabs/home');
  });

  it('displays notification and specific error on unauthorized email', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        message: 'Aquest correu no està autoritzat.',
        errors: {
          email: ['El correu no està autoritzat a la llista.'],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountRegisterPage();

    await wrapper.find('#register-name').setValue('Pere');
    await wrapper.find('#register-surname').setValue('Martí');
    await wrapper.find('#register-email').setValue('noautoritzat@colla.cat');
    await wrapper.find('#register-password').setValue('Password123!');
    await wrapper.find('#register-password-confirmation').setValue('Password123!');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Correu no autoritzat.');
  });

  it('displays general error alert on server failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        message: 'Error intern del servidor',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountRegisterPage();

    await wrapper.find('#register-name').setValue('Pere');
    await wrapper.find('#register-surname').setValue('Martí');
    await wrapper.find('#register-email').setValue('pere@colla.cat');
    await wrapper.find('#register-password').setValue('Password123!');
    await wrapper.find('#register-password-confirmation').setValue('Password123!');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    const alert = wrapper.findComponent({ name: 'AppAlert' });
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('Error intern del servidor');
  });
});
