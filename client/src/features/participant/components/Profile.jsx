import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit3 } from 'lucide-react';

import { useStore } from '../../../state/StoreProvider';
import { Badge, Button, Card, Field, PageHeader } from '../../../components';

export function Profile({ edit = false }) {
  const { user, editProfile, notify } = useStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user.name,
    bio: user.bio || '',
    studentId: user.studentId || '',
    avatar: user.avatar || '',
  });
  const [error, setError] = useState('');

  const save = (event) => {
    event.preventDefault();

    if (form.name.trim().length < 2) {
      return setError('Enter your full name.');
    }

    if (!form.studentId.trim()) {
      return setError('Student ID is required.');
    }

    try {
      editProfile(form);
      notify('Profile updated.');
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Unable to update profile.');
    }
  };

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

  return (
    <>
      <PageHeader
        eyebrow="ACCOUNT"
        title={edit ? 'Edit Profile' : 'My Profile'}
        description={
          edit
            ? 'Keep your personal details up to date.'
            : 'Your campus identity and account information.'
        }
        action={
          !edit && (
            <Link className="button primary" to="/profile/edit">
              <Edit3 size={16} />
              Edit Profile
            </Link>
          )
        }
      />

      <Card className="profile-card">
        <div className="profile-head">
          <div className="profile-avatar">
            {form.avatar ? <img src={form.avatar} alt="Profile avatar" /> : initials}
          </div>

          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <div className="tag-row">
              {user.roles.map((role) => (
                <Badge
                  key={role}
                  tone={role === 'Admin' ? 'info' : role === 'Organizer' ? 'success' : 'neutral'}
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {edit ? (
          <form onSubmit={save} className="stack-form profile-form">
            <Field label="Full name">
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </Field>

            <Field label="School email" hint="Email changes are managed by campus administration.">
              <input value={user.email} readOnly />
            </Field>

            <Field label="Student ID">
              <input
                value={form.studentId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, studentId: event.target.value }))
                }
              />
            </Field>

            <Field label="About me">
              <textarea
                rows={4}
                value={form.bio}
                onChange={(event) =>
                  setForm((current) => ({ ...current, bio: event.target.value }))
                }
              />
            </Field>

            <Field label="Profile photo" hint="Choose an image smaller than 1 MB.">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;

                  if (file.size > 1024 * 1024) {
                    return setError('Image must be smaller than 1 MB.');
                  }

                  const reader = new FileReader();
                  reader.onload = () =>
                    setForm((current) => ({ ...current, avatar: String(reader.result) }));
                  reader.readAsDataURL(file);
                }}
              />
            </Field>

            {error && (
              <p className="form-alert" role="alert">
                {error}
              </p>
            )}

            <div className="actions">
              <Link className="button outline" to="/profile">
                Cancel
              </Link>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div>
              <small>Full name</small>
              <strong>{user.name}</strong>
            </div>
            <div>
              <small>School email</small>
              <strong>{user.email}</strong>
            </div>
            <div>
              <small>Student ID</small>
              <strong>{user.studentId}</strong>
            </div>
            <div>
              <small>About me</small>
              <strong>{user.bio || 'No bio added yet.'}</strong>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
