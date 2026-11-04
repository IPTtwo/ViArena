import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Check,
  ChevronRight,
  Clock3,
  Plus,
  Search,
  Shield,
} from "lucide-react";
import { useStore } from "../../store";
import { categories } from "../../data";
import { canCreateEvent, validateEvent } from "../../domain";
import {
  Badge,
  Button,
  Card,
  Confirm,
  dateTimeText,
  Empty,
  Field,
  GuestShell,
  PageHeader,
} from "../../ui";

const now = () => new Date();
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

export { EventEditor, OrganizerDashboard, OrganizerEvents };
