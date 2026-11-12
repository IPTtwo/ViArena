import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Require, RequireOrganizerWorkspace, Denied, NotFound } from './guards';
import { BrowsingShell, Shell } from '../components';
import { Landing } from '../features/auth/components/Landing';
import { Auth } from '../features/auth/components/Auth';
import { EventFeed } from '../features/participant/components/EventFeed';
import { EventDetail } from '../features/participant/components/EventDetail';
import { RegistrationRedirect } from '../features/participant/components/RegistrationRedirect';
import { MyEvents } from '../features/participant/components/MyEvents';
import { Profile } from '../features/participant/components/Profile';
import { MyTeams } from '../features/participant/components/MyTeams';
import { TeamDetail } from '../features/participant/components/TeamDetail';
import { TeamTasks } from '../features/participant/components/TeamTasks';
import { CalendarView } from '../features/participant/components/CalendarView';
import { History } from '../features/participant/components/History';
import { Certificates } from '../features/participant/components/Certificates';
import { LiveNow } from '../features/organizer/components/LiveNow';
import { WatchEvent } from '../features/organizer/components/WatchEvent';
import { OrganizerDashboard } from '../features/organizer/components/OrganizerDashboard';
import { OrganizerEvents } from '../features/organizer/components/OrganizerEvents';
import { OrganizerRegistrations } from '../features/organizer/components/OrganizerRegistrations';
import { EventEditor } from '../features/organizer/components/EventEditor';
import { RegistrationManager } from '../features/organizer/components/RegistrationManager';
import { EventTeams } from '../features/organizer/components/EventTeams';
import { TeamRoleAssignment } from '../features/organizer/components/TeamRoleAssignment';
import { ScheduleEditor } from '../features/organizer/components/ScheduleEditor';
import { StreamSettings } from '../features/organizer/components/StreamSettings';
import { ParticipationManager } from '../features/organizer/components/ParticipationManager';
import { CoOrganizerManagement } from '../features/organizer/components/CoOrganizerManagement';
import { AdminDashboard } from '../features/admin/components/AdminDashboard';
import { AdminEvents } from '../features/admin/components/AdminEvents';
import { AdminUsers } from '../features/admin/components/AdminUsers';
import { AdminUserDetail } from '../features/admin/components/AdminUserDetail';
import { AuditLog } from '../features/admin/components/AuditLog';

function AppLayout() {
  return <Shell><Outlet /></Shell>;
}

function BrowsingLayout() {
  return <BrowsingShell><Outlet /></BrowsingShell>;
}

export function AppRoutes() {
  return <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Auth mode="login" />} />
    <Route path="/signup" element={<Auth mode="signup" />} />
    <Route path="/forgot-password" element={<Auth mode="forgot" />} />
    <Route path="/reset-password" element={<Auth mode="reset" />} />
    <Route path="/dashboard" element={<Navigate to="/events" replace />} />

    <Route element={<BrowsingLayout />}>
      <Route path="/events" element={<EventFeed />} />
      <Route path="/events/:eventId" element={<EventDetail />} />
      <Route path="/live" element={<LiveNow />} />
      <Route path="/events/:eventId/watch" element={<WatchEvent />} />
    </Route>

    <Route element={<Require><AppLayout /></Require>}>
      <Route path="/events/:eventId/register" element={<RegistrationRedirect />} />
      <Route path="/my-events" element={<MyEvents />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/edit" element={<Profile edit />} />
      <Route path="/my-teams" element={<MyTeams />} />
      <Route path="/events/:eventId/teams/:teamId" element={<TeamDetail />} />
      <Route path="/events/:eventId/teams/:teamId/tasks" element={<TeamTasks />} />
      <Route path="/calendar" element={<CalendarView />} />
      <Route path="/history" element={<History />} />
      <Route path="/certificates" element={<Certificates />} />
      <Route path="/organizer" element={<Require role="Organizer"><OrganizerDashboard /></Require>} />
      <Route path="/organizer/events" element={<RequireOrganizerWorkspace><OrganizerEvents /></RequireOrganizerWorkspace>} />
      <Route path="/organizer/registrations" element={<RequireOrganizerWorkspace><OrganizerRegistrations /></RequireOrganizerWorkspace>} />
      <Route path="/organizer/events/new" element={<Require role="Organizer"><EventEditor /></Require>} />
      <Route path="/organizer/events/:eventId/edit" element={<RequireOrganizerWorkspace><EventEditor /></RequireOrganizerWorkspace>} />
      <Route path="/organizer/events/:eventId/registrations" element={<RequireOrganizerWorkspace><RegistrationManager /></RequireOrganizerWorkspace>} />
      <Route path="/organizer/events/:eventId/teams" element={<RequireOrganizerWorkspace><EventTeams /></RequireOrganizerWorkspace>} />
      <Route path="/organizer/events/:eventId/teams/:teamId/roles" element={<RequireOrganizerWorkspace><TeamRoleAssignment /></RequireOrganizerWorkspace>} />
      <Route path="/organizer/events/:eventId/schedule" element={<RequireOrganizerWorkspace><ScheduleEditor /></RequireOrganizerWorkspace>} />
      <Route path="/organizer/events/:eventId/stream" element={<RequireOrganizerWorkspace><StreamSettings /></RequireOrganizerWorkspace>} />
      <Route path="/organizer/events/:eventId/participation" element={<RequireOrganizerWorkspace><ParticipationManager /></RequireOrganizerWorkspace>} />
      <Route path="/organizer/events/:eventId/staff" element={<RequireOrganizerWorkspace><CoOrganizerManagement /></RequireOrganizerWorkspace>} />
      <Route path="/admin" element={<Require role="Admin"><AdminDashboard /></Require>} />
      <Route path="/admin/users" element={<Require role="Admin"><AdminUsers /></Require>} />
      <Route path="/admin/users/:userId" element={<Require role="Admin"><AdminUserDetail /></Require>} />
      <Route path="/admin/events" element={<Require role="Admin"><AdminEvents /></Require>} />
      <Route path="/admin/audit" element={<Require role="Admin"><AuditLog /></Require>} />
      <Route path="/403" element={<Denied />} />
    </Route>
    <Route path="/access" element={<Denied />} />
    <Route path="/admin/requests" element={<Denied />} />
    <Route path="/organizer/create" element={<Navigate to="/organizer/events/new" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>;
}
