import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Check, Clock, Plus, Users, Video, Download, Play, MapPin, ExternalLink } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { Badge, Button, Card, Confirm, Empty, Field, PageHeader, dateText, dateTimeText } from '../../../components';
import { canManageEvent } from '../../../functions/domain';
import { StatusBadge } from '../../../components';
export function CalendarView() {
  const { events, schedules, tasks, teams, user, canManageSchedule } = useStore();
  const [mode, setMode] = useState('Month');
  const [cursor, setCursor] = useState(() => new Date());
  const entries = useMemo(() => {
    const published = events.filter(e => e.visibility === 'Published');
    const schedule = published.flatMap(e => schedules.filter(s => s.eventId === e.id).map(s => ({ ...s, date: s.startsAt, kind: 'Session', event: e })));
    const eventDates = published.map(e => ({ id: `event-${e.id}`, date: e.start, title: e.title, kind: 'Event', event: e }));
    const myTasks = tasks.filter(t => {
      const team = teams.find(x => x.id === t.teamId);
      return team?.memberIds.includes(user.id) || team?.managerId === user.id || team?.handlerIds.includes(user.id) || canManageSchedule(events.find(e => e.id === team?.eventId))
    }).map(t => ({ ...t, date: t.due, kind: 'Task', event: events.find(e => e.id === teams.find(x => x.id === t.teamId)?.eventId) }));
    return [...eventDates, ...schedule, ...myTasks].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, schedules, tasks, teams, user.id]);
  const change = (step) => setCursor(d => {
    const n = new Date(d);
    if (mode === 'Month') n.setMonth(n.getMonth() + step); else if (mode === 'Week') n.setDate(n.getDate() + 7 * step); else n.setMonth(n.getMonth() + step);
    return n
  });
  const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthLength = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const offset = first.getDay();
  const days = Array.from({ length: Math.ceil((offset + monthLength) / 7) * 7 }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i - offset + 1));
  const weekStart = new Date(cursor);
  weekStart.setDate(cursor.getDate() - cursor.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const visible = e => mode === 'Month' ? new Date(e.date).getMonth() === cursor.getMonth() && new Date(e.date).getFullYear() === cursor.getFullYear() : mode === 'Week' ? new Date(e.date) >= weekStart && new Date(e.date) < new Date(weekStart.getTime() + 7 * 86400000) : new Date(e.date).getMonth() === cursor.getMonth() && new Date(e.date).getFullYear() === cursor.getFullYear();
  return <>
    <PageHeader eyebrow="CAMPUS CALENDAR"
      title="Calendar"
      description="Official event schedules and your assigned task deadlines. Only authorized event staff can edit schedules." />
    <Card>
      <div className="calendar-toolbar">
        <div className="actions">
          <Button variant="outline" onClick={() => change(-1)}>Previous</Button>
          <Button variant="outline" onClick={() => setCursor(new Date())}>Today</Button>
          <Button variant="outline" onClick={() => change(1)}>Next</Button>
        </div>
        <strong>{cursor.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</strong>
        <div className="tabs" aria-label="Calendar layout">{['Month', 'Week', 'List'].map(t => <button key={t} onClick={() => setMode(t)} className={mode === t ? 'active' : ''}>{t}</button>)}
        </div>
      </div>
      {mode === 'Month' ? <div className="calendar-month">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="calendar-weekday">{d}
      </div>)}{days.map(day => <div key={day.toISOString()} className={`calendar-day ${day.getMonth() !== cursor.getMonth() ? 'outside' : ''}`}>
        <strong>{day.getDate()}</strong>{entries.filter(e => sameDay(e.date, day)).slice(0, 3).map(e => <Link key={e.id} to={`/events/${e.event?.id || ''}`} className={`calendar-pill ${e.kind.toLowerCase()}`}>{e.title}</Link>)}
      </div>)}
      </div> : <div className="calendar-list">{entries.filter(visible).map(e => <div className="simple-row" key={`${e.kind}-${e.id}`}>
        <div className="calendar-tile">
          <strong>{new Date(e.date).getDate()}</strong>
          <small>{new Date(e.date).toLocaleDateString('en-PH', { month: 'short' })}</small>
        </div>
        <div className="grow">
          <h3>{e.title}</h3>
          <p>{dateTimeText(e.date)}, {e.event?.title}</p>
        </div>
        <Badge tone={e.kind === 'Task' ? 'warning' : e.kind === 'Session' ? 'info' : 'success'}>{e.kind}
        </Badge>
        <Link className="button outline" to={`/events/${e.event?.id || ''}`}>View</Link>
      </div>)}{!entries.some(visible) && <Empty title="No entries this period" />}
      </div>}
      <p className="subtext">Event and stream schedule entries are read-only here. Organizers edit their events in Manage Schedule.</p>
    </Card>
    {events.some(e=>canManageSchedule(e))&&<Card><h2>Manage your event schedules</h2><div className="feature-links">{events.filter(e=>canManageSchedule(e)).map(e=><Link className="button outline" key={e.id} to={`/organizer/events/${e.id}/schedule`}>{e.title}</Link>)}</div></Card>}
  </>
}
