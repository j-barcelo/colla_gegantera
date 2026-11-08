import type { User } from '@shared/types/auth';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProfileDetails from '../ProfileDetails.vue';

describe('ProfileDetails.vue', () => {
  const mockUser: User = {
    id: 1,
    name: 'Joan Carles',
    surname: 'Martorell',
    email: 'joan@example.cat',
    phone: '612345678',
    address: 'Major 12',
    role: 'member',
  };

  const mountProfileDetails = (user?: User | null, editable = true) =>
    mount(ProfileDetails, {
      props: {
        user,
        editable,
      },
      global: {
        stubs: {
          AppButton: true,
        },
      },
    });

  it('renders user details with separate surname', () => {
    const wrapper = mountProfileDetails(mockUser);

    expect(wrapper.text()).toContain('Joan Carles');
    expect(wrapper.text()).toContain('Martorell');
    expect(wrapper.text()).toContain('612345678');
    expect(wrapper.text()).toContain('joan@example.cat');
    expect(wrapper.text()).toContain('Major 12');
  });

  it('splits full name when surname is not present', () => {
    const userWithoutSurname: User = {
      id: 2,
      name: 'Maria Antònia Soler',
      email: 'maria@example.cat',
      role: 'member',
    };

    const wrapper = mountProfileDetails(userWithoutSurname);

    expect(wrapper.text()).toContain('Maria');
    expect(wrapper.text()).toContain('Antònia Soler');
    expect(wrapper.text()).toContain('—'); // fallback for phone/address
  });

  it('handles empty user gracefully', () => {
    const wrapper = mountProfileDetails(null);

    expect(wrapper.text()).toContain('—');
  });

  it('emits edit event when edit button is clicked', async () => {
    const wrapper = mountProfileDetails(mockUser, true);
    const editBtn = wrapper.findComponent({ name: 'AppButton' });

    await editBtn.trigger('click');
    expect(wrapper.emitted('edit')).toBeTruthy();
  });

  it('hides edit button when editable is false', () => {
    const wrapper = mountProfileDetails(mockUser, false);
    expect(wrapper.findComponent({ name: 'AppButton' }).exists()).toBe(false);
  });
});
