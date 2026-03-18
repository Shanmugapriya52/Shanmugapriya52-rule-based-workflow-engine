import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserIcon,
  ShieldCheckIcon,
  KeyIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

export default function RoleManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'User',
    department: '',
    email: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) {
      alert('Please fill in username and password');
      return;
    }

    try {
      await api.post('/users', newUser);
      fetchUsers();
      // Reset form
      setNewUser({
        username: '',
        password: '',
        role: 'User',
        department: '',
        email: '',
        status: 'Active'
      });
      setShowAddForm(false);
    } catch (error) {
      alert("Failed to create user: " + (error.response?.data?.message || error.message));
    }
  };

  const startEditing = (user) => {
    setEditingUser(user._id || user.id);
    setEditFormData({ ...user });
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/users/${editingUser}`, editFormData);
      fetchUsers();
      setEditingUser(null);
      setEditFormData(null);
    } catch (error) {
      alert("Failed to update user: " + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await api.put(`/users/${userId}`, { status: newStatus });
      fetchUsers();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (error) {
        alert("Failed to delete user");
      }
    }
  };

  const handleTestLogin = (username, password) => {
    alert(`Login credentials:\n\nUsername: ${username}\nPassword: ${password}\n\nYou can use these to login to the system.`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      Active: "bg-emerald-50 text-emerald-600 border-emerald-100",
      Inactive: "bg-slate-50 text-slate-600 border-slate-100",
      Suspended: "bg-amber-50 text-amber-600 border-amber-100"
    };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${styles[status] || styles.Active}`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const r = (role || 'user').toLowerCase();
    const styles = {
      administrator: "bg-lilac-bg text-lilac-primary border-lilac-border",
      admin: "bg-lilac-bg text-lilac-primary border-lilac-border",
      manager: "bg-pink-50 text-pink-500 border-pink-100",
      developer: "bg-blue-50 text-blue-500 border-blue-100",
      employee: "bg-slate-50 text-slate-600 border-slate-100"
    };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${styles[r] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
        {role}
      </span>
    );
  };

  const filteredUsers = (users || []).filter(u => 
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8 px-4">
      {/* HEADER SECTION */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(200,162,255,0.15)] border border-lilac-border p-8 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D1B3FF] to-[#FFB7D5] rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-[#4A2C8F] tracking-tighter uppercase leading-none">Authority Nexus</h1>
              <p className="text-[#D1B3FF] font-black mt-3 tracking-[0.3em] uppercase text-[10px] md:text-xs">Role synchronization & User hierarchy</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowAddForm(true); setEditingUser(null); }}
              className="px-6 py-3 bg-gradient-to-r from-[#D1B3FF] to-[#FFB7D5] text-white font-black rounded-xl shadow-lg hover:opacity-90 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2 group"
            >
              <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              New Identity
            </button>
            <button
              onClick={fetchUsers}
              className="p-3 bg-white border-2 border-lilac-border rounded-xl hover:border-lilac-primary transition-all shadow-sm text-xs font-black group"
            >
              <ArrowPathIcon className={`w-5 h-5 text-lilac-text group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-lilac-muted" />
          <input
            type="text"
            placeholder="Search identities, roles, or departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/80 backdrop-blur-sm border-2 border-lilac-border rounded-2xl pl-12 pr-6 py-4 text-lilac-text font-bold focus:ring-4 focus:ring-lilac-primary/20 focus:border-lilac-primary outline-none transition-all placeholder:text-lilac-muted/50 shadow-sm"
          />
        </div>
        <div className="bg-white/80 backdrop-blur-sm border-2 border-lilac-border rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sm">
           <span className="text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em]">Total Pulse:</span>
           <span className="text-xl font-black text-[#4A2C8F]">{users.length}</span>
        </div>
      </div>

      {/* ADD / EDIT USER FORM */}
      {(showAddForm || editingUser) && (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border-2 border-lilac-border p-8 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-[#4A2C8F] uppercase tracking-tight">
              {editingUser ? "Identity Modification" : "Identity Generation"}
            </h3>
            <button 
              onClick={() => { setShowAddForm(false); setEditingUser(null); setEditFormData(null); }} 
              className="text-lilac-muted hover:text-[#4A2C8F] transition-colors font-black text-xs uppercase tracking-widest"
            >
              Abort
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-lilac-muted uppercase tracking-widest ml-1">Username</label>
              <input
                type="text"
                value={editingUser ? editFormData.username : newUser.username}
                onChange={(e) => editingUser 
                  ? setEditFormData({ ...editFormData, username: e.target.value })
                  : setNewUser({ ...newUser, username: e.target.value })
                }
                className="w-full bg-lilac-bg/30 border border-lilac-border rounded-xl px-4 py-3 text-lilac-text font-bold focus:border-lilac-primary outline-none transition-all"
                placeholder="system_handle"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-lilac-muted uppercase tracking-widest ml-1">
                {editingUser ? "New Access Phrase (Optional)" : "Access Phrase"}
              </label>
              <input
                type="password"
                value={editingUser ? (editFormData.password || '') : newUser.password}
                onChange={(e) => editingUser
                  ? setEditFormData({ ...editFormData, password: e.target.value })
                  : setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full bg-lilac-bg/30 border border-lilac-border rounded-xl px-4 py-3 text-lilac-text font-bold focus:border-lilac-primary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-lilac-muted uppercase tracking-widest ml-1">Protocol Role</label>
              <input
                type="text"
                value={editingUser ? editFormData.role : newUser.role}
                onChange={(e) => editingUser
                  ? setEditFormData({ ...editFormData, role: e.target.value })
                  : setNewUser({ ...newUser, role: e.target.value })
                }
                className="w-full bg-lilac-bg/30 border border-lilac-border rounded-xl px-4 py-3 text-lilac-text font-bold focus:border-lilac-primary outline-none transition-all"
                placeholder="Admin, Manager, User..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-lilac-muted uppercase tracking-widest ml-1">Department Cluster</label>
              <input
                type="text"
                value={editingUser ? editFormData.department : newUser.department}
                onChange={(e) => editingUser
                  ? setEditFormData({ ...editFormData, department: e.target.value })
                  : setNewUser({ ...newUser, department: e.target.value })
                }
                className="w-full bg-lilac-bg/30 border border-lilac-border rounded-xl px-4 py-3 text-lilac-text font-bold focus:border-lilac-primary outline-none transition-all"
                placeholder="IT, HR, Finance..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-lilac-muted uppercase tracking-widest ml-1">Comms Endpoint</label>
              <input
                type="email"
                value={editingUser ? editFormData.email : newUser.email}
                onChange={(e) => editingUser
                  ? setEditFormData({ ...editFormData, email: e.target.value })
                  : setNewUser({ ...newUser, email: e.target.value })
                }
                className="w-full bg-lilac-bg/30 border border-lilac-border rounded-xl px-4 py-3 text-lilac-text font-bold focus:border-lilac-primary outline-none transition-all"
                placeholder="user@system.io"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-lilac-muted uppercase tracking-widest ml-1">Vital Status</label>
              <select
                value={editingUser ? editFormData.status : newUser.status}
                onChange={(e) => editingUser
                  ? setEditFormData({ ...editFormData, status: e.target.value })
                  : setNewUser({ ...newUser, status: e.target.value })
                }
                className="w-full bg-lilac-bg/30 border border-lilac-border rounded-xl px-4 py-3 text-lilac-text font-bold focus:border-lilac-primary outline-none transition-all appearance-none"
              >
                <option value="Active">Active Pulse</option>
                <option value="Inactive">Offline</option>
                <option value="Suspended">Restricted</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={editingUser ? handleSaveEdit : handleAddUser}
              className="px-10 py-4 bg-gradient-to-r from-[#D1B3FF] to-[#FFB7D5] text-white font-black rounded-xl shadow-xl hover:shadow-[#D1B3FF]/40 hover:-translate-y-1 transition-all uppercase tracking-widest text-[10px]"
            >
              {editingUser ? "Validate & Sync Changes" : "Verify & Instantiate"}
            </button>
          </div>
        </div>
      )}

      {/* USERS DATA GRID */}
      <div className="bg-white/90 backdrop-blur-sm border-2 border-lilac-border rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lilac-border">
            <thead className="bg-[#F8F3FF]/50">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em]">Identity Handle</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em]">Protocol Role</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em]">Department Cluster</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em]">Vital Status</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em]">Temporal Origin</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em]">Override Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lilac-border/50 bg-white/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D1B3FF] mx-auto mb-4"></div>
                    <p className="text-[10px] font-black text-lilac-muted uppercase tracking-widest opacity-50">Syncing with Data Stream...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <p className="text-[10px] font-black text-lilac-muted uppercase tracking-widest opacity-50">No Identities Detected in Stream</p>
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id || user.id || Math.random().toString()} className="hover:bg-lilac-bg/20 transition-all duration-300 group">
                  <td className="px-8 py-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#D1B3FF] to-[#FFB7D5] rounded-xl flex items-center justify-center text-white text-lg font-black shadow-md shadow-[#D1B3FF]/20 group-hover:scale-110 transition-transform duration-300">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-black text-[#4A2C8F] uppercase tracking-tight">{user.username}</div>
                      <div className="text-[10px] text-lilac-muted font-bold lowercase opacity-70 italic">{user.email || 'no-comms@endpoint.io'}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-8 py-5 font-black text-xs text-lilac-text uppercase tracking-widest opacity-80">
                    {user.department || 'N/A'}
                  </td>
                  <td className="px-8 py-5">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-8 py-5 text-[10px] font-black text-lilac-muted uppercase italic opacity-60">
                    {new Date(user.created_at || user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => handleTestLogin(user.username, user.password)}
                        className="w-10 h-10 flex items-center justify-center bg-white text-lilac-primary rounded-xl border-2 border-lilac-border hover:border-lilac-primary transition-all shadow-sm"
                        title="Reveal Access Codes"
                      >
                        <KeyIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => startEditing(user)}
                        className="w-10 h-10 flex items-center justify-center bg-white text-blue-500 rounded-xl border-2 border-blue-50 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                        title="Modify Identity"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id || user.id)}
                        className="w-10 h-10 flex items-center justify-center bg-white text-rose-500 rounded-xl border-2 border-rose-50 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        title="Terminate Identity"
                        disabled={user.username === 'admin'}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
