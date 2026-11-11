import React, { useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Eye, EyeOff, Filter, MapPin, Plus, Search, Shield, Ticket, Users, Upload, User, Edit3 } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { seedEvents, categories } from '../../../data/fixtures';
import { canCreateEvent, canViewPrivateEvent, registrationEligibility, validateEvent, validSchoolEmail } from '../../../functions/domain';
import { eventStatus, now } from '../../../functions/event';
import { Badge, Button, Card, Confirm, dateText, dateTimeText, Empty, ErrorState, Field, GuestShell, Loading, PageHeader, Shell, Stats, VisibilityStatus } from '../../../components';
import { Denied, NotFound } from '../../../app/guards';

export function OrganizerRegistrations() {
  const { events, canManageRegistrations, count } = useStore();
  const manageable = events.filter(e => canManageRegistrations(e));
  return <>
    <PageHeader eyebrow="ORGANIZER WORKSPACE" title="Registrations" description="Select an event to review its participant roster." />
    <Card>{manageable.length ? manageable.map(e => <div className="simple-row" key={e.id}>
      <div className="grow">
        <h3>{e.title}</h3>
        <p className="subtext">{count(e.id)} / {e.capacity} registered</p>
      </div>{VisibilityStatus(e)}
      <Link className="button primary" to={`/organizer/events/${e.id}/registrations`}>Manage registrations</Link>
    </div>) : <Empty title="No registration lists available" description="You need an event-owner or authorized co-organizer assignment." />}
    </Card>
  </>
}
