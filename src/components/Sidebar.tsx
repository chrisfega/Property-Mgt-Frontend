import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Home, Key, FileText, CreditCard, PenTool, LogOut, X, Users as UsersIcon } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tenants', path: '/dashboard/tenants', icon: Users },
    { name: 'Properties', path: '/dashboard/properties', icon: Home },
    { name: 'Landlords', path: '/dashboard/landlords', icon: Key },
    { name: 'Leases', path: '/dashboard/leases', icon: FileText },
    { name: 'Invoices', path: '/dashboard/invoices', icon: CreditCard },
    { name: 'Payments', path: '/dashboard/payments', icon: CreditCard },
    { name: 'Maintenance', path: '/dashboard/maintenance', icon: PenTool },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={clsx(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">PropManage</h1>
            <p className="text-sm text-muted-foreground mt-1">Property Management</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => onClose()} // Close sidebar on mobile when link clicked
                className={clsx(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary border-r-2 border-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
          {user?.role === 'ADMIN' && (
            <Link 
              to="/dashboard/account-management" 
              onClick={() => onClose()}
              className={clsx(
                'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200',
                location.pathname === '/dashboard/account-management'
                  ? 'bg-primary/10 text-primary border-r-2 border-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <UsersIcon className="w-5 h-5 mr-3" />
              Account Management
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};
