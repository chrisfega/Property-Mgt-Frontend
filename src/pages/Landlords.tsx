import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Search, Mail, Phone } from 'lucide-react';

import { AddLandlordModal } from '../components/AddLandlordModal';

export const Landlords: React.FC = () => {
  const [landlords, setLandlords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchLandlords();
  }, []);

  const fetchLandlords = async () => {
    try {
      const response = await api.get('/landlords');
      setLandlords(response.data.data.landlords);
    } catch (error) {
      console.error('Failed to fetch landlords', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Landlords</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Landlord
        </button>
      </div>

      <AddLandlordModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchLandlords} 
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search landlords..." 
              className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Contact Info</th>
                <th className="px-6 py-3">Properties</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {landlords.map((landlord) => (
                <tr key={landlord.id} className="bg-card hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{landlord.fullName}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="w-3 h-3 mr-2" />
                        {landlord.email}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="w-3 h-3 mr-2" />
                        {landlord.phoneNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {landlord.properties?.length || 0} Properties
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary hover:text-primary/80 font-medium">View</button>
                  </td>
                </tr>
              ))}
              {landlords.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No landlords found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
