import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import {
  Badge,
  Button,
  Card,
  Confirm,
  Empty,
  Field,
  PageHeader,
  dateTimeText,
} from '../../../components';
export function ScheduleEditor() {
  const { eventId } = useParams();
  const { events, schedules, canManageSchedule, saveSchedule, removeSchedule, notify } = useStore();
  const event = events.find((e) => e.id === eventId);
  const items = schedules
    .filter((s) => s.eventId === eventId)
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  const empty = { title: '', startsAt: '', endsAt: '', venue: '', description: '' };
  const [form, setForm] = useState(empty),
    [editing, setEditing] = useState(null),
    [open, setOpen] = useState(false),
    [deleting, setDeleting] = useState(null),
    [error, setError] = useState('');
  if (!event || !canManageSchedule(event))
    return (
      <Card>
        <Empty title="Schedule editor unavailable" />
      </Card>
    );
  const reset = () => {
    setForm(empty);
    setEditing(null);
    setOpen(false);
    setError('');
  };
  const submit = (e) => {
    e.preventDefault();
    try {
      saveSchedule(eventId, form, editing);
      notify('Schedule saved.');
      reset();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="OFFICIAL EVENT SCHEDULE"
        title={`${event.title}: Schedule`}
        description="Only authorized event organizers can change official sessions."
        action={
          <Button
            onClick={() => {
              reset();
              setOpen(true);
            }}
          >
            <Plus size={16} /> Add session
          </Button>
        }
      />
      {open && (
        <Card>
          <h2>{editing ? 'Edit session' : 'New schedule session'}</h2>
          <form onSubmit={submit} className="stack-form">
            <Field label="Session title">
              <input
                required
                value={form.title}
                onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
              />
            </Field>
            <div className="form-grid">
              <Field label="Start">
                <input
                  type="datetime-local"
                  required
                  value={form.startsAt}
                  onChange={(e) => setForm((v) => ({ ...v, startsAt: e.target.value }))}
                />
              </Field>
              <Field label="End">
                <input
                  type="datetime-local"
                  required
                  value={form.endsAt}
                  onChange={(e) => setForm((v) => ({ ...v, endsAt: e.target.value }))}
                />
              </Field>
            </div>
            <Field label="Location">
              <input
                required
                value={form.venue}
                onChange={(e) => setForm((v) => ({ ...v, venue: e.target.value }))}
              />
            </Field>
            <Field label="Description">
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
              />
            </Field>
            {error && (
              <p className="form-alert" role="alert">
                {error}
              </p>
            )}
            <div className="actions">
              <Button type="submit">Save session</Button>
              <Button type="button" variant="outline" onClick={reset}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Card>
        <div className="card-heading">
          <h2>Published schedule</h2>
          <Badge tone="info">{items.length} sessions</Badge>
        </div>
        {items.map((item) => (
          <div className="simple-row" key={item.id}>
            <div className="grow">
              <h3>{item.title}</h3>
              <p>
                {dateTimeText(item.startsAt)} to {dateTimeText(item.endsAt)}, {item.venue}
              </p>
              <p>{item.description}</p>
            </div>
            <div className="actions">
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(item.id);
                  setForm({
                    title: item.title,
                    startsAt: item.startsAt,
                    endsAt: item.endsAt,
                    venue: item.venue,
                    description: item.description,
                  });
                  setOpen(true);
                }}
              >
                Edit
              </Button>
              <Button variant="danger" onClick={() => setDeleting(item)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
        {!items.length && (
          <Empty title="No sessions added" description="Create a schedule item for this event." />
        )}
      </Card>
      {deleting && (
        <Confirm
          title="Delete session?"
          description={`Remove ${deleting.title} from the event schedule.`}
          danger
          confirmLabel="Delete session"
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            removeSchedule(eventId, deleting.id);
            setDeleting(null);
            notify('Session removed.');
          }}
        />
      )}
    </>
  );
}
