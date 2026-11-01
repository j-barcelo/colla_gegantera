import { beforeEach, describe, expect, it } from 'vitest';
import { useNotification } from '../useNotification';

describe('useNotification', () => {
  const { notifications, notify, dismissNotification, clearNotifications } = useNotification();

  beforeEach(() => {
    clearNotifications();
  });

  it('initializes with empty notifications', () => {
    expect(notifications.value).toHaveLength(0);
  });

  it('adds a notification with notify() and defaults to dark variant', () => {
    const id = notify({
      title: 'Dades personals',
      message: 'Canvis desats correctament.',
      duration: 3000,
    });

    expect(id).toBeDefined();
    expect(notifications.value).toHaveLength(1);
    expect(notifications.value[0].title).toBe('Dades personals');
    expect(notifications.value[0].message).toBe('Canvis desats correctament.');
    expect(notifications.value[0].duration).toBe(3000);
    expect(notifications.value[0].variant).toBe('dark');
  });

  it('supports primary and danger variants with aliases', () => {
    notify({ message: 'Success action', variant: 'success' });
    notify({ message: 'Error action', variant: 'error' });

    expect(notifications.value).toHaveLength(2);
    expect(notifications.value[0].variant).toBe('primary');
    expect(notifications.value[1].variant).toBe('danger');
  });

  it('dismisses a notification by id', () => {
    const id1 = notify({ message: 'Msg 1' });
    const id2 = notify({ message: 'Msg 2' });

    expect(notifications.value).toHaveLength(2);

    dismissNotification(id1);

    expect(notifications.value).toHaveLength(1);
    expect(notifications.value[0].id).toBe(id2);
  });
});
