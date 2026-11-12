import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useStore } from '../../state/StoreProvider';
import logo from '../../assets/logo.svg';
export function GuestShell({ children }) {
  const { user } = useStore();
  return (
    <>
      <header className="guest-header">
        <Link to="/arena" aria-label="ViArena home">
          <img src={logo} alt="" />
          <strong>ViArena</strong>
        </Link>
        <nav>
          <NavLink to="/arena">Arena</NavLink>
          <Link to="/events">Explore Events</Link>
          {user ? (
            <Link to="/events">My Events Feed</Link>
          ) : (
            <>
              <Link to="/login">Sign In</Link>
              <Link className="button primary" to="/signup">
                Create Account
              </Link>
            </>
          )}
        </nav>
      </header>
      {children}
    </>
  );
}
