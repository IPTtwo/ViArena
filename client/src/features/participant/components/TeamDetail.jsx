import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Check, Clock, Plus, Users, Video, Download, Play, MapPin, ExternalLink } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { Badge, Button, Card, Confirm, Empty, Field, PageHeader, dateText, dateTimeText } from '../../../components';
import { canManageEvent } from '../../../functions/domain';
export function TeamDetail() {
  const { eventId, teamId } = useParams();
  const { teams, users, events, user, tasks, canManageTeams, registrations, placeMember, notify } = useStore();
  const team = teams.find(t => t.id === teamId && t.eventId === eventId);
  const event = events.find(e => e.id === eventId);
  const allowed = team && (team.memberIds.includes(user.id) || canManageTeams(event));
  if (!allowed) return <Card>
    <Empty title="Team unavailable" description="You can only view teams assigned to you." />
  </Card>;
  const [selected,setSelected] = useState('');
  const eligible = registrations.filter(r=>r.eventId===eventId&&r.status==='Registered'&&!team.memberIds.includes(r.userId)).map(r=>users.find(u=>u.id===r.userId)).filter(Boolean);
  const memberNames = team.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean);
  const manager = user.id === team.managerId;
  const eventStaff = canManageTeams(event);
  return <>
    <PageHeader eyebrow={event?.title}
      title={team.name}
      description="Team roster, responsibilities, and task progress."
      action={<Link className="button outline" to="/my-teams"><ArrowLeft size={16} /> My Teams</Link>} />
    <div className="two-column">
      <Card>
        <div className="card-heading">
          <h2>Team roster</h2>
          <Badge tone="info">{memberNames.length} members
          </Badge>
        </div>
        {memberNames.map(member => <div className="simple-row" key={member.id}>
          <span className="avatar">{member.name.slice(0, 1)}</span>
          <div className="grow">
            <h3>{member.name}</h3>
            <p>{member.studentId}</p>
          </div>{team.managerId === member.id ? <Badge tone="success">Team Manager</Badge> : team.handlerIds.includes(member.id) ? <Badge tone="info">Handler</Badge> : <Badge>Member</Badge>}
        </div>)}
        {!memberNames.length && <Empty title="No members assigned" description="The organizer will populate this roster." />}
        {(manager||eventStaff)&&<div className="inline-form"><Field label="Add registered participant"><select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Select participant</option>{eligible.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></Field><Button disabled={!selected} onClick={()=>{try{placeMember(team.id,selected);notify('Member added.');setSelected('')}catch(err){notify(err.message,'error')}}}>Add member</Button></div>}
 {(manager||eventStaff)&&<p className="subtext">Team leadership and handler roles are assigned only by event staff.</p>}
        {eventStaff && <Link className="button outline" to={`/organizer/events/${eventId}/teams`}>Manage team roster</Link>}
      </Card>
      <Card>
        <h2>Team tasks</h2>
        <p className="subtext">Track responsibilities and upcoming due dates.</p>
        <div className="feature-stat">{tasks.filter(t => t.teamId === team.id).length} total tasks
        </div>
        <Link className="button primary" to={`/events/${eventId}/teams/${teamId}/tasks`}>View team tasks</Link>{eventStaff && <Link className="button outline" to={`/organizer/events/${eventId}/teams/${teamId}/roles`}>Assign team roles</Link>}
      </Card>
    </div>
  </>
}
