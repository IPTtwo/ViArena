import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clipboard, CalendarClock, Plus, Users, Shield, Video, Check, ExternalLink } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { Badge, Button, Card, Confirm, Empty, Field, PageHeader, dateTimeText } from '../../../components';
export function TeamRoleAssignment() {
  const { eventId, teamId } = useParams();
  const { events, teams, users, assignTeamRole, canManageTeams, notify } = useStore();
  const event = events.find(e => e.id === eventId);
  const team = teams.find(t => t.id === teamId && t.eventId === eventId);
  const [pending, setPending] = useState(null);
  if (!team || !canManageTeams(event)) return <Card>
    <Empty title="Role assignment unavailable" />
  </Card>;
  const apply = () => {
    try {
      assignTeamRole(teamId, pending.userId, pending.role, pending.remove);
      notify('Team responsibility updated.')
    } catch (err) {
      notify(err.message, 'error')
    }
    setPending(null)
  };
  return <>
    <PageHeader eyebrow="ORGANIZER ASSIGNMENTS"
      title={`${team.name}: Team Roles`}
      description="Only event staff can assign Team Managers and Handlers."
      action={<Link className="button outline" to={`/organizer/events/${eventId}/teams`}><ArrowLeft size={16} /> All teams</Link>} />
    <Card>
      <p className="subtext">Exactly one Team Manager can be active per team. Assigning a replacement transfers the responsibility.</p>
      {team.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean).map(member => <div key={member.id} className="simple-row">
        <div className="grow">
          <h3>{member.name}</h3>
          <p>{member.studentId}</p>
        </div>{team.managerId === member.id ? <Badge tone="success">Team Manager</Badge> : <Badge>Member</Badge>}{team.handlerIds.includes(member.id) && <Badge tone="info">Handler</Badge>}
        <div className="actions">{team.managerId === member.id ? <Button variant="outline" onClick={() => setPending({ userId: member.id, role: 'Manager', remove: true })}>Remove Manager</Button> : <Button variant="outline" onClick={() => setPending({ userId: member.id, role: 'Manager', remove: false })}>Assign Manager</Button>}
          <Button variant="outline" onClick={() => setPending({ userId: member.id, role: 'Handler', remove: team.handlerIds.includes(member.id) })}>{team.handlerIds.includes(member.id) ? 'Remove Handler' : 'Assign Handler'}
          </Button>
        </div>
      </div>)}
      {!team.memberIds.length && <Empty title="No members assigned" description="Add registered participants to this team first." />}
    </Card>
    {pending && <Confirm title="Confirm team role change"
      description={`This will ${pending.remove ? 'remove' : 'assign'} the ${pending.role} role for this team only.`}
      onConfirm={apply}
      onClose={() => setPending(null)} />}
  </>
}
