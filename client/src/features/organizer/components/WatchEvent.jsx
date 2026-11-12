import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Video, ExternalLink } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { Badge, Card, Empty, PageHeader, dateTimeText } from '../../../components';
import { streamEmbedUrl } from '../../../functions/stream';
export function WatchEvent() {
  const { eventId } = useParams();
  const { events, user, canManageStream, schedules } = useStore();
  const event = events.find((e) => e.id === eventId);
  if (!event || (event.visibility !== 'Published' && !canManageStream(event)))
    return (
      <Card>
        <Empty title="Stream unavailable" />
      </Card>
    );
  const stream = event.stream || {};
  const embed = streamEmbedUrl(stream.url);
  return (
    <>
      <PageHeader
        eyebrow="LIVE VIEWING"
        title={event.title}
        description="Watch the official event broadcast and session schedule."
        action={
          <Link className="button outline" to={`/events/${eventId}`}>
            <ArrowLeft size={16} /> Event details
          </Link>
        }
      />
      <div className="two-column">
        <Card>
          <div className="tag-row">
            <Badge tone={stream.status === 'Live' ? 'danger' : 'info'}>
              {stream.status || 'Scheduled'}
            </Badge>
          </div>
          {embed ? (
            <div className="stream-player">
              <iframe
                title={`Broadcast: ${event.title}`}
                src={embed}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <div className="stream-empty">
              <Video size={40} />
              <h2>{stream.url ? 'Embedded viewing unavailable' : 'Broadcast not available yet'}</h2>
              <p>Check the stream schedule or open the official broadcast externally.</p>
            </div>
          )}
          {stream.url && (
            <a
              className="button outline"
              href={stream.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={16} /> Open stream externally
            </a>
          )}
          {stream.replayUrl && (
            <a
              className="button outline"
              href={stream.replayUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch replay
            </a>
          )}
        </Card>
        <Card>
          <h2>Session schedule</h2>
          {schedules
            .filter((s) => s.eventId === eventId)
            .map((s) => (
              <div className="simple-row" key={s.id}>
                <div className="grow">
                  <h3>{s.title}</h3>
                  <p>{dateTimeText(s.startsAt)}</p>
                </div>
              </div>
            ))}
          {!schedules.some((s) => s.eventId === eventId) && (
            <Empty title="Schedule not published" />
          )}
        </Card>
      </div>
    </>
  );
}
