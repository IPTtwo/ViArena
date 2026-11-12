import assert from 'node:assert/strict';
import test from 'node:test';
import { getArenaEvents } from '../src/features/participant/functions/arena.js';

const currentTime = new Date('2026-11-12T12:00:00Z');
const event = (id, start, end, visibility = 'Published') => ({ id, start, end, visibility });

test('empty and draft-only data have no featured event', () => {
  assert.equal(getArenaEvents([], currentTime).featured, undefined);
  const draft = event('draft', '2026-11-12T10:00:00Z', '2026-11-12T14:00:00Z', 'Draft');
  assert.deepEqual(getArenaEvents([draft], currentTime).published, []);
});

test('live events take priority and the featured event is not repeated', () => {
  const live = event('live', '2026-11-12T10:00:00Z', '2026-11-12T14:00:00Z');
  const next = event('next', '2026-11-13T10:00:00Z', '2026-11-13T14:00:00Z');
  const result = getArenaEvents([next, live], currentTime);
  assert.equal(result.featured.id, 'live');
  assert.deepEqual(result.otherLive, []);
  assert.deepEqual(
    result.otherUpcoming.map((item) => item.id),
    ['next'],
  );
});

test('upcoming events are chronological and drafts never appear', () => {
  const later = event('later', '2026-11-15T10:00:00Z', '2026-11-15T14:00:00Z');
  const sooner = event('sooner', '2026-11-13T10:00:00Z', '2026-11-13T14:00:00Z');
  const draft = { ...sooner, id: 'draft', visibility: 'Draft' };
  const result = getArenaEvents([later, draft, sooner], currentTime);
  assert.equal(result.featured.id, 'sooner');
  assert.deepEqual(
    result.otherUpcoming.map((item) => item.id),
    ['later'],
  );
});

test('start is inclusive and end is exclusive for live events', () => {
  const starting = event('starting', currentTime.toISOString(), '2026-11-12T14:00:00Z');
  const ended = event('ended', '2026-11-12T10:00:00Z', currentTime.toISOString());
  assert.deepEqual(
    getArenaEvents([ended, starting], currentTime).liveEvents.map((item) => item.id),
    ['starting'],
  );
});
