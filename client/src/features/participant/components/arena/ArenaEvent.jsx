import React from 'react';
import { ArrowRight, CalendarDays, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dateText } from '../../../../functions/format';

export function ArenaEvent({ event, live = false }) {
  return (
    <Link className="arena-event" to={`/events/${event.id}`}>
      <span className={`arena-event-icon ${live ? 'is-live' : ''}`}>
        {live ? <Radio size={16} /> : <CalendarDays size={16} />}
      </span>
      <span className="arena-event-copy">
        <strong>{event.title}</strong>
        <small>
          {live ? 'Live now' : dateText(event.start)} · {event.category}
        </small>
      </span>
      <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}
