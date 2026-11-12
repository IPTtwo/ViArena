import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useStore } from '../../../state/StoreProvider';
import { Button, Card, Confirm, Empty, Field, PageHeader } from '../../../components';

const availablePermissions = [
  ['manage_event', 'Edit event details'],
  ['manage_registrations', 'Manage registrations'],
  ['manage_teams', 'Manage teams'],
  ['manage_event_schedule', 'Edit official calendar'],
  ['manage_stream', 'Manage stream'],
  ['manage_participation', 'Verify participation'],
];

export function CoOrganizerManagement() {
  const { eventId } = useParams();
  const { events, users, canManageStaff, setCoOrganizer, notify } = useStore();
  const event = events.find((item) => item.id === eventId);
  const [memberId, setMemberId] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [pending, setPending] = useState(null);

  if (!event || !canManageStaff(event)) {
    return (
      <Card>
        <Empty title="Co-organizer management unavailable" />
      </Card>
    );
  }

  const assign = (eventSubmit) => {
    eventSubmit.preventDefault();

    try {
      setCoOrganizer(eventId, memberId, permissions);
      notify('Co-organizer permissions saved.');
      setMemberId('');
      setPermissions([]);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="EVENT STAFF"
        title={`${event.title}: Co-organizers`}
        description="Assign event-specific staff access without granting an Organizer account role."
      />

      <div className="two-column">
        <Card>
          <h2>Add or update co-organizer</h2>

          <form className="stack-form" onSubmit={assign}>
            <Field label="Existing account">
              <select
                required
                value={memberId}
                onChange={(event) => {
                  setMemberId(event.target.value);
                  setPermissions(
                    event.coOrganizers?.find(
                      (coOrganizer) => coOrganizer.userId === event.target.value,
                    )?.permissions || [],
                  );
                }}
              >
                <option value="">Select account</option>
                {users
                  .filter((user) => user.id !== event.ownerId)
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
              </select>
            </Field>

            <fieldset className="checkbox-list">
              <legend>Event-specific permissions</legend>
              {availablePermissions.map(([key, label]) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={permissions.includes(key)}
                    onChange={(event) =>
                      setPermissions((current) =>
                        event.target.checked
                          ? [...current, key]
                          : current.filter((permission) => permission !== key),
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </fieldset>

            <Button type="submit" disabled={!memberId}>
              Save assignment
            </Button>
          </form>
        </Card>

        <Card>
          <h2>Current event staff</h2>
          {event.coOrganizers?.map((item) => (
            <div className="simple-row" key={item.userId}>
              <div className="grow">
                <h3>{users.find((user) => user.id === item.userId)?.name || 'Unknown account'}</h3>
                <p>
                  {item.permissions
                    .map(
                      (permission) =>
                        availablePermissions.find(([key]) => key === permission)?.[1] || permission,
                    )
                    .join(', ') || 'Read-only assignment'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setMemberId(item.userId);
                  setPermissions(item.permissions);
                }}
              >
                Edit
              </Button>
              <Button variant="danger" onClick={() => setPending(item)}>
                Remove
              </Button>
            </div>
          ))}

          {!event.coOrganizers?.length && <Empty title="No co-organizers assigned" />}
        </Card>
      </div>

      {pending && (
        <Confirm
          title="Remove co-organizer?"
          description="This will revoke all event-specific staff permissions."
          danger
          onClose={() => setPending(null)}
          onConfirm={() => {
            setCoOrganizer(eventId, pending.userId, [], true);
            setPending(null);
            notify('Co-organizer removed.');
          }}
        />
      )}
    </>
  );
}
