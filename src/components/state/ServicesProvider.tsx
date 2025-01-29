import React from 'react';
import { billServiceFactory, userServiceFactory } from '../../inversify.config';
import { ServicesContext } from './ServicesContext';

export const ServicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const billService = billServiceFactory();
  const userService = userServiceFactory();

  return <ServicesContext.Provider value={{ billService, userService }}>{children}</ServicesContext.Provider>;
};
