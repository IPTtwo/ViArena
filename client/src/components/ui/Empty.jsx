import React from 'react';
import { FileText } from 'lucide-react';
export function Empty({
  title = 'No results found',
  description = 'Try adjusting your search or filters.',
  action,
}) {
  return (
    <div className="empty">
      <FileText size={32} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
