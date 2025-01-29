import { useContext } from 'react';
import { UserService } from '../../core/services/UserService';
import { ServicesContext } from './ServicesContext';

export const useUserService = (): UserService => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useUserService must be used within a ServicesProvider');
  }
  return context.userService;
};
