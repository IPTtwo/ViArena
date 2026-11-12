import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../../state/StoreProvider';
import logo from '../../logo.svg';
export function GuestShell({ children }) {
  const { user } = useStore();
  return <>
    <header className="guest-header">
      <Link to={user ? '/profile' : '/login'} aria-label={user ? 'Open my profile' : 'Sign in to ViArena'}><img src={logo} alt="" /><strong>ViArena</strong></Link>
      <nav>
        <Link to="/events">Explore Events</Link>{user ? <Link to="/events">My Events Feed</Link> : <>
          <Link to="/login">Sign In</Link>
          <Link className="button primary" to="/signup">Create Account</Link>
        </>}
      </nav>
    </header>{children}
  </>;
}
