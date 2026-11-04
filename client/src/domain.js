// Shared frontend rules. Mirror and enforce every permission on the Express API.
export const normalizedEmail = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
export const validSchoolEmail = (value) =>
  /^[^@\s]+@adnu\.edu\.ph$/i.test(normalizedEmail(value));
export const hasRole = (actor, role) => !!actor?.roles?.includes(role);
export const canCreateEvent = (actor) =>
  hasRole(actor, "Organizer") || hasRole(actor, "Admin");
export const isEventOwner = (event, actor) =>
  !!event &&
  !!actor &&
  event.ownerId === actor.id &&
  hasRole(actor, "Organizer");
export const scopedPermission = (event, actor, permission) =>
  !!event &&
  !!actor &&
  !!event.coOrganizers?.some(
    (c) => c.userId === actor.id && c.permissions?.includes(permission),
  );
export const canManageEvent = (event, actor) =>
  !!event &&
  (hasRole(actor, "Admin") ||
    isEventOwner(event, actor) ||
    scopedPermission(event, actor, "manage_event"));
export const canManageRegistrations = (event, actor) =>
  !!event &&
  (hasRole(actor, "Admin") ||
    isEventOwner(event, actor) ||
    scopedPermission(event, actor, "manage_registrations"));
export const canViewPrivateEvent = (event, actor) =>
  !!event &&
  (event.visibility === "Published" ||
    canManageEvent(event, actor) ||
    canManageRegistrations(event, actor));
export function registrationEligibility(
  event,
  count,
  registered = false,
  at = new Date(),
) {
  if (!event || event.visibility !== "Published")
    return {
      allowed: false,
      code: "unavailable",
      reason: "This event is not available for registration.",
    };
  if (registered)
    return {
      allowed: false,
      code: "registered",
      reason: "You are already registered for this event.",
    };
  if (new Date(event.end) <= at || new Date(event.start) <= at)
    return {
      allowed: false,
      code: "ended",
      reason: "This event has already started or ended.",
    };
  if (new Date(event.deadline) <= at)
    return {
      allowed: false,
      code: "closed",
      reason: "Registration has closed.",
    };
  if (count >= Number(event.capacity))
    return { allowed: false, code: "full", reason: "This event is full." };
  return { allowed: true, code: "open", reason: "Registration is open." };
}
export function validateEvent(
  fields,
  publish = false,
  registeredCount = 0,
  at = new Date(),
) {
  const capacity = Number(fields.capacity);
  if (!Number.isInteger(capacity) || capacity < 1)
    return "Capacity must be a positive whole number.";
  if (capacity < registeredCount)
    return "Capacity cannot be lower than the confirmed registration count.";
  if (!publish) {
    if (fields.title?.trim() && fields.title.trim().length < 3)
      return "Event title must have at least 3 characters.";
    return "";
  }
  if (!fields.title?.trim() || fields.title.trim().length < 3)
    return "Enter an event title with at least 3 characters.";
  if (!fields.description?.trim())
    return "Add an event description before publishing.";
  if (!fields.venue?.trim()) return "Enter an event venue.";
  if (!fields.start || !fields.end || !fields.deadline)
    return "Enter the event start, end, and registration deadline.";
  if (
    !Number.isFinite(new Date(fields.start).getTime()) ||
    !Number.isFinite(new Date(fields.end).getTime()) ||
    !Number.isFinite(new Date(fields.deadline).getTime())
  )
    return "Enter valid event dates.";
  if (new Date(fields.start) >= new Date(fields.end))
    return "Event end time must be after start time.";
  if (new Date(fields.start) <= at)
    return "The event start must be in the future when publishing.";
  if (new Date(fields.deadline) > new Date(fields.start))
    return "Registration must close before the event begins.";
  return "";
}

// VIA-207 and VIA-208: pure filtering functions for testable management views.
export const normalizeQuery = (value) =>
  String(value || "")
    .toLowerCase()
    .trim();
export function filterRegistrations(
  registrations,
  users,
  eventId,
  query = "",
  status = "Registered",
) {
  return registrations
    .filter(
      (r) => r.eventId === eventId && (status === "All" || r.status === status),
    )
    .map((r) => ({ ...r, member: users.find((u) => u.id === r.userId) }))
    .filter(
      (r) =>
        r.member &&
        [r.member.name, r.member.email, r.member.studentId].some((value) =>
          normalizeQuery(value).includes(normalizeQuery(query)),
        ),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
export function filterMembers(users, query = "", role = "All") {
  const q = normalizeQuery(query);
  return users.filter(
    (u) =>
      (role === "All" || u.roles.includes(role)) &&
      [u.name, u.email, u.studentId].some((v) => normalizeQuery(v).includes(q)),
  );
}
export function canAssignOrganizer(actor, target, events, enabled) {
  if (!hasRole(actor, "Admin"))
    return { allowed: false, reason: "Admin permission required." };
  if (!target || hasRole(target, "Admin"))
    return { allowed: false, reason: "This account cannot be changed." };
  if (actor.id === target.id)
    return { allowed: false, reason: "You cannot change your own role." };
  if (!enabled && events.some((e) => e.ownerId === target.id))
    return {
      allowed: false,
      reason: "Reassign owned events before revoking Organizer access.",
    };
  return { allowed: true, reason: "" };
}
