import { useEffect, useState } from 'react';
import { useUserService } from '../state/useUserService';
import User from '../../core/entities/User';
import Avatar from '../common/Avatar';
import { NavLink } from 'react-router';

export default function LoginButton() {
  const userService = useUserService();
  const [self, setSelf] = useState<User | null>(null);

  useEffect(() => {
    userService.createSelf().then(setSelf).catch(console.error);
  }, [userService]);

  return self?.logged_in ? (
    <Avatar user={self!} />
  ) : (
    <NavLink
      to="/login"
      end
      data-testid="header-login-link"
      className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-brand-50 hover:text-white focus-ring"
    >
      Entrar <span aria-hidden="true">&rarr;</span>
    </NavLink>
  );
}
