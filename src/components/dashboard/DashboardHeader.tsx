import React from 'react';
import { Navbar } from '../layout/Navbar';

interface DashboardHeaderProps {
  user: { name?: string; email?: string } | null;
  onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onLogout }) => {
  return <Navbar user={user} onLogout={onLogout} />;
};
