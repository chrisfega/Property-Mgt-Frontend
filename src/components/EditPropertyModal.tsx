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

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  property: any;
}

export const EditPropertyModal: React.FC<EditPropertyModalProps> = ({ isOpen, onClose, onSuccess, property }) => {
  const [landlords, setLandlords] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(property?.imageUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors }, reset, setValue } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
        ...property,
        units: [], // Start with empty new units, existing units are not edited here
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "units",
  });

  useEffect(() => {
    if (isOpen) {
      fetchLandlords();
      if (property) {
        // Set form values
        Object.keys(property).forEach((key) => {
            if (key !== 'units') { // Don't populate existing units into the "new units" field
                setValue(key as any, property[key]);
            }
        });
        setImagePreview(property.imageUrl || null);
      }
    }
  }, [isOpen, property]);

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

      // Append new units as JSON string
      if (data.units && data.units.length > 0) {
        formData.append('units', JSON.stringify(data.units));
      }
      
      // Append image if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.patch(`/properties/${property.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Property updated successfully!');
      reset();
      setImageFile(null);
      setImagePreview(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to update property', error);
      toast.error(error.response?.data?.message || 'Failed to update property');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Edit Property</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Property Details</h3>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Image</label>
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
                    <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-2">Upload</span>
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
                <label className="block text-sm font-medium text-gray-700">Property Name*</label>
                <input
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address Line 1*</label>
                  <input
                    {...register('addressLine1')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border"
                  />
                  {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                  <input
                    {...register('addressLine2')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border"
                  />
                </div>
              </div>

              {/* City, State, Country */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City*</label>
                  <input
                    {...register('city')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State*</label>
                  <input
                    {...register('state')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border"
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country*</label>
                  <input
                    {...register('country')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border"
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                </div>
              </div>

              {/* Type and Landlord */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type*</label>
                  <select
                    {...register('type')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-2 border"
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
                  <label className="block text-sm font-medium text-gray-700">Landlord*</label>
                  <select
                    {...register('landlordId')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
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
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
            </div>

            {/* Right Column: Units */}
            <div className="space-y-4">
              {/* Existing Units Display */}
              {property?.units && property.units.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-3">Existing Units</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {property.units.map((unit: any) => (
                      <div key={unit.id} className="bg-gray-100 p-3 rounded-md flex justify-between items-center text-sm">
                        <span className="font-medium">{unit.name}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-600">₦{unit.monthlyRentAmount}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                                unit.status === 'VACANT' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
                            }`}>
                                {unit.status}
                            </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-medium text-gray-900">Add New Units</h3>
                <button
                  type="button"
                  onClick={() => append({ name: '', monthlyRentAmount: 0, status: 'VACANT' })}
                  className="flex items-center text-sm text-primary hover:text-primary/80"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Unit
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Unit Name/Number</label>
                        <input
                          {...register(`units.${index}.name`)}
                          placeholder="e.g. Flat 1A"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-sm"
                        />
                        {errors.units?.[index]?.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.units[index]?.name?.message}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Monthly Rent</label>
                          <input
                            type="number"
                            {...register(`units.${index}.monthlyRentAmount`, { valueAsNumber: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-sm"
                          />
                          {errors.units?.[index]?.monthlyRentAmount && (
                            <p className="text-red-500 text-xs mt-1">{errors.units[index]?.monthlyRentAmount?.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Status</label>
                          <select
                            {...register(`units.${index}.status`)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-sm"
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
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p>No new units being added.</p>
                    <p className="text-sm">Click "Add Unit" to add more units to this property.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
