import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { GenerateInvoiceModal } from '../components/GenerateInvoiceModal';
import { toast } from 'react-toastify';

interface Invoice {
  id: string;
  tenant: {
    fullName: string;
  };
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';
  type: string;
}

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data.data.invoices);
    } catch (error) {
      console.error('Failed to fetch invoices', error);
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/invoices/${id}`, { status: newStatus });
      toast.success('Invoice status updated');
      fetchInvoices();
    } catch (error: any) {
      console.error('Failed to update invoice status', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSuccess = () => {
    fetchInvoices();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-500/10 text-emerald-500';
      case 'PENDING': return 'bg-orange-500/10 text-orange-500';
      case 'OVERDUE': return 'bg-red-500/10 text-red-500';
      case 'PARTIALLY_PAID': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
        <button 
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Generate Invoice
        </button>
      </div>

      <GenerateInvoiceModal 
        isOpen={isGenerateModalOpen} 
        onClose={() => setIsGenerateModalOpen(false)} 
        onSuccess={handleSuccess} 
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-3">Invoice ID</th>
                <th className="px-6 py-3">Tenant</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.length === 0 && !loading ? (
                 <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        No invoices found. Generate one to get started.
                    </td>
                 </tr>
              ) : (
                invoices.map((invoice) => (
                    <tr key={invoice.id} className="bg-card hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">#{invoice.id.substring(0, 8)}</td>
                      <td className="px-6 py-4 text-foreground">{invoice.tenant?.fullName || 'N/A'}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{invoice.type}</td>
                      <td className="px-6 py-4 text-foreground font-medium">₦{invoice.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        {invoice.status !== 'PAID' && (
                            <button 
                                onClick={() => handleStatusUpdate(invoice.id, 'PAID')}
                                title="Mark as Paid"
                                className="text-emerald-500 hover:text-emerald-600"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </button>
                        )}
                        {invoice.status !== 'CANCELLED' && (
                            <button 
                                onClick={() => handleStatusUpdate(invoice.id, 'CANCELLED')}
                                title="Cancel Invoice"
                                className="text-red-500 hover:text-red-600"
                            >
                                <XCircle className="w-4 h-4" />
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
