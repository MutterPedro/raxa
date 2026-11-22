import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';

import User from '../../core/entities/User';
import { useUserService } from '../state/useUserService';

/**
 * Sync-readiness cue (messaging only — sync is backend-less today): logged-out
 * users get a quiet invitation to log in; it disappears on its own once there
 * is a session.
 */
export default function SyncHint() {
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
    // Hide the moment a login lands anywhere in the app, not just on reload.
    const unsubscribe = userService.subscribeLoggedUser(setLoggedUser);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [userService]);

  if (loggedUser) return null;

  return (
    <NavLink
      to="/login"
      end
      data-testid="sync-hint"
      className="inline-flex min-h-11 items-center text-sm text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-brand-700 dark:hover:text-brand-400 focus-ring"
    >
      Faça login para sincronizar
    </NavLink>
  );
}
