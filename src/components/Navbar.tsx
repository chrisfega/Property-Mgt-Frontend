import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, User, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar Placeholder */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-5 h-5 text-muted-foreground" />
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 pl-10 pr-4 text-sm text-foreground bg-accent border-none rounded-md focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-muted-foreground hover:text-foreground relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>

        <div className="flex items-center space-x-3 pl-4 border-l border-border">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-foreground">{user?.fullName}</span>
            <span className="text-xs text-muted-foreground">{user?.role}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
