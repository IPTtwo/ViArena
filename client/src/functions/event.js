export const now = () => new Date();
export function eventStatus(e, count = 0) {
  if (new Date(e.end) <= now()) return { text: 'Ended', tone: 'neutral', open: false };
  if (new Date(e.start) <= now())
    return { text: 'Registration Closed', tone: 'neutral', open: false };
  if (new Date(e.deadline) <= now())
    return { text: 'Registration Closed', tone: 'neutral', open: false };
  if (count >= e.capacity) return { text: 'Full', tone: 'warning', open: false };
  return { text: 'Registration Open', tone: 'success', open: true };
}
