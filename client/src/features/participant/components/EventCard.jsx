import React, { useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Eye, EyeOff, Filter, MapPin, Plus, Search, Shield, Ticket, Users, Upload, User, Edit3 } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { seedEvents, categories } from '../../../data/fixtures';
import { canCreateEvent, canViewPrivateEvent, registrationEligibility, validateEvent, validSchoolEmail } from '../../../functions/domain';
import { eventStatus, now } from '../../../functions/event';
import { Badge, Button, Card, Confirm, dateText, dateTimeText, Empty, ErrorState, Field, GuestShell, Loading, PageHeader, Shell, Stats, VisibilityStatus } from '../../../components';
import { Denied, NotFound } from '../../../app/guards';

export function EventCard({ event }) {
  const { count } = useStore();
  const status = eventStatus(event, count(event.id));
  return <Card className="event-card">
    <div className="event-cover">{event.cover ? <img src={event.cover} alt="" /> : <>
      <span className="cover-motif">{event.category === 'Esports' ? 'ESPORTS' : event.category.toUpperCase()}</span>
      <span className="cover-symbol">V</span>
    </>}
    </div>
    <div className="event-card-body">
      <div className="tag-row">
        <Badge tone={status.tone}>{status.text}
        </Badge>
        <Badge tone="info">{event.category}
        </Badge>
      </div>
      <h2><Link to={`/events/${event.id}`}>{event.title}</Link></h2>
      <p className="event-meta"><CalendarDays size={16} />{dateTimeText(event.start)}</p>
      <p className="event-meta"><MapPin size={16} />{event.venue}</p>
      <div className="event-bottom">
        <span>{count(event.id)} / {event.capacity} registered</span>
        <Link className="button outline" to={`/events/${event.id}`}>View event <ArrowRight size={15} /></Link>
      </div>
    </div>
  </Card>
}