import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clipboard, CalendarClock, Plus, Users, Shield, Video, Check, ExternalLink } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { Badge, Button, Card, Confirm, Empty, Field, PageHeader, dateTimeText } from '../../../components';
export function StreamSettings() {
  const { eventId } = useParams();
  const { events, canManageStream, saveStream, notify } = useStore();
  const event = events.find(e => e.id === eventId);
  const [form, setForm] = useState(() => ({ url: event?.stream?.url || '', provider: event?.stream?.provider || 'YouTube', status: event?.stream?.status || 'Scheduled', replayUrl: event?.stream?.replayUrl || '', scheduledAt: event?.stream?.scheduledAt || '' }));
  const [error, setError] = useState('');
  if (!event || !canManageStream(event)) return <Card>
    <Empty title="Stream settings unavailable" />
  </Card>;
  const submit = e => {
    e.preventDefault();
    try {
      saveStream(eventId, form);
      notify('Stream settings saved.');
      setError('')
    } catch (err) {
      setError(err.message)
    }
  };
  return <>
    <PageHeader eyebrow="BROADCAST MANAGEMENT"
      title={`${event.title}: Stream`}
      description="Manage the official external broadcast, status, and replay."
      action={<Link to={`/events/${eventId}/watch`} className="button outline"><ExternalLink size={16} /> Watch page</Link>} />
    <Card>
      <form onSubmit={submit} className="stack-form">
        <Field label="Stream provider">
          <select value={form.provider} onChange={e => setForm(v => ({ ...v, provider: e.target.value }))}><option>YouTube</option><option>Twitch</option><option>Facebook</option><option>Other</option></select>
        </Field>
        <Field label="Official broadcast URL">
          <input type="url" placeholder="https://" value={form.url} onChange={e => setForm(v => ({ ...v, url: e.target.value }))} />
        </Field>
        <div className="form-grid">
          <Field label="Stream status">
            <select value={form.status} onChange={e => setForm(v => ({ ...v, status: e.target.value }))}><option>Scheduled</option><option>Live</option><option>Ended</option></select>
          </Field>
          <Field label="Scheduled start">
            <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(v => ({ ...v, scheduledAt: e.target.value }))} />
          </Field>
        </div>
        <Field label="Replay URL">
          <input type="url" placeholder="https://" value={form.replayUrl} onChange={e => setForm(v => ({ ...v, replayUrl: e.target.value }))} />
        </Field>
        <p className="subtext">YouTube streams can be embedded directly. For other providers, viewers can use the external viewing link.</p>{error && <p className="form-alert" role="alert">{error}</p>}
        <Button type="submit">Save stream settings</Button>
      </form>
    </Card>
  </>
}
