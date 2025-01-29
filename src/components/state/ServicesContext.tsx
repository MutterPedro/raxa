import { createContext } from 'react';
import { BillService } from '../../core/services/BillService';
import { UserService } from '../../core/services/UserService';

interface Services {
  billService: BillService;
  userService: UserService;
}
export const ServicesContext = createContext<Services | undefined>(undefined);
