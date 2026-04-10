import React, { useState, useEffect } from 'react';
// --- NEW IMPORTS: Added Search, Eye, and EyeOff icons ---
import { Trash2, Edit, ShieldAlert, ShieldCheck, User as UserIcon, X, AlertTriangle, Search, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import API from '../../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- NEW: Search State ---
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: '', password: '' });
  
  // --- NEW: Password Visibility State ---
  const [showPassword, setShowPassword] = useState(false);
  
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const getConfig = () => {
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
    return { headers: { Authorization: `Bearer ${adminInfo?.token}` } };
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users', getConfig());
      setUsers(data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  // --- NEW: Filtered Users Logic ---
  // This filters the list instantly based on the search box
  const filteredUsers = users.filter((user) => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- CUSTOM DELETE HANDLERS ---
  const confirmDelete = (user) => setUserToDelete(user);

  const executeDelete = async () => {
    if (!userToDelete) return;
    const toastId = toast.loading('Deleting user...');
    try {
      await API.delete(`/admin/users/${userToDelete._id}`, getConfig());
      setUsers(users.filter((user) => user._id !== userToDelete._id));
      toast.success('User deleted successfully', { id: toastId });
      setUserToDelete(null); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user', { id: toastId });
      setUserToDelete(null); 
    }
  };

  // --- UPDATE HANDLERS ---
  const openEditModal = (user) => {
    setEditingUser(user);
    setShowPassword(false); // Reset the eye icon when opening the modal
    setEditForm({ username: user.username, email: user.email, role: user.role, password: '' });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Updating user data...');
    
    try {
      const updateData = { ...editForm };
      if (!updateData.password) {
        delete updateData.password;
      }

      const { data } = await API.put(`/admin/users/${editingUser._id}`, updateData, getConfig());
      setUsers(users.map(u => (u._id === editingUser._id ? data : u)));
      setEditingUser(null);
      toast.success('User updated successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed', { id: toastId });
    }
  };

  if (loading) return <div className="p-8 text-gray-500 font-medium">Loading user database...</div>;

  return (
    <div className="p-6 lg:p-8 relative">
      <Toaster position="top-right" /> 

      {/* --- HEADER WITH NEW SEARCH BAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500 text-sm mt-1">View, edit, and search SwapNest members.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm shadow-sm transition-shadow"
            />
          </div>

          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-full sm:w-auto text-center shrink-0">
            <span className="text-gray-500 text-sm font-medium">Total Users: </span>
            <span className="text-gray-900 font-bold">{users.length}</span>
          </div>
        </div>
      </div>

      {/* The Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-bold">User</th>
              <th className="p-4 font-bold">Email</th>
              <th className="p-4 font-bold">Role</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* --- NEW: Mapping over filteredUsers instead of users --- */}
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden shrink-0 border border-gray-200">
                      {user.profilePic ? (
                        <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={16} />
                      )}
                    </div>
                    <span className="font-bold text-gray-900">{user.username}</span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{user.email}</td>
                  <td className="p-4">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><ShieldAlert size={12} /> Admin</span>
                    ) : user.role === 'volunteer' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><ShieldCheck size={12} /> Volunteer</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">User</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => confirmDelete(user)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={user.role === 'admin'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  No users found matching "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center transform transition-all">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Are you sure you want to permanently delete <strong>{userToDelete.username}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setUserToDelete(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg transition">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                <input type="text" value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">System Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="user">Standard User</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* --- NEW: INTERACTIVE PASSWORD FIELD --- */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-1">New Password <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={editForm.password} 
                    onChange={(e) => setEditForm({...editForm, password: e.target.value})} 
                    placeholder="Leave blank to keep current password"
                    className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg transition">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;