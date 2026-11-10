import React from 'react';

import { Badge } from '../../../components';

export function RoleBadge({ member }) {
  const roles = member.roles.filter((role) => role !== 'Participant');

  return (
    <div className="tag-row">
      {roles.length ? (
        roles.map((role) => (
          <Badge key={role} tone={role === 'Admin' ? 'info' : 'success'}>
            {role}
          </Badge>
        ))
      ) : (
        <Badge>Participant</Badge>
      )}
    </div>
  );
}
