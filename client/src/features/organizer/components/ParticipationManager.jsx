import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../../state/StoreProvider';
import { Badge, Button, Card, Confirm, Empty, PageHeader } from '../../../components';
export function ParticipationManager() {
  const { eventId } = useParams();
  const {
    events,
    users,
    registrations,
    attendance,
    canManageParticipation,
    confirmParticipation,
    notify,
  } = useStore();
  const event = events.find((e) => e.id === eventId);
  const [pending, setPending] = useState(null);
  if (!event || !canManageParticipation(event))
    return (
      <Card>
        <Empty title="Participation management unavailable" />
      </Card>
    );
  const records = registrations
    .filter((r) => r.eventId === eventId && r.status === 'Registered')
    .map((r) => ({
      member: users.find((u) => u.id === r.userId),
      verified: attendance.some(
        (a) => a.eventId === eventId && a.userId === r.userId && a.verified,
      ),
    }))
    .filter((r) => r.member);
  return (
    <>
      <PageHeader
        eyebrow="PARTICIPATION VERIFICATION"
        title={event.title}
        description="Confirm completed participation before certificates become available."
      />
      <Card>
        <div className="card-heading">
          <h2>Registered participants</h2>
          <Badge tone="success">{records.filter((r) => r.verified).length} verified</Badge>
        </div>
        {records.map(({ member, verified }) => (
          <div className="simple-row" key={member.id}>
            <div className="grow">
              <h3>{member.name}</h3>
              <p>{member.studentId}</p>
            </div>
            <Badge tone={verified ? 'success' : 'neutral'}>
              {verified ? 'Verified' : 'Not verified'}
            </Badge>
            <Button
              variant="outline"
              onClick={() => setPending({ userId: member.id, verified: !verified })}
            >
              {verified ? 'Remove verification' : 'Confirm participation'}
            </Button>
          </div>
        ))}
        {!records.length && (
          <Empty
            title="No registrations"
            description="Participants will appear after they register."
          />
        )}
      </Card>
      {pending && (
        <Confirm
          title="Confirm participation update"
          description="The participant's certificate eligibility will be updated."
          confirmLabel="Confirm"
          onClose={() => setPending(null)}
          onConfirm={() => {
            try {
              confirmParticipation(eventId, pending.userId, pending.verified);
              notify('Participation record updated.');
            } catch (err) {
              notify(err.message, 'error');
            }
            setPending(null);
          }}
        />
      )}
    </>
  );
}
