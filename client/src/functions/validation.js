export function registrationEligibility(event, count, registered = false, at = new Date()) {
  if (!event || event.visibility !== 'Published') return { allowed: false, code: 'unavailable', reason: 'This event is not available for registration.' };
  if (registered) return { allowed: false, code: 'registered', reason: 'You are already registered for this event.' };
  if (new Date(event.end) <= at || new Date(event.start) <= at) return { allowed: false, code: 'ended', reason: 'This event has already started or ended.' };
  if (new Date(event.deadline) <= at) return { allowed: false, code: 'closed', reason: 'Registration has closed.' };
  if (count >= Number(event.capacity)) return { allowed: false, code: 'full', reason: 'This event is full.' };
  return { allowed: true, code: 'open', reason: 'Registration is open.' };
}
export function validateEvent(fields, publish = false, registeredCount = 0, at = new Date()) {
  const capacity = Number(fields.capacity);
  if (!Number.isInteger(capacity) || capacity < 1) return 'Capacity must be a positive whole number.';
  if (capacity < registeredCount) return 'Capacity cannot be lower than the confirmed registration count.';
  if (!publish) {
    if (fields.title?.trim() && fields.title.trim().length < 3) return 'Event title must have at least 3 characters.';
    return ''
  }
  if (!fields.title?.trim() || fields.title.trim().length < 3) return 'Enter an event title with at least 3 characters.';
  if (!fields.description?.trim()) return 'Add an event description before publishing.';
  if (!fields.venue?.trim()) return 'Enter an event venue.';
  if (!fields.start || !fields.end || !fields.deadline) return 'Enter the event start, end, and registration deadline.';
  if (!Number.isFinite(new Date(fields.start).getTime()) || !Number.isFinite(new Date(fields.end).getTime()) || !Number.isFinite(new Date(fields.deadline).getTime())) return 'Enter valid event dates.';
  if (new Date(fields.start) >= new Date(fields.end)) return 'Event end time must be after start time.';
  if (new Date(fields.start) <= at) return 'The event start must be in the future when publishing.';
  if (new Date(fields.deadline) > new Date(fields.start)) return 'Registration must close before the event begins.';
  return '';
}
