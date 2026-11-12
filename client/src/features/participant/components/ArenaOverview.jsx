import React from 'react';
import { ArrowRight, CalendarDays, MapPin, Radio, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../state/StoreProvider';
import { eventStatus } from '../../../functions/event';
import { dateText } from '../../../functions/format';
import { Card, PageHeader } from '../../../components';
import { JoinEventCode } from '../../../components/events';
import { EventPoster } from './arena/EventPoster';
import { ArenaEvent } from './arena/ArenaEvent';
import { getArenaEvents } from '../functions/arena';

export function ArenaOverview() {
  const { events, registrations, count, user, isRegistered } = useStore();
  const { published, liveEvents, featured, otherUpcoming, otherLive } = getArenaEvents(events);
  const categories = new Set(published.map((event) => event.category));

  return (
    <div className="arena-page">
      <PageHeader
        title="Your campus arena"
        description="See what is happening now, what is coming next, and where you belong."
        action={
          <Link className="button outline" to="/events">
            Browse all events <ArrowRight size={16} />
          </Link>
        }
      />

      <section className="arena-layout" aria-labelledby="arena-stage-title">
        <Card className={`arena-stage-card ${featured ? '' : 'arena-stage-empty'}`}>
          {featured && <EventPoster key={featured.id} event={featured} />}
          <div className="arena-stage-content">
            {featured && (
              <span className="arena-feature-status">
                {liveEvents.some((event) => event.id === featured.id)
                  ? 'Happening now'
                  : eventStatus(featured, count(featured.id)).text}
              </span>
            )}
            <div className="arena-feature-heading">
              {featured && (
                <time className="arena-date-badge" dateTime={featured.start}>
                  <strong>{new Date(featured.start).getDate()}</strong>
                  <span>
                    {new Date(featured.start).toLocaleDateString('en-PH', { month: 'short' })}
                  </span>
                </time>
              )}
              <h2 id="arena-stage-title">{featured ? featured.title : 'The arena is ready'}</h2>
            </div>
            <p>
              {featured
                ? featured.description
                : 'Published events will appear here when they are ready to welcome participants.'}
            </p>
            {featured && (
              <div className="arena-stage-meta">
                <span>
                  <CalendarDays size={15} /> {dateText(featured.start)}
                </span>
                <span>
                  <MapPin size={15} /> {featured.venue}
                </span>
              </div>
            )}
            {featured && (
              <Link className="button" to={`/events/${featured.id}`}>
                {isRegistered(featured.id) ? 'View your event' : 'View event'}{' '}
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </Card>

        {otherLive.length > 0 && (
          <Card className="arena-rail">
            <div className="card-heading">
              <div>
                <h2>Live around campus</h2>
                <p className="subtext">Beyond the main stage</p>
              </div>
              <Users size={20} aria-hidden="true" />
            </div>
            {otherLive.slice(0, 3).map((event) => (
              <ArenaEvent key={event.id} event={event} live />
            ))}
            <div className="arena-rail-action">
              <strong>{user ? 'Make your next move' : 'Find your place in the arena'}</strong>
              <p>
                {user
                  ? 'Keep your registrations and event plans together.'
                  : 'Sign in to join events and follow your campus activities.'}
              </p>
              <Link className="button outline" to={user ? '/my-events' : '/login'}>
                {user ? 'My events' : 'Sign in'} <ArrowRight size={16} />
              </Link>
            </div>
          </Card>
        )}
      </section>

      <section className="arena-shortcuts" aria-label="Event shortcuts">
        <div>
          <h2>{user ? 'Your next step' : 'Join your campus community'}</h2>
          <p>
            {user
              ? 'Keep your events and plans close at hand.'
              : 'Sign in to register for events and keep track of your plans.'}
          </p>
          <div className="arena-shortcut-links">
            <Link className="button outline" to={user ? '/my-events' : '/login'}>
              {user ? 'My events' : 'Sign in'} <ArrowRight size={16} />
            </Link>
            {user && (
              <Link className="button outline" to="/calendar">
                View calendar <CalendarDays size={16} />
              </Link>
            )}
          </div>
        </div>
        <JoinEventCode />
      </section>
      {!liveEvents.length && (
        <p className="arena-live-note">
          <Radio size={16} aria-hidden="true" />
          No live events right now.
          <Link to="/live">
            Live Now <ArrowRight size={14} />
          </Link>
        </p>
      )}

      <section className="arena-next">
        <div className="section-heading">
          <h2>Upcoming events</h2>
          <Link to="/events">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {otherUpcoming.length ? (
          <div className="arena-event-grid">
            {otherUpcoming.slice(0, 3).map((event) => (
              <div className="arena-upcoming-card" key={event.id}>
                <ArenaEvent event={event} />
                <p>
                  <MapPin size={15} aria-hidden="true" />
                  {event.venue}
                </p>
                <span>{eventStatus(event, count(event.id)).text}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="arena-empty">
            <p>No additional upcoming events yet. Check back for the next announcement.</p>
            <Link to="/events">Browse all events</Link>
          </div>
        )}
      </section>
      <dl className="arena-summary" aria-label="Arena overview">
        {[
          ['Events in the arena', published.length, 'Published events'],
          ['Live now', liveEvents.length, 'Watch ongoing moments'],
          ['Categories', categories.size, 'Ways to participate'],
          [
            user ? 'Your registrations' : 'Campus registrations',
            registrations.filter(
              (item) =>
                item.status === 'Registered' &&
                (user
                  ? item.userId === user.id
                  : published.some((event) => event.id === item.eventId)),
            ).length,
            user ? 'Events you joined' : 'Across published events',
          ],
        ].map(([label, value, description]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
            <small>{description}</small>
          </div>
        ))}
      </dl>
    </div>
  );
}
