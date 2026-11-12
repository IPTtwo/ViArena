import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { useStore } from '../../../state/StoreProvider';
import { Badge, Card, PageHeader, Stats } from '../../../components';
import { now } from '../../../functions/event';

export function AdminDashboard() {
  const { users, events, roleAudit } = useStore();

  const organizerCount = users.filter((user) => user.roles.includes('Organizer')).length;
  const activeEventCount = events.filter(
    (event) => event.visibility === 'Published' && new Date(event.end) > now(),
  ).length;

  const roleDistribution = [
    ['Participants', users.length],
    ['Event Organizers', organizerCount],
    ['Admins', users.filter((user) => user.roles.includes('Admin')).length],
  ];

  return (
    <>
      <PageHeader
        eyebrow="ADMIN CONSOLE"
        title="Dashboard"
        description="School-wide overview for Ateneo de Naga University."
      />

      <Stats
        items={[
          ['TOTAL USERS', users.length, 'Registered accounts'],
          ['ORGANIZERS', organizerCount, 'Account-level organizer grants'],
          ['ACTIVE EVENTS', activeEventCount, 'Upcoming or ongoing'],
          ['ROLE CHANGES', roleAudit.length, 'Recorded role updates'],
        ]}
      />

      <div className="dashboard-grid">
        <Card>
          <div className="card-heading">
            <h2>User management</h2>
            <Link to="/admin/users">
              View all users <ChevronRight size={16} />
            </Link>
          </div>

          {users.slice(0, 5).map((user) => {
            const initials = user.name
              .split(' ')
              .slice(0, 2)
              .map((part) => part[0])
              .join('');

            const badgeLabel = user.roles.includes('Admin')
              ? 'Admin'
              : user.roles.includes('Organizer')
                ? 'Organizer'
                : 'Participant';

            return (
              <div className="simple-row" key={user.id}>
                <span className="avatar">{initials}</span>
                <div className="grow">
                  <strong>{user.name}</strong>
                  <p className="subtext">{user.email}</p>
                </div>
                <Badge
                  tone={
                    user.roles.includes('Admin')
                      ? 'info'
                      : user.roles.includes('Organizer')
                        ? 'success'
                        : 'neutral'
                  }
                >
                  {badgeLabel}
                </Badge>
              </div>
            );
          })}

          <Link className="button outline" to="/admin/users">
            Open User Management
          </Link>
        </Card>

        <div className="dashboard-stack">
          <Card>
            <h2>Role distribution</h2>
            {roleDistribution.map(([label, count]) => (
              <div className="metric-line" key={label}>
                <span>{label}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </Card>

          <Card>
            <h2>Event oversight</h2>
            <p className="subtext">
              Inspect campus events and manage authorized organizer accounts.
            </p>
            <Link className="button primary" to="/admin/events">
              View events
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}
