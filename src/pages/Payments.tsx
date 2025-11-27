import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';

// --- Record Payment Modal Component ---

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  method: z.enum(['BANK_TRANSFER', 'CASH', 'CARD', 'OTHER']),
  reference: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: 'BANK_TRANSFER'
    }
  });

  const selectedInvoiceId = watch('invoiceId');

  useEffect(() => {
    if (isOpen) {
      fetchPendingInvoices();
    }
  }, [isOpen]);

  // When invoice is selected, auto-fill the amount with the remaining balance
  useEffect(() => {
      if (selectedInvoiceId) {
          const invoice = invoices.find(inv => inv.id === selectedInvoiceId);
          if (invoice) {
              setValue('amount', invoice.amount); // Simplification: assuming full amount for MVP
          }
      }
  }, [selectedInvoiceId, invoices, setValue]);

  const fetchPendingInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      console.log('Invoices response:', response.data); // Debug log
      // Filter for unpaid invoices
      const pending = response.data.data.invoices.filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'CANCELLED');
      console.log('Pending invoices:', pending); // Debug log
      setInvoices(pending);
      
      if (pending.length === 0) {
        toast.info('No pending invoices found. Create an invoice first.');
      }
    } catch (error: any) {
      console.error('Failed to fetch invoices', error);
      toast.error(error.response?.data?.message || 'Failed to fetch invoices. Please try again.');
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await api.post('/payments', data);
      toast.success('Payment recorded successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to record payment', error);
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Record Payment</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Invoice</label>
            <select
              {...register('invoiceId')}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select Invoice</option>
              {invoices.map(inv => (
                <option key={inv.id} value={inv.id}>
                    #{inv.id.substring(0, 8)} - {inv.tenant?.fullName} (₦{inv.amount})
                </option>
              ))}
            </select>
            {errors.invoiceId && <p className="text-destructive text-xs">{errors.invoiceId.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Amount</label>
            <input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="0.00"
            />
            {errors.amount && <p className="text-destructive text-xs">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Payment Method</label>
            <select
              {...register('method')}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.method && <p className="text-destructive text-xs">{errors.method.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Reference / Note</label>
            <input
              type="text"
              {...register('reference')}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Transaction ID, Receipt No, etc."
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main Payments Page Component ---

interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  invoice: {
    id: string;
    tenant: {
      fullName: string;
    };
    unit: {
      name: string;
      property: {
        name: string;
      }
    }
  };
}

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data.data.payments);
    } catch (error) {
      console.error('Failed to fetch payments', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchPayments();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Payments</h1>
        <button 
          onClick={() => setIsRecordModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Record Payment
        </button>
      </div>

      <RecordPaymentModal 
        isOpen={isRecordModalOpen} 
        onClose={() => setIsRecordModalOpen(false)} 
        onSuccess={handleSuccess} 
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search payments..." 
              className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button className="flex items-center px-3 py-2 border border-border rounded-lg hover:bg-secondary/50 transition-colors text-sm font-medium text-foreground">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Tenant</th>
                <th className="px-6 py-3">Property / Unit</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.length === 0 && !loading ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No payments recorded yet.
                    </td>
                 </tr>
              ) : (
                payments.map((payment) => (
                    <tr key={payment.id} className="bg-card hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {payment.invoice?.tenant?.fullName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                         {payment.invoice?.unit?.property?.name} - {payment.invoice?.unit?.name}
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">
                        ₦{payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary text-foreground">
                          {payment.method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                        {payment.reference || '-'}
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
