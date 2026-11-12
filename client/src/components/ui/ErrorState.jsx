import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="empty" role="alert">
      <AlertCircle size={32} />
      <h3>Unable to load content</h3>
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
    </div>
  );
}
