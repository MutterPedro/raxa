import { useEffect, useState } from 'react';
import { useUserService } from '../state/useUserService';
import User from '../../core/entities/User';
import Avatar from '../common/Avatar';
import { NavLink } from 'react-router';

export default function LoginButton() {
  const userService = useUserService();
  const [loggedUser, setLoggedUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;
    userService
      .getLoggedUser()
      .then((user) => {
        if (active) setLoggedUser(user);
      })
      .catch(console.error);
    // The header outlives route changes, so follow logins that happen elsewhere.
    const unsubscribe = userService.subscribeLoggedUser(setLoggedUser);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [userService]);

  return loggedUser ? (
    <Avatar user={loggedUser} />
  ) : (
    <NavLink
      to="/login"
      end
      data-testid="header-login-link"
      className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-brand-50 hover:text-white focus-ring"
    >
      Entrar
      {/* Inline SVG instead of '→' text: U+2192 is outside the Plus Jakarta Sans
          subsets, so a text arrow renders from a system fallback font and differs
          per OS. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-1 h-3.5 w-3.5"
      >
        <path d="M4 12h16m-6-7 7 7-7 7" />
      </svg>
    </NavLink>
  );
}
