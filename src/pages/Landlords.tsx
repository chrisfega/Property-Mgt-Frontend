import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Search, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { AddLandlordModal } from '../components/AddLandlordModal';
import { EditLandlordModal } from '../components/EditLandlordModal';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const Landlords: React.FC = () => {
  const [landlords, setLandlords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [landlordToDelete, setLandlordToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLandlords();
  }, []);

  const fetchLandlords = async () => {
    try {
      const response = await api.get('/landlords');
      setLandlords(response.data.data.landlords);
    } catch (error) {
      console.error('Failed to fetch landlords', error);
      toast.error('Failed to fetch landlords');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (landlord: any) => {
    setSelectedLandlord(landlord);
    setIsEditModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setLandlordToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!landlordToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/landlords/${landlordToDelete}`);
      toast.success('Landlord deleted successfully');
      fetchLandlords();
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      console.error('Failed to delete landlord', error);
      toast.error(error.response?.data?.message || 'Failed to delete landlord');
    } finally {
      setIsDeleting(false);
      setLandlordToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Landlords</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Landlord
        </button>
      </div>

      <AddLandlordModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchLandlords} 
      />

      {selectedLandlord && (
        <EditLandlordModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedLandlord(null);
          }}
          onSuccess={fetchLandlords}
          landlord={selectedLandlord}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Landlord"
        message="Are you sure you want to delete this landlord? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search landlords..." 
              className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Contact Info</th>
                <th className="px-6 py-3">Properties</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {landlords.map((landlord) => (
                <tr key={landlord.id} className="bg-card hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{landlord.fullName}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="w-3 h-3 mr-2" />
                        {landlord.email}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="w-3 h-3 mr-2" />
                        {landlord.phone || landlord.phoneNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {landlord.properties?.length || 0} Properties
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(landlord)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => confirmDelete(landlord.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {landlords.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No landlords found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
