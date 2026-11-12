import React from 'react';
import { Badge } from './Badge';
export function VisibilityStatus(e) {
  return <Badge tone={e.visibility === 'Published' ? 'success' : 'neutral'}>{e.visibility}</Badge>;
}
