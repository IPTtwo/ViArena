import { OrganizerEventLinks } from '../../../components/events/OrganizerEventLinks';
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, Clock3 } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { categories } from '../../../data/fixtures';
import { validateEvent } from '../../../functions/domain';
import {
  Button,
  Card,
  Confirm,
  dateTimeText,
  Field,
  PageHeader,
  VisibilityStatus,
} from '../../../components';
import { Denied, NotFound } from '../../../app/guards';

const defaultEvent = {
  title: '',
  description: '',
  category: 'Esports',
  venue: '',
  start: '',
  end: '',
  deadline: '',
  capacity: '24',
  cover: '',
  eligibility: '',
  visibility: 'Draft',
};
function EventEditor() {
  const { eventId } = useParams();
  const { events, user, saveEvent, canManageEvent, count, notify } = useStore();
  const navigate = useNavigate();
  const current = eventId ? events.find((e) => e.id === eventId) : null;
  const [form, setForm] = useState(
    current ? { ...current, capacity: String(current.capacity) } : { ...defaultEvent },
  );
  const [error, setError] = useState(''),
    [publishConfirm, setPublishConfirm] = useState(false),
    [unpublishConfirm, setUnpublishConfirm] = useState(false);
  if (eventId && !current) return <NotFound />;
  if (current && !canManageEvent(current)) return <Denied />;
  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError('');
  };
  const save = (visibility) => {
    const fields = { ...form, visibility };
    try {
      const id = saveEvent(fields, eventId);
      notify(visibility === 'Published' ? 'Event published successfully.' : 'Draft saved.');
      navigate(`/organizer/events/${id}/edit`, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };
  const requestPublish = () => {
    const problem = validateEvent(form, true, current ? count(current.id) : 0);
    if (problem) {
      setError(problem);
      return;
    }
    setPublishConfirm(true);
  };
  const checklist = [
    ['Event title and description', !!form.title.trim() && !!form.description.trim()],
    [
      'Event start and end times',
      !!form.start && !!form.end && new Date(form.start) < new Date(form.end),
    ],
    ['Venue and capacity', !!form.venue.trim() && Number(form.capacity) >= 1],
    ['Registration deadline', !!form.deadline && new Date(form.deadline) <= new Date(form.start)],
  ];
  return (
    <>
      <PageHeader
        eyebrow="ORGANIZER WORKSPACE"
        title={eventId ? 'Edit event' : 'Create an event'}
        description="Set up event details and publish when everything is ready."
        action={
          <Link className="button outline" to="/organizer/events">
            Back to events
          </Link>
        }
      />
      <div className="editor-grid">
        <Card>
          <div className="between">
            <h2>Event details</h2>
            {current && VisibilityStatus(current)}
          </div>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              save(current?.visibility === 'Published' ? 'Published' : 'Draft');
            }}
          >
            <Field label="Event title">
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Enter an event title"
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Tell participants what to expect"
              />
            </Field>
            <div className="form-grid">
              <Field label="Category">
                <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {categories
                    .filter((c) => c !== 'All categories')
                    .map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                </select>
              </Field>
              <Field label="Capacity">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.capacity}
                  onChange={(e) => set('capacity', e.target.value)}
                />
              </Field>
            </div>
            <Field label="Venue">
              <input
                value={form.venue}
                onChange={(e) => set('venue', e.target.value)}
                placeholder="Where is the event happening?"
              />
            </Field>
            <div className="form-grid">
              <Field label="Starts">
                <input
                  type="datetime-local"
                  value={form.start}
                  onChange={(e) => set('start', e.target.value)}
                />
              </Field>
              <Field label="Ends">
                <input
                  type="datetime-local"
                  value={form.end}
                  onChange={(e) => set('end', e.target.value)}
                />
              </Field>
            </div>
            <Field label="Registration deadline">
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => set('deadline', e.target.value)}
              />
            </Field>
            <Field label="Eligibility" hint="Optional, shown on the event details page.">
              <textarea
                rows={3}
                value={form.eligibility || ''}
                onChange={(e) => set('eligibility', e.target.value)}
                placeholder="Who can participate?"
              />
            </Field>
            <Field label="Cover image" hint="Optional. JPG or PNG, up to 1 MB.">
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (!['image/jpeg', 'image/png'].includes(f.type) || f.size > 1024 * 1024)
                    return setError('Choose a JPG or PNG smaller than 1 MB.');
                  const reader = new FileReader();
                  reader.onload = () => set('cover', String(reader.result));
                  reader.readAsDataURL(f);
                }}
              />
            </Field>
            {form.cover && (
              <>
                <img className="cover-preview" src={form.cover} alt="Event cover preview" />
                <Button type="button" variant="outline" onClick={() => set('cover', '')}>
                  Remove cover
                </Button>
              </>
            )}
            {error && (
              <p className="form-alert" role="alert">
                {error}
              </p>
            )}
            <div className="actions">
              <Link className="button outline" to="/organizer/events">
                Cancel
              </Link>
              <Button type="submit" variant="outline">
                {current?.visibility === 'Published' ? 'Save changes' : 'Save draft'}
              </Button>
              {current?.visibility !== 'Published' && (
                <Button type="button" onClick={requestPublish}>
                  Publish event
                </Button>
              )}
              {current?.visibility === 'Published' && (
                <Button type="button" variant="outline" onClick={() => setUnpublishConfirm(true)}>
                  Unpublish
                </Button>
              )}
            </div>
          </form>
        </Card>
        <Card className="side-checklist">
          <h2>Publishing checklist</h2>
          {checklist.map(([label, ready]) => (
            <div key={label} className="checkline">
              {ready ? <Check size={17} /> : <Clock3 size={17} className="check-pending" />}
              <span>{label}</span>
            </div>
          ))}
          <hr />
          <p className="subtext">
            Published events appear in Explore Events. Only the owner or authorized staff can edit
            this event.
          </p>
          {current?.updatedAt && (
            <p className="subtext">Last updated: {dateTimeText(current.updatedAt)}</p>
          )}
        </Card>
      </div>
      {current && (
        <Card>
          <h2>Manage event</h2>
          <OrganizerEventLinks event={current} />
        </Card>
      )}
      {publishConfirm && (
        <Confirm
          title="Publish this event?"
          description="The event will become visible to everyone in Explore Events."
          confirmLabel="Publish event"
          onClose={() => setPublishConfirm(false)}
          onConfirm={() => {
            setPublishConfirm(false);
            save('Published');
          }}
        />
      )}
      {unpublishConfirm && (
        <Confirm
          title="Unpublish this event?"
          description="This event will disappear from the public feed. Existing registrations will be kept."
          confirmLabel="Unpublish event"
          danger
          onClose={() => setUnpublishConfirm(false)}
          onConfirm={() => {
            setUnpublishConfirm(false);
            save('Draft');
          }}
        />
      )}
    </>
  );
}

export { EventEditor };
