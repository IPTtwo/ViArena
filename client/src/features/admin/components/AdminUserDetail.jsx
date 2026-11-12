import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import { useStore } from '../../../state/StoreProvider';
import { Badge, Button, Card, Confirm, Empty, PageHeader, dateTimeText } from '../../../components';
import { useRoleActions } from '../hooks/useRoleActions';
import { RoleBadge } from './RoleBadge';

export function AdminUserDetail() {
  const { userId } = useParams();
  const { users, user, events, roleAudit } = useStore();
  const { pending, setPending, apply } = useRoleActions();

  const member = users.find((item) => item.id === userId);

  if (!member) {
    return (
      <div className="center-page">
        <h1>Page not found</h1>
        <Link to="/admin/users" className="button primary">
          User Management
        </Link>
      </div>
    );
  }

  const owned = events.filter((event) => event.ownerId === member.id);
  const history = roleAudit.filter((item) => item.targetId === member.id);
  const eligible = member.id !== user.id && !member.roles.includes('Admin');

  return (
    <>
      <PageHeader
        eyebrow="ADMIN CONSOLE"
        title={member.name}
        description="Account details and Organizer role assignment"
        action={
          <Link className="button outline" to="/admin/users">
            <ArrowLeft size={16} /> User Management
          </Link>
        }
      />

      <div className="management-grid">
        <Card>
          <div className="card-heading">
            <h2>Account information</h2>
            <RoleBadge member={member} />
          </div>

          <dl className="details-list">
            <div>
              <dt>School email</dt>
              <dd>{member.email}</dd>
            </div>
            <div>
              <dt>Student ID</dt>
              <dd>{member.studentId}</dd>
            </div>
            <div>
              <dt>Account</dt>
              <dd>Active</dd>
            </div>
            <div>
              <dt>Events owned</dt>
              <dd>{owned.length}</dd>
            </div>
          </dl>

          {eligible && (
            <div className="actions">
              <Button
                variant={member.roles.includes('Organizer') ? 'danger' : 'primary'}
                onClick={() => setPending({ member, enable: !member.roles.includes('Organizer') })}
              >
                {member.roles.includes('Organizer') ? 'Revoke Organizer' : 'Assign Organizer'}
              </Button>
            </div>
          )}
        </Card>

        <Card>
          <h2>Role change history</h2>
          {history.length ? (
            <div className="activity-list">
              {history.map((item) => (
                <div key={item.id} className="activity-item">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>{item.action}</strong>
                    <p>
                      By {item.actorName}, {dateTimeText(item.timestamp)}
                    </p>
                    <small>
                      {item.previousRoles.join(', ')} to {item.nextRoles.join(', ')}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="No role changes recorded"
              description="Future account changes will be recorded here."
            />
          )}
        </Card>
      </div>

      {owned.length > 0 && (
        <Card>
          <h2>Owned events</h2>
          {owned.map((event) => (
            <div className="simple-row" key={event.id}>
              <div className="grow">
                <h3>{event.title}</h3>
                <Badge tone={event.visibility === 'Published' ? 'success' : 'neutral'}>
                  {event.visibility}
                </Badge>
              </div>
              <Link to={`/events/${event.id}`} className="button outline">
                View event
              </Link>
            </div>
          ))}
        </Card>
      )}

      {pending && (
        <Confirm
          title={pending.enable ? 'Assign Organizer?' : 'Revoke Organizer?'}
          description={
            pending.enable
              ? `Grant ${member.name} Organizer permissions?`
              : `Revoke ${member.name}'s Organizer permissions? Owned events must be reassigned first.`
          }
          danger={!pending.enable}
          confirmLabel={pending.enable ? 'Assign Organizer' : 'Revoke Organizer'}
          onClose={() => setPending(null)}
          onConfirm={apply}
        />
      )}
    </>
  );
}
