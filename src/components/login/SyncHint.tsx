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
  const [self, setSelf] = useState<User | null>(null);

  useEffect(() => {
    userService.createSelf().then(setSelf).catch(console.error);
  }, [userService]);

  if (self?.logged_in) return null;

  return (
    <NavLink
      to="/login"
      end
      data-testid="sync-hint"
      className="text-sm text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-brand-700 dark:hover:text-brand-400"
    >
      Faça login para sincronizar
    </NavLink>
  );
}
