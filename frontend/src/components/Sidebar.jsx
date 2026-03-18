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
  PlusIcon
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
    { name: "Dashboard Builder", path: "/dashboard-builder", icon: PlusIcon },
    { name: "Workflows", path: "/workflows", icon: DocumentTextIcon },
    { name: "Workflow Editor", path: "/workflow-editor", icon: PencilSquareIcon },
    { name: "Step Editor", path: "/step-editor", icon: WrenchScrewdriverIcon },
    { name: "Rule Editor", path: "/rule-editor", icon: CogIcon },
    { name: "Execute Workflow", path: "/execute-workflow", icon: PlayIcon },
    { name: "Execution Logs", path: "/logs", icon: ChartBarIcon },
    { name: "Approvals", path: "/approvals", icon: CheckCircleIcon },
    { name: "Notifications", path: "/notifications", icon: BellIcon },
    { name: "Audit Logs", path: "/audit", icon: ClipboardDocumentListIcon },
    { name: "User Management", path: "/role-management", icon: UserGroupIcon }
  ];

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-200">
      {/* Logo Section */}
      <div className="flex items-center h-16 px-6 border-b border-slate-800">
        <div className="flex items-center">
          <BuildingOfficeIcon className="w-8 h-8 text-white mr-3" />
          <span className="text-white font-semibold text-lg">Workflow</span>
        </div>
      </div>

      {/* User Section */}
      {currentUser && (
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-slate-300" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{currentUser.displayName || currentUser.username}</p>
              <p className="text-slate-400 text-xs capitalize">{currentUser.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              location.pathname === item.path
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {React.createElement(item.icon, { className: "w-5 h-5 mr-3" })}
            <span className="flex-1 text-left">{item.name}</span>
            {location.pathname === item.path && (
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            )}
          </button>
        ))}
      </nav>

      {/* Logout Section */}
      {currentUser && (
        <div className="px-4 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
