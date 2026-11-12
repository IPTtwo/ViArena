import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../state/StoreProvider';
import { Badge, Button, Card, Confirm, dateTimeText, Empty, PageHeader } from '../../../components';

export function MyEvents() {
  const { events, registrations, user, cancelRegistration, notify } = useStore();
  const [confirm, setConfirm] = useState(null),
    [tab, setTab] = useState('Upcoming');
  const mine = registrations
    .filter((r) => r.userId === user.id)
    .map((r) => ({ ...r, event: events.find((e) => e.id === r.eventId) }))
    .filter((r) => r.event)
    .filter((r) => {
      const e = r.event;
      if (tab === 'Canceled') return r.status === 'Canceled';
      if (r.status !== 'Registered') return false;
      if (tab === 'Past') return new Date(e.end) <= new Date();
      if (tab === 'Live') return new Date(e.start) <= new Date() && new Date(e.end) > new Date();
      return new Date(e.start) > new Date();
    });
  return (
    <div className="my-events-page">
      <PageHeader
        eyebrow="MY ARENA"
        title="My Events"
        description="Keep track of your event registrations."
      />
      <div className="tabs" role="tablist" aria-label="My Events filters">
        {['Upcoming', 'Live', 'Past', 'Canceled'].map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            key={t}
            className={tab === t ? 'active' : ''}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <Card className="my-events-card">
        {mine.length ? (
          mine.map((r) => (
            <div className="simple-row event-row" key={r.id}>
              <div className="calendar-tile">
                <strong>{new Date(r.event.start).getDate()}</strong>
                <small>
                  {new Date(r.event.start)
                    .toLocaleString('en-PH', { month: 'short' })
                    .toUpperCase()}
                </small>
              </div>
              <div className="grow">
                <h3>
                  <Link to={`/events/${r.event.id}`}>{r.event.title}</Link>
                </h3>
                <p>
                  {dateTimeText(r.event.start)}: {r.event.venue}
                </p>
                <div className="tag-row">
                  <Badge tone={r.status === 'Registered' ? 'success' : 'danger'}>{r.status}</Badge>
                  <Badge tone={new Date(r.event.end) <= new Date() ? 'neutral' : 'info'}>
                    {new Date(r.event.end) <= new Date()
                      ? 'Ended'
                      : new Date(r.event.start) <= new Date()
                        ? 'In Progress'
                        : 'Upcoming'}
                  </Badge>
                </div>
              </div>
              {r.status === 'Registered' && new Date(r.event.end) > new Date() && (
                <Button variant="outline" onClick={() => setConfirm(r.event)}>
                  Cancel registration
                </Button>
              )}
            </div>
          ))
        ) : (
          <Empty
            title={`No ${tab.toLowerCase()} events`}
            description="Your event activity will appear here."
            action={
              <Link to="/events" className="button primary">
                Explore Events
              </Link>
            }
          />
        )}
      </Card>
      {confirm && (
        <Confirm
          title="Cancel registration?"
          description={`Your spot for ${confirm.title} will be released.`}
          danger
          confirmLabel="Cancel registration"
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            try {
              cancelRegistration(confirm.id);
              notify('Registration canceled.');
            } catch (err) {
              notify(err.message, 'error');
            }
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}
