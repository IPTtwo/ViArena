import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

import { useStore } from '../../../state/StoreProvider';
import { filterMembers } from '../../../functions/domain';
import { Button, Card, Confirm, Empty, PageHeader } from '../../../components';
import { useRoleActions } from '../hooks/useRoleActions';
import { RoleBadge } from './RoleBadge';

export function AdminUsers() {
  const { users, user, events } = useStore();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All');
  const { pending, setPending, apply } = useRoleActions();

  const filtered = useMemo(() => filterMembers(users, query, role), [users, query, role]);

  return (
    <>
      <PageHeader
        eyebrow="ADMIN CONSOLE"
        title="User Management"
        description="View campus accounts and manage Organizer permissions."
      />

      <Card>
        <div className="management-tools">
          <div className="searchbox">
            <Search size={18} />
            <input
              placeholder="Search members"
              value={query}
              aria-label="Search members"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <select
            aria-label="Filter account role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option>All</option>
            <option>Participant</option>
            <option>Organizer</option>
            <option>Admin</option>
          </select>
        </div>

        {filtered.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Student ID</th>
                  <th>Account role</th>
                  <th>Managed events</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <strong>{member.name}</strong>
                      <small>{member.email}</small>
                    </td>
                    <td>{member.studentId}</td>
                    <td>
                      <RoleBadge member={member} />
                    </td>
                    <td>{events.filter((event) => event.ownerId === member.id).length}</td>
                    <td>
                      <div className="table-actions">
                        <Link className="button outline" to={`/admin/users/${member.id}`}>
                          View user
                        </Link>
                        {member.id !== user.id && !member.roles.includes('Admin') && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              setPending({ member, enable: !member.roles.includes('Organizer') })
                            }
                          >
                            {member.roles.includes('Organizer') ? 'Revoke Organizer' : 'Assign Organizer'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No matching members" description="Try another name, account role, or student ID." />
        )}
      </Card>

      {pending && (
        <Confirm
          title={pending.enable ? 'Assign Organizer?' : 'Revoke Organizer?'}
          description={`${pending.member.name}: ${
            pending.enable
              ? 'Grant event creation and ownership privileges.'
              : 'Remove account-level Organizer permissions. Owned events must be reassigned before revocation.'
          }`}
          confirmLabel={pending.enable ? 'Assign Organizer' : 'Revoke Organizer'}
          danger={!pending.enable}
          onClose={() => setPending(null)}
          onConfirm={apply}
        />
      )}
    </>
  );
}
