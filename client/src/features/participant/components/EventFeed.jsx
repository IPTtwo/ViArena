import { JoinEventCode } from '../../../components/events/JoinEventCode';
import React, { useMemo, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Eye, EyeOff, Filter, MapPin, Plus, Search, Shield, Ticket, Users, Upload, User, Edit3 } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { seedEvents, categories } from '../../../data/fixtures';
import { canCreateEvent, canViewPrivateEvent, registrationEligibility, validateEvent, validSchoolEmail } from '../../../functions/domain';
import { eventStatus, now } from '../../../functions/event';
import { Badge, Button, Card, Confirm, dateText, dateTimeText, Empty, ErrorState, Field, GuestShell, Loading, PageHeader, Shell, Stats, VisibilityStatus } from '../../../components';
import { Denied, NotFound } from '../../../app/guards';
import { EventCard } from './EventCard';
import { BrowsingShell } from '../../../components';

export function EventFeed() {
  const { events } = useStore();
  const [search, setSearch] = useState(''), [category, setCategory] = useState('All categories'), [status, setStatus] = useState('All statuses'), [limit, setLimit] = useState(6);
  const published = events.filter(e => e.visibility === 'Published');
  const { count } = useStore();
  const filtered = published.filter(e => [e.title, e.description, e.venue].join(' ').toLowerCase().includes(search.trim().toLowerCase()) && (category === 'All categories' || e.category === category) && (status === 'All statuses' || (status === 'Open' && eventStatus(e, count(e.id)).text === 'Registration Open') || (status === 'Closed' && eventStatus(e, count(e.id)).text !== 'Registration Open')));
  return <BrowsingShell>
    <div className="public-content">
      <PageHeader eyebrow="EVENTS SPOTLIGHT"
        title="Explore events"
        description="Discover tournaments, campus activities, and community events." />
      <JoinEventCode />
      <Card className="filter-card">
        <div className="searchbox">
          <Search size={19} />
          <input aria-label="Search events"
            placeholder="Search events, venues, or activities"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setLimit(6)
            }} />
        </div>
        <select aria-label="Filter by category" value={category} onChange={e => {
          setCategory(e.target.value);
          setLimit(6)
        }}>{categories.map(c => <option key={c}>{c}</option>)}</select>
        <select aria-label="Filter by registration status" value={status} onChange={e => {
          setStatus(e.target.value);
          setLimit(6)
        }}><option>All statuses</option><option>Open</option><option>Closed</option></select>
      </Card>
      <div className="results-info">
        <span>{filtered.length} {filtered.length === 1 ? 'event' : 'events'} found</span>{(search || category !== 'All categories' || status !== 'All statuses') && <button className="text-button" onClick={() => {
          setSearch('');
          setCategory('All categories');
          setStatus('All statuses')
        }}>Clear filters</button>}
      </div>{filtered.length ? <>
        <div className="event-grid">{filtered.slice(0, limit).map(e => <EventCard key={e.id} event={e} />)}
        </div>{limit < filtered.length && <div className="load-more">
          <Button variant="outline" onClick={() => setLimit(v => v + 6)}>Load more events</Button>
        </div>}
      </> : <Empty title="No matching events" description="Try a different search or category." />}
    </div>
  </BrowsingShell>
}
