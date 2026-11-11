import { useState } from 'react';

import { useStore } from '../../../state/StoreProvider';

export function useRoleActions() {
  const { setOrganizerRole, notify, events } = useStore();
  const [pending, setPending] = useState(null);

  const apply = () => {
    const { member, enable } = pending;

    try {
      if (!enable && events.some((event) => event.ownerId === member.id)) {
        throw new Error('Reassign owned events before removing Organizer access.');
      }

      setOrganizerRole(member.id, enable);
      notify(enable ? 'Organizer role assigned.' : 'Organizer role revoked.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setPending(null);
    }
  };

  return { pending, setPending, apply };
}
