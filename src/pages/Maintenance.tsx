import React, { useState, useEffect } from 'react';
import { Plus, Search, Clock } from 'lucide-react';
import api from '../services/api';
import { LogMaintenanceModal } from '../components/LogMaintenanceModal';
import { toast } from 'react-toastify';

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  property: {
    name: string;
  };
  unit?: {
    name: string;
  };
}

export const Maintenance: React.FC = () => {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/maintenance');
      setTickets(response.data.data.tickets);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
      toast.error('Failed to fetch maintenance tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/maintenance/${id}`, { status: newStatus });
      toast.success('Ticket status updated');
      fetchTickets();
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update ticket status');
    }
  };

  const handleSuccess = () => {
    fetchTickets();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'text-blue-500';
      case 'IN_PROGRESS': return 'text-orange-500';
      case 'RESOLVED': return 'text-green-500';
      case 'CLOSED': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/10 text-red-500';
      case 'HIGH': return 'bg-orange-500/10 text-orange-500';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500';
      case 'LOW': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Maintenance</h1>
        <button 
          onClick={() => setIsLogModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Request
        </button>
      </div>

      <LogMaintenanceModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        onSuccess={handleSuccess} 
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search requests..." 
              className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-3">Issue</th>
                <th className="px-6 py-3">Property / Unit</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Date Reported</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tickets.length === 0 && !loading ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No maintenance tickets found.
                    </td>
                 </tr>
              ) : (
                tickets.map((ticket) => (
                    <tr key={ticket.id} className="bg-card hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div>{ticket.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-xs">{ticket.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-foreground">{ticket.property.name}</div>
                        <div className="text-xs text-muted-foreground">{ticket.unit?.name || 'Common Area'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center ${getStatusColor(ticket.status)}`}>
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">{ticket.status.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                            className="bg-secondary border border-border rounded text-xs p-1 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={ticket.status}
                            onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                        >
                            <option value="NEW">New</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>
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
