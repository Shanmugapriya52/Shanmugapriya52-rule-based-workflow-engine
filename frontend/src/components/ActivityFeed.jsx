import { useNavigate } from "react-router-dom";
import { useNotifications } from "../services/NotificationService";
import { 
  BellIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

export default function ActivityFeed() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'approval_required':
      case 'approval':
        return <CheckCircleIcon className="w-5 h-5 text-amber-500" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
      case 'rejection':
      case 'failed':
        return <ExclamationCircleIcon className="w-5 h-5 text-rose-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-lilac-primary" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id || notification.id);
    if (notification.type === 'approval_required' || notification.type === 'approval') {
      navigate('/approvals');
    } else if (notification.execution_id) {
      navigate(`/logs?id=${notification.execution_id}`);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-lilac-border shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-lilac-border/50 flex items-center justify-between bg-gradient-to-br from-lilac-bg/30 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-lilac-primary/10 rounded-xl border border-lilac-primary/20">
            <BellIcon className="w-5 h-5 text-lilac-primary" />
          </div>
          <div>
            <h3 className="text-lg font-black text-lilac-text uppercase tracking-tight">Activity Feed</h3>
            {unreadCount > 0 && (
              <p className="text-[10px] font-black text-lilac-accent uppercase tracking-widest mt-0.5">{unreadCount} New Alerts</p>
            )}
          </div>
        </div>
        <button 
          onClick={() => navigate('/notifications')}
          className="p-2 text-lilac-muted hover:text-lilac-primary transition-colors hover:bg-lilac-bg rounded-lg"
          title="View All"
        >
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <InformationCircleIcon className="w-12 h-12 text-lilac-muted/30 mb-4" />
            <p className="text-xs font-black text-lilac-muted uppercase tracking-widest">No recent activity</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <div 
              key={notification._id || notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group flex gap-4 ${
                notification.read 
                  ? 'bg-white/40 border-lilac-border/30 grayscale-[0.5] opacity-80' 
                  : 'bg-white border-lilac-primary/20 shadow-sm hover:border-lilac-primary hover:shadow-md'
              }`}
            >
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
                notification.read ? 'bg-lilac-bg/50 border-lilac-border' : 'bg-white border-lilac-primary/20 shadow-inner'
              }`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-xs font-black uppercase tracking-tight truncate ${
                    notification.read ? 'text-lilac-muted' : 'text-lilac-text'
                  }`}>
                    {notification.title}
                  </h4>
                  <span className="text-[9px] font-black text-lilac-muted/60 uppercase shrink-0">
                    {formatTime(notification.created_at)}
                  </span>
                </div>
                <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                  notification.read ? 'text-lilac-muted' : 'text-lilac-text/90 font-medium'
                }`}>
                  {notification.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-lilac-bg/20 border-t border-lilac-border/50">
        <button 
          onClick={() => navigate('/notifications')}
          className="w-full py-2 text-[10px] font-black text-lilac-accent hover:text-lilac-primary uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
        >
          Synchronize Full Logs
          <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
