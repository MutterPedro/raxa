import React, { createContext, useContext } from 'react';
import { BillService } from '../../core/services/BillService';
import { billServiceFactory } from '../../inversify.config';

const BillServiceContext = createContext<BillService | undefined>(undefined);

export const BillServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const billService = billServiceFactory();

  return <BillServiceContext.Provider value={billService}>{children}</BillServiceContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBillService = (): BillService => {
  const context = useContext(BillServiceContext);
  if (context === undefined) {
    throw new Error('useBillService must be used within a BillServiceProvider');
  }
  return context;
};
