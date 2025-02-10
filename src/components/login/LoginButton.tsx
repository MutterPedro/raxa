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

  return (
    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
      {self?.logged_in ? (
        <Avatar user={self!} />
      ) : (
        <NavLink to="/login" end className="text-sm font-semibold leading-6">
          Log in <span aria-hidden="true">&rarr;</span>
        </NavLink>
      )}
    </div>
  );
}
