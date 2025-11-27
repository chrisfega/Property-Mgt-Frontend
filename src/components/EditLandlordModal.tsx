import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const landlordSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
});

type LandlordFormData = z.infer<typeof landlordSchema>;

interface EditLandlordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  landlord: any;
}

export const EditLandlordModal: React.FC<EditLandlordModalProps> = ({ isOpen, onClose, onSuccess, landlord }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LandlordFormData>({
    resolver: zodResolver(landlordSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    if (landlord) {
      reset({
        fullName: landlord.fullName,
        email: landlord.email,
        phone: landlord.phone || landlord.phoneNumber // Handle both cases just in case
      });
    }
  }, [landlord, reset]);

  const onSubmit = async (data: LandlordFormData) => {
    try {
      await api.patch(`/landlords/${landlord.id}`, data);
      toast.success('Landlord updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to update landlord', error);
      toast.error(error.response?.data?.message || 'Failed to update landlord');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Edit Landlord</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <input
              type="text"
              {...register('fullName')}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Jane Doe"
            />
            {errors.fullName && <p className="text-destructive text-xs">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="jane@example.com"
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone Number</label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="+1 234 567 890"
            />
            {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
