import React from 'react';
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="subtext">{description}</p>}
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  );
}
