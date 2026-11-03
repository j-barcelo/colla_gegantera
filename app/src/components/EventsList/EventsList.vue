<script setup lang="ts">
import EventCard from '@/components/EventCard/EventCard.vue';

export interface EventListItem {
  id: number | string;
  title: string;
  dayNumber: string | number;
  monthName: string;
  location: string;
  time: string;
  confirmed?: boolean;
  attendeesCount?: number;
  carriersCount?: number;
  musiciansCount?: number;
}

interface Props {
  items?: EventListItem[];
}

const defaultMockEvents: EventListItem[] = [
  {
    id: 1,
    title: "23ª TROBADA DE GEGANTS D'INCA",
    dayNumber: '10',
    monthName: 'NOVEMBRE',
    location: 'Inca',
    time: '09:30',
    confirmed: true,
    attendeesCount: 20,
    carriersCount: 9,
    musiciansCount: 4,
  },
  {
    id: 2,
    title: '27ª TROBADA DE GEGANTS DE SA POBLA',
    dayNumber: '16',
    monthName: 'NOVEMBRE',
    location: 'Sa Pobla',
    time: '17:00',
    confirmed: false,
    attendeesCount: 15,
    carriersCount: 5,
    musiciansCount: 2,
  },
  {
    id: 3,
    title: "TROBADA DE GEGANTS D'ALCÚDIA",
    dayNumber: '23',
    monthName: 'NOVEMBRE',
    location: 'Alcúdia',
    time: '16:00',
    confirmed: true,
    attendeesCount: 12,
    carriersCount: 5,
    musiciansCount: 0,
  },
];

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
});

const emit = defineEmits<{
  (e: 'select-event', item: EventListItem): void;
  (e: 'details-event', item: EventListItem): void;
  (e: 'toggle-status', item: EventListItem): void;
}>();

const currentEvents = () => (props.items.length > 0 ? props.items : defaultMockEvents);
</script>

<template>
  <section class="c-events-list" aria-label="Llistat d'esdeveniments i trobades">
    <EventCard
      v-for="event in currentEvents()"
      :key="event.id"
      :title="event.title"
      :day-number="event.dayNumber"
      :month-name="event.monthName"
      :location="event.location"
      :time="event.time"
      :confirmed="event.confirmed"
      :attendees-count="event.attendeesCount"
      :carriers-count="event.carriersCount"
      :musicians-count="event.musiciansCount"
      @click="emit('select-event', event)"
      @click-details="emit('details-event', event)"
      @toggle-status="emit('toggle-status', event)"
    />
  </section>
</template>

<style lang="scss" src="./EventsList.scss"></style>
