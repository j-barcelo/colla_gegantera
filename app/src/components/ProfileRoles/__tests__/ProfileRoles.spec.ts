import type { User } from '@shared/types/auth';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProfileRoles from '../ProfileRoles.vue';

describe('ProfileRoles.vue', () => {
  it('renders explicit user roles list', () => {
    const user: User = {
      id: 1,
      name: 'Pau',
      email: 'pau@colla.cat',
      role: 'member',
      roles: ['Portadors', 'Músics'],
    };

    const wrapper = mount(ProfileRoles, {
      props: { user },
    });

    const items = wrapper.findAll('li');
    expect(items).toHaveLength(2);
    expect(wrapper.text()).toContain('Portadors');
    expect(wrapper.text()).toContain('Músics');
  });

  it('falls back to default roles based on user.role', () => {
    const adminUser: User = {
      id: 2,
      name: 'Admin',
      email: 'admin@colla.cat',
      role: 'admin',
    };

    const wrapper = mount(ProfileRoles, {
      props: { user: adminUser },
    });

    expect(wrapper.text()).toContain('Administració');
  });

  it('renders empty message when user has no roles', () => {
    const wrapper = mount(ProfileRoles, {
      props: { user: null },
    });

    expect(wrapper.find('.c-profile-roles__empty').exists()).toBe(true);
  });

  it('shows edit button and emits edit event when editable is true', async () => {
    const user: User = { id: 1, name: 'Pau', email: 'pau@colla.cat', role: 'member' };
    const wrapper = mount(ProfileRoles, {
      props: { user, editable: true },
    });

    const editBtn = wrapper.find('[data-testid="edit-roles-btn"]');
    expect(editBtn.exists()).toBe(true);

    await editBtn.trigger('click');
    expect(wrapper.emitted('edit')).toBeTruthy();
  });
});
