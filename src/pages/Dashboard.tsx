import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { StaffDashboard } from './StaffDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'STAFF') {
    return <StaffDashboard />;
  }

  return <AdminDashboard />;
};

