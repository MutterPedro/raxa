import { useContext } from 'react';
import { BillService } from '../../core/services/BillService';
import { ServicesContext } from './ServicesContext';

export const useBillService = (): BillService => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useBillService must be used within a ServicesProvider');
  }
  return context.billService;
};
