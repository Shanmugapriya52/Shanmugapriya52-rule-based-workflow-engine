import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  HomeIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  PlayIcon,
  ChartBarIcon,
  CheckCircleIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  FolderIcon,
  TagIcon,
  ArchiveBoxIcon,
  ChartPieIcon,
  UsersIcon,
  CalendarIcon,
  DocumentMagnifyingGlassIcon,
  Square3Stack3DIcon,
  LightBulbIcon,
  FireIcon,
  RocketLaunchIcon
} from "@heroicons/react/24/outline";

export default function ResponsiveSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }

    // Check screen size with better breakpoints
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false); // Close menu on desktop
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const navSections = [
    {
      title: "Main",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: HomeIcon, badge: null },
        { name: "Dashboard Builder", path: "/dashboard-builder", icon: PlusIcon, badge: "Admin", allowedRoles: ['admin'] },
      ]
    },
    {
      title: "Workflow Management",
      items: [
        { name: "Workflows", path: "/workflows", icon: DocumentTextIcon, badge: null, allowedRoles: ['admin'] },
        { name: "Workflow Editor", path: "/workflow-editor", icon: PencilSquareIcon, badge: null, allowedRoles: ['admin'] },
        { name: "Step Editor", path: "/step-editor", icon: WrenchScrewdriverIcon, badge: null, allowedRoles: ['admin'] },
        { name: "Rule Editor", path: "/rule-editor", icon: CogIcon, badge: null, allowedRoles: ['admin'] },
        { name: "Execute Workflow", path: "/execute-workflow", icon: PlayIcon, badge: null, allowedRoles: ['admin', 'Manager', 'Finance', 'Employee', 'CEO', 'Developer'] },
      ]
    },
    {
      title: "Monitoring",
      items: [
        { name: "Execution Logs", path: "/logs", icon: ChartBarIcon, badge: null, allowedRoles: ['admin', 'Manager', 'Finance', 'CEO', 'Developer'] },
        { name: "Approvals", path: "/approvals", icon: CheckCircleIcon, badge: null, allowedRoles: ['admin', 'Manager', 'Finance', 'CEO'] },
        { name: "Notifications", path: "/notifications", icon: BellIcon, badge: null, allowedRoles: ['admin', 'Manager', 'Finance', 'Employee', 'CEO', 'Developer'] },
      ]
    },
    {
      title: "System",
      items: [
        { name: "Audit Logs", path: "/audit", icon: ClipboardDocumentListIcon, badge: null, allowedRoles: ['admin'] },
        { name: "Automation", path: "/automation", icon: CogIcon, badge: "New", allowedRoles: ['admin'] },
        { name: "User Management", path: "/role-management", icon: UserGroupIcon, badge: null, allowedRoles: ['admin'] },
        { name: "Settings", path: "/settings", icon: CogIcon, badge: null, allowedRoles: ['admin'] },
      ]
    }
  ];

  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      !item.allowedRoles || (currentUser && item.allowedRoles.includes(currentUser.role))
    )
  })).filter(section => section.items.length > 0);

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isMobileMenuOpen && !event.target.closest('.mobile-sidebar')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 p-2.5 sm:p-3 bg-white border border-slate-200/50 text-slate-800 rounded-xl shadow-lg lg:hidden hover:bg-slate-50 hover:shadow-xl transition-all duration-300"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40" onClick={toggleMobileMenu} />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-md border-r border-lilac-border shadow-[4px_0_24px_-4px_rgba(200,162,255,0.15)] transform transition-transform duration-300 ease-in-out z-50 mobile-sidebar flex flex-col ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`
          : 'hidden lg:flex lg:flex-col lg:relative w-72 flex-shrink-0 h-full bg-white/80 backdrop-blur-xl border-r border-lilac-border overflow-hidden'
        }
      `}>
        {/* Logo Section */}
        <div className="flex items-center h-16 px-6 border-b border-lilac-border bg-white/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-lilac-primary to-lilac-accent rounded-lg flex items-center justify-center shadow-[0_4px_14px_0_rgba(200,162,255,0.39)]">
              <FireIcon className="w-4 h-4 text-white" />
            </div>
            <span className="ml-3 text-lilac-text font-bold text-lg">Workflow Pro</span>
          </div>
          {isMobile && (
            <button
              onClick={toggleMobileMenu}
              className="ml-auto p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Section */}
        {currentUser && (
          <div className="px-4 py-4 border-b border-lilac-border bg-lilac-bg/50 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-lilac-primary to-lilac-accent border border-lilac-border rounded-xl flex items-center justify-center shadow-sm shadow-lilac-primary/20">
                <span className="text-white font-bold text-sm">
                  {(currentUser.displayName || currentUser.username || 'User').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lilac-text font-semibold text-sm truncate">{currentUser.displayName || currentUser.username}</p>
                <p className="text-lilac-accent text-xs capitalize font-medium">{currentUser.role}</p>
              </div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto w-full max-h-full scrollbar-thin scrollbar-thumb-lilac-secondary scrollbar-track-transparent">
          {filteredSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="px-3 text-xs font-semibold text-lilac-muted uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-lilac-primary to-lilac-accent text-white shadow-[0_4px_14px_0_rgba(200,162,255,0.3)]'
                        : 'text-lilac-text hover:bg-lilac-secondary/50 hover:text-lilac-accent'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                      location.pathname === item.path ? 'text-white' : 'text-lilac-muted group-hover:text-lilac-accent'
                    }`} />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        location.pathname === item.path
                          ? 'bg-white/20 text-white'
                          : 'bg-lilac-secondary text-lilac-text group-hover:bg-lilac-bg'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {location.pathname === item.path && (
                      <div className="absolute inset-y-0 right-0 w-1 bg-white rounded-l-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Quick Actions & Logout */}
        <div className="px-3 py-4 border-t border-lilac-border bg-white/50 flex-shrink-0 space-y-2 pb-6">
          <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-lilac-text bg-white/80 hover:bg-white rounded-xl transition-all duration-200 border border-lilac-border shadow-sm hover:border-lilac-primary">
            <LightBulbIcon className="w-5 h-5 mr-3 text-amber-500" />
            <span className="flex-1 text-left">Tips & Tricks</span>
          </button>
          
          <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-lilac-text bg-white/80 hover:bg-white rounded-xl transition-all duration-200 border border-lilac-border shadow-sm hover:border-lilac-primary">
            <RocketLaunchIcon className="w-5 h-5 mr-3 text-lilac-accent" />
            <span className="flex-1 text-left">What's New</span>
          </button>

          {currentUser && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 mt-2 text-sm font-medium text-rose-600 bg-white/80 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 rounded-xl transition-all duration-200 group border border-lilac-border shadow-sm"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
