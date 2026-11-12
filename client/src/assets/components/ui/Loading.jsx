import React from 'react';

export function Loading({ label = 'Loading...' }) {
  return <div className="empty" role="status" aria-live="polite">{label}</div>;
}
