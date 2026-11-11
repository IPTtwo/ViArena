import React from 'react';
import { Card } from './Card';
export function Stats({ items }) {
  return <div className="stats-grid">{items.map(([label, value, info]) => <Card key={label} className="stat-card">
    <div className="stat-label">{label}
    </div>
    <strong>{value}</strong>
    <p>{info}</p>
  </Card>)}
  </div>
}