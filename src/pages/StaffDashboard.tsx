import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Home, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface StaffDashboardSummary {
  totalTenants: number;
  totalVacantUnits: number;
  openMaintenanceTickets: number;
  pendingLeases: number;
}

export const StaffDashboard: React.FC = () => {
  const [summary, setSummary] = useState<StaffDashboardSummary | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // In a real app, this might be a specific endpoint for staff stats
        // For now, we'll use the main summary or a mock if the backend doesn't support it yet
        // Assuming the backend returns a generic summary we can pick from, or we mock it for now
        // since the backend might not have a dedicated staff summary endpoint yet.
        // Let's try to fetch the main summary and adapt, or default to 0s.
        const response = await api.get('/reports/dashboard/summary');
        const data = response.data.data.summary;
        setSummary({
            totalTenants: data.totalTenants || 0,
            totalVacantUnits: data.totalVacantUnits || 0,
            openMaintenanceTickets: 5, // Mocking for now as it might not be in the main summary
            pendingLeases: 2 // Mocking
        });
      } catch (error) {
        console.error('Failed to fetch staff dashboard summary', error);
        // Fallback mock data for demonstration if endpoint fails or doesn't exist
        setSummary({
            totalTenants: 12,
            totalVacantUnits: 3,
            openMaintenanceTickets: 5,
            pendingLeases: 2
        });
      }
    };

    fetchSummary();
  }, []);

  if (!summary) {
    return null;
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of daily operations and tasks.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Open Maintenance" 
          value={summary.openMaintenanceTickets} 
          icon={AlertCircle} 
          color="bg-red-500" 
        />
        <StatCard 
          title="Vacant Units" 
          value={summary.totalVacantUnits} 
          icon={Home} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Active Tenants" 
          value={summary.totalTenants} 
          icon={Users} 
          color="bg-primary" 
        />
        <StatCard 
          title="Pending Leases" 
          value={summary.pendingLeases} 
          icon={Clock} 
          color="bg-blue-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Priority Tasks</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-3 hover:bg-accent/50 rounded-lg transition-colors">
                <div className="bg-red-500/10 p-2 rounded-full text-red-500 mt-1">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Urgent: Water Leak</p>
                  <p className="text-xs text-muted-foreground">Unit 4B - Reported 1h ago</p>
                </div>
            </div>
             <div className="flex items-start space-x-4 p-3 hover:bg-accent/50 rounded-lg transition-colors">
                <div className="bg-blue-500/10 p-2 rounded-full text-blue-500 mt-1">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Lease Renewal Review</p>
                  <p className="text-xs text-muted-foreground">Tenant: John Doe - Expires in 30 days</p>
                </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Recent Maintenance Updates</h3>
          </div>
          <div className="space-y-4">
             <div className="flex items-start space-x-4 p-3 hover:bg-accent/50 rounded-lg transition-colors">
                <div className="bg-green-500/10 p-2 rounded-full text-green-500 mt-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">AC Repair Completed</p>
                  <p className="text-xs text-muted-foreground">Unit 12A - Resolved by Tech</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
