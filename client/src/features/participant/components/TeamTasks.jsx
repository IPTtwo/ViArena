import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useStore } from '../../../state/StoreProvider';
import { Badge, Button, Card, Empty, Field, PageHeader, dateTimeText } from '../../../components';
import { StatusBadge } from '../../../components';
export function TeamTasks() {
  const { eventId, teamId } = useParams();
  const { teams, users, events, user, tasks, canManageTeams, saveTask, updateTaskStatus, notify } =
    useStore();
  const team = teams.find((t) => t.id === teamId && t.eventId === eventId);
  const event = events.find((e) => e.id === eventId);
  const allowed = team && (team.memberIds.includes(user.id) || canManageTeams(event));
  const editor = team && (team.managerId === user.id || canManageTeams(event));
  const [form, setForm] = useState({ title: '', description: '', assigneeId: '', due: '' });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  if (!allowed)
    return (
      <Card>
        <Empty title="Team unavailable" description="This team is not assigned to your account." />
      </Card>
    );
  const submit = (e) => {
    e.preventDefault();
    try {
      saveTask(team.id, form);
      setForm({ title: '', description: '', assigneeId: '', due: '' });
      setError('');
      setOpen(false);
      notify('Task assigned.');
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="TEAM TASKS"
        title={team.name}
        description="Assignments and deadlines for this event team."
        action={
          editor ? (
            <Button onClick={() => setOpen((v) => !v)}>
              <Plus size={16} /> Create task
            </Button>
          ) : null
        }
      />
      {open && editor && (
        <Card>
          <h2>New task</h2>
          <form className="stack-form" onSubmit={submit}>
            <Field label="Task name">
              <input
                value={form.title}
                onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
                required
              />
            </Field>
            <Field label="Description">
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
              />
            </Field>
            <Field label="Assign to">
              <select
                value={form.assigneeId}
                onChange={(e) => setForm((v) => ({ ...v, assigneeId: e.target.value }))}
                required
              >
                <option value="">Select team member</option>
                {team.memberIds
                  .map((id) => users.find((u) => u.id === id))
                  .filter(Boolean)
                  .map((member) => (
                    <option value={member.id} key={member.id}>
                      {member.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Due date">
              <input
                type="datetime-local"
                value={form.due}
                onChange={(e) => setForm((v) => ({ ...v, due: e.target.value }))}
                required
              />
            </Field>
            {error && (
              <p className="form-alert" role="alert">
                {error}
              </p>
            )}
            <div className="actions">
              <Button type="submit">Assign task</Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Card>
        <div className="card-heading">
          <h2>Assignments</h2>
          <Badge>{tasks.filter((t) => t.teamId === teamId).length} tasks</Badge>
        </div>
        {tasks
          .filter((t) => t.teamId === teamId)
          .map((task) => (
            <div className="simple-row" key={task.id}>
              <div className="grow">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>
                  Assigned to {users.find((u) => u.id === task.assigneeId)?.name || 'Unknown'}, Due{' '}
                  {dateTimeText(task.due)}
                </p>
              </div>
              <StatusBadge status={task.status} />
              {(task.assigneeId === user.id || editor) && (
                <select
                  aria-label={`Status of ${task.title}`}
                  value={task.status}
                  onChange={(e) => {
                    try {
                      updateTaskStatus(task.id, e.target.value);
                      notify('Task updated.');
                    } catch (err) {
                      notify(err.message, 'error');
                    }
                  }}
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              )}
            </div>
          ))}
        {!tasks.some((t) => t.teamId === teamId) && (
          <Empty
            title="No tasks assigned"
            description="Team tasks will appear here when a manager creates them."
          />
        )}
      </Card>
    </>
  );
}
