import React, { useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Eye, EyeOff, Filter, MapPin, Plus, Search, Shield, Ticket, Users, Upload, User, Edit3 } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { seedEvents, categories } from '../../../data/fixtures';
import { canCreateEvent, canViewPrivateEvent, registrationEligibility, validateEvent, validSchoolEmail } from '../../../functions/domain';
import { eventStatus, now } from '../../../functions/event';
import { Badge, Button, Card, Confirm, dateText, dateTimeText, Empty, ErrorState, Field, GuestShell, Loading, PageHeader, Shell, Stats, VisibilityStatus } from '../../../components';
import { Denied, NotFound } from '../../../app/guards';

export function LiveNow() {
  const { events } = useStore();
  const streams = events.filter(e => e.visibility === 'Published' && e.stream?.status === 'Live');
  return <>
    <PageHeader eyebrow="WATCH TOGETHER" title="Live Now" description="Watch ongoing campus events and broadcasts." />{streams.length ? <div className="event-grid">{streams.map(e => <Card key={e.id}>
      <Badge tone="danger">Live</Badge>
      <h2>{e.title}</h2>
      <p className="subtext">{e.venue}</p>
      <Link to={`/events/${e.id}/watch`} className="button primary">Watch event</Link>
    </Card>)}
    </div> : <Card>
      <Empty title="No events are live right now"
        description="Browse published events to see upcoming competitions."
        action={<Link className="button outline" to="/events">Explore Events</Link>} />
    </Card>}
  </>
}
