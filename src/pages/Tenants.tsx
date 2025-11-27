import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-toastify';

interface Tenant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  currentUnit?: {
      name: string;
      property: {
          name: string;
      }
  }
}

import { AddTenantModal } from '../components/AddTenantModal';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const Tenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  // const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data.data.tenants);
    } catch (error) {
      console.error('Failed to fetch tenants', error);
      toast.error('Failed to fetch tenants');
    } finally {
      // setLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setTenantToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
      if (!tenantToDelete) return;

      setIsDeleting(true);
      try {
          await api.delete(`/tenants/${tenantToDelete}`);
          toast.success('Tenant deleted successfully');
          fetchTenants();
          setIsDeleteModalOpen(false);
      } catch (error) {
          console.error('Failed to delete tenant', error);
          toast.error('Failed to delete tenant');
      } finally {
          setIsDeleting(false);
          setTenantToDelete(null);
      }
  }

  // if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Tenant
        </button>
      </div>

      <AddTenantModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchTenants} 
      />

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{tenant.fullName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{tenant.email}</div>
                  <div className="text-sm text-gray-500">{tenant.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    tenant.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-primary text-red-800'
                  }`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tenant.currentUnit ? `${tenant.currentUnit.property.name} - ${tenant.currentUnit.name}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-primary hover:text-primary/80 mr-4"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => confirmDelete(tenant.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Tenant"
        message="Are you sure you want to delete this tenant? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
