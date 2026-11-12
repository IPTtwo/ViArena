import React from 'react';
import { useStore } from '../../state/StoreProvider';
import { Shell } from './Shell';
import { GuestShell } from './GuestShell';
export function BrowsingShell({ children }) {
  const { user } = useStore();
  return user ? <Shell>{children}
  </Shell> : <GuestShell>{children}
  </GuestShell>
}
