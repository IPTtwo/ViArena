export const normalizeQuery = value => String(value || '').toLowerCase().trim();
export function filterRegistrations(registrations, users, eventId, query = '', status = 'Registered') {
  return registrations.filter(r => r.eventId === eventId && (status === 'All' || r.status === status))
    .map(r => ({ ...r, member: users.find(u => u.id === r.userId) }))
    .filter(r => r.member && [r.member.name, r.member.email, r.member.studentId].some(value => normalizeQuery(value).includes(normalizeQuery(query))))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
export function filterMembers(users, query = '', role = 'All') {
  const q = normalizeQuery(query);
  return users.filter(u => (role === 'All' || u.roles.includes(role)) && [u.name, u.email, u.studentId].some(v => normalizeQuery(v).includes(q)));
}
