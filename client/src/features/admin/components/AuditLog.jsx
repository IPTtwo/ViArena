import React, { useState } from 'react';

import { useStore } from '../../../state/StoreProvider';
import { Badge, Card, Empty, PageHeader, dateTimeText } from '../../../components';

export function AuditLog() {
  const { auditLogs, roleAudit } = useStore();
  const [query, setQuery] = useState('');

  const items = [
    ...auditLogs,
    ...roleAudit.map((entry) => ({
      ...entry,
      details: entry.targetId,
      resourceId: entry.targetId,
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filtered = items.filter((entry) =>
    [entry.actorName, entry.action, entry.resourceId, entry.details].some((value) =>
      String(value || '')
        .toLowerCase()
        .includes(query.toLowerCase()),
    ),
  );

  return (
    <>
      <PageHeader
        eyebrow="ADMIN CONSOLE"
        title="Audit Log"
        description="Account role assignments, schedule changes, and event management history."
      />

      <Card>
        <div className="searchbox table-search">
          <input
            aria-label="Search audit log"
            value={query}
            placeholder="Search activities"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {filtered.map((item) => (
          <div className="simple-row" key={item.id}>
            <div className="grow">
              <h3>{item.action}</h3>
              <p>
                {item.actorName || 'System'}, {dateTimeText(item.timestamp)}
              </p>
              <p className="subtext">
                Resource: {item.resourceId}
                {item.details ? `, ${item.details}` : ''}
              </p>
            </div>
            <Badge tone="info">Recorded</Badge>
          </div>
        ))}

        {!filtered.length && (
          <Empty
            title="No matching activity"
            description="Role and event changes will appear here when performed."
          />
        )}
      </Card>
    </>
  );
}
