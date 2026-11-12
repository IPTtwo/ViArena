import React from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { registrationEligibility } from '../../../functions/domain';
import { Button, Card, dateTimeText, PageHeader } from '../../../components';
import { NotFound } from '../../../app/guards';

export function RegistrationRedirect() {
  const { eventId } = useParams();
  const { user, events, count, isRegistered, register, notify } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  const event = events.find((e) => e.id === eventId);
  if (!event || event.visibility !== 'Published') return <NotFound />;
  const status = registrationEligibility(event, count(event.id), isRegistered(event.id));
  const submit = () => {
    try {
      register(event.id);
      notify('Registration confirmed.');
      navigate('/my-events', { replace: true });
    } catch (err) {
      notify(err.message, 'error');
      navigate(`/events/${event.id}`, { replace: true });
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="EVENT REGISTRATION"
        title="Confirm registration"
        description="Review your registration before securing your place."
      />
      <div className="registration-panel">
        <Card>
          <h2>{event.title}</h2>
          <div className="detail-facts">
            <div>
              <CalendarDays size={18} />
              <span>
                <strong>Date</strong>
                {dateTimeText(event.start)}
              </span>
            </div>
            <div>
              <MapPin size={18} />
              <span>
                <strong>Venue</strong>
                {event.venue}
              </span>
            </div>
            <div>
              <Users size={18} />
              <span>
                <strong>Availability</strong>
                {Math.max(0, event.capacity - count(event.id))} places remaining
              </span>
            </div>
            <div>
              <Clock3 size={18} />
              <span>
                <strong>Deadline</strong>
                {dateTimeText(event.deadline)}
              </span>
            </div>
          </div>
          <hr />
          <p className="subtext">{status.reason}</p>
          <div className="actions">
            <Link className="button outline" to={`/events/${eventId}`}>
              Back
            </Link>
            <Button disabled={!status.allowed} onClick={submit}>
              Confirm Registration
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
