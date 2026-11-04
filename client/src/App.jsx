import { RegistrationManager } from "./features/registrations/RegistrationManager";
import { AdminUsers, AdminUserDetail } from "./features/admin/UserManagement";
import React, { useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  Filter,
  MapPin,
  Plus,
  Search,
  Shield,
  Ticket,
  Users,
  Upload,
  User,
  Edit3,
} from "lucide-react";
import { StoreProvider, useStore } from "./store";
import { seedEvents, categories } from "./data";
import {
  canCreateEvent,
  canViewPrivateEvent,
  registrationEligibility,
  validateEvent,
  validSchoolEmail,
} from "./domain";
import {
  Badge,
  Button,
  Card,
  Confirm,
  dateText,
  dateTimeText,
  Empty,
  ErrorState,
  Field,
  GuestShell,
  Loading,
  PageHeader,
  Shell,
} from "./ui";
// Shared time helper keeps status and date comparisons consistent throughout the app.
const now = () => new Date();

// Event status is derived from the event lifecycle before checking capacity.
function eventStatus(e, count = 0) {
  if (new Date(e.end) <= now())
    return { text: "Ended", tone: "neutral", open: false };
  if (new Date(e.start) <= now())
    return { text: "Registration Closed", tone: "neutral", open: false };
  if (new Date(e.deadline) <= now())
    return { text: "Registration Closed", tone: "neutral", open: false };
  if (count >= e.capacity)
    return { text: "Full", tone: "warning", open: false };
  return { text: "Registration Open", tone: "success", open: true };
}
function visibilityStatus(e) {
  return (
    <Badge tone={e.visibility === "Published" ? "success" : "neutral"}>
      {e.visibility}
    </Badge>
  );
}
function Stats({ items }) {
  return (
    <div className="stats-grid">
      {items.map(([label, value, info]) => (
        <Card key={label} className="stat-card">
          <div className="stat-label">{label}</div>
          <strong>{value}</strong>
          <p>{info}</p>
        </Card>
      ))}
    </div>
  );
}

// Route guards keep authentication and role checks in one place.
function Require({ children, role }) {
  const { user } = useStore();
  const location = useLocation();
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  if (
    role &&
    !user.roles.includes(role) &&
    !(role === "Organizer" && user.roles.includes("Admin"))
  )
    return <Denied />;
  return <Shell>{children}</Shell>;
}
function Denied() {
  return (
    <div className="center-page" role="alert">
      <Shield size={42} />
      <h1>Access denied</h1>
      <p>You do not have permission to view this page.</p>
      <div className="actions">
        <Link className="button primary" to="/events">
          Explore Events
        </Link>
        <Link className="button outline" to="/profile">
          My Profile
        </Link>
      </div>
    </div>
  );
}
function NotFound() {
  return (
    <GuestShell>
      <div className="center-page">
        <h1>Page not found</h1>
        <p>We couldn't find the page you requested.</p>
        <Link className="button primary" to="/events">
          Explore Events
        </Link>
      </div>
    </GuestShell>
  );
}
function Landing() {
  const { user } = useStore();
  return (
    <GuestShell>
      <div className="landing">
        <div className="landing-copy">
          <span className="eyebrow light">THE CAMPUS ARENA</span>
          <h1>
            Compete.
            <br />
            Connect.
            <br />
            <em>Celebrate.</em>
          </h1>
          <p>One place for campus events, teams, and your next big moments.</p>
          <div className="landing-actions">
            <Link className="button primary light-button" to="/events">
              Explore events <ArrowRight size={18} />
            </Link>
            <Link
              className="button outline white-outline"
              to={user ? "/dashboard" : "/signup"}
            >
              {user ? "Open dashboard" : "Create an account"}
            </Link>
          </div>
        </div>
        <div className="landing-art">
          <span className="art-label">YOUR CAMPUS. YOUR ARENA.</span>
          <div className="art-orbit">
            <div className="art-ball">V</div>
          </div>
          <div className="art-info">
            <strong>Find your next event</strong>
            <span>Be part of something great.</span>
          </div>
        </div>
      </div>
    </GuestShell>
  );
}

// Login, signup, and password recovery share the same form and validation flow.
function Auth({ mode }) {
  const { login, signup, notify, user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    studentId: "",
    password: "",
    confirm: "",
  });
  const [show, setShow] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState(false),
    [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((a) => ({ ...a, [k]: "" }));
    setError("");
  };
  const returnTo =
    location.state?.from?.startsWith("/") &&
    !location.state.from.startsWith("//")
      ? location.state.from
      : "/dashboard";
  if (user && mode !== "reset") return <Navigate to="/dashboard" replace />;
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const next = {};
    if (!validSchoolEmail(form.email) && mode !== "reset")
      next.email = "Enter a valid @adnu.edu.ph email.";
    if (mode === "signup") {
      if (form.name.trim().length < 2) next.name = "Enter your full name.";
      if (!form.studentId.trim()) next.studentId = "Student ID is required.";
      if (form.password.length < 8)
        next.password = "Use at least 8 characters.";
      if (form.password !== form.confirm)
        next.confirm = "Passwords do not match.";
    }
    if (mode === "login" && !form.password)
      next.password = "Enter your password.";
    if (mode === "reset" && form.password.length < 8)
      next.password = "Use at least 8 characters.";
    if (mode === "reset" && form.password !== form.confirm)
      next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      if (mode === "forgot" || mode === "reset") {
        const base = import.meta.env.VITE_API_BASE_URL;
        if (!base)
          throw Error(
            "Password recovery requires your campus account service. Please contact your campus administrator.",
          );
        const token = params.get("token");
        if (mode === "reset" && !token)
          throw Error("Your password reset link is missing or invalid.");
        const response = await fetch(
          `${base.replace(/\/$/, "")}/auth/${mode === "forgot" ? "forgot-password" : "reset-password"}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              mode === "forgot"
                ? { email: form.email }
                : { token, password: form.password },
            ),
          },
        );
        if (!response.ok)
          throw Error(
            "The request could not be completed. Check your details or contact your administrator.",
          );
        setDone(true);
        return;
      }
      if (mode === "signup") await signup(form);
      else await login(form.email, form.password);
      notify(
        mode === "signup"
          ? "Account created successfully."
          : "Welcome back to ViArena.",
      );
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
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
          <p>
            Discover tournaments, connect with your campus, and celebrate your
            achievements.
          </p>
        </div>
        <p className="auth-tagline">We are ONE.</p>
      </div>
      <div className="auth-main">
        <div className="auth-box">
          <p className="eyebrow">
            {mode === "signup"
              ? "CREATE ACCOUNT"
              : mode === "login"
                ? "SECURE SIGN IN"
                : "ACCOUNT RECOVERY"}
          </p>
          <h1>
            {mode === "signup"
              ? "Join ViArena"
              : mode === "login"
                ? "Welcome back"
                : mode === "forgot"
                  ? "Forgot password?"
                  : "Choose a new password"}
          </h1>
          <p className="subtext">
            {mode === "signup"
              ? "Create your campus account. All new accounts begin as Participants."
              : mode === "login"
                ? "Sign in to continue your campus experience."
                : mode === "forgot"
                  ? "Enter your school email to request a recovery link."
                  : "Set a new password using your recovery link."}
          </p>
          {done ? (
            <Card className="message-card">
              <CheckCircle2 size={28} />
              <h2>
                {mode === "forgot"
                  ? "Check your school email"
                  : "Password updated"}
              </h2>
              <p>
                {mode === "forgot"
                  ? "If the account exists, recovery instructions will be sent."
                  : "Your password has been changed. You can now sign in."}
              </p>
              <Link className="button primary" to="/login">
                Return to Sign In
              </Link>
            </Card>
          ) : (
            <form onSubmit={submit} className="stack-form" noValidate>
              {mode === "signup" && (
                <Field label="Full name" error={errors.name}>
                  <input
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    aria-invalid={!!errors.name}
                  />
                </Field>
              )}
              {mode !== "reset" && (
                <Field label="School email" error={errors.email}>
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    placeholder="you@adnu.edu.ph"
                    onChange={(e) => update("email", e.target.value)}
                    aria-invalid={!!errors.email}
                  />
                </Field>
              )}
              {mode === "signup" && (
                <Field label="Student ID" error={errors.studentId}>
                  <input
                    value={form.studentId}
                    onChange={(e) => update("studentId", e.target.value)}
                    aria-invalid={!!errors.studentId}
                  />
                </Field>
              )}
              {mode !== "forgot" && (
                <Field
                  label={mode === "reset" ? "New password" : "Password"}
                  error={errors.password}
                >
                  <div className="password-wrap">
                    <input
                      type={show ? "text" : "password"}
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={show ? "Hide password" : "Show password"}
                      onClick={() => setShow((v) => !v)}
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Field>
              )}
              {(mode === "signup" || mode === "reset") && (
                <Field label="Confirm password" error={errors.confirm}>
                  <input
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={(e) => update("confirm", e.target.value)}
                    aria-invalid={!!errors.confirm}
                  />
                </Field>
              )}
              {error && (
                <p className="form-alert" role="alert">
                  {error}
                </p>
              )}
              {mode === "login" && (
                <div className="between">
                  <span className="subtext">School account</span>
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
              )}
              <Button type="submit" disabled={busy} className="full-width">
                {busy
                  ? "Please wait"
                  : mode === "signup"
                    ? "Create Account"
                    : mode === "login"
                      ? "Sign In"
                      : mode === "forgot"
                        ? "Send Recovery Link"
                        : "Reset Password"}{" "}
                <ArrowRight size={16} />
              </Button>
            </form>
          )}
          <p className="auth-bottom-link">
            {mode === "signup" ? (
              <>
                Already a member? <Link to="/login">Sign in</Link>
              </>
            ) : mode === "login" ? (
              <>
                New to ViArena? <Link to="/signup">Create an account</Link>
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
function Dashboard() {
  const { user, events, registrations, count } = useStore();
  const published = events.filter((e) => e.visibility === "Published");
  const mine = registrations.filter(
    (r) => r.userId === user.id && r.status === "Registered",
  );
  const upcoming = published.filter((e) => new Date(e.start) > now());
  return (
    <>
      <PageHeader
        eyebrow="WELCOME BACK"
        title={`Hello, ${user.name.split(" ")[0]}`}
        description="Here's what's happening in your arena today."
      />
      <Stats
        items={[
          ["UPCOMING EVENTS", upcoming.length, "Events coming to campus"],
          ["MY REGISTRATIONS", mine.length, "Events you have joined"],
          ["EXPLORE", published.length, "Published campus events"],
        ]}
      />
      <div className="dashboard-grid">
        <Card>
          <div className="card-heading">
            <h2>Upcoming events</h2>
            <Link to="/events">
              Browse all <ChevronRight size={16} />
            </Link>
          </div>
          {upcoming.length ? (
            upcoming.slice(0, 3).map((e) => (
              <div className="simple-row" key={e.id}>
                <div className="calendar-tile">
                  <strong>{new Date(e.start).getDate()}</strong>
                  <small>
                    {new Date(e.start)
                      .toLocaleString("en-PH", { month: "short" })
                      .toUpperCase()}
                  </small>
                </div>
                <div className="grow">
                  <h3>{e.title}</h3>
                  <p>
                    {dateTimeText(e.start)}: {e.venue}
                  </p>
                  <Badge tone={eventStatus(e, count(e.id)).tone}>
                    {eventStatus(e, count(e.id)).text}
                  </Badge>
                </div>
                <Link to={`/events/${e.id}`} className="button outline">
                  View event
                </Link>
              </div>
            ))
          ) : (
            <Empty title="No upcoming events" />
          )}
        </Card>
        <Card>
          <div className="card-heading">
            <h2>Your registrations</h2>
            <Link to="/my-events">
              My Events <ChevronRight size={16} />
            </Link>
          </div>
          {mine.length ? (
            mine.map((r) => {
              const e = events.find((x) => x.id === r.eventId);
              return e ? (
                <div className="simple-row" key={r.id}>
                  <div className="grow">
                    <h3>{e.title}</h3>
                    <p>{dateText(e.start)}</p>
                  </div>
                  <Badge tone="success">Registered</Badge>
                </div>
              ) : null;
            })
          ) : (
            <Empty
              title="Your event journey starts here"
              description="Discover an event and secure your spot."
              action={
                <Link className="button primary" to="/events">
                  Explore events
                </Link>
              }
            />
          )}
        </Card>
      </div>
    </>
  );
}

// Public event pages use the guest shell when signed out and the app shell when signed in.
function BrowsingShell({ children }) {
  const { user } = useStore();
  return user ? <Shell>{children}</Shell> : <GuestShell>{children}</GuestShell>;
}
function EventCard({ event }) {
  const { count } = useStore();
  const status = eventStatus(event, count(event.id));
  return (
    <Card className="event-card">
      <div className="event-cover">
        {event.cover ? (
          <img src={event.cover} alt="" />
        ) : (
          <>
            <span className="cover-motif">
              {event.category === "Esports"
                ? "ESPORTS"
                : event.category.toUpperCase()}
            </span>
            <span className="cover-symbol">V</span>
          </>
        )}
      </div>
      <div className="event-card-body">
        <div className="tag-row">
          <Badge tone={status.tone}>{status.text}</Badge>
          <Badge tone="info">{event.category}</Badge>
        </div>
        <h2>
          <Link to={`/events/${event.id}`}>{event.title}</Link>
        </h2>
        <p className="event-meta">
          <CalendarDays size={16} />
          {dateTimeText(event.start)}
        </p>
        <p className="event-meta">
          <MapPin size={16} />
          {event.venue}
        </p>
        <div className="event-bottom">
          <span>
            {count(event.id)} / {event.capacity} registered
          </span>
          <Link className="button outline" to={`/events/${event.id}`}>
            View event <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
function EventFeed() {
  const { events } = useStore();
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("All categories"),
    [status, setStatus] = useState("All statuses"),
    [limit, setLimit] = useState(6);
  const published = events.filter((e) => e.visibility === "Published");
  const { count } = useStore();
  const filtered = published.filter(
    (e) =>
      [e.title, e.description, e.venue]
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (category === "All categories" || e.category === category) &&
      (status === "All statuses" ||
        (status === "Open" &&
          eventStatus(e, count(e.id)).text === "Registration Open") ||
        (status === "Closed" &&
          eventStatus(e, count(e.id)).text !== "Registration Open")),
  );
  return (
    <BrowsingShell>
      <div className="public-content">
        <PageHeader
          eyebrow="EVENTS SPOTLIGHT"
          title="Explore events"
          description="Discover tournaments, campus activities, and community events."
        />
        <Card className="filter-card">
          <div className="searchbox">
            <Search size={19} />
            <input
              aria-label="Search events"
              placeholder="Search events, venues, or activities"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setLimit(6);
              }}
            />
          </div>
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setLimit(6);
            }}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Filter by registration status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setLimit(6);
            }}
          >
            <option>All statuses</option>
            <option>Open</option>
            <option>Closed</option>
          </select>
        </Card>
        <div className="results-info">
          <span>
            {filtered.length} {filtered.length === 1 ? "event" : "events"} found
          </span>
          {(search ||
            category !== "All categories" ||
            status !== "All statuses") && (
            <button
              className="text-button"
              onClick={() => {
                setSearch("");
                setCategory("All categories");
                setStatus("All statuses");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
        {filtered.length ? (
          <>
            <div className="event-grid">
              {filtered.slice(0, limit).map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
            {limit < filtered.length && (
              <div className="load-more">
                <Button
                  variant="outline"
                  onClick={() => setLimit((v) => v + 6)}
                >
                  Load more events
                </Button>
              </div>
            )}
          </>
        ) : (
          <Empty
            title="No matching events"
            description="Try a different search or category."
          />
        )}
      </div>
    </BrowsingShell>
  );
}

// Event details also handle registration eligibility and private-event visibility.
function EventDetail() {
  const { eventId } = useParams();
  const { events, user, count, isRegistered } = useStore();
  const e = events.find((x) => x.id === eventId);
  if (!e || !canViewPrivateEvent(e, user)) return <NotFound />;
  const eligibility = registrationEligibility(
    e,
    count(e.id),
    isRegistered(e.id),
  );
  const joined = isRegistered(e.id);
  return (
    <BrowsingShell>
      <div className="public-content">
        <Link to="/events" className="back-link">
          <ArrowLeft size={16} /> All events
        </Link>
        <div className="detail-grid">
          <div>
            <div className="detail-cover">
              {e.cover ? (
                <img src={e.cover} alt="Event cover" />
              ) : (
                <>
                  <span className="eyebrow light">
                    {e.category.toUpperCase()}
                  </span>
                  <span>ViArena</span>
                </>
              )}
            </div>
            <Card>
              <div className="tag-row">
                {visibilityStatus(e)}
                <Badge
                  tone={
                    eligibility.code === "open"
                      ? "success"
                      : eligibility.code === "full"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {eligibility.code === "open"
                    ? "Registration Open"
                    : eligibility.code === "full"
                      ? "Full"
                      : eligibility.code === "registered"
                        ? "Registered"
                        : "Registration Closed"}
                </Badge>
              </div>
              <h1 className="detail-title">{e.title}</h1>
              <p className="subtext">
                {e.description || "Details will be announced soon."}
              </p>
              <hr />
              <div className="detail-facts">
                <div>
                  <CalendarDays size={18} />
                  <span>
                    <strong>Date and time</strong>
                    {dateTimeText(e.start)} to {dateTimeText(e.end)}
                  </span>
                </div>
                <div>
                  <MapPin size={18} />
                  <span>
                    <strong>Venue</strong>
                    {e.venue || "To be announced"}
                  </span>
                </div>
                <div>
                  <Clock3 size={18} />
                  <span>
                    <strong>Registration deadline</strong>
                    {dateTimeText(e.deadline)}
                  </span>
                </div>
                <div>
                  <Users size={18} />
                  <span>
                    <strong>Capacity</strong>
                    {count(e.id)} of {e.capacity} registered
                  </span>
                </div>
              </div>
              {e.eligibility && (
                <>
                  <hr />
                  <h3>Eligibility</h3>
                  <p>{e.eligibility}</p>
                </>
              )}
            </Card>
          </div>
          <Card className="sticky-side">
            <h2>Your registration</h2>
            <p className="subtext">{eligibility.reason}</p>
            <div className="capacity-meter">
              <div
                style={{
                  width: `${Math.min(100, (100 * count(e.id)) / Math.max(1, e.capacity))}%`,
                }}
              />
            </div>
            <p className="capacity-label">
              {Math.max(0, e.capacity - count(e.id))} spots remaining
            </p>
            {joined ? (
              <>
                <Badge tone="success">Registered</Badge>
                <Link className="button outline full-width" to="/my-events">
                  Manage registration
                </Link>
              </>
            ) : eligibility.allowed ? (
              <Link
                className="button primary full-width"
                to={user ? `/events/${e.id}/register` : "/login"}
                state={user ? undefined : { from: `/events/${e.id}/register` }}
              >
                {user ? "Register for this event" : "Sign in to register"}
              </Link>
            ) : (
              <Button disabled className="full-width">
                {eligibility.code === "full"
                  ? "Event Full"
                  : eligibility.code === "ended"
                    ? "Event Started or Ended"
                    : eligibility.code === "closed"
                      ? "Registration Closed"
                      : "Registration Unavailable"}
              </Button>
            )}
            {e.visibility === "Draft" && <Badge>Draft</Badge>}
            <hr />
            <h3>About this event</h3>
            <p className="subtext">{e.category}: Ateneo de Naga University</p>
          </Card>
        </div>
      </div>
    </BrowsingShell>
  );
}
function MyEvents() {
  const { events, registrations, user, cancelRegistration, notify } =
    useStore();
  const [confirm, setConfirm] = useState(null),
    [tab, setTab] = useState("Upcoming");
  const mine = registrations
    .filter((r) => r.userId === user.id)
    .map((r) => ({ ...r, event: events.find((e) => e.id === r.eventId) }))
    .filter((r) => r.event)
    .filter((r) => {
      const e = r.event;
      if (tab === "Canceled") return r.status === "Canceled";
      if (r.status !== "Registered") return false;
      if (tab === "Past") return new Date(e.end) <= new Date();
      if (tab === "Live")
        return new Date(e.start) <= new Date() && new Date(e.end) > new Date();
      return new Date(e.start) > new Date();
    });
  return (
    <>
      <PageHeader
        eyebrow="MY ARENA"
        title="My Events"
        description="Keep track of your event registrations."
      />
      <div className="tabs" role="tablist" aria-label="My Events filters">
        {["Upcoming", "Live", "Past", "Canceled"].map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <Card>
        {mine.length ? (
          mine.map((r) => (
            <div className="simple-row" key={r.id}>
              <div className="calendar-tile">
                <strong>{new Date(r.event.start).getDate()}</strong>
                <small>
                  {new Date(r.event.start)
                    .toLocaleString("en-PH", { month: "short" })
                    .toUpperCase()}
                </small>
              </div>
              <div className="grow">
                <h3>
                  <Link to={`/events/${r.event.id}`}>{r.event.title}</Link>
                </h3>
                <p>
                  {dateTimeText(r.event.start)}: {r.event.venue}
                </p>
                <div className="tag-row">
                  <Badge
                    tone={r.status === "Registered" ? "success" : "danger"}
                  >
                    {r.status}
                  </Badge>
                  <Badge
                    tone={
                      new Date(r.event.end) <= new Date() ? "neutral" : "info"
                    }
                  >
                    {new Date(r.event.end) <= new Date()
                      ? "Ended"
                      : new Date(r.event.start) <= new Date()
                        ? "In Progress"
                        : "Upcoming"}
                  </Badge>
                </div>
              </div>
              {r.status === "Registered" &&
                new Date(r.event.end) > new Date() && (
                  <Button variant="outline" onClick={() => setConfirm(r.event)}>
                    Cancel registration
                  </Button>
                )}
            </div>
          ))
        ) : (
          <Empty
            title={`No ${tab.toLowerCase()} events`}
            description="Your event activity will appear here."
            action={
              <Link to="/events" className="button primary">
                Explore Events
              </Link>
            }
          />
        )}
      </Card>
      {confirm && (
        <Confirm
          title="Cancel registration?"
          description={`Your spot for ${confirm.title} will be released.`}
          danger
          confirmLabel="Cancel registration"
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            try {
              cancelRegistration(confirm.id);
              notify("Registration canceled.");
            } catch (err) {
              notify(err.message, "error");
            }
            setConfirm(null);
          }}
        />
      )}
    </>
  );
}

// Profile supports both the read-only view and the edit form.
function Profile({ edit = false }) {
  const { user, editProfile, notify } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user.name,
    bio: user.bio || "",
    studentId: user.studentId || "",
    avatar: user.avatar || "",
  });
  const [error, setError] = useState("");
  const save = (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return setError("Enter your full name.");
    if (!form.studentId.trim()) return setError("Student ID is required.");
    try {
      editProfile(form);
      notify("Profile updated.");
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="ACCOUNT"
        title={edit ? "Edit Profile" : "My Profile"}
        description={
          edit
            ? "Keep your personal details up to date."
            : "Your campus identity and account information."
        }
        action={
          !edit && (
            <Link className="button primary" to="/profile/edit">
              <Edit3 size={16} /> Edit Profile
            </Link>
          )
        }
      />
      <Card className="profile-card">
        <div className="profile-head">
          <div className="profile-avatar">
            {form.avatar ? (
              <img src={form.avatar} alt="Profile avatar" />
            ) : (
              user.name
                .split(" ")
                .slice(0, 2)
                .map((x) => x[0])
                .join("")
            )}
          </div>
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <div className="tag-row">
              {user.roles.map((r) => (
                <Badge
                  key={r}
                  tone={
                    r === "Admin"
                      ? "info"
                      : r === "Organizer"
                        ? "success"
                        : "neutral"
                  }
                >
                  {r}
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </Field>
            <Field
              label="School email"
              hint="Email changes are managed by campus administration."
            >
              <input value={user.email} readOnly />
            </Field>
            <Field label="Student ID">
              <input
                value={form.studentId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, studentId: e.target.value }))
                }
              />
            </Field>
            <Field label="About me">
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bio: e.target.value }))
                }
              />
            </Field>
            <Field
              label="Profile photo"
              hint="Choose an image smaller than 1 MB."
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 1024 * 1024)
                    return setError("Image must be smaller than 1 MB.");
                  const reader = new FileReader();
                  reader.onload = () =>
                    setForm((f) => ({ ...f, avatar: String(reader.result) }));
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
              <strong>{user.bio || "No bio added yet."}</strong>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
const defaultEvent = {
  title: "",
  description: "",
  category: "Esports",
  venue: "",
  start: "",
  end: "",
  deadline: "",
  capacity: "24",
  cover: "",
  eligibility: "",
  visibility: "Draft",
};

// Event creation and editing share the same validation and publishing workflow.
function EventEditor() {
  const { eventId } = useParams();
  const { events, user, saveEvent, canManageEvent, count, notify } = useStore();
  const navigate = useNavigate();
  const current = eventId ? events.find((e) => e.id === eventId) : null;
  const [form, setForm] = useState(
    current
      ? { ...current, capacity: String(current.capacity) }
      : { ...defaultEvent },
  );
  const [error, setError] = useState(""),
    [publishConfirm, setPublishConfirm] = useState(false),
    [unpublishConfirm, setUnpublishConfirm] = useState(false);
  if (eventId && !current) return <NotFound />;
  if (current && !canManageEvent(current)) return <Denied />;
  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  };
  const save = (visibility) => {
    const fields = { ...form, visibility };
    try {
      const id = saveEvent(fields, eventId);
      notify(
        visibility === "Published"
          ? "Event published successfully."
          : "Draft saved.",
      );
      navigate(`/organizer/events/${id}/edit`, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };
  const requestPublish = () => {
    const problem = validateEvent(form, true, current ? count(current.id) : 0);
    if (problem) {
      setError(problem);
      return;
    }
    setPublishConfirm(true);
  };
  const checklist = [
    [
      "Event title and description",
      !!form.title.trim() && !!form.description.trim(),
    ],
    [
      "Event start and end times",
      !!form.start && !!form.end && new Date(form.start) < new Date(form.end),
    ],
    ["Venue and capacity", !!form.venue.trim() && Number(form.capacity) >= 1],
    [
      "Registration deadline",
      !!form.deadline && new Date(form.deadline) <= new Date(form.start),
    ],
  ];
  return (
    <>
      <PageHeader
        eyebrow="ORGANIZER WORKSPACE"
        title={eventId ? "Edit event" : "Create an event"}
        description="Set up event details and publish when everything is ready."
        action={
          <Link className="button outline" to="/organizer/events">
            Back to events
          </Link>
        }
      />
      <div className="editor-grid">
        <Card>
          <div className="between">
            <h2>Event details</h2>
            {current && visibilityStatus(current)}
          </div>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              save(current?.visibility === "Published" ? "Published" : "Draft");
            }}
          >
            <Field label="Event title">
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Enter an event title"
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Tell participants what to expect"
              />
            </Field>
            <div className="form-grid">
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {categories
                    .filter((c) => c !== "All categories")
                    .map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                </select>
              </Field>
              <Field label="Capacity">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.capacity}
                  onChange={(e) => set("capacity", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Venue">
              <input
                value={form.venue}
                onChange={(e) => set("venue", e.target.value)}
                placeholder="Where is the event happening?"
              />
            </Field>
            <div className="form-grid">
              <Field label="Starts">
                <input
                  type="datetime-local"
                  value={form.start}
                  onChange={(e) => set("start", e.target.value)}
                />
              </Field>
              <Field label="Ends">
                <input
                  type="datetime-local"
                  value={form.end}
                  onChange={(e) => set("end", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Registration deadline">
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
              />
            </Field>
            <Field
              label="Eligibility"
              hint="Optional, shown on the event details page."
            >
              <textarea
                rows={3}
                value={form.eligibility || ""}
                onChange={(e) => set("eligibility", e.target.value)}
                placeholder="Who can participate?"
              />
            </Field>
            <Field label="Cover image" hint="Optional. JPG or PNG, up to 1 MB.">
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (
                    !["image/jpeg", "image/png"].includes(f.type) ||
                    f.size > 1024 * 1024
                  )
                    return setError("Choose a JPG or PNG smaller than 1 MB.");
                  const reader = new FileReader();
                  reader.onload = () => set("cover", String(reader.result));
                  reader.readAsDataURL(f);
                }}
              />
            </Field>
            {form.cover && (
              <>
                <img
                  className="cover-preview"
                  src={form.cover}
                  alt="Event cover preview"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => set("cover", "")}
                >
                  Remove cover
                </Button>
              </>
            )}
            {error && (
              <p className="form-alert" role="alert">
                {error}
              </p>
            )}
            <div className="actions">
              <Link className="button outline" to="/organizer/events">
                Cancel
              </Link>
              <Button type="submit" variant="outline">
                {current?.visibility === "Published"
                  ? "Save changes"
                  : "Save draft"}
              </Button>
              {current?.visibility !== "Published" && (
                <Button type="button" onClick={requestPublish}>
                  Publish event
                </Button>
              )}
              {current?.visibility === "Published" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUnpublishConfirm(true)}
                >
                  Unpublish
                </Button>
              )}
            </div>
          </form>
        </Card>
        <Card className="side-checklist">
          <h2>Publishing checklist</h2>
          {checklist.map(([label, ready]) => (
            <div key={label} className="checkline">
              {ready ? (
                <Check size={17} />
              ) : (
                <Clock3 size={17} className="check-pending" />
              )}
              <span>{label}</span>
            </div>
          ))}
          <hr />
          <p className="subtext">
            Published events appear in Explore Events. Only the owner or
            authorized staff can edit this event.
          </p>
          {current?.updatedAt && (
            <p className="subtext">
              Last updated: {dateTimeText(current.updatedAt)}
            </p>
          )}
        </Card>
      </div>
      {publishConfirm && (
        <Confirm
          title="Publish this event?"
          description="The event will become visible to everyone in Explore Events."
          confirmLabel="Publish event"
          onClose={() => setPublishConfirm(false)}
          onConfirm={() => {
            setPublishConfirm(false);
            save("Published");
          }}
        />
      )}
      {unpublishConfirm && (
        <Confirm
          title="Unpublish this event?"
          description="This event will disappear from the public feed. Existing registrations will be kept."
          confirmLabel="Unpublish event"
          danger
          onClose={() => setUnpublishConfirm(false)}
          onConfirm={() => {
            setUnpublishConfirm(false);
            save("Draft");
          }}
        />
      )}
    </>
  );
}
function OrganizerDashboard() {
  const { events, user, count, canManageEvent } = useStore();
  const mine = events.filter((e) => canManageEvent(e));
  const upcoming = mine
    .filter((e) => new Date(e.start) >= now())
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const draft = mine.find((e) => e.visibility === "Draft");
  return (
    <>
      <PageHeader
        eyebrow="WELCOME BACK"
        title="Dashboard"
        description="Here's what's happening in your arena today."
        action={
          <Link className="button primary" to="/organizer/events/new">
            <Plus size={18} /> Create event
          </Link>
        }
      />
      <Stats
        items={[
          [
            "ACTIVE EVENTS",
            mine.filter((e) => e.visibility === "Published").length,
            "Published campus events",
          ],
          [
            "TEAM REGISTRATIONS",
            mine.reduce((s, e) => s + count(e.id), 0),
            "Confirmed registrations",
          ],
          [
            "CO-ORGANIZERS",
            new Set(
              mine.flatMap((e) => e.coOrganizers?.map((c) => c.userId) || []),
            ).size,
            "Across managed events",
          ],
          [
            "DRAFT EVENTS",
            mine.filter((e) => e.visibility === "Draft").length,
            "Continue preparing your event",
          ],
        ]}
      />
      <div className="dashboard-grid">
        <div className="dashboard-stack">
          <Card>
            <div className="section-label">UPCOMING EVENT</div>
            {upcoming.length ? (
              upcoming.slice(0, 2).map((e) => (
                <div className="featured-event" key={e.id}>
                  <div className="calendar-tile">
                    <strong>{new Date(e.start).getDate()}</strong>
                    <small>
                      {new Date(e.start)
                        .toLocaleString("en-PH", { month: "short" })
                        .toUpperCase()}
                    </small>
                  </div>
                  <div className="grow">
                    <h3>{e.title}</h3>
                    <p>
                      {dateTimeText(e.start)}: {e.venue}
                    </p>
                    <div className="tag-row">
                      {visibilityStatus(e)}
                      <Badge tone="info">{e.category}</Badge>
                    </div>
                    <p className="subtext">
                      {count(e.id)} participants registered
                    </p>
                  </div>
                  <Link
                    className="button outline"
                    to={`/organizer/events/${e.id}/edit`}
                  >
                    Manage event
                  </Link>
                </div>
              ))
            ) : (
              <Empty title="No upcoming managed events" />
            )}
          </Card>
          <Card>
            <div className="card-heading">
              <h2>Registration overview</h2>
              <Link to="/organizer/registrations">
                View registrations <ChevronRight size={16} />
              </Link>
            </div>
            <div className="quick-list">
              {mine
                .filter((e) => e.visibility === "Published")
                .slice(0, 3)
                .map((e) => (
                  <div className="simple-row" key={e.id}>
                    <div className="grow">
                      <strong>{e.title}</strong>
                      <p className="subtext">
                        {count(e.id)} of {e.capacity} registered
                      </p>
                    </div>
                    <Link
                      to={`/organizer/events/${e.id}/registrations`}
                      className="button outline"
                    >
                      Review
                    </Link>
                  </div>
                ))}
            </div>
          </Card>
        </div>
        <div className="dashboard-stack">
          <Card>
            <div className="section-label">ON THE HORIZON</div>
            {upcoming[0] ? (
              <div className="upcoming-summary">
                <div className="calendar-tile">
                  <strong>{new Date(upcoming[0].start).getDate()}</strong>
                  <small>
                    {new Date(upcoming[0].start)
                      .toLocaleString("en-PH", { month: "short" })
                      .toUpperCase()}
                  </small>
                </div>
                <div>
                  <h3>{upcoming[0].title}</h3>
                  <p className="subtext">{dateTimeText(upcoming[0].start)}</p>
                  <p className="subtext">{upcoming[0].venue}</p>
                </div>
              </div>
            ) : (
              <p className="subtext">No upcoming events.</p>
            )}
          </Card>
          <Card>
            <div className="card-heading">
              <h2>Continue your draft</h2>
              {draft && <Badge>Draft</Badge>}
            </div>
            {draft ? (
              <>
                <h3>{draft.title}</h3>
                <p className="subtext">
                  Add the missing details and review before publishing.
                </p>
                <Link
                  className="button primary"
                  to={`/organizer/events/${draft.id}/edit`}
                >
                  Continue draft
                </Link>
              </>
            ) : (
              <Empty
                title="No draft events"
                action={
                  <Link to="/organizer/events/new" className="button outline">
                    Create event
                  </Link>
                }
              />
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

// Organizer routes expose only events and registration lists the current user can manage.
function OrganizerEvents() {
  const { events, user, canManageEvent, canManageRegistrations, count } =
    useStore();
  const [tab, setTab] = useState("All"),
    [search, setSearch] = useState("");
  const mine = events
    .filter((e) => canManageEvent(e) || canManageRegistrations(e))
    .filter(
      (e) =>
        (tab === "All" || e.visibility === tab) &&
        e.title.toLowerCase().includes(search.toLowerCase()),
    );
  return (
    <>
      <PageHeader
        eyebrow="ORGANIZER WORKSPACE"
        title="Event management"
        description="Manage your event drafts, published details, and registrations."
        action={
          canCreateEvent(user) ? (
            <Link className="button primary" to="/organizer/events/new">
              <Plus size={18} /> Create event
            </Link>
          ) : null
        }
      />
      <div className="tabs">
        {["All", "Published", "Draft"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <Card>
        <div className="searchbox table-search">
          <Search size={18} />
          <input
            placeholder="Search managed events"
            aria-label="Search managed events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {mine.length ? (
          mine.map((e) => (
            <div className="simple-row" key={e.id}>
              <div className="grow">
                <h3>{e.title}</h3>
                <p>
                  {dateTimeText(e.start)}: {count(e.id)} registrations
                </p>
              </div>
              {visibilityStatus(e)}
              <div className="actions">
                {canManageRegistrations(e) && (
                  <Link
                    className="button outline"
                    to={`/organizer/events/${e.id}/registrations`}
                  >
                    Registrations
                  </Link>
                )}
                {canManageEvent(e) && (
                  <Link
                    className="button primary"
                    to={`/organizer/events/${e.id}/edit`}
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <Empty title="No managed events found" />
        )}
      </Card>
    </>
  );
}
function AdminDashboard() {
  const { users, events, roleAudit } = useStore();
  return (
    <>
      <PageHeader
        eyebrow="ADMIN CONSOLE"
        title="Dashboard"
        description="School-wide overview for Ateneo de Naga University."
      />
      <Stats
        items={[
          ["TOTAL USERS", users.length, "Registered accounts"],
          [
            "ORGANIZERS",
            users.filter((u) => u.roles.includes("Organizer")).length,
            "Account-level organizer grants",
          ],
          [
            "ACTIVE EVENTS",
            events.filter(
              (e) => e.visibility === "Published" && new Date(e.end) > now(),
            ).length,
            "Upcoming or ongoing",
          ],
          ["ROLE CHANGES", roleAudit.length, "Recorded role updates"],
        ]}
      />
      <div className="dashboard-grid">
        <Card>
          <div className="card-heading">
            <h2>User management</h2>
            <Link to="/admin/users">
              View all users <ChevronRight size={16} />
            </Link>
          </div>
          {users.slice(0, 5).map((u) => (
            <div className="simple-row" key={u.id}>
              <span className="avatar">
                {u.name
                  .split(" ")
                  .slice(0, 2)
                  .map((x) => x[0])
                  .join("")}
              </span>
              <div className="grow">
                <strong>{u.name}</strong>
                <p className="subtext">{u.email}</p>
              </div>
              <Badge
                tone={
                  u.roles.includes("Admin")
                    ? "info"
                    : u.roles.includes("Organizer")
                      ? "success"
                      : "neutral"
                }
              >
                {u.roles.includes("Admin")
                  ? "Admin"
                  : u.roles.includes("Organizer")
                    ? "Organizer"
                    : "Participant"}
              </Badge>
            </div>
          ))}
          <Link className="button outline" to="/admin/users">
            Open User Management
          </Link>
        </Card>
        <div className="dashboard-stack">
          <Card>
            <h2>Role distribution</h2>
            {[
              ["Participants", users.length],
              [
                "Event Organizers",
                users.filter((u) => u.roles.includes("Organizer")).length,
              ],
              ["Admins", users.filter((u) => u.roles.includes("Admin")).length],
            ].map(([label, n]) => (
              <div className="metric-line" key={label}>
                <span>{label}</span>
                <strong>{n}</strong>
              </div>
            ))}
          </Card>
          <Card>
            <h2>Event oversight</h2>
            <p className="subtext">
              Inspect campus events and manage authorized organizer accounts.
            </p>
            <Link className="button primary" to="/admin/events">
              View events
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}

// Admin event views are intentionally read-only; changes happen through dedicated controls.
function AdminEvents() {
  const { events, users, count } = useStore();
  return (
    <>
      <PageHeader
        eyebrow="ADMIN CONSOLE"
        title="Events"
        description="Read-only view of all campus events, including drafts."
      />
      <Card>
        {events.map((e) => (
          <div className="simple-row" key={e.id}>
            <div className="grow">
              <h3>{e.title}</h3>
              <p className="subtext">
                {users.find((u) => u.id === e.ownerId)?.name || "Unassigned"}:{" "}
                {dateText(e.start)}: {count(e.id)} registrations
              </p>
            </div>
            {visibilityStatus(e)}
            <Link className="button outline" to={`/events/${e.id}`}>
              Public view
            </Link>
          </div>
        ))}
      </Card>
    </>
  );
}
function OrganizerRegistrations() {
  const { events, canManageRegistrations, count } = useStore();
  const manageable = events.filter((e) => canManageRegistrations(e));
  return (
    <>
      <PageHeader
        eyebrow="ORGANIZER WORKSPACE"
        title="Registrations"
        description="Select an event to review its participant roster."
      />
      <Card>
        {manageable.length ? (
          manageable.map((e) => (
            <div className="simple-row" key={e.id}>
              <div className="grow">
                <h3>{e.title}</h3>
                <p className="subtext">
                  {count(e.id)} / {e.capacity} registered
                </p>
              </div>
              {visibilityStatus(e)}
              <Link
                className="button primary"
                to={`/organizer/events/${e.id}/registrations`}
              >
                Manage registrations
              </Link>
            </div>
          ))
        ) : (
          <Empty
            title="No registration lists available"
            description="You need an event-owner or authorized co-organizer assignment."
          />
        )}
      </Card>
    </>
  );
}
function InterfacePreview() {
  const [tab, setTab] = useState("captain");
  const views = [
    ["captain", "Team Captain"],
    ["handler", "Handler"],
    ["participant", "Participant"],
    ["organizer", "Organizer"],
    ["admin", "Admin"],
  ];
  return (
    <>
      <PageHeader
        eyebrow="DEVELOPMENT ONLY: DESIGN REVIEW"
        title="Interface previews"
        description=" "
      />
      <div className="tabs" role="tablist" aria-label="Interface preview roles">
        {views.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "captain" ? (
        <>
          <Stats
            items={[
              ["ROSTER", "3 / 6", "Confirmed team members"],
              ["JOIN REQUESTS", 2, "Awaiting captain review"],
              ["OPEN POSITIONS", 3, "Recruitment opportunities"],
              ["TASKS", 2, "Pending team responsibilities"],
            ]}
          />
          <div className="dashboard-grid">
            <Card>
              <div className="section-label">TEAM OVERVIEW</div>
              <h2>KeyBros Esports</h2>
              <p className="subtext">
                Mobile Legends: Ateneo de Naga University
              </p>
              <Badge tone="success">Recruitment open</Badge>
              <div className="preview-roster">
                {[
                  ["Yang Jungwon", "Captain"],
                  ["Park Sunghoon", "Jungler"],
                  ["Lee Haneul", "Mid lane"],
                ].map(([name, role]) => (
                  <div className="simple-row" key={name}>
                    <span className="avatar">
                      {name
                        .split(" ")
                        .map((v) => v[0])
                        .join("")}
                    </span>
                    <div className="grow">
                      <strong>{name}</strong>
                      <p className="subtext">{role}</p>
                    </div>
                    <Badge tone="success">Confirmed</Badge>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h2>Recruitment & requests</h2>
              <p className="subtext">
                Reference layout for captain-managed membership requests and
                roster administration.
              </p>
              <div className="preview-note">
                Read-only preview — approval actions are planned for a later
                phase.
              </div>
            </Card>
          </div>
        </>
      ) : tab === "handler" ? (
        <>
          <Stats
            items={[
              ["TO DO", 2, "Assigned tasks"],
              ["IN PROGRESS", 1, "Current work"],
              ["COMPLETED", 8, "This month"],
              ["TEAMS GRANTED", 1, "KeyBros Esports"],
            ]}
          />
          <div className="dashboard-grid">
            <Card>
              <h2>Assigned tasks</h2>
              {[
                ["Finalize team lineup", "In progress", "19 Oct 2026"],
                ["Upload player IDs", "To do", "31 Oct 2026"],
                ["Confirm practice schedule", "To do", "30 Oct 2026"],
              ].map(([name, status, date]) => (
                <div className="simple-row" key={name}>
                  <div className="grow">
                    <h3>{name}</h3>
                    <p className="subtext">KeyBros Esports: Due {date}</p>
                  </div>
                  <Badge
                    tone={status === "In progress" ? "warning" : "neutral"}
                  >
                    {status}
                  </Badge>
                </div>
              ))}
            </Card>
            <Card>
              <h2>Granted team</h2>
              <h3>KeyBros Esports</h3>
              <p className="subtext">
                Mobile Legends: Handler access is limited to assigned tasks and
                team viewing.
              </p>
              <div className="preview-note">
                Roster editing and role changes are not granted to Handlers.
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <h2>{views.find((v) => v[0] === tab)?.[1]} workspace</h2>
          <p className="subtext">
            This workspace already has implemented routes. To test real
            navigation, use an authorized seeded account instead of a visual
            mock.
          </p>
          <Link
            className="button primary"
            to={
              tab === "admin"
                ? "/admin"
                : tab === "organizer"
                  ? "/organizer"
                  : "/dashboard"
            }
          >
            Open actual workspace
          </Link>
        </Card>
      )}
    </>
  );
}
function LiveNow() {
  const { events } = useStore();
  const streams = events.filter(
    (e) => e.visibility === "Published" && e.stream?.status === "Live",
  );
  return (
    <>
      <PageHeader
        eyebrow="WATCH TOGETHER"
        title="Live Now"
        description="Watch ongoing campus events and broadcasts."
      />
      {streams.length ? (
        <div className="event-grid">
          {streams.map((e) => (
            <Card key={e.id}>
              <Badge tone="danger">Live</Badge>
              <h2>{e.title}</h2>
              <p className="subtext">{e.venue}</p>
              <Link to={`/events/${e.id}`} className="button primary">
                View event
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Empty
            title="No events are live right now"
            description="Browse published events to see upcoming competitions."
            action={
              <Link className="button outline" to="/events">
                Explore Events
              </Link>
            }
          />
        </Card>
      )}
    </>
  );
}
function Deferred({ title, description }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card>
        <Empty
          title="Nothing to show yet"
          description="This section will be available as its event data is added."
        />
      </Card>
    </>
  );
}

// These routes are intentionally defined in one place to make access rules easy to audit.
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/signup" element={<Auth mode="signup" />} />
      <Route path="/forgot-password" element={<Auth mode="forgot" />} />
      <Route path="/reset-password" element={<Auth mode="reset" />} />
      <Route path="/events" element={<EventFeed />} />
      <Route path="/events/:eventId" element={<EventDetail />} />
      <Route
        path="/events/:eventId/register"
        element={<RegistrationRedirect />}
      />
      <Route
        path="/dashboard"
        element={
          <Require>
            <Dashboard />
          </Require>
        }
      />
      <Route
        path="/my-events"
        element={
          <Require>
            <MyEvents />
          </Require>
        }
      />
      <Route
        path="/profile"
        element={
          <Require>
            <Profile />
          </Require>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <Require>
            <Profile edit />
          </Require>
        }
      />
      <Route
        path="/organizer"
        element={
          <Require role="Organizer">
            <OrganizerDashboard />
          </Require>
        }
      />
      <Route
        path="/organizer/events"
        element={
          <Require>
            <OrganizerEvents />
          </Require>
        }
      />
      <Route
        path="/organizer/registrations"
        element={
          <Require>
            <OrganizerRegistrations />
          </Require>
        }
      />
      <Route
        path="/organizer/events/new"
        element={
          <Require role="Organizer">
            <EventEditor />
          </Require>
        }
      />
      <Route
        path="/organizer/events/:eventId/edit"
        element={
          <Require>
            <EventEditor />
          </Require>
        }
      />
      <Route
        path="/organizer/events/:eventId/registrations"
        element={
          <Require>
            <RegistrationManager />
          </Require>
        }
      />
      <Route
        path="/admin"
        element={
          <Require role="Admin">
            <AdminDashboard />
          </Require>
        }
      />
      <Route
        path="/admin/users"
        element={
          <Require role="Admin">
            <AdminUsers />
          </Require>
        }
      />
      <Route
        path="/admin/events"
        element={
          <Require role="Admin">
            <AdminEvents />
          </Require>
        }
      />
      <Route
        path="/admin/users/:userId"
        element={
          <Require role="Admin">
            <AdminUserDetail />
          </Require>
        }
      />
      <Route
        path="/interface-preview"
        element={
          import.meta.env.DEV ? (
            <Require>
              <InterfacePreview />
            </Require>
          ) : (
            <NotFound />
          )
        }
      />
      <Route
        path="/calendar"
        element={
          <Require>
            <CalendarView />
          </Require>
        }
      />
      <Route
        path="/live"
        element={
          <Require>
            <LiveNow />
          </Require>
        }
      />
      <Route path="/history" element={<NotFound />} />
      <Route path="/certificates" element={<NotFound />} />
      <Route path="/access" element={<Denied />} />
      <Route path="/admin/requests" element={<Denied />} />
      <Route
        path="/organizer/create"
        element={<Navigate to="/organizer/events/new" replace />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
function RegistrationRedirect() {
  const { eventId } = useParams();
  const { user, events, count, isRegistered, register, notify } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  if (!user)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  const event = events.find((e) => e.id === eventId);
  if (!event || event.visibility !== "Published") return <NotFound />;
  const status = registrationEligibility(
    event,
    count(event.id),
    isRegistered(event.id),
  );
  const submit = () => {
    try {
      register(event.id);
      notify("Registration confirmed.");
      navigate("/my-events", { replace: true });
    } catch (err) {
      notify(err.message, "error");
      navigate(`/events/${event.id}`, { replace: true });
    }
  };
  return (
    <Shell>
      <PageHeader
        eyebrow="EVENT REGISTRATION"
        title="Confirm registration"
        description="Review your registration before securing your place."
      />
      <div className="registration-panel">
        <Card>
          <h2>{event.title}</h2>
          <div className="detail-facts">
            <div>
              <CalendarDays size={18} />
              <span>
                <strong>Date</strong>
                {dateTimeText(event.start)}
              </span>
            </div>
            <div>
              <MapPin size={18} />
              <span>
                <strong>Venue</strong>
                {event.venue}
              </span>
            </div>
            <div>
              <Users size={18} />
              <span>
                <strong>Availability</strong>
                {Math.max(0, event.capacity - count(event.id))} places remaining
              </span>
            </div>
            <div>
              <Clock3 size={18} />
              <span>
                <strong>Deadline</strong>
                {dateTimeText(event.deadline)}
              </span>
            </div>
          </div>
          <hr />
          <p className="subtext">{status.reason}</p>
          <div className="actions">
            <Link className="button outline" to={`/events/${eventId}`}>
              Back
            </Link>
            <Button disabled={!status.allowed} onClick={submit}>
              Confirm Registration
            </Button>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
function CalendarView() {
  const { events } = useStore();
  const entries = events
    .filter((e) => e.visibility === "Published")
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  return (
    <>
      <PageHeader
        eyebrow="CAMPUS CALENDAR"
        title="Calendar"
        description="View upcoming published events and registration deadlines."
      />
      <Card>
        <div className="card-heading">
          <h2>Upcoming schedule</h2>
          <Badge tone="info">View only</Badge>
        </div>
        {entries.length ? (
          entries.map((e) => (
            <div key={e.id} className="simple-row">
              <div className="calendar-tile">
                <strong>{new Date(e.start).getDate()}</strong>
                <small>
                  {new Date(e.start)
                    .toLocaleString("en-PH", { month: "short" })
                    .toUpperCase()}
                </small>
              </div>
              <div className="grow">
                <h3>{e.title}</h3>
                <p>
                  {dateTimeText(e.start)}: {e.venue}
                </p>
              </div>
              <Link className="button outline" to={`/events/${e.id}`}>
                View event
              </Link>
            </div>
          ))
        ) : (
          <Empty />
        )}
      </Card>
    </>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppRoutes />
      </StoreProvider>
    </BrowserRouter>
  );
}
