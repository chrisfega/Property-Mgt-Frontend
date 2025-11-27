import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit } from 'lucide-react';
import { AddPropertyModal } from '../components/AddPropertyModal';
import { EditPropertyModal } from '../components/EditPropertyModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { toast } from 'react-toastify';

interface Property {
  id: string;
  name: string;
  addressLine1: string;
  city: string;
  type: string;
  imageUrl?: string;
  units: any[];
}

export const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  // const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties');
      setProperties(response.data.data.properties);
    } catch (error) {
      console.error('Failed to fetch properties', error);
      toast.error('Failed to fetch properties');
    } finally {
      // setLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setPropertyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
      if (!propertyToDelete) return;

      setIsDeleting(true);
      try {
          await api.delete(`/properties/${propertyToDelete}`);
          toast.success('Property deleted successfully');
          fetchProperties();
          setIsDeleteModalOpen(false);
      } catch (error) {
          console.error('Failed to delete property', error);
          toast.error('Failed to delete property');
      } finally {
          setIsDeleting(false);
          setPropertyToDelete(null);
      }
  }

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setIsEditModalOpen(true);
  };

  // if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Properties</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
              <div key={property.id} className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
                  {property.imageUrl && (
                    <img 
                      src={property.imageUrl} 
                      alt={property.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h3 className="text-lg font-semibold text-foreground">{property.name}</h3>
                              <p className="text-sm text-muted-foreground">{property.addressLine1}, {property.city}</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium bg-secondary text-foreground rounded-full">{property.type}</span>
                      </div>
                      <div className="mb-4">
                          <p className="text-sm text-muted-foreground">Units: {property.units.length}</p>
                      </div>
                      <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleEdit(property)}
                            className="p-2 text-muted-foreground hover:text-primary"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => confirmDelete(property.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchProperties}
      />

      {selectedProperty && (
        <EditPropertyModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProperty(null);
          }}
          onSuccess={fetchProperties}
          property={selectedProperty}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Property"
        message="Are you sure you want to delete this property? This will also delete all associated units and data. This action cannot be undone."
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
