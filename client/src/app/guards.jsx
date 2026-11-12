import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../state/StoreProvider';
import { canCreateEvent, hasRole } from '../functions/domain';

export function Require({ children, role }) {
  const { user } = useStore();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && !hasRole(user, role)) return <Navigate to="/403" replace />;
  return children;
}

export function RequireOrganizerWorkspace({ children }) {
  const { user } = useStore();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!canCreateEvent(user)) return <Navigate to="/403" replace />;
  return children;
}

export function Denied() {
  return (
    <main className="content">
      <h1>Access denied</h1>
      <p>You do not have permission to view this page.</p>
    </main>
  );
}

export function NotFound() {
  return (
    <main className="content">
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
    </main>
  );
}
