import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const leaseSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().min(1, 'Unit is required'),
  tenantId: z.string().min(1, 'Tenant is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  rentAmount: z.number().min(0, 'Rent amount must be positive'),
  paymentFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
});

type LeaseFormData = z.infer<typeof leaseSchema>;

interface CreateLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateLeaseModal: React.FC<CreateLeaseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema),
  });

  const selectedPropertyId = watch('propertyId');

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      fetchTenants();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPropertyId) {
      const property = properties.find(p => p.id === selectedPropertyId);
      if (property) {
        setUnits(property.units || []);
      } else {
        setUnits([]);
      }
    }
  }, [selectedPropertyId, properties]);

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties');
      setProperties(response.data.data.properties);
    } catch (error) {
      console.error('Failed to fetch properties', error);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data.data.tenants);
    } catch (error) {
      console.error('Failed to fetch tenants', error);
    }
  };

  const onSubmit = async (data: LeaseFormData) => {
    try {
      await api.post('/leases', data);
      toast.success('Lease created successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to create lease', error);
      toast.error(error.response?.data?.message || 'Failed to create lease');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Create New Lease</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Property</label>
            <select
              {...register('propertyId')}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select Property</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.propertyId && <p className="text-destructive text-xs">{errors.propertyId.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Unit</label>
            <select
              {...register('unitId')}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={!selectedPropertyId}
            >
              <option value="">Select Unit</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            {errors.unitId && <p className="text-destructive text-xs">{errors.unitId.message}</p>}
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.startDate && <p className="text-destructive text-xs">{errors.startDate.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">End Date</label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {errors.endDate && <p className="text-destructive text-xs">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Rent Amount</label>
            <input
              type="number"
              {...register('rentAmount', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="0.00"
            />
            {errors.rentAmount && <p className="text-destructive text-xs">{errors.rentAmount.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Payment Frequency</label>
            <select
              {...register('paymentFrequency')}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="YEARLY">Yearly</option>
            </select>
            {errors.paymentFrequency && <p className="text-destructive text-xs">{errors.paymentFrequency.message}</p>}
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
              {isSubmitting ? 'Create Lease' : 'Create Lease'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
