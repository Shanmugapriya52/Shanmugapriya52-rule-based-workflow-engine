import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../services/NotificationService";
import {
  BellIcon,
  UserCircleIcon,
  DocumentTextIcon,
  PlayIcon,
  Bars3Icon,
  PlusIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const navigate = useNavigate();
  const { notifications, unreadCount, approvalCount, sendNotification, markAsRead } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour ago`;
    if (diffDays < 7) return `${diffDays} day ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    setShowNotifications(false);
    // Mark as read
    markAsRead(notification._id);
    // Navigate based on notification type
    switch(notification.type) {
      case 'approval':
        navigate('/approvals');
        break;
      case 'success':
        navigate('/logs');
        break;
      default:
        navigate('/dashboard');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowNotifications(false);
        setShowUserMenu(false);
        setShowTips(false);
        setShowWhatsNew(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="h-16 bg-white/80 backdrop-blur-xl border-b border-lilac-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40 shadow-[0_4px_24px_-4px_rgba(200,162,255,0.05)]">
      {/* Left side - Mobile Menu & Page Title */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="lg:hidden p-2 text-lilac-text hover:text-lilac-accent hover:bg-lilac-bg rounded-lg transition-colors"
          onClick={toggleMobileMenu}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-lilac-primary to-lilac-accent uppercase tracking-tighter">
            {currentUser.organizationName || 'Workflow OS'}
          </h1>
        </div>
      </div>
      
      {/* Right Side Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Actions - Desktop Only (Admin Only) */}
        {currentUser.role === 'admin' && (
          <div className="hidden lg:flex items-center gap-2">
            <button 
              onClick={() => navigate("/dashboard-builder")}
              className="p-2 text-lilac-accent hover:text-purple-600 hover:bg-lilac-secondary/50 rounded-lg transition-colors"
              title="Dashboard Builder"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate("/workflows")}
              className="p-2 text-lilac-text hover:text-lilac-accent hover:bg-lilac-secondary/50 rounded-lg transition-colors"
              title="Workflows"
            >
              <DocumentTextIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate("/execute-workflow")}
              className="p-2 text-lilac-text hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Execute"
            >
              <PlayIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Tips & Tricks */}
        <div className="relative dropdown-container">
          <button 
            className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Tips & Tricks"
            onClick={() => {
              setShowTips(!showTips);
              setShowNotifications(false);
              setShowUserMenu(false);
              setShowWhatsNew(false);
            }}
          >
            <LightBulbIcon className="w-5 h-5" />
          </button>
          {showTips && (
            <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.2)] border border-lilac-border z-50 overflow-hidden">
              <div className="p-4 bg-gradient-to-br from-amber-50/50 to-white">
                <h3 className="font-semibold text-lilac-text mb-3 flex items-center"><LightBulbIcon className="w-4 h-4 mr-2 text-amber-500"/>Tips & Tricks</h3>
                <div className="space-y-2 text-sm text-lilac-text/80">
                  <p>• Use keyboard shortcuts to navigate faster</p>
                  <p>• Customize your dashboard for better productivity</p>
                  <p>• Set up automated workflows to save time</p>
                  <p>• Use templates for consistent workflow creation</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* What's New */}
        <div className="relative dropdown-container">
          <button 
            className="p-2 text-lilac-accent hover:text-purple-600 hover:bg-lilac-bg rounded-lg transition-colors"
            title="What's New"
            onClick={() => {
              setShowWhatsNew(!showWhatsNew);
              setShowNotifications(false);
              setShowUserMenu(false);
              setShowTips(false);
            }}
          >
            <RocketLaunchIcon className="w-5 h-5" />
          </button>
          {showWhatsNew && (
            <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.2)] border border-lilac-border z-50 overflow-hidden">
              <div className="p-4 bg-gradient-to-br from-lilac-bg/50 to-white">
                <h3 className="font-semibold text-lilac-text mb-3 flex items-center"><RocketLaunchIcon className="w-4 h-4 mr-2 text-lilac-accent"/>What's New</h3>
                <div className="space-y-3">
                  <div className="pb-2 border-b border-lilac-border/50">
                    <p className="font-medium text-lilac-text">Dynamic Dashboard Builder</p>
                    <p className="text-sm text-lilac-muted">Create custom dashboards for different roles</p>
                  </div>
                  <div className="pb-2 border-b border-lilac-border/50">
                    <p className="font-medium text-lilac-text">Enhanced Workflow Engine</p>
                    <p className="text-sm text-lilac-muted">Improved performance and reliability</p>
                  </div>
                  <div>
                    <p className="font-medium text-lilac-text">Mobile Responsive Design</p>
                    <p className="text-sm text-lilac-muted">Better experience on all devices</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Approvals Link (Common for all users) */}
        <button 
          onClick={() => navigate('/approvals')}
          className="p-2 text-lilac-text hover:text-lilac-accent hover:bg-lilac-secondary/30 rounded-lg transition-colors relative"
          title="Pending Approvals"
        >
          <CheckBadgeIcon className="w-5 h-5" />
          {approvalCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm shadow-emerald-200">
              {approvalCount}
            </span>
          )}
        </button>

        {/* Notifications */}
        <div className="relative dropdown-container">
          <button 
            className="p-2 text-lilac-text hover:text-lilac-accent hover:bg-lilac-secondary/30 rounded-lg transition-colors relative"
            title="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
              setShowTips(false);
              setShowWhatsNew(false);
            }}
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm shadow-rose-200">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.2)] border border-lilac-border z-50 overflow-hidden">
              <div className="p-4 border-b border-lilac-border bg-gradient-to-br from-lilac-bg/30 to-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lilac-text">Notifications</h3>
                  <button 
                    onClick={() => navigate('/notifications')}
                    className="text-sm font-medium text-lilac-primary hover:text-lilac-accent transition-colors"
                  >
                    View all
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-lilac-secondary scrollbar-track-transparent">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="p-4 border-b border-lilac-border/30 hover:bg-lilac-bg/50 cursor-pointer transition-colors"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-lilac-text text-sm">{notification.title}</p>
                        <p className="text-sm text-lilac-text/80 mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-lilac-muted mt-2 font-medium">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative dropdown-container">
          <button 
            className="p-2 text-lilac-text hover:text-lilac-accent hover:bg-lilac-secondary/30 rounded-lg transition-colors"
            title="User menu"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
              setShowTips(false);
              setShowWhatsNew(false);
            }}
          >
            <UserCircleIcon className="w-5 h-5" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_-4px_rgba(200,162,255,0.2)] border border-lilac-border z-50 overflow-hidden">
              <div className="p-4 border-b border-lilac-border bg-gradient-to-br from-lilac-bg/50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-lilac-primary to-lilac-accent rounded-full flex items-center justify-center shadow-md shadow-lilac-primary/20">
                    <span className="text-white font-bold">
                      {(currentUser.displayName || currentUser.username || 'User').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-lilac-text">{currentUser.displayName || currentUser.username || 'User'}</p>
                    <p className="text-xs font-medium text-lilac-accent uppercase tracking-wider mt-0.5">{currentUser.role || 'User'}</p>
                  </div>
                </div>
              </div>
              <div className="p-2 bg-white">
                {currentUser.role === 'admin' && (
                  <button 
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-lilac-text hover:bg-lilac-bg hover:text-lilac-accent rounded-xl transition-colors"
                  >
                    <CogIcon className="w-4 h-4" />
                    Settings
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors mt-1"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
