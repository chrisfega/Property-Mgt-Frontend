import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Home, Key, DollarSign, AlertCircle, TrendingUp, Activity } from 'lucide-react';

interface DashboardSummary {
  totalProperties: number;
  totalUnits: number;
  totalOccupiedUnits: number;
  totalVacantUnits: number;
  totalTenants: number;
  totalLandlords: number;
  totalRentDueThisMonth: number;
  totalRentCollectedThisMonth: number;
  totalOverdueAmount: number;
}

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/reports/dashboard/summary');
        setSummary(response.data.data.summary);
      } catch (error) {
        console.error('Failed to fetch dashboard summary', error);
      }
    };

    fetchSummary();
  }, []);

  if (!summary) {
    return null;
  }

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <div className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </div>
        )}
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
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening with your properties.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Properties" 
          value={summary.totalProperties} 
          icon={Home} 
          color="bg-blue-500"
          trend="+2.5%" 
        />
        <StatCard 
          title="Occupancy Rate" 
          value={`${Math.round((summary.totalOccupiedUnits / (summary.totalUnits || 1)) * 100)}%`} 
          icon={Users} 
          color="bg-primary/100"
          trend="+5%" 
        />
        <StatCard 
          title="Total Tenants" 
          value={summary.totalTenants} 
          icon={Users} 
          color="bg-stone-500" 
        />
        <StatCard 
          title="Total Landlords" 
          value={summary.totalLandlords} 
          icon={Key} 
          color="bg-amber-600" 
        />
        <StatCard 
          title="Rent Collected (Month)" 
          value={`₦${summary.totalRentCollectedThisMonth.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-emerald-500"
          trend="+12%" 
        />
        <StatCard 
          title="Overdue Amount" 
          value={`₦${summary.totalOverdueAmount.toLocaleString()}`} 
          icon={AlertCircle} 
          color="bg-red-500" 
        />
      </div>

      {/* Recent Activity Section (Mock Data for Visuals) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            <button className="text-sm text-primary hover:text-primary/80">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-4 p-3 hover:bg-accent/50 rounded-lg transition-colors">
                <div className="bg-primary/10 p-2 rounded-full text-primary mt-1">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">New Lease Signed</p>
                  <p className="text-xs text-muted-foreground">Unit 4B at Sunset Apartments</p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Maintenance Requests</h3>
            <button className="text-sm text-primary hover:text-primary/80">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start space-x-4 p-3 hover:bg-accent/50 rounded-lg transition-colors">
                <div className="bg-orange-500/10 p-2 rounded-full text-primary mt-1">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Leaking Faucet</p>
                  <p className="text-xs text-muted-foreground">Unit 12A - High Priority</p>
                  <p className="text-xs text-muted-foreground mt-1">Pending Action</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
