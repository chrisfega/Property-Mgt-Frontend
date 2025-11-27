import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, User as UserIcon, Shield, Mail, Calendar, Edit, Trash2 } from 'lucide-react';
import { AddUserModal } from '../components/AddUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { toast } from 'react-toastify';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  status: 'ACTIVE' | 'FROZEN';
  createdAt: string;
}

export const AccountManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Failed to fetch users');
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const confirmDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      await api.delete(`/users/${selectedUser.id}`);
      toast.success('User deleted successfully');
      fetchUsers();
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      console.error('Failed to delete user', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-foreground">Account Management</h1>
            <p className="text-muted-foreground mt-1">Manage admin and staff accounts.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {user.role === 'ADMIN' ? <Shield className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{user.fullName}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {user.role}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="w-4 h-4 mr-2" />
                {user.email}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-border">
              <button 
                onClick={() => handleEdit(user)}
                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Edit user"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => confirmDelete(user)}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Delete user"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchUsers} 
      />

      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={fetchUsers}
          user={selectedUser}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
