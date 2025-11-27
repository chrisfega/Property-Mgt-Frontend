import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const invoiceSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  type: z.enum(['RENT', 'UTILITY', 'MAINTENANCE', 'OTHER']).default('RENT'),
  description: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tenants, setTenants] = useState<any[]>([]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      type: 'RENT'
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchTenants();
    }
  }, [isOpen]);

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data.data.tenants);
    } catch (error) {
      console.error('Failed to fetch tenants', error);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      await api.post('/invoices', data);
      toast.success('Invoice generated successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to generate invoice', error);
      toast.error(error.response?.data?.message || 'Failed to generate invoice');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Generate Invoice</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tenant</label>
            <select
              {...register('tenantId')}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select Tenant</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
            {errors.tenantId && <p className="text-destructive text-xs">{errors.tenantId.message}</p>}
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
            <label className="text-sm font-medium text-foreground">Due Date</label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {errors.dueDate && <p className="text-destructive text-xs">{errors.dueDate.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Type</label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="RENT">Rent</option>
              <option value="UTILITY">Utility</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.type && <p className="text-destructive text-xs">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description (Optional)</label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
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
              {isSubmitting ? 'Generate' : 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
