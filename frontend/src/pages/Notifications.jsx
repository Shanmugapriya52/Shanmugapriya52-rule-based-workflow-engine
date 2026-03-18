import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

import api from "../api/axios";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = currentUser._id;
      
      if (!userId) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Backend API call - Axios automatically handles base URL and organization ID
      const response = await api.get('/notifications', { params: { userId } });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      
      setNotifications(prev => 
        prev.map(notif => 
          (notif._id === notificationId || notif.id === notificationId)
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => (notif._id !== notificationId && notif.id !== notificationId)));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <XMarkIcon className="w-5 h-5 text-red-500" />;
      case 'system':
        return <SparklesIcon className="w-5 h-5 text-indigo-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          border: 'border-emerald-200',
          bg: 'bg-emerald-50/50',
          badge: 'bg-emerald-100 text-emerald-800'
        };
      case 'warning':
        return {
          border: 'border-amber-200',
          bg: 'bg-amber-50/50',
          badge: 'bg-amber-100 text-amber-800'
        };
      case 'error':
        return {
          border: 'border-rose-200',
          bg: 'bg-rose-50/50',
          badge: 'bg-rose-100 text-rose-800'
        };
      case 'system':
        return {
          border: 'border-lilac-primary/30',
          bg: 'bg-lilac-secondary/30',
          badge: 'bg-lilac-primary text-white'
        };
      default:
        return {
          border: 'border-lilac-border',
          bg: 'bg-lilac-bg/50',
          badge: 'bg-lilac-secondary text-lilac-accent'
        };
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.1)] border border-lilac-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-lilac-text tracking-tight uppercase">Notification Hub</h1>
          <p className="text-lilac-muted font-medium mt-1 italic">Real-time alerts and activity updates</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-6 py-2.5 bg-gradient-to-r from-lilac-primary to-lilac-accent text-white font-black rounded-xl shadow-lg hover:opacity-90 transition-all uppercase tracking-widest text-xs flex items-center gap-2"
          >
            <CheckIcon className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-lilac-border p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-lilac-muted uppercase tracking-widest">Filter:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === 'all'
                    ? 'bg-lilac-primary text-white shadow-md shadow-lilac-primary/20'
                    : 'bg-lilac-bg text-lilac-accent hover:bg-lilac-secondary border border-lilac-border'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === 'unread'
                    ? 'bg-lilac-primary text-white shadow-md shadow-lilac-primary/20'
                    : 'bg-lilac-bg text-lilac-accent hover:bg-lilac-secondary border border-lilac-border'
                }`}
              >
                New ({notifications.filter(n => !n.read).length})
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-lilac-bg rounded-xl border border-lilac-border text-[10px] font-black tracking-widest uppercase text-lilac-accent">
            <BellIcon className="w-4 h-4 shadow-sm" />
            <span>{notifications.filter(n => !n.read).length} Unread Alerts</span>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-lilac-border p-16 text-center shadow-lg border-dashed">
            <div className="w-20 h-20 bg-lilac-bg rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-lilac-border opacity-50">
              <BellIcon className="w-10 h-10 text-lilac-primary" />
            </div>
            <h3 className="text-xl font-black text-lilac-text uppercase tracking-tight mb-2">Zero Notifications</h3>
            <p className="text-lilac-muted font-medium mb-8 max-w-sm mx-auto leading-relaxed">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications found in your inbox."
                : filter === 'all'
                ? "Your notification feed is empty. New alerts will appear here as workflows execute."
                : `No activity found for your ${filter} filter.`
              }
            </p>
            
            <div className="bg-lilac-bg/40 rounded-2xl p-6 max-w-md mx-auto border border-lilac-border">
              <p className="text-[10px] font-black text-lilac-accent uppercase tracking-widest mb-4">Feed Details:</p>
              <ul className="text-xs text-lilac-text space-y-3 text-left font-bold">
                <li className="flex items-center gap-2">• <span className="opacity-70">New Workflow Initiations</span></li>
                <li className="flex items-center gap-2">• <span className="opacity-70">Approval Request Alerts</span></li>
                <li className="flex items-center gap-2">• <span className="opacity-70">Step & Rule Completions</span></li>
                <li className="flex items-center gap-2">• <span className="opacity-70">System Health Updates</span></li>
              </ul>
            </div>
            
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-8 text-lilac-accent hover:underline text-xs font-black uppercase tracking-widest"
              >
                Show All activity
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const styles = getNotificationStyles(notification.type);
            return (
              <div
                key={notification._id || notification.id}
                className={`group border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${
                  notification.read ? 'bg-white/40 border-lilac-border/50' : `${styles.border} ${styles.bg} shadow-md`
                } hover:border-lilac-primary`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex items-start space-x-6 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                      notification.read ? 'bg-lilac-bg border-lilac-border' : 'bg-white border-white'
                    } group-hover:scale-110`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                        <h3 className={`text-lg font-black tracking-tight uppercase truncate ${
                          notification.read ? 'text-lilac-text/60' : 'text-lilac-text'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border ${styles.badge}`}>
                            {notification.type}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-lilac-muted/70 flex items-center">
                            <ClockIcon className="w-3.2 h-3.2 mr-1" />
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm font-bold leading-relaxed ${
                        notification.read ? 'text-lilac-muted' : 'text-lilac-text'
                      }`}>
                        {notification.message}
                      </p>
                      {notification.action_url && (
                        <button
                          onClick={() => navigate(notification.action_url)}
                          className="mt-4 px-4 py-2 bg-lilac-bg text-lilac-accent text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-lilac-border hover:bg-lilac-secondary transition-all flex items-center gap-2 group/btn"
                        >
                          <DocumentTextIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          Inspect Event
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end md:self-start opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id || notification.id)}
                        className="w-10 h-10 flex items-center justify-center bg-white text-lilac-accent border border-lilac-border rounded-xl hover:bg-lilac-primary hover:text-white transition-all shadow-sm"
                        title="Mark as read"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id || notification.id)}
                      className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      title="Delete notification"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
