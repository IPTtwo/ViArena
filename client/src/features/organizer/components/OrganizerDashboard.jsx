import { OrganizerEventLinks } from '../../../components/events/OrganizerEventLinks';
import React, { useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Eye, EyeOff, Filter, MapPin, Plus, Search, Shield, Ticket, Users, Upload, User, Edit3 } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { seedEvents, categories } from '../../../data/fixtures';
import { canCreateEvent, canViewPrivateEvent, registrationEligibility, validateEvent, validSchoolEmail } from '../../../functions/domain';
import { eventStatus, now } from '../../../functions/event';
import { Badge, Button, Card, Confirm, dateText, dateTimeText, Empty, ErrorState, Field, GuestShell, Loading, PageHeader, Shell, Stats, VisibilityStatus } from '../../../components';
import { Denied, NotFound } from '../../../app/guards';

export function OrganizerDashboard() {
  const { events, user, count, canManageEvent } = useStore();
  const mine = events.filter(e => canManageEvent(e));
  const upcoming = mine.filter(e => new Date(e.start) >= now()).sort((a, b) => new Date(a.start) - new Date(b.start));
  const draft = mine.find(e => e.visibility === 'Draft');
  return <>
    <PageHeader eyebrow="WELCOME BACK"
      title="Dashboard"
      description="Here's what's happening in your arena today."
      action={<Link className="button primary" to="/organizer/events/new"><Plus size={18} /> Create event</Link>} />
    <Stats items={[["ACTIVE EVENTS", mine.filter(e => e.visibility === 'Published').length, 'Published campus events'], ['TEAM REGISTRATIONS', mine.reduce((s, e) => s + count(e.id), 0), 'Confirmed registrations'], ['CO-ORGANIZERS', new Set(mine.flatMap(e => e.coOrganizers?.map(c => c.userId) || [])).size, 'Across managed events'], ['DRAFT EVENTS', mine.filter(e => e.visibility === 'Draft').length, 'Continue preparing your event']]} />
    <div className="dashboard-grid">
      <div className="dashboard-stack">
        <Card>
          <div className="section-label">UPCOMING EVENT</div>{upcoming.length ? upcoming.slice(0, 2).map(e => <div className="featured-event" key={e.id}>
            <div className="calendar-tile">
              <strong>{new Date(e.start).getDate()}</strong>
              <small>{new Date(e.start).toLocaleString('en-PH', { month: 'short' }).toUpperCase()}</small>
            </div>
            <div className="grow">
              <h3>{e.title}</h3>
              <p>{dateTimeText(e.start)}: {e.venue}</p>
              <div className="tag-row">{VisibilityStatus(e)}
                <Badge tone="info">{e.category}
                </Badge>
              </div>
              <p className="subtext">{count(e.id)} participants registered</p>
            </div>
            <Link className="button outline" to={`/organizer/events/${e.id}/edit`}>Manage event</Link>
          </div>) : <Empty title="No upcoming managed events" />}
        </Card>
        <Card>
          <div className="card-heading">
            <h2>Registration overview</h2>
            <Link to="/organizer/registrations">View registrations <ChevronRight size={16} /></Link>
          </div>
          <div className="quick-list">{mine.filter(e => e.visibility === 'Published').slice(0, 3).map(e => <div className="simple-row" key={e.id}>
            <div className="grow">
              <strong>{e.title}</strong>
              <p className="subtext">{count(e.id)} of {e.capacity} registered</p>
            </div>
            <Link to={`/organizer/events/${e.id}/registrations`} className="button outline">Review</Link>
          </div>)}
          </div>
        </Card>
      </div>
      <div className="dashboard-stack">
        <Card>
          <div className="section-label">ON THE HORIZON</div>{upcoming[0] ? <div className="upcoming-summary">
            <div className="calendar-tile">
              <strong>{new Date(upcoming[0].start).getDate()}</strong>
              <small>{new Date(upcoming[0].start).toLocaleString('en-PH', { month: 'short' }).toUpperCase()}</small>
            </div>
            <div>
              <h3>{upcoming[0].title}</h3>
              <p className="subtext">{dateTimeText(upcoming[0].start)}</p>
              <p className="subtext">{upcoming[0].venue}</p>
            </div>
          </div> : <p className="subtext">No upcoming events.</p>}
        </Card>
        <Card>
          <div className="card-heading">
            <h2>Continue your draft</h2>{draft && <Badge>Draft</Badge>}
          </div>{draft ? <>
            <h3>{draft.title}</h3>
            <p className="subtext">Add the missing details and review before publishing.</p>
            <Link className="button primary" to={`/organizer/events/${draft.id}/edit`}>Continue draft</Link>
          </> : <Empty title="No draft events" action={<Link to="/organizer/events/new" className="button outline">Create event</Link>} />}
        </Card>
      </div>
    </div>
  </>
}
