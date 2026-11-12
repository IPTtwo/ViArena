import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../state/StoreProvider';
import { Badge, Card, Empty, PageHeader } from '../../../components';

export function LiveNow() {
  const { events } = useStore();
  const streams = events.filter((e) => e.visibility === 'Published' && e.stream?.status === 'Live');
  return (
    <>
      <PageHeader
        eyebrow="WATCH TOGETHER"
        title="Live Now"
        description="Watch ongoing campus events and broadcasts."
      />
      {streams.length ? (
        <div className="event-grid">
          {streams.map((e) => (
            <Card key={e.id}>
              <Badge tone="danger">Live</Badge>
              <h2>{e.title}</h2>
              <p className="subtext">{e.venue}</p>
              <Link to={`/events/${e.id}/watch`} className="button primary">
                Watch event
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Empty
            title="No events are live right now"
            description="Browse published events to see upcoming competitions."
            action={
              <Link className="button outline" to="/events">
                Explore Events
              </Link>
            }
          />
        </Card>
      )}
    </>
  );
}
