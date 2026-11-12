import React from 'react';
import { LoaderCircle } from 'lucide-react';

export function Loading({ label = 'Loading...' }) {
  return <div className="loading-state" role="status" aria-live="polite" aria-busy="true">
    <LoaderCircle className="loading-spinner" size={24} aria-hidden="true" />
    <span>{label}</span>
  </div>;
}
