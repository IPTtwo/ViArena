import React from 'react';
import { useStore } from '../../../state/StoreProvider';
import { Badge, Card, Empty, PageHeader, dateText } from '../../../components';
export function History() {
  const { user, events, registrations, attendance } = useStore();
  const own = registrations
    .filter((r) => r.userId === user.id)
    .map((r) => ({
      registration: r,
      event: events.find((e) => e.id === r.eventId),
      confirmed: attendance.some(
        (a) => a.eventId === r.eventId && a.userId === user.id && a.verified,
      ),
    }))
    .filter((r) => r.event)
    .sort((a, b) => new Date(b.event.start) - new Date(a.event.start));
  return (
    <>
      <PageHeader
        eyebrow="MY PARTICIPATION"
        title="Participation History"
        description="Your registration records and verified event participation."
      />
      <Card>
        {own.map(({ event, registration, confirmed }) => (
          <div className="simple-row" key={registration.id}>
            <div className="grow">
              <h3>{event.title}</h3>
              <p>{dateText(event.start)}</p>
            </div>
            <Badge tone={registration.status === 'Registered' ? 'success' : 'danger'}>
              {registration.status}
            </Badge>
            <Badge tone={confirmed ? 'success' : 'neutral'}>
              {confirmed ? 'Verified' : 'Not verified'}
            </Badge>
          </div>
        ))}
        {!own.length && (
          <Empty
            title="No participation records yet"
            description="Events you register for will appear here."
          />
        )}
      </Card>
    </>
  );
}
