import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, Users, UserMinus, ArrowLeft } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { filterRegistrations } from '../../../functions/domain';
import { Badge, Button, Card, Confirm, Empty, PageHeader, dateTimeText } from '../../../components';

export function RegistrationManager() {
  const { eventId } = useParams();
  const { events, users, registrations, count, canManageRegistrations, cancelRegistration, notify } = useStore();
  const [query, setQuery] = useState(''), [filter, setFilter] = useState('Registered'), [selected, setSelected] = useState(null), [pending, setPending] = useState(null);
  const event = events.find(e => e.id === eventId);
  const rows = useMemo(() => filterRegistrations(registrations, users, eventId, query, filter), [registrations, users, eventId, query, filter]);
  if (!event) return <div className="center-page">
    <h1>Page not found</h1>
    <p>That event is unavailable.</p>
    <Link className="button primary" to="/organizer/events">Back to events</Link>
  </div>;
  if (!canManageRegistrations(event)) return <div className="center-page" role="alert">
    <h1>Access denied</h1>
    <p>You do not have permission to view this page.</p>
    <Link className="button primary" to="/events">Explore Events</Link>
  </div>;
  const registered = count(eventId), total = registrations.filter(r => r.eventId === eventId).length;
  const doRemove = () => {
    try {
      cancelRegistration(eventId, pending.userId);
      notify('Registration removed.');
      setPending(null);
      setSelected(null)
    } catch (error) {
      notify(error.message, 'error');
      setPending(null)
    }
  };
  return <>
    <PageHeader eyebrow="ORGANIZER WORKSPACE"
      title="Registrations"
      description={event.title}
      action={<Link to="/organizer/events" className="button outline"><ArrowLeft size={16} /> Event management</Link>} />
    <div className="stats-grid">
      <Card className="stat-card">
        <div className="stat-label">REGISTERED</div>
        <strong>{registered}</strong>
        <p>Confirmed participants</p>
      </Card>
      <Card className="stat-card">
        <div className="stat-label">CAPACITY</div>
        <strong>{event.capacity}</strong>
        <p>Maximum participants</p>
      </Card>
      <Card className="stat-card">
        <div className="stat-label">AVAILABLE</div>
        <strong>{Math.max(0, event.capacity - registered)}</strong>
        <p>Remaining places</p>
      </Card>
      <Card className="stat-card">
        <div className="stat-label">REGISTRATION RECORDS</div>
        <strong>{total}</strong>
        <p>Including cancellations</p>
      </Card>
    </div>
    <Card>
      <div className="card-heading">
        <h2>Participant roster</h2>
        <Badge tone={registered >= event.capacity ? 'warning' : 'success'}>{registered >= event.capacity ? 'Full' : 'Registration Open'}
        </Badge>
      </div>
      <div className="management-tools">
        <div className="searchbox">
          <Search size={18} />
          <input aria-label="Search by name, email, or ID"
            placeholder="Search name, email, or student ID"
            value={query}
            onChange={e => setQuery(e.target.value)} />
        </div>
        <select aria-label="Registration status" value={filter} onChange={e => setFilter(e.target.value)}><option>Registered</option><option>Canceled</option><option>All</option></select>
      </div>
      {rows.length ? <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Student ID</th>
              <th>Registration date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{rows.map(r => <tr key={r.id}>
            <td>
              <strong>{r.member.name}</strong>
              <small>{r.member.email}</small>
            </td>
            <td>{r.member.studentId || 'Not available'}
            </td>
            <td>{dateTimeText(r.createdAt)}
            </td>
            <td>
              <Badge tone={r.status === 'Registered' ? 'success' : 'danger'}>{r.status}
              </Badge>
            </td>
            <td>
              <div className="table-actions">
                <Button variant="outline" onClick={() => setSelected(r)}>Details</Button>{r.status === 'Registered' && <Button variant="outline" onClick={() => setPending(r)}>
                  <UserMinus size={15} /> Remove
                </Button>}
              </div>
            </td>
          </tr>)}
          </tbody>
        </table>
      </div> : <Empty title="No registrations found" description={query ? 'Try another participant name or student ID.' : 'Registrations matching this status will appear here.'} />}
    </Card>
    {selected && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setSelected(null)}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="participant-details-title">
        <h2 id="participant-details-title">Participant details</h2>
        <dl className="details-list"><div>
          <dt>Name</dt>
          <dd>{selected.member.name}</dd>
        </div><div>
            <dt>School email</dt>
            <dd>{selected.member.email}</dd>
          </div><div>
            <dt>Student ID</dt>
            <dd>{selected.member.studentId}</dd>
          </div><div>
            <dt>Registered at</dt>
            <dd>{dateTimeText(selected.createdAt)}</dd>
          </div><div>
            <dt>Status</dt>
            <dd>{selected.status}</dd>
          </div></dl>
        <div className="actions">
          <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>{selected.status === 'Registered' && <Button variant="danger" onClick={() => {
            setPending(selected);
            setSelected(null)
          }}>Remove registration</Button>}
        </div>
      </div>
    </div>}
    {pending && <Confirm title="Remove this registration?"
      description={`${pending.member.name} will lose their place in ${event.title}. Available capacity will increase by one.`}
      danger
      confirmLabel="Remove registration"
      onClose={() => setPending(null)}
      onConfirm={doRemove} />}
  </>;
}
