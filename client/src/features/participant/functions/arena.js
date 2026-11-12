// Keep event selection independent of React and local persistence.
export function getArenaEvents(events, currentTime = new Date()) {
  const published = events.filter((event) => event.visibility === 'Published');
  const liveEvents = published.filter(
    (event) => new Date(event.start) <= currentTime && new Date(event.end) > currentTime,
  );
  const upcomingEvents = published
    .filter((event) => new Date(event.start) > currentTime)
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const featured = liveEvents[0] || upcomingEvents[0] || published[0];

  return {
    published,
    liveEvents,
    featured,
    otherUpcoming: upcomingEvents.filter((event) => event.id !== featured?.id),
    otherLive: liveEvents.filter((event) => event.id !== featured?.id),
  };
}
