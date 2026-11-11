import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import { useStore } from "../state/StoreProvider";
import { Shell, GuestShell } from "../components";
import { hasRole, canCreateEvent } from "../functions/domain";
export function Require({ children, role }) {
  const { user } = useStore();
  const location = useLocation();
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  if (
    role &&
    !hasRole(user, role) &&
    !(role === "Organizer" && hasRole(user, "Admin"))
  )
    return (
      <Shell>
        <Denied />
      </Shell>
    );
  return <Shell>{children}</Shell>;
}
export function Denied() {
  return (
    <div className="center-page" role="alert">
      <Shield size={42} />
      <h1>Access denied</h1>
      <p>You do not have permission to view this page.</p>
      <div className="actions">
        <Link className="button primary" to="/events">
          Explore Events
        </Link>
        <Link className="button outline" to="/profile">
          My Profile
        </Link>
      </div>
    </div>
  );
}
export function NotFound() {
  return (
    <GuestShell>
      <div className="center-page">
        <h1>Page not found</h1>
        <p>We couldn't find the page you requested.</p>
        <Link className="button primary" to="/events">
          Explore Events
        </Link>
      </div>
    </GuestShell>
  );
}

export function RequireOrganizerWorkspace({ children }) {
  const { user, events } = useStore();
  const location = useLocation();
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  const allowed =
    canCreateEvent(user) ||
    events.some((e) =>
      e.coOrganizers?.some(
        (c) => c.userId === user.id && c.permissions?.length,
      ),
    );
  return <Shell>{allowed ? children : <Denied />}</Shell>;
}
