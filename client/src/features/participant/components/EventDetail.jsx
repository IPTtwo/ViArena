import React, { useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Eye, EyeOff, Filter, MapPin, Plus, Search, Shield, Ticket, Users, Upload, User, Edit3 } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { seedEvents, categories } from '../../../data/fixtures';
import { canCreateEvent, canViewPrivateEvent, registrationEligibility, validateEvent, validSchoolEmail } from '../../../functions/domain';
import { eventStatus, now } from '../../../functions/event';
import { Badge, Button, Card, Confirm, dateText, dateTimeText, Empty, ErrorState, Field, GuestShell, Loading, PageHeader, Shell, Stats, VisibilityStatus } from '../../../components';
import { Denied, NotFound } from '../../../app/guards';
import { BrowsingShell } from '../../../components';

export function EventDetail() {
  const { eventId } = useParams();
  const { events, user, count, isRegistered } = useStore();
  const e = events.find(x => x.id === eventId);
  if (!e || !canViewPrivateEvent(e, user)) return <NotFound />;
  const eligibility = registrationEligibility(e, count(e.id), isRegistered(e.id));
  const joined = isRegistered(e.id);
  return <>
    <div className="public-content">
      <Link to="/events" className="back-link"><ArrowLeft size={16} /> All events</Link>
      <div className="detail-grid">
        <div>
          <div className="detail-cover">{e.cover ? <img src={e.cover} alt="Event cover" /> : <>
            <span className="eyebrow light">{e.category.toUpperCase()}</span>
            <span>ViArena</span>
          </>}
          </div>
          <Card>
            <div className="tag-row">{VisibilityStatus(e)}
              <Badge tone={eligibility.code === 'open' ? 'success' : eligibility.code === 'full' ? 'warning' : 'neutral'}>{eligibility.code === 'open' ? 'Registration Open' : eligibility.code === 'full' ? 'Full' : eligibility.code === 'registered' ? 'Registered' : 'Registration Closed'}
              </Badge>
            </div>
            <h1 className="detail-title">{e.title}</h1>
            <p className="subtext">{e.description || 'Details will be announced soon.'}</p>
            <hr />
            <div className="detail-facts">
              <div>
                <CalendarDays size={18} />
                <span><strong>Date and time</strong>{dateTimeText(e.start)} to {dateTimeText(e.end)}</span>
              </div>
              <div>
                <MapPin size={18} />
                <span><strong>Venue</strong>{e.venue || 'To be announced'}</span>
              </div>
              <div>
                <Clock3 size={18} />
                <span><strong>Registration deadline</strong>{dateTimeText(e.deadline)}</span>
              </div>
              <div>
                <Users size={18} />
                <span><strong>Capacity</strong>{count(e.id)} of {e.capacity} registered</span>
              </div>
            </div>{e.eligibility && <>
              <hr />
              <h3>Eligibility</h3>
              <p>{e.eligibility}</p>
            </>}
          </Card>
        </div>
        <Card className="sticky-side">
          <h2>Your registration</h2>
          <p className="subtext">{eligibility.reason}</p>
          <div className="capacity-meter">
            <div style={{ width: `${Math.min(100, 100 * count(e.id) / Math.max(1, e.capacity))}%` }} />
          </div>
          <p className="capacity-label">{Math.max(0, e.capacity - count(e.id))} spots remaining</p>{joined ? <>
            <Badge tone="success">Registered</Badge>
            <Link className="button outline full-width" to="/my-events">Manage registration</Link>
          </> : eligibility.allowed ? <Link className="button primary full-width"
            to={user ? `/events/${e.id}/register` : '/login'}
            state={user ? undefined : { from: `/events/${e.id}/register` }}>{user ? 'Register for this event' : 'Sign in to register'}</Link> : <Button disabled className="full-width">{eligibility.code === 'full' ? 'Event Full' : eligibility.code === 'ended' ? 'Event Started or Ended' : eligibility.code === 'closed' ? 'Registration Closed' : 'Registration Unavailable'}
          </Button>}{e.visibility === 'Draft' && <Badge>Draft</Badge>}{e.stream?.url && <Link className="button outline full-width" to={`/events/${e.id}/watch`}>Watch event stream</Link>}
          <hr />
          <h3>About this event</h3>
          <p className="subtext">{e.category}: Ateneo de Naga University</p>
        </Card>
      </div>
    </div>
  </>
}
