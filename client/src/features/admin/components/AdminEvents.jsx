import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useStore } from '../../../state/StoreProvider';
import { Badge, Button, Card, Confirm, Empty, PageHeader, dateText } from '../../../components';

export function AdminEvents() {
  const { events, users, count, reassignEventOwner, notify } = useStore();
  const [selection, setSelection] = useState({});
  const [pending, setPending] = useState(null);

  const owners = users.filter((user) => user.roles.includes('Organizer'));

  return (
    <>
      <PageHeader
        eyebrow="ADMIN CONSOLE"
        title="Event Oversight"
        description="Review all published and draft events, and reassign event ownership."
      />

      <Card>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Reassign owner</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>{event.title}</strong>
                    <small>{dateText(event.start)}</small>
                    <Link to={`/events/${event.id}`}>View event</Link>
                  </td>
                  <td>{users.find((user) => user.id === event.ownerId)?.name || 'Unknown'}</td>
                  <td>
                    <Badge tone={event.visibility === 'Published' ? 'success' : 'neutral'}>
                      {event.visibility}
                    </Badge>
                  </td>
                  <td>{count(event.id)}</td>
                  <td>
                    <div className="inline-form">
                      <select
                        aria-label={`New owner for ${event.title}`}
                        value={selection[event.id] || ''}
                        onChange={(event) =>
                          setSelection((current) => ({
                            ...current,
                            [event.id]: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select Organizer</option>
                        {owners
                          .filter((user) => user.id !== event.ownerId)
                          .map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name}
                            </option>
                          ))}
                      </select>

                      <Button
                        variant="outline"
                        disabled={!selection[event.id]}
                        onClick={() =>
                          setPending({
                            eventId: event.id,
                            userId: selection[event.id],
                            title: event.title,
                          })
                        }
                      >
                        Reassign
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!events.length && <Empty title="No events available" />}
      </Card>

      {pending && (
        <Confirm
          title="Reassign event owner?"
          description={`Assign ${pending.title} to ${
            users.find((user) => user.id === pending.userId)?.name
          }? This administrative action will be recorded.`}
          onClose={() => setPending(null)}
          onConfirm={() => {
            try {
              reassignEventOwner(pending.eventId, pending.userId);
              notify('Event owner updated.');
            } catch (err) {
              notify(err.message, 'error');
            }
            setPending(null);
          }}
        />
      )}
    </>
  );
}
