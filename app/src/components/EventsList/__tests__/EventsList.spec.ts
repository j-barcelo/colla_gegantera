import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import EventsList, { type EventListItem } from '../EventsList.vue';

describe('EventsList.vue', () => {
  const mountEventsList = (items?: EventListItem[]) =>
    mount(EventsList, {
      props: items ? { items } : {},
      global: {
        stubs: {
          EventCard: true,
        },
      },
    });

  it('renders default mock events when no items provided', () => {
    const wrapper = mountEventsList();
    const cards = wrapper.findAllComponents({ name: 'EventCard' });

    expect(cards).toHaveLength(3);
  });

  it('renders custom items when items prop is passed', () => {
    const customItems: EventListItem[] = [
      {
        id: 99,
        title: 'Trobada de Prova',
        dayNumber: '01',
        monthName: 'GENER',
        location: 'Palma',
        time: '11:00',
        confirmed: true,
      },
    ];

    const wrapper = mountEventsList(customItems);
    const cards = wrapper.findAllComponents({ name: 'EventCard' });

    expect(cards).toHaveLength(1);
    expect(cards[0].props('title')).toBe('Trobada de Prova');
  });

  it.each([
    { childEmit: 'click', forwardedEvent: 'select-event' },
    { childEmit: 'click-details', forwardedEvent: 'details-event' },
    { childEmit: 'toggle-status', forwardedEvent: 'toggle-status' },
  ])('forwards $forwardedEvent when EventCard emits $childEmit', async ({ childEmit, forwardedEvent }) => {
    const wrapper = mountEventsList();
    const firstCard = wrapper.findComponent({ name: 'EventCard' });

    await firstCard.vm.$emit(childEmit);
    expect(wrapper.emitted(forwardedEvent)).toBeTruthy();
  });
});
