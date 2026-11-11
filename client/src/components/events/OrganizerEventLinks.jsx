import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../state/StoreProvider';
export function OrganizerEventLinks({ event }) {
  const { canManageEvent, canManageRegistrations, canManageTeams, canManageSchedule, canManageStream, canManageParticipation, canManageStaff } = useStore();
  const id = event?.id;
  if (!id) return null;
  const links = [
    [canManageEvent(event), 'Edit event', `/organizer/events/${id}/edit`, true],
    [canManageRegistrations(event), 'Registrations', `/organizer/events/${id}/registrations`, false],
    [canManageTeams(event), 'Teams', `/organizer/events/${id}/teams`, false],
    [canManageSchedule(event), 'Schedule', `/organizer/events/${id}/schedule`, false],
    [canManageStream(event), 'Stream', `/organizer/events/${id}/stream`, false],
    [canManageParticipation(event), 'Participation', `/organizer/events/${id}/participation`, false],
    [canManageStaff(event), 'Co-organizers', `/organizer/events/${id}/staff`, false],
  ];
  return <nav className="feature-links" aria-label={`Manage ${event.title}`}>{links.filter(([allowed]) => allowed).map(([, title, to, primary]) => <Link className={`button ${primary ? 'primary' : 'outline'}`} to={to} key={to}>{title}</Link>)}
  </nav>;
}
