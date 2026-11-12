// Shared frontend rules. Mirror and enforce every permission on the Express API.
export const normalizedEmail = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();
export const validSchoolEmail = (value) => /^[^@\s]+@adnu\.edu\.ph$/i.test(normalizedEmail(value));
export const hasRole = (actor, role) => !!actor?.roles?.includes(role);
export const canCreateEvent = (actor) => hasRole(actor, 'Organizer') || hasRole(actor, 'Admin');
export const isEventOwner = (event, actor) =>
  !!event && !!actor && event.ownerId === actor.id && hasRole(actor, 'Organizer');
export const scopedPermission = (event, actor, permission) =>
  !!event &&
  !!actor &&
  !!event.coOrganizers?.some((c) => c.userId === actor.id && c.permissions?.includes(permission));
export const canManageEvent = (event, actor) =>
  !!event &&
  (hasRole(actor, 'Admin') ||
    isEventOwner(event, actor) ||
    scopedPermission(event, actor, 'manage_event'));
export const canManageRegistrations = (event, actor) =>
  !!event &&
  (hasRole(actor, 'Admin') ||
    isEventOwner(event, actor) ||
    scopedPermission(event, actor, 'manage_registrations'));
export const canViewPrivateEvent = (event, actor) =>
  !!event &&
  (event.visibility === 'Published' ||
    canManageEvent(event, actor) ||
    canManageRegistrations(event, actor));
export function canAssignOrganizer(actor, target, events, enabled) {
  if (!hasRole(actor, 'Admin')) return { allowed: false, reason: 'Admin permission required.' };
  if (!target || hasRole(target, 'Admin'))
    return { allowed: false, reason: 'This account cannot be changed.' };
  if (actor.id === target.id) return { allowed: false, reason: 'You cannot change your own role.' };
  if (!enabled && events.some((e) => e.ownerId === target.id))
    return { allowed: false, reason: 'Reassign owned events before revoking Organizer access.' };
  return { allowed: true, reason: '' };
}
