import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const propertySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  description: z.string().optional(),
  type: z.enum(['APARTMENT', 'DUPLEX', 'OFFICE', 'SHOP', 'SHORT_LET', 'OTHER']),
  landlordId: z.string().min(1, 'Landlord is required'),
  units: z.array(z.object({
    name: z.string().min(1, 'Unit name is required'),
    monthlyRentAmount: z.number().min(0, 'Rent must be positive'),
    status: z.enum(['VACANT', 'OCCUPIED', 'RESERVED', 'UNDER_MAINTENANCE']).optional(),
  })).optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [landlords, setLandlords] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      units: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "units",
  });

  useEffect(() => {
    if (isOpen) {
      fetchLandlords();
    }
  }, [isOpen]);

  const fetchLandlords = async () => {
    try {
      const response = await api.get('/landlords');
      setLandlords(response.data.data.landlords);
    } catch (error) {
      console.error('Failed to fetch landlords', error);
      toast.error('Failed to fetch landlords');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append all simple form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'units' && value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      });

      // Append units as JSON string
      if (data.units && data.units.length > 0) {
        formData.append('units', JSON.stringify(data.units));
      }
      
      // Append image if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.post('/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Property created successfully!');
      reset();
      setImageFile(null);
      setImagePreview(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to create property', error);
      toast.error(error.response?.data?.message || 'Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-2xl font-bold text-foreground">Add New Property</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Property Details</h3>
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Property Image</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-32 h-32">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary bg-secondary/20">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-2">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Property Name */}
              <div>
                <label className="block text-sm font-medium text-foreground">Property Name*</label>
                <input
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-border bg-secondary/50 shadow-sm focus:border-primary focus:ring-primary p-2 border text-foreground"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Address Line 1*</label>
                  <input
                    {...register('addressLine1')}
                    className="mt-1 block w-full rounded-md border-border bg-secondary/50 shadow-sm focus:border-primary focus:ring-primary p-2 border text-foreground"
                  />
                  {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Address Line 2</label>
                  <input
                    {...register('addressLine2')}
                    className="mt-1 block w-full rounded-md border-border bg-secondary/50 shadow-sm focus:border-primary focus:ring-primary p-2 border text-foreground"
                  />
                </div>
              </div>

              {/* City, State, Country */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">City*</label>
                  <input
                    {...register('city')}
                    className="mt-1 block w-full rounded-md border-border bg-secondary/50 shadow-sm focus:border-primary focus:ring-primary p-2 border text-foreground"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">State*</label>
                  <input
                    {...register('state')}
                    className="mt-1 block w-full rounded-md border-border bg-secondary/50 shadow-sm focus:border-primary focus:ring-primary p-2 border text-foreground"
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Country*</label>
                  <input
                    {...register('country')}
                    className="mt-1 block w-full rounded-md border-border bg-secondary/50 shadow-sm focus:border-primary focus:ring-primary p-2 border text-foreground"
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                </div>
              </div>

              {/* Type and Landlord */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Type*</label>
                  <select
                    {...register('type')}
                    className="mt-1 block w-full rounded-md border-border bg-secondary/50 shadow-sm focus:border-primary focus:ring-primary p-2 border text-foreground"
                  >
                    <option value="">Select type</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="DUPLEX">Duplex</option>
                    <option value="OFFICE">Office</option>
                    <option value="SHOP">Shop</option>
                    <option value="SHORT_LET">Short Let</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Landlord*</label>
                  <select
                    {...register('landlordId')}
                    className="mt-1 block w-full rounded-md border-border bg-secondary/50 shadow-sm focus:border-primary focus:ring-primary p-2 border text-foreground"
                  >
                    <option value="">Select landlord</option>
                    {landlords.map((landlord) => (
                      <option key={landlord.id} value={landlord.id}>
                        {landlord.fullName}
                      </option>
                    ))}
                  </select>
                  {errors.landlordId && <p className="text-red-500 text-xs mt-1">{errors.landlordId.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-border bg-secondary/50 shadow-sm focus:border-primary focus:ring-primary p-2 border text-foreground"
                />
              </div>
            </div>

            {/* Right Column: Units */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h3 className="text-lg font-medium text-foreground">Units</h3>
                <button
                  type="button"
                  onClick={() => append({ name: '', monthlyRentAmount: 0, status: 'VACANT' })}
                  className="flex items-center text-sm text-primary hover:text-primary/80"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Unit
                </button>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="bg-secondary/20 p-4 rounded-lg border border-border relative">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-foreground">Unit Name/Number</label>
                        <input
                          {...register(`units.${index}.name`)}
                          placeholder="e.g. Flat 1A"
                          className="mt-1 block w-full rounded-md border-border bg-secondary/50 shadow-sm focus:border-primary focus:ring-primary p-2 border text-sm text-foreground"
                        />
                        {errors.units?.[index]?.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.units[index]?.name?.message}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-foreground">Monthly Rent</label>
                          <input
                            type="number"
                            {...register(`units.${index}.monthlyRentAmount`, { valueAsNumber: true })}
                            className="mt-1 block w-full rounded-md border-border bg-secondary/50 shadow-sm focus:border-primary focus:ring-primary p-2 border text-sm text-foreground"
                          />
                          {errors.units?.[index]?.monthlyRentAmount && (
                            <p className="text-red-500 text-xs mt-1">{errors.units[index]?.monthlyRentAmount?.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground">Status</label>
                          <select
                            {...register(`units.${index}.status`)}
                            className="mt-1 block w-full rounded-md border-border bg-secondary/50 shadow-sm focus:border-primary focus:ring-primary p-2 border text-sm text-foreground"
                          >
                            <option value="VACANT">Vacant</option>
                            <option value="OCCUPIED">Occupied</option>
                            <option value="RESERVED">Reserved</option>
                            <option value="UNDER_MAINTENANCE">Maintenance</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {fields.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-lg border border-dashed border-border">
                    <p>No units added yet.</p>
                    <p className="text-sm">Click "Add Unit" to start adding units to this property.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
