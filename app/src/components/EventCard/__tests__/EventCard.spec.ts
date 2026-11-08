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
    expect(wrapper.text()).toContain('20');
    expect(wrapper.text()).toContain('9');
    expect(wrapper.text()).toContain('4');
  });

  it('displays confirmed accessible state when confirmed prop is true', () => {
    const wrapper = mount(EventCard, {
      props: defaultProps,
    });

    const statusBtn = wrapper.find('[data-testid="attendance-toggle-btn"]');
    expect(statusBtn.attributes('aria-pressed')).toBe('true');
  });

  it('displays pending accessible state when confirmed prop is false', () => {
    const wrapper = mount(EventCard, {
      props: {
        ...defaultProps,
        confirmed: false,
      },
    });

    const statusBtn = wrapper.find('[data-testid="attendance-toggle-btn"]');
    expect(statusBtn.attributes('aria-pressed')).toBe('false');
  });

  it.each([
    { selector: '[data-testid="attendance-toggle-btn"]', event: 'toggle-status' },
    { selector: '[data-testid="event-details-btn"]', event: 'click-details' },
    { selector: 'article', event: 'click' },
  ])('emits $event when clicking on $selector', async ({ selector, event }) => {
    const wrapper = mount(EventCard, {
      props: defaultProps,
    });

    await wrapper.find(selector).trigger('click');
    expect(wrapper.emitted(event)).toHaveLength(1);
  });
});
