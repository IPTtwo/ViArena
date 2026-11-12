import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { eventStatus } from '../../../functions/event';
import { Badge, Card, dateTimeText } from '../../../components';

export function EventCard({ event }) {
  const { count } = useStore();
  const status = eventStatus(event, count(event.id));
  return (
    <Card className="event-card">
      <div className="event-cover">
        {event.cover ? (
          <img src={event.cover} alt="" />
        ) : (
          <>
            <span className="cover-motif">
              {event.category === 'Esports' ? 'ESPORTS' : event.category.toUpperCase()}
            </span>
            <span className="cover-symbol">V</span>
          </>
        )}
      </div>
      <div className="event-card-body">
        <div className="tag-row">
          <Badge tone={status.tone}>{status.text}</Badge>
          <Badge tone="info">{event.category}</Badge>
        </div>
        <h2>
          <Link to={`/events/${event.id}`}>{event.title}</Link>
        </h2>
        <p className="event-meta">
          <CalendarDays size={16} />
          {dateTimeText(event.start)}
        </p>
        <p className="event-meta">
          <MapPin size={16} />
          {event.venue}
        </p>
        <div className="event-bottom">
          <span>
            {count(event.id)} / {event.capacity} registered
          </span>
          <Link className="button outline" to={`/events/${event.id}`}>
            View event <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
