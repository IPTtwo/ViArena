import { OrganizerEventLinks } from '../../../components/events/OrganizerEventLinks';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { canCreateEvent } from '../../../functions/domain';
import { Card, dateTimeText, Empty, PageHeader, VisibilityStatus } from '../../../components';

export function OrganizerEvents() {
  const { events, user, canManageEvent, canManageRegistrations, count } = useStore();
  const [tab, setTab] = useState('All'), [search, setSearch] = useState('');
  const mine = events.filter(e => canManageEvent(e) || canManageRegistrations(e) || e.coOrganizers?.some(c => c.userId === user?.id && c.permissions?.length)).filter(e => (tab === 'All' || e.visibility === tab) && e.title.toLowerCase().includes(search.toLowerCase()));
  return <>
    <PageHeader eyebrow="Organizer"
      title="Manage campus events"
      description="Create, publish, and coordinate the events you own."
      action={canCreateEvent(user) ? <Link className="button primary" to="/organizer/events/new"><Plus size={18} /> Create event</Link> : null} />
    <div className="tabs" aria-label="Filter events">{['All', 'Published', 'Draft'].map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
    </div>
    <Card>
      <div className="managed-events-heading">
        <div className="searchbox table-search">
        <Search size={18} />
          <input placeholder="Search events" aria-label="Search events" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <p className="managed-events-count" aria-live="polite">{mine.length} {mine.length === 1 ? 'event' : 'events'}</p>
      </div>{mine.length ? mine.map(e => <div className="simple-row managed-event-row" key={e.id}>
        <div className="grow">
          <h3>{e.title}</h3>
          <p><time dateTime={e.start}>{dateTimeText(e.start)}</time><span aria-hidden="true"> · </span>{count(e.id)} registrations</p>
        </div>{VisibilityStatus(e)}
        <div className="actions managed-event-actions"><OrganizerEventLinks event={e} />
        </div>
      </div>) : <Empty title="No managed events found" />}
    </Card>
  </>
}
