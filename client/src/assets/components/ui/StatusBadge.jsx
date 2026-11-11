import React from 'react';
import { Badge } from './Badge';
const tones = { Draft: 'neutral', Published: 'success', Full: 'warning', Live: 'danger', Scheduled: 'info', Ended: 'neutral', Registered: 'success', Canceled: 'danger', Assigned: 'info', Removed: 'neutral', 'To Do': 'neutral', 'In Progress': 'info', Done: 'success', Overdue: 'danger', Eligible: 'success', Ineligible: 'neutral' };
export function StatusBadge({ status }) {
  return <Badge tone={tones[status] || 'neutral'}>{status}
  </Badge>
}
