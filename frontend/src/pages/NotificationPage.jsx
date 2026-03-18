import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import { 
  BellIcon, 
  CheckCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  TrashIcon,
  EnvelopeOpenIcon,
  ArrowPathIcon,
  BoltIcon
} from "@heroicons/react/24/outline";

import api from "../api/axios";

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setUser(storedUser);
    if (storedUser?._id) {
       fetchNotifications(storedUser._id);
    } else {
       setLoading(false);
    }
  }, []);

  const handleBroadcast = async () => {
    if (!broadcastForm.title || !broadcastForm.message) return;
    try {
      setSending(true);
      const res = await api.post('/notifications/broadcast', broadcastForm);
      const data = res.data;
      if (data.success) {
        alert("Transmission successful across all sectors.");
        setShowBroadcast(false);
        setBroadcastForm({ title: '', message: '' });
      }
    } catch (err) {
      console.error("Transmission failure");
    } finally {
      setSending(false);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      setLoading(true);
      const res = await api.get(`/notifications/user/${userId}`);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Signal reception failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Read state sync failure");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error("Decomposition failure");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "approval_required": return <BoltIcon className="w-6 h-6 text-lilac-primary" />;
      case "rejection": return <ExclamationTriangleIcon className="w-6 h-6 text-rose-500" />;
      case "success": return <CheckCircleIcon className="w-6 h-6 text-emerald-500" />;
      default: return <InformationCircleIcon className="w-6 h-6 text-lilac-primary" />;
    }
  };

  const stats = [
    { label: "Total Signals", val: notifications.length, icon: BellIcon },
    { label: "Unread Tracks", val: notifications.filter(n => !n.read).length, icon: BoltIcon },
    { label: "Access Node", val: user?.username?.toUpperCase() || "UNKNOWN", icon: BoltIcon }
  ];

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lilac-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-lilac-border pb-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-lilac-primary to-lilac-accent rounded-2xl flex items-center justify-center shadow-lg">
            <BellIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-lilac-text tracking-tighter uppercase leading-none">SIGNAL STREAM</h1>
            <p className="text-lilac-accent font-black mt-3 tracking-[0.3em] uppercase text-[10px] md:text-xs">Operational alerts & status updates</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <button 
              onClick={() => setShowBroadcast(true)}
              className="p-3 bg-gradient-to-br from-lilac-primary to-lilac-accent text-white rounded-xl hover:opacity-90 transition-all shadow-md text-xs font-black uppercase tracking-widest flex items-center gap-2"
            >
              <BoltIcon className="w-5 h-5" />
              <span>Broadcast Signal</span>
            </button>
          )}
          <button 
            onClick={() => user?._id && fetchNotifications(user._id)}
            className="p-3 bg-white border-2 border-lilac-border rounded-xl hover:border-lilac-primary transition-all group shadow-sm text-xs font-black uppercase tracking-widest flex items-center gap-2"
          >
            <ArrowPathIcon className={`w-5 h-5 text-lilac-text group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 bg-lilac-text/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-lilac-border shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-lilac-primary to-lilac-accent p-6 flex justify-between items-center text-white">
               <h2 className="text-xl font-black uppercase tracking-tighter">Initiate Global Broadcast</h2>
               <button onClick={() => setShowBroadcast(false)} className="hover:rotate-90 transition-transform">
                  <TrashIcon className="w-6 h-6" />
               </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-lilac-muted uppercase tracking-widest ml-1">Transmission Title</label>
                <input 
                  type="text" 
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({...broadcastForm, title: e.target.value})}
                  className="w-full px-5 py-4 bg-lilac-bg border-2 border-lilac-border rounded-2xl focus:border-lilac-primary outline-none font-bold text-lilac-text text-sm transition-all"
                  placeholder="e.g., SYSTEM MAINTENANCE"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-lilac-muted uppercase tracking-widest ml-1">Signal Payload</label>
                <textarea 
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({...broadcastForm, message: e.target.value})}
                  rows="4"
                  className="w-full px-5 py-4 bg-lilac-bg border-2 border-lilac-border rounded-2xl focus:border-lilac-primary outline-none font-bold text-lilac-text text-sm transition-all resize-none"
                  placeholder="Enter message for all active node users..."
                />
              </div>

              <button 
                onClick={handleBroadcast}
                disabled={sending}
                className="w-full py-5 bg-lilac-text text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-lilac-primary transition-all disabled:opacity-50"
              >
                {sending ? 'Transmitting...' : 'Dispatch Signal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
           <div key={i} className="bg-white border-2 border-lilac-border rounded-2xl p-6 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-lilac-bg rounded-lg flex items-center justify-center text-lilac-primary border border-lilac-border">
                 <s.icon className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-xl font-black text-lilac-text uppercase tracking-tight">{s.val}</p>
                 <p className="text-[10px] font-black text-lilac-muted uppercase tracking-widest">{s.label}</p>
              </div>
           </div>
        ))}
      </div>

      {/* Signal List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-lilac-border rounded-3xl p-20 text-center">
            <InformationCircleIcon className="w-12 h-12 text-lilac-muted/30 mx-auto mb-4" />
            <p className="text-xs font-black text-lilac-muted uppercase tracking-widest opacity-40">No signals detected in current stream</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n._id} 
              className={`group bg-white border-2 rounded-2xl p-6 flex items-start gap-6 transition-all hover:border-lilac-primary hover:shadow-lg ${n.read ? 'border-lilac-border opacity-70' : 'border-lilac-primary/40 shadow-sm'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${n.read ? 'border-lilac-border bg-lilac-bg/30' : 'border-lilac-primary/20 bg-lilac-bg'} transition-transform group-hover:scale-110`}>
                {getIcon(n.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                   <h3 className={`text-sm font-black uppercase tracking-widest ${n.read ? 'text-lilac-muted' : 'text-lilac-text'}`}>
                      {n.title}
                   </h3>
                   <span className="text-[9px] font-black text-lilac-muted/40 uppercase tracking-tighter">
                      {new Date(n.created_at).toLocaleString()}
                   </span>
                </div>
                <p className={`text-xs font-bold leading-relaxed mb-4 ${n.read ? 'text-lilac-muted' : 'text-lilac-accent'}`}>
                  {n.message}
                </p>
                
                <div className="flex items-center gap-4">
                  {!n.read && (
                    <button 
                      onClick={() => markAsRead(n._id)}
                      className="text-[10px] font-black text-lilac-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      <EnvelopeOpenIcon className="w-3 h-3" />
                      Acknowledge
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(n._id)}
                    className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 flex items-center gap-1"
                  >
                    <TrashIcon className="w-3 h-3" />
                    Decompose
                  </button>
                  {n.execution_id && (
                    <button 
                      onClick={() => navigate(`/logs?id=${n.execution_id}`)}
                      className="text-[10px] font-black text-lilac-muted uppercase tracking-widest hover:text-lilac-primary flex items-center gap-1"
                    >
                      <boltIcon className="w-3 h-3" />
                      Trace Stream
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
