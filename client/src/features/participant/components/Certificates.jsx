import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Check, Clock, Plus, Users, Video, Download, Play, MapPin, ExternalLink } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { Badge, Button, Card, Confirm, Empty, Field, PageHeader, dateText, dateTimeText } from '../../../components';
import { canManageEvent } from '../../../functions/domain';
import { certificateSvg } from '../../../functions/certificates';
export function Certificates() {
  const { user, events, attendance } = useStore();
  const eligible = attendance.filter(a => a.userId === user.id && a.verified).map(a => ({ record: a, event: events.find(e => e.id === a.eventId) })).filter(x => x.event);
  const download = (event, record) => {
    const svg = certificateSvg(user, event, record.verifiedAt);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ViArena-Certificate-${event.id}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url)
  };
  return <>
    <PageHeader eyebrow="ACHIEVEMENTS" title="Certificates" description="Download certificates for verified event participation." />{eligible.length ? <div className="event-grid">{eligible.map(({ record, event }) => <Card key={record.id}>
      <Badge tone="success">Available</Badge>
      <h2>{event.title}</h2>
      <p>Verified {dateText(record.verifiedAt)}</p>
      <Button onClick={() => download(event, record)}>
        <Download size={16} /> Download Certificate
      </Button>
    </Card>)}
    </div> : <Card>
      <Empty title="No certificates available" description="Certificates will appear after authorized event staff confirm your participation." />
    </Card>}
  </>
}
