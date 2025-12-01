import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TouchButton from '../components/TouchButton';
import { ArrowLeft, UserPlus, Users as UsersIcon, Shield, Trash2, Key } from 'lucide-react';
import { authFetch } from '../utils/auth';
import type { User, UserRole } from '../../../shared/types';

interface RolePermissions {
  label: string;
  description: string;
  permissions: string[];
  canCreate: UserRole[];
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, RolePermissions>>({} as any);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'reception' as UserRole
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, currentUserRes, permissionsRes] = await Promise.all([
        authFetch('/api/users'),
        authFetch('/api/users/me'),
        authFetch('/api/users/roles/permissions')
      ]);

      const usersData = await usersRes.json();
      const currentUserData = await currentUserRes.json();
      const permissionsData = await permissionsRes.json();

      if (usersData.success) setUsers(usersData.data);
      if (currentUserData.success) setCurrentUser(currentUserData.data);
      if (permissionsData.success) setRolePermissions(permissionsData.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ User "${formData.username}" created successfully!`);
        setShowCreateModal(false);
        setFormData({ username: '', password: '', full_name: '', role: 'reception' });
        loadData();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Failed to create user: ' + error.message);
    }
  };

  const handleToggleActive = async (user: User) => {
    if (!confirm(`${user.active ? 'Deactivate' : 'Activate'} user "${user.username}"?`)) {
      return;
    }

    try {
      const response = await authFetch(`/api/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !user.active })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ User ${user.active ? 'deactivated' : 'activated'} successfully!`);
        loadData();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Failed to update user: ' + error.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      const response = await authFetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Password reset successfully for "${selectedUser.username}"!`);
        setShowPasswordModal(false);
        setSelectedUser(null);
        setNewPassword('');
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Failed to reset password: ' + error.message);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`⚠️ DELETE user "${user.username}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      const response = await authFetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ User "${user.username}" deleted successfully!`);
        loadData();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Failed to delete user: ' + error.message);
    }
  };

  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
      case 'super_admin': return 'bg-purple-600 text-white';
      case 'restaurant_admin': return 'bg-blue-600 text-white';
      case 'reception': return 'bg-green-600 text-white';
      case 'kitchen': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const canCreateRole = (role: UserRole): boolean => {
    if (!currentUser) return false;
    const permissions = rolePermissions[currentUser.role];
    return permissions?.canCreate?.includes(role) || false;
  };

  const canManageUser = (user: User): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'restaurant_admin') {
      return user.created_by === currentUser.id && ['reception', 'kitchen'].includes(user.role);
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 shadow-2xl">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <TouchButton
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            size="medium"
            className="!bg-white/10 !text-white hover:!bg-white/20 backdrop-blur-sm border-white/20"
          >
            <ArrowLeft size={28} />
          </TouchButton>
          
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <UsersIcon size={40} />
            User Management
          </h1>
          
          <TouchButton
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            size="medium"
            className="flex items-center gap-2"
          >
            <UserPlus size={28} />
            <span>Add User</span>
          </TouchButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Current User Info */}
          {currentUser && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-[#FF6B35]">
              <div className="flex items-center gap-4">
                <Shield size={32} className="text-[#FF6B35]" />
                <div>
                  <p className="text-sm text-gray-600">Logged in as</p>
                  <p className="text-xl font-bold">{currentUser.full_name || currentUser.username}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(currentUser.role)}`}>
                    {rolePermissions[currentUser.role]?.label || currentUser.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">All Users ({users.length})</h2>
            
            {users.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No users found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      user.active
                        ? 'border-gray-200 bg-white hover:border-[#FF6B35]/50 hover:shadow-lg'
                        : 'border-gray-300 bg-gray-50 opacity-60'
                    }`}
                  >
                    {/* Role Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                        {rolePermissions[user.role]?.label || user.role}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="pr-24">
                      <h3 className="text-lg font-bold text-gray-800">
                        {user.full_name || user.username}
                      </h3>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      {user.created_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      )}
                      {user.last_login && (
                        <p className="text-xs text-gray-500">
                          Last login: {new Date(user.last_login).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {canManageUser(user) && user.id !== currentUser?.id && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            user.active
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {user.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPasswordModal(true);
                          }}
                          className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                          title="Reset Password"
                        >
                          <Key size={18} />
                        </button>
                        {currentUser?.role === 'super_admin' && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    )}

                    {user.id === currentUser?.id && (
                      <div className="mt-4 text-center text-sm font-semibold text-[#FF6B35]">
                        (You)
                      </div>
                    )}

                    {!user.active && (
                      <div className="mt-4 text-center text-sm font-semibold text-red-600">
                        ⚠️ Deactivated
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <UserPlus size={28} className="text-[#FF6B35]" />
              Create New User
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#FF6B35] focus:outline-none"
                  placeholder="johndoe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#FF6B35] focus:outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#FF6B35] focus:outline-none"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#FF6B35] focus:outline-none"
                >
                  {Object.entries(rolePermissions).map(([role, info]) => (
                    <option
                      key={role}
                      value={role}
                      disabled={!canCreateRole(role as UserRole)}
                    >
                      {info.label} - {info.description}
                    </option>
                  ))}
                </select>
                {formData.role && rolePermissions[formData.role] && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-800 mb-1">Permissions:</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      {rolePermissions[formData.role].permissions.slice(0, 4).map((perm, idx) => (
                        <li key={idx}>• {perm}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <TouchButton
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ username: '', password: '', full_name: '', role: 'reception' });
                  }}
                  variant="outline"
                  size="medium"
                  className="flex-1"
                >
                  Cancel
                </TouchButton>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-[#FF6B35] text-white font-semibold hover:bg-[#FF6B35]/90 active:scale-95 transition-all"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Key size={28} className="text-[#FF6B35]" />
              Reset Password
            </h2>

            <p className="text-gray-600 mb-4">
              Reset password for: <strong>{selectedUser.full_name || selectedUser.username}</strong>
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#FF6B35] focus:outline-none"
                  placeholder="Minimum 6 characters"
                />
              </div>


              <div className="flex gap-3 pt-4">
                <TouchButton
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    setNewPassword('');
                  }}
                  variant="outline"
                  size="medium"
                  className="flex-1"
                >
                  Cancel
                </TouchButton>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-[#FF6B35] text-white font-semibold hover:bg-[#FF6B35]/90 active:scale-95 transition-all"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
