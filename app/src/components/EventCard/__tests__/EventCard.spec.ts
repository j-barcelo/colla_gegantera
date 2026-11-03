import EventCard from '@/components/EventCard/EventCard.vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

describe('EventCard.vue', () => {
  const defaultProps = {
    title: "23ª TROBADA DE GEGANTS D'INCA",
    dayNumber: '10',
    monthName: 'NOVEMBRE',
    location: 'Inca',
    time: '09:30',
    confirmed: true,
    attendeesCount: 20,
    carriersCount: 9,
    musiciansCount: 4,
  };

  it('renders event information correctly', () => {
    const wrapper = mount(EventCard, {
      props: defaultProps,
    });

    expect(wrapper.text()).toContain("23ª TROBADA DE GEGANTS D'INCA");
    expect(wrapper.text()).toContain('10');
    expect(wrapper.text()).toContain('NOVEMBRE');
    expect(wrapper.text()).toContain('Inca');
    expect(wrapper.text()).toContain('09:30');
    expect(wrapper.text()).toContain('Han confirmat 20 persones');
    expect(wrapper.text()).toContain('9 Portadors');
    expect(wrapper.text()).toContain('4 Músics');
  });

  it('displays confirmed status modifier when confirmed prop is true', () => {
    const wrapper = mount(EventCard, {
      props: defaultProps,
    });

    const statusBtn = wrapper.find('.c-event-card__status');
    expect(statusBtn.classes()).toContain('c-event-card__status--confirmed');
    expect(wrapper.find('.c-event-card__check-icon').exists()).toBe(true);
  });

  it('displays pending status modifier and dash when confirmed prop is false', () => {
    const wrapper = mount(EventCard, {
      props: {
        ...defaultProps,
        confirmed: false,
      },
    });

    const statusBtn = wrapper.find('.c-event-card__status');
    expect(statusBtn.classes()).toContain('c-event-card__status--pending');
    expect(wrapper.find('.c-event-card__dash-icon').exists()).toBe(true);
  });

  it('emits events on user interactions', async () => {
    const wrapper = mount(EventCard, {
      props: defaultProps,
    });

    await wrapper.find('.c-event-card__status').trigger('click');
    expect(wrapper.emitted('toggle-status')).toHaveLength(1);

    await wrapper.find('.c-event-card__details-btn').trigger('click');
    expect(wrapper.emitted('click-details')).toHaveLength(1);

    await wrapper.find('.c-event-card').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });
});
