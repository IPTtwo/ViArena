import React, { useState } from 'react';
import { Gamepad2, Trophy, Palette, GraduationCap, Users } from 'lucide-react';

export function EventPoster({ event }) {
  const [failed, setFailed] = useState(false);
  const Icon =
    { Esports: Gamepad2, Sports: Trophy, Arts: Palette, Academic: GraduationCap }[event.category] ||
    Users;
  return (
    <div className="arena-poster">
      {event.cover && !failed ? (
        <img src={event.cover} alt={`Poster for ${event.title}`} onError={() => setFailed(true)} />
      ) : (
        <div className="arena-poster-fallback">
          <Icon size={72} strokeWidth={1.25} aria-hidden="true" />
          <span>{event.category}</span>
          <strong>{event.title}</strong>
        </div>
      )}
    </div>
  );
}
