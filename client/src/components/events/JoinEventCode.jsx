import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Field } from '../index';
import { useStore } from '../../state/StoreProvider';
export function JoinEventCode() {
  const { joinCodes, events } = useStore();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const submit = e => {
    e.preventDefault();
    const item = joinCodes.find(c => c.enabled && c.code.toUpperCase() === code.trim().toUpperCase());
    const event = events.find(e => e.id === item?.eventId && e.visibility === 'Published');
    if (!event) {
      setError('This event code is invalid or unavailable.');
      return;
    }
    setError('');
    navigate(`/events/${event.id}?join=${encodeURIComponent(item.code)}`)
  };
  return <Card className="join-code-card">
    <form onSubmit={submit} className="inline-form">
      <Field label="Have an event code?">
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter event code" aria-invalid={!!error} />
      </Field>
      <Button type="submit">Open event</Button>
    </form>{error && <p className="form-alert" role="alert">{error}</p>}
  </Card>
}