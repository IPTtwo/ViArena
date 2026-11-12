import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../state/StoreProvider';
import { Card, Empty, PageHeader, VisibilityStatus } from '../../../components';

export function OrganizerRegistrations() {
  const { events, canManageRegistrations, count } = useStore();
  const manageable = events.filter((e) => canManageRegistrations(e));
  return (
    <>
      <PageHeader
        eyebrow="ORGANIZER WORKSPACE"
        title="Registrations"
        description="Select an event to review its participant roster."
      />
      <Card>
        {manageable.length ? (
          manageable.map((e) => (
            <div className="simple-row" key={e.id}>
              <div className="grow">
                <h3>{e.title}</h3>
                <p className="subtext">
                  {count(e.id)} / {e.capacity} registered
                </p>
              </div>
              {VisibilityStatus(e)}
              <Link className="button primary" to={`/organizer/events/${e.id}/registrations`}>
                Manage registrations
              </Link>
            </div>
          ))
        ) : (
          <Empty
            title="No registration lists available"
            description="You need an event-owner or authorized co-organizer assignment."
          />
        )}
      </Card>
    </>
  );
}
