import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { useStore } from '../../../state/StoreProvider';
import { GuestShell } from '../../../components';

export function Landing() {
  const { user } = useStore();
  const destination = user ? '/events' : '/signup';
  const ctaLabel = user ? 'Explore events' : 'Create an account';

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
              Explore events
              <ArrowRight size={18} />
            </Link>
            <Link className="button outline white-outline" to={destination}>
              {ctaLabel}
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
