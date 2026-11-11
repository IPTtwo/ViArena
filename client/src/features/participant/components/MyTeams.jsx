import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Check, Clock, Plus, Users, Video, Download, Play, MapPin, ExternalLink } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { Badge, Button, Card, Confirm, Empty, Field, PageHeader, dateText, dateTimeText } from '../../../components';
import { canManageEvent } from '../../../functions/domain';
export function MyTeams() {
  const { user, teams, events, tasks, canManageTeams } = useStore();
  const assigned = teams.filter(t => t.memberIds.includes(user.id) || t.managerId === user.id || t.handlerIds.includes(user.id) || canManageTeams(events.find(e => e.id === t.eventId)));
  return <>
    <PageHeader title="My Teams" eyebrow="TEAM COORDINATION" description="Your event teams and assigned responsibilities." />
    {assigned.length ? <div className="event-grid">{assigned.map(t => {
      const event = events.find(e => e.id === t.eventId);
      const role = t.managerId === user.id ? 'Team Manager' : t.handlerIds.includes(user.id) ? 'Handler' : t.memberIds.includes(user.id) ? 'Team Member' : 'Event Staff';
      return <Card key={t.id}>
        <div className="tag-row">
          <Badge tone="info">{role}
          </Badge>
        </div>
        <h2>{t.name}</h2>
        <p className="subtext">{event?.title}</p>
        <p>{t.memberIds.length} members, {tasks.filter(task => task.teamId === t.id && task.status !== 'Done').length} open tasks</p>
        <Link className="button outline" to={`/events/${t.eventId}/teams/${t.id}`}>View team</Link>
      </Card>
    })}
    </div> : <Card>
      <Empty title="No team assignment yet"
        description="An event organizer will assign you to a team after registration."
        action={<Link className="button outline" to="/events">Explore Events</Link>} />
    </Card>}
  </>
}
