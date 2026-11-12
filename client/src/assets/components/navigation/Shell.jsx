import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronRight, ClipboardList, Compass, FileText, Home, LogOut, Menu, Radio, Shield, User, Users, X, Plus, CheckCircle2, BookOpen, Award, Activity, CalendarClock } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import logo from '../../logo.svg';
import { canCreateEvent, canManageEvent } from '../../../functions/domain';

const coreLinks = [
  { to: '/events', label: 'Explore Events', icon: Compass },
  { to: '/my-events', label: 'My Events', icon: CalendarDays },
  { to: '/my-teams', label: 'My Teams', icon: Users, assignedOnly: true },
  { to: '/calendar', label: 'Calendar', icon: CalendarClock },
  { to: '/live', label: 'Live Now', icon: Radio },
  { to: '/history', label: 'Participation History', icon: BookOpen },
  { to: '/certificates', label: 'Certificates', icon: Award },
  { to: '/profile', label: 'My Profile', icon: User },
];
const organizerLinks = [
  { to: '/organizer', label: 'Organizer Dashboard', icon: Home, organizerOnly: true },
  { to: '/organizer/events/new', label: 'Create Event', icon: Plus, organizerOnly: true },
  { to: '/organizer/events', label: 'Managed Events', icon: CalendarDays },
  { to: '/organizer/registrations', label: 'Registrations', icon: ClipboardList },
];
const adminLinks = [
  { to: '/admin', label: 'Admin Dashboard', icon: Home },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/events', label: 'Event Oversight', icon: Shield },
  { to: '/admin/audit', label: 'Audit Log', icon: Activity },
];
export function Shell({ children }) {
  const { user, events, teams = [], logout, flash, setFlash } = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const admin = user?.roles?.includes('Admin');
  const organizer = canCreateEvent(user);
  const manageable = events.some(e => canManageEvent(e, user) || e.coOrganizers?.some(c => c.userId === user?.id));
  const teamAssigned = teams.some(t => t.memberIds.includes(user?.id) || t.managerId === user?.id || t.handlerIds.includes(user?.id));
  const core = coreLinks.filter(l => !l.assignedOnly || teamAssigned || organizer || admin);
  const sections = [{ label: 'YOUR ARENA', links: core }];
  if (organizer || manageable) sections.push({ label: 'ORGANIZER TOOLS', links: organizerLinks.filter(l => !l.organizerOnly || organizer) });
  if (admin) sections.push({ label: 'ADMINISTRATION', links: adminLinks });
  const initials = user?.name?.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase();
  const area = pathname.startsWith('/admin') ? 'Admin Console' : pathname.startsWith('/organizer') ? 'Organizer Workspace' : 'ViArena';
  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand">
        <Link to="/profile" aria-label="Open my profile" onClick={() => setOpen(false)}><img src={logo} alt="" /><strong>ViArena</strong></Link>
        <button className="icon-button sidebar-close" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button>
      </div>
      <div className="school">
        <small>SCHOOL WORKSPACE</small>
        <strong>Ateneo de Naga University</strong>
        <span>Naga City, Philippines</span>
      </div>
      <nav aria-label="Main navigation" className="sidebar-links">{sections.map(section => <div key={section.label}>
        <div className="nav-section-title">{section.label}
        </div>{section.links.map(({ to, label, icon: Icon }) => <NavLink key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          end={to === '/organizer' || to === '/admin' || to === '/events'}><Icon size={18} />{label}</NavLink>)}
      </div>)}
      </nav>
      <div className="sidebar-footer">
        <p className="motto">We are ONE.</p>
        <p>Your events, people, and next big moments.</p>
        <div className="sidebar-user">
          <Link to="/profile" className="avatar" aria-label="My profile">{initials}</Link>
          <div>
            <strong>{user?.name}</strong>
            <small>{admin ? 'Admin' : organizer ? 'Organizer' : 'Participant'}</small>
          </div>
          <button className="icon-button" aria-label="Sign out" onClick={() => {
            logout();
            navigate('/login')
          }}><LogOut size={18} /></button>
        </div>
      </div>
    </aside>{open && <button className="drawer-shade" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <div className="app-content">
      <header className="topbar">
        <button className="icon-button menu-toggle" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu /></button>
        <div className="topbar-title">
          <span>{area}</span>
          <ChevronRight size={15} />
          <strong>{pathname.split('/').filter(Boolean).slice(-1)[0]?.replaceAll('-', ' ') || 'Explore Events'}</strong>
        </div>
        <div className="topbar-right">
          <span className="timezone">Philippine Standard Time, UTC+8</span>
          <Link to="/profile" className="avatar" aria-label="My profile">{initials}</Link>
        </div>
      </header>
      <main className="content">{children}
      </main>
      <footer className="footer">ViArena / Ateneo de Naga University
        <span>Built for the moments we share.</span>
      </footer>
    </div>
    {flash && <div role="status" className={`toast ${flash.type === 'error' ? 'toast-error' : ''}`}>
      <CheckCircle2 size={18} />{flash.message}
      <button className="icon-button" aria-label="Dismiss notification" onClick={() => setFlash(null)}><X size={16} /></button>
    </div>}
  </div>;
}
