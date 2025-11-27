import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { CreateLeaseModal } from '../components/CreateLeaseModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { toast } from 'react-toastify';

interface Lease {
  id: string;
  tenant: {
    fullName: string;
  };
  unit: {
    name: string;
    property: {
      name: string;
    };
  };
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: 'ACTIVE' | 'TERMINATED' | 'EXPIRED';
  paymentFrequency: string;
}

export const Leases: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
  const [isTerminating, setIsTerminating] = useState(false);

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    try {
      const response = await api.get('/leases');
      setLeases(response.data.data.leases);
    } catch (error) {
      console.error('Failed to fetch leases', error);
      toast.error('Failed to fetch leases');
    } finally {
      setLoading(false);
    }
  };

  const confirmTerminate = (id: string) => {
    setSelectedLeaseId(id);
    setIsTerminateModalOpen(true);
  };

  const handleTerminate = async () => {
    if (!selectedLeaseId) return;
    
    setIsTerminating(true);
    try {
      await api.post(`/leases/${selectedLeaseId}/terminate`);
      toast.success('Lease terminated successfully');
      fetchLeases();
      setIsTerminateModalOpen(false);
    } catch (error: any) {
      console.error('Failed to terminate lease', error);
      toast.error(error.response?.data?.message || 'Failed to terminate lease');
    } finally {
      setIsTerminating(false);
      setSelectedLeaseId(null);
    }
  };

  const handleSuccess = () => {
    fetchLeases();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Leases</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Lease
        </button>
      </div>

      <CreateLeaseModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={handleSuccess} 
      />

      <ConfirmationModal
        isOpen={isTerminateModalOpen}
        onClose={() => setIsTerminateModalOpen(false)}
        onConfirm={handleTerminate}
        title="Terminate Lease"
        message="Are you sure you want to terminate this lease? This action cannot be undone and will mark the unit as vacant."
        confirmText="Terminate"
        type="danger"
        isLoading={isTerminating}
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search leases..." 
              className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-3">Property / Unit</th>
                <th className="px-6 py-3">Tenant</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Rent</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leases.length === 0 && !loading ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No leases found. Create one to get started.
                    </td>
                 </tr>
              ) : (
                leases.map((lease) => (
                    <tr key={lease.id} className="bg-card hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{lease.unit.property.name}</div>
                        <div className="text-xs text-muted-foreground">{lease.unit.name}</div>
                      </td>
                      <td className="px-6 py-4 text-foreground">{lease.tenant.fullName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-2" />
                          {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        ₦{lease.rentAmount.toLocaleString()}/{lease.paymentFrequency.toLowerCase().replace('ly', '')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          lease.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 
                          lease.status === 'TERMINATED' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {lease.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {lease.status === 'ACTIVE' && (
                            <button 
                                onClick={() => confirmTerminate(lease.id)}
                                className="text-destructive hover:text-destructive/80 font-medium text-xs flex items-center"
                            >
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Terminate
                            </button>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
