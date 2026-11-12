import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

import { useStore } from '../../../state/StoreProvider';
import { validSchoolEmail } from '../../../functions/domain';
import { Button, Card, Field } from '../../../components';

export function Auth({ mode }) {
  const { login, signup, notify, user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
    setError('');
  };

  const returnTo =
    location.state?.from?.startsWith('/') && !location.state.from.startsWith('//')
      ? location.state.from
      : '/events';

  if (user && mode !== 'reset') {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const nextErrors = {};

    if (!validSchoolEmail(form.email) && mode !== 'reset') {
      nextErrors.email = 'Enter a valid @adnu.edu.ph email.';
    }

    if (mode === 'signup') {
      if (form.name.trim().length < 2) {
        nextErrors.name = 'Enter your full name.';
      }
      if (!form.studentId.trim()) {
        nextErrors.studentId = 'Student ID is required.';
      }
      if (form.password.length < 8) {
        nextErrors.password = 'Use at least 8 characters.';
      }
      if (form.password !== form.confirm) {
        nextErrors.confirm = 'Passwords do not match.';
      }
    }

    if (mode === 'login' && !form.password) {
      nextErrors.password = 'Enter your password.';
    }

    if (mode === 'reset') {
      if (form.password.length < 8) {
        nextErrors.password = 'Use at least 8 characters.';
      }
      if (form.password !== form.confirm) {
        nextErrors.confirm = 'Passwords do not match.';
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setBusy(true);

    try {
      if (mode === 'forgot' || mode === 'reset') {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        if (!baseUrl) {
          throw new Error(
            'Password recovery requires your campus account service. Please contact your campus administrator.',
          );
        }

        const token = params.get('token');

        if (mode === 'reset' && !token) {
          throw new Error('Your password reset link is missing or invalid.');
        }

        const endpoint = `${baseUrl.replace(/\/$/, '')}/auth/${
          mode === 'forgot' ? 'forgot-password' : 'reset-password'
        }`;

        const payload =
          mode === 'forgot' ? { email: form.email } : { token, password: form.password };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            'The request could not be completed. Check your details or contact your administrator.',
          );
        }

        setDone(true);
        return;
      }

      if (mode === 'signup') {
        await signup(form);
      } else {
        await login(form.email, form.password);
      }

      notify(mode === 'signup' ? 'Account created successfully.' : 'Welcome back to ViArena.');
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const eyebrowText =
    mode === 'signup' ? 'CREATE ACCOUNT' : mode === 'login' ? 'SECURE SIGN IN' : 'ACCOUNT RECOVERY';
  const heading =
    mode === 'signup'
      ? 'Join ViArena'
      : mode === 'login'
        ? 'Welcome back'
        : mode === 'forgot'
          ? 'Forgot password?'
          : 'Choose a new password';
  const subtext =
    mode === 'signup'
      ? 'Create your campus account. All new accounts begin as Participants.'
      : mode === 'login'
        ? 'Sign in to continue your campus experience.'
        : mode === 'forgot'
          ? 'Enter your school email to request a recovery link.'
          : 'Set a new password using your recovery link.';

  return (
    <div className="auth-layout">
      <div className="auth-side">
        <Link className="auth-mark" to="/login">
          ViArena
        </Link>
        <div>
          <p className="eyebrow light">THE CAMPUS ARENA</p>
          <h1>
            Compete.
            <br />
            Connect.
            <br />
            <em>Celebrate.</em>
          </h1>
          <p>Discover tournaments, connect with your campus, and celebrate your achievements.</p>
        </div>
        <p className="auth-tagline">We are ONE.</p>
      </div>

      <div className="auth-main">
        <div className="auth-box">
          <p className="eyebrow">{eyebrowText}</p>
          <h1>{heading}</h1>
          <p className="subtext">{subtext}</p>

          {done ? (
            <Card className="message-card">
              <CheckCircle2 size={28} />
              <h2>{mode === 'forgot' ? 'Check your school email' : 'Password updated'}</h2>
              <p>
                {mode === 'forgot'
                  ? 'If the account exists, recovery instructions will be sent.'
                  : 'Your password has been changed. You can now sign in.'}
              </p>
              <Link className="button primary" to="/login">
                Return to Sign In
              </Link>
            </Card>
          ) : (
            <form onSubmit={submit} className="stack-form" noValidate>
              {mode === 'signup' && (
                <Field label="Full name" error={errors.name}>
                  <input
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    aria-invalid={!!errors.name}
                  />
                </Field>
              )}

              {mode !== 'reset' && (
                <Field label="School email" error={errors.email}>
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    placeholder="you@adnu.edu.ph"
                    onChange={(event) => updateField('email', event.target.value)}
                    aria-invalid={!!errors.email}
                  />
                </Field>
              )}

              {mode === 'signup' && (
                <Field label="Student ID" error={errors.studentId}>
                  <input
                    value={form.studentId}
                    onChange={(event) => updateField('studentId', event.target.value)}
                    aria-invalid={!!errors.studentId}
                  />
                </Field>
              )}

              {mode !== 'forgot' && (
                <Field
                  label={mode === 'reset' ? 'New password' : 'Password'}
                  error={errors.password}
                >
                  <div className="password-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      value={form.password}
                      onChange={(event) => updateField('password', event.target.value)}
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Field>
              )}

              {(mode === 'signup' || mode === 'reset') && (
                <Field label="Confirm password" error={errors.confirm}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={(event) => updateField('confirm', event.target.value)}
                    aria-invalid={!!errors.confirm}
                  />
                </Field>
              )}

              {error && (
                <p className="form-alert" role="alert">
                  {error}
                </p>
              )}

              {mode === 'login' && (
                <div className="between">
                  <span className="subtext">School account</span>
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
              )}

              <Button type="submit" disabled={busy} className="full-width">
                {busy
                  ? 'Please wait'
                  : mode === 'signup'
                    ? 'Create Account'
                    : mode === 'login'
                      ? 'Sign In'
                      : mode === 'forgot'
                        ? 'Send Recovery Link'
                        : 'Reset Password'}
                <ArrowRight size={16} />
              </Button>
            </form>
          )}

          <p className="auth-bottom-link">
            {mode === 'signup' ? (
              <>
                Already a member?
                <Link to="/login">Sign in</Link>
              </>
            ) : mode === 'login' ? (
              <>
                New to ViArena?
                <Link to="/signup">Create an account</Link>
              </>
            ) : (
              <Link to="/login">Back to sign in</Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
