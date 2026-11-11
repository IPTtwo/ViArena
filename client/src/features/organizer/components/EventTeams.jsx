import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clipboard, CalendarClock, Plus, Users, Shield, Video, Check, ExternalLink } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { Badge, Button, Card, Confirm, Empty, Field, PageHeader, dateTimeText } from '../../../components';
export function EventTeams() {
  const { eventId } = useParams();
  const { events, teams, users, registrations, joinCodes, createTeam, placeMember, generateJoinCode, disableJoinCode, canManageTeams, notify } = useStore();
  const event = events.find(e => e.id === eventId);
  const ownTeams = teams.filter(t => t.eventId === eventId);
  const [name, setName] = useState(''), [selection, setSelection] = useState({}), [error, setError] = useState('');
  if (!event || !canManageTeams(event)) return <Card>
    <Empty title="Event team management unavailable" />
  </Card>;
  const roster = registrations.filter(r => r.eventId === eventId && r.status === 'Registered').map(r => users.find(u => u.id === r.userId)).filter(Boolean);
  const code = joinCodes.find(c => c.eventId === eventId);
  const joinUrl = `${window.location.origin}/events/${eventId}${code?.enabled ? `?join=${code.code}` : ''}`;
  const submit = e => {
    e.preventDefault();
    try {
      createTeam(eventId, name);
      setName('');
      setError('');
      notify('Event team created.')
    } catch (err) {
      setError(err.message)
    }
  };
  const assign = team => {
    try {
      placeMember(team.id, selection[team.id]);
      notify('Participant assigned to team.');
      setSelection(v => ({ ...v, [team.id]: '' }))
    } catch (err) {
      notify(err.message, 'error')
    }
  };
  return <>
    <PageHeader eyebrow="EVENT TEAM MANAGEMENT"
      title={event.title}
      description="Create teams, manage event join codes, and place registered participants into teams."
      action={<Link className="button outline" to="/organizer/events"><ArrowLeft size={16} /> Managed events</Link>} />
    <div className="two-column">
      <Card>
        <h2>Event join link</h2>
        <p className="subtext">The link opens this event's registration page. It does not assign privileged roles.</p>
        <Field label="Join link">
          <input readOnly value={joinUrl} onFocus={e => e.target.select()} />
        </Field>
        {code?.enabled ? <Badge tone="success">Code active: {code.code}
        </Badge> : <Badge>Code not active</Badge>}
        <div className="actions">
          <Button variant="outline" onClick={async () => {
            try {
              await navigator.clipboard.writeText(joinUrl);
              notify('Join link copied.')
            } catch {
              notify('Copy the link from the field above.', 'error')
            }
          }}>
            <Clipboard size={16} /> Copy link
          </Button>
          <Button onClick={() => {
            generateJoinCode(eventId);
            notify('New join code generated.')
          }}>Generate code</Button>{code?.enabled && <Button variant="danger" onClick={() => disableJoinCode(eventId)}>Disable code</Button>}
        </div>
      </Card>
      <Card>
        <h2>Create an event team</h2>
        <form className="stack-form" onSubmit={submit}>
          <Field label="Team name">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter a team name" required />
          </Field>{error && <p className="form-alert" role="alert">{error}</p>}
          <Button type="submit">
            <Plus size={16} /> Create team
          </Button>
        </form>
      </Card>
    </div>
    <div className="section-heading">
      <h2>Event teams</h2>
      <p className="subtext">Only registered participants can be placed on a team.</p>
    </div>
    {ownTeams.length ? ownTeams.map(team => <Card key={team.id}>
      <div className="card-heading">
        <div>
          <h2>{team.name}</h2>
          <p className="subtext">{team.memberIds.length} members, Team Manager: {users.find(u => u.id === team.managerId)?.name || 'Unassigned'}</p>
        </div>
        <Link className="button outline" to={`/organizer/events/${eventId}/teams/${team.id}/roles`}>Assign roles</Link>
      </div>
      <div className="inline-form">
        <Field label="Add registered participant">
          <select value={selection[team.id] || ''} onChange={e => setSelection(v => ({ ...v, [team.id]: e.target.value }))}><option value="">Select participant</option>{roster.filter(u => !team.memberIds.includes(u.id)).map(u => <option value={u.id} key={u.id}>{u.name}</option>)}</select>
        </Field>
        <Button disabled={!selection[team.id]} onClick={() => assign(team)}>Add member</Button>
      </div>
      {team.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean).map(member => <div className="simple-row" key={member.id}>
        <div className="grow">
          <h3>{member.name}</h3>
          <p>{member.studentId}</p>
        </div>{team.managerId === member.id ? <Badge tone="success">Manager</Badge> : team.handlerIds.includes(member.id) ? <Badge tone="info">Handler</Badge> : <Badge>Member</Badge>}
        <Button variant="outline" onClick={() => {
          try {
            placeMember(team.id, member.id, true);
            notify('Member removed.')
          } catch (err) {
            notify(err.message, 'error')
          }
        }}>Remove</Button>
      </div>)}
      <Link to={`/events/${eventId}/teams/${team.id}/tasks`} className="button outline">View tasks</Link>
    </Card>) : <Card>
      <Empty title="No teams created" description="Create the first event team above." />
    </Card>}
  </>
}
