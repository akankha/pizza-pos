import {
  ArrowLeft,
  Key,
  Shield,
  Trash2,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User, UserRole } from "../../../shared/types";
import LoadingScreen from "../components/LoadingScreen";
import { showToast } from "../components/Toast";
import { authFetch } from "../utils/auth";

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
  const [rolePermissions, setRolePermissions] = useState<
    Record<UserRole, RolePermissions>
  >({} as any);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "reception" as UserRole,
  });
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, currentUserRes, permissionsRes] = await Promise.all([
        authFetch("/api/users"),
        authFetch("/api/users/me"),
        authFetch("/api/users/roles/permissions"),
      ]);

      const usersData = await usersRes.json();
      const currentUserData = await currentUserRes.json();
      const permissionsData = await permissionsRes.json();

      if (usersData.success) setUsers(usersData.data);
      if (currentUserData.success) setCurrentUser(currentUserData.data);
      if (permissionsData.success) setRolePermissions(permissionsData.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          `User "${formData.username}" created successfully!`,
          "success"
        );
        setShowCreateModal(false);
        setFormData({
          username: "",
          password: "",
          full_name: "",
          role: "reception",
        });
        loadData();
      } else {
        showToast("Error: " + result.error, "error");
      }
    } catch (error: any) {
      showToast("Failed to create user: " + error.message, "error");
    }
  };

  const initiateToggleActive = (user: User) => {
    setSelectedUser(user);
    setShowToggleConfirm(true);
  };

  const confirmToggleActive = async () => {
    if (!selectedUser) return;

    try {
      const response = await authFetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify({ active: !selectedUser.active }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          `User ${
            selectedUser.active ? "deactivated" : "activated"
          } successfully!`,
          "success"
        );
        loadData();
      } else {
        showToast("Error: " + result.error, "error");
      }
    } catch (error: any) {
      showToast("Failed to update user: " + error.message, "error");
    } finally {
      setShowToggleConfirm(false);
      setSelectedUser(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      const response = await authFetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify({ password: newPassword }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          `Password reset successfully for "${selectedUser.username}"!`,
          "success"
        );
        setShowPasswordModal(false);
        setSelectedUser(null);
        setNewPassword("");
      } else {
        showToast("Error: " + result.error, "error");
      }
    } catch (error: any) {
      showToast("Failed to reset password: " + error.message, "error");
    }
  };

  const initiateDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await authFetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          `User "${selectedUser.username}" deleted successfully!`,
          "success"
        );
        loadData();
      } else {
        showToast("Error: " + result.error, "error");
      }
    } catch (error: any) {
      showToast("Failed to delete user: " + error.message, "error");
    } finally {
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    }
  };

  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
      case "super_admin":
        return "bg-purple-600 text-white";
      case "restaurant_admin":
        return "bg-blue-600 text-white";
      case "reception":
        return "bg-green-600 text-white";
      case "kitchen":
        return "bg-orange-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const canCreateRole = (role: UserRole): boolean => {
    if (!currentUser) return false;
    const permissions = rolePermissions[currentUser.role];
    return permissions?.canCreate?.includes(role) || false;
  };

  const canManageUser = (user: User): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === "super_admin") return true;
    if (currentUser.role === "restaurant_admin") {
      return (
        user.created_by === currentUser.id &&
        ["reception", "kitchen"].includes(user.role)
      );
    }
    return false;
  };

  if (isLoading) {
    return <LoadingScreen message="Loading users..." variant="dark" />;
  }

  return (
    <div className="min-h-screen w-screen bg-slate-800 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all duration-300 shadow-md"
            >
              <ArrowLeft size={20} />
              <span className="font-medium hidden sm:inline">Back</span>
            </button>

            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <UsersIcon size={24} />
              <span className="hidden sm:inline">User Management</span>
            </h1>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] hover:bg-[#e55a2b] text-white rounded-xl shadow-md transition-all duration-300"
            >
              <UserPlus size={20} />
              <span className="font-medium hidden sm:inline">Add User</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Current User Info */}
          {currentUser && (
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200 animate-slide-up">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#FF6B35]/10">
                  <Shield size={24} className="text-[#FF6B35]" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Logged in as</p>
                  <p className="text-lg font-bold text-slate-900">
                    {currentUser.full_name || currentUser.username}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getRoleBadgeColor(
                      currentUser.role
                    )}`}
                  >
                    {rolePermissions[currentUser.role]?.label ||
                      currentUser.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Users List */}
          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              All Users ({users.length})
            </h2>

            {users.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No users found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user, index) => (
                  <div
                    key={user.id}
                    className={`relative p-4 rounded-xl border transition-all duration-300 animate-slide-up ${
                      user.active
                        ? "border-slate-200 bg-slate-50 hover:border-[#FF6B35]/50 hover:shadow-md"
                        : "border-slate-300 bg-slate-100 opacity-60"
                    }`}
                    style={{ animationDelay: `${0.1 + index * 0.03}s` }}
                  >
                    {/* Role Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {rolePermissions[user.role]?.label || user.role}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="pr-24">
                      <h3 className="text-lg font-bold text-slate-900">
                        {user.full_name || user.username}
                      </h3>
                      <p className="text-sm text-slate-500">@{user.username}</p>
                      {user.created_at && (
                        <p className="text-xs text-slate-400 mt-1">
                          Created:{" "}
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      )}
                      {user.last_login && (
                        <p className="text-xs text-slate-400">
                          Last login:{" "}
                          {new Date(user.last_login).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {canManageUser(user) && user.id !== currentUser?.id && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => initiateToggleActive(user)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
                            user.active
                              ? "bg-yellow-500 text-white hover:bg-yellow-600"
                              : "bg-emerald-500 text-white hover:bg-emerald-600"
                          }`}
                        >
                          {user.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPasswordModal(true);
                          }}
                          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
                          title="Reset Password"
                        >
                          <Key size={18} />
                        </button>
                        {currentUser?.role === "super_admin" && (
                          <button
                            onClick={() => initiateDeleteUser(user)}
                            className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow-sm"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    )}

                    {user.id === currentUser?.id && (
                      <div className="mt-4 text-center text-sm font-medium text-[#FF6B35]">
                        (You)
                      </div>
                    )}

                    {!user.active && (
                      <div className="mt-4 text-center text-sm font-medium text-red-500">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <UserPlus size={24} className="text-[#FF6B35]" />
              Create New User
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all placeholder:text-slate-400"
                  placeholder="johndoe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all placeholder:text-slate-400"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all placeholder:text-slate-400"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserRole,
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all"
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
                    <p className="text-xs font-semibold text-blue-700 mb-1">
                      Permissions:
                    </p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      {rolePermissions[formData.role].permissions
                        .slice(0, 4)
                        .map((perm, idx) => (
                          <li key={idx}>• {perm}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      username: "",
                      password: "",
                      full_name: "",
                      role: "reception",
                    });
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-[#FF6B35] text-white font-medium hover:bg-[#e55a2b] transition-all shadow-md"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Key size={24} className="text-[#FF6B35]" />
              Reset Password
            </h2>

            <p className="text-slate-600 mb-4">
              Reset password for:{" "}
              <strong className="text-slate-900">
                {selectedUser.full_name || selectedUser.username}
              </strong>
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 transition-all placeholder:text-slate-400"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    setNewPassword("");
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-[#FF6B35] text-white font-medium hover:bg-[#e55a2b] transition-all shadow-md"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Active Confirmation Modal */}
      {showToggleConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <UsersIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {selectedUser.active ? "Deactivate" : "Activate"} User?
              </h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to{" "}
                {selectedUser.active ? "deactivate" : "activate"}{" "}
                <strong className="text-slate-900">
                  {selectedUser.username}
                </strong>
                ?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowToggleConfirm(false);
                    setSelectedUser(null);
                  }}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmToggleActive}
                  className={`px-6 py-3 text-white rounded-xl font-medium transition-all shadow-md ${
                    selectedUser.active
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  Yes, {selectedUser.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Delete User?
              </h3>
              <p className="text-slate-600 mb-2">
                Are you sure you want to delete{" "}
                <strong className="text-slate-900">
                  {selectedUser.username}
                </strong>
                ?
              </p>
              <p className="text-red-600 font-medium mb-6">
                ⚠️ This action cannot be undone!
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedUser(null);
                  }}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-md"
                >
                  Yes, Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
