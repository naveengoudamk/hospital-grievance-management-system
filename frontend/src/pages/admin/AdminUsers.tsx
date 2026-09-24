import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  UserCheck,
  UserX,
  Edit2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Key,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { PagedResponse, Role, User } from '../../types';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminUsers: React.FC = () => {
  const [usersData, setUsersData] = useState<PagedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('ROLE_COMMITTEE_MEMBER');
  const [actionLoading, setActionLoading] = useState(false);

  // Edit User Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<Role>('ROLE_COMMITTEE_MEMBER');
  const [editNewPassword, setEditNewPassword] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers({
        role: roleFilter ? (roleFilter as Role) : undefined,
        search: search.trim() || undefined,
        page,
        size: 10,
      });
      setUsersData(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminApi.createUser({
        fullName,
        username,
        email,
        phone,
        password,
        role,
      });
      setCreateModalOpen(false);
      setFullName('');
      setUsername('');
      setEmail('');
      setPhone('');
      setPassword('');
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setActionLoading(true);
    try {
      await adminApi.updateUser(editingUser.id, {
        fullName: editFullName,
        email: editEmail,
        phone: editPhone,
        role: editRole,
        newPassword: editNewPassword.trim() || undefined,
      });
      setEditModalOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditFullName(u.fullName);
    setEditEmail(u.email);
    setEditPhone(u.phone || '');
    setEditRole(u.role);
    setEditNewPassword('');
    setEditModalOpen(true);
  };

  const handleToggleStatus = async (userId: number, currentActive: boolean) => {
    if (!confirm(`Are you sure you want to ${currentActive ? 'deactivate' : 'activate'} this user account?`)) {
      return;
    }
    try {
      await adminApi.toggleUserStatus(userId, !currentActive);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change user status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Hospital Staff & Committee Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure administrator accounts and inquiry committee members.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Internal User</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPage(0);
                loadUsers();
              }
            }}
            placeholder="Search by user's full name, username, or email..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-hospital-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(0);
          }}
          className="w-full sm:w-48 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700"
        >
          <option value="">All Roles</option>
          <option value="ROLE_ADMIN">Admins Only</option>
          <option value="ROLE_COMMITTEE_MEMBER">Committee Members Only</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading user accounts..." />
        ) : !usersData || usersData.content.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No users matching search criteria.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Name & Username</th>
                    <th className="px-6 py-3.5">Email / Phone</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {usersData.content.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">{u.fullName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-800 block">{u.email}</span>
                        <span className="text-[11px] text-slate-400">{u.phone || 'No phone'}</span>
                      </td>
                      <td className="px-6 py-4">
                        {u.role === 'ROLE_ADMIN' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                            <Shield className="w-3 h-3" />
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                            <UserCheck className="w-3 h-3" />
                            <span>Committee Member</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Deactivated</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-slate-500 hover:text-hospital-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.active)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.active
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.active ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total {usersData.totalElements} accounts registered</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={usersData.first}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-800">
                  Page {usersData.page + 1} of {usersData.totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={usersData.last}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Internal Hospital User"
        subtitle="Add a new administrator or committee member"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Robert Chen"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Username *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. rchen"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
              >
                <option value="ROLE_COMMITTEE_MEMBER">Committee Member</option>
                <option value="ROLE_ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@hospital.org"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-019-2045"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white font-bold"
            >
              {actionLoading ? 'Saving...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Internal User"
        subtitle={`Updating account: @${editingUser?.username}`}
      >
        <form onSubmit={handleEditUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Email *</label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Phone</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Role</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as Role)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
            >
              <option value="ROLE_COMMITTEE_MEMBER">Committee Member</option>
              <option value="ROLE_ADMIN">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Reset Password (Leave blank to keep unchanged)</label>
            <input
              type="password"
              value={editNewPassword}
              onChange={(e) => setEditNewPassword(e.target.value)}
              placeholder="Enter new password to overwrite"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
