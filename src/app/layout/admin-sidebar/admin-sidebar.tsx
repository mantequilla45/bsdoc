'use client';
import React, { useState } from 'react';
import {
  Users,
  BarChart2,
  Bell,
  ChevronLeft,
  ChevronRight,
  Database,
  HelpCircle,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import NavItem from './components/NavItem';
import { FaCheckDouble } from 'react-icons/fa6';

interface SideBarProps {
  onContentChange?: (contentId: string) => void;
  activeContentId: string;
}

const SideBar: React.FC<SideBarProps> = ({ onContentChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const notificationCount = 3;

  const handleNavClick = (contentId: string) => {
    setActiveItem(contentId);
    if (onContentChange) {
      onContentChange(contentId);
    }
  };

  return (
    <aside
      className={`
        flex flex-col h-screen sticky top-0 bg-gray-800 shadow-lg
        transition-all duration-300 ease-in-out
        ${collapsed ? 'md:w-16 w-14' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className="flex items-center md:justify-between justify-center md:p-4 py-2 border-b border-gray-700">
        {!collapsed && (
          <span className="md:text-xl text-md font-bold text-white truncate">
            Admin Panel
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-gray-700 text-white transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* User profile */}
      {!collapsed && (
        <div className="flex items-center p-4 border-b border-gray-700">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            A
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-white opacity-75 truncate">Administrator</p>
          </div>
        </div>
      )}

      {/* Back to Home */}
      <div className="md:px-3 pt-4">
        <NavItem
          href="/"
          icon={<ChevronLeft size={18} />}
          title="Back to Home"
          collapsed={collapsed}
        />
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto py-4 md:px-3 px-0 space-y-1">
        <NavItem
          href="/admin/dashboard"
          icon={<BarChart2 size={20} />}
          title="Dashboard"
          active={activeItem === 'dashboard'}
          onClick={handleNavClick}
          collapsed={collapsed}
        />

        <NavItem
          href="/admin/user-management"
          icon={<Users size={20} />}
          title="User Management"
          active={activeItem === 'user-management'}
          onClick={handleNavClick}
          collapsed={collapsed}
        />

        <NavItem
          href="/admin/bug-reports"
          icon={<MessageSquare size={20} />}
          title="Bug Reports"
          active={activeItem === 'bug-reports'}
          onClick={handleNavClick}
          collapsed={collapsed}
        />

        <NavItem
          href="/admin/doctor-verification"
          icon={<FaCheckDouble size={20} />}
          title="Doctor Verification"
          active={activeItem === 'doctor-verification'}
          onClick={handleNavClick}
          collapsed={collapsed}
        />
        
        {!collapsed && (
          <div className="pt-6 mb-2 px-3 text-xs uppercase text-white font-semibold tracking-wider opacity-80">
            System
          </div>
        )}

        <NavItem
          href="/admin/database"
          icon={<Database size={20} />}
          title="Database"
          active={activeItem === 'database'}
          onClick={handleNavClick}
          collapsed={collapsed}
        />

        <NavItem
          href="/admin/notifications"
          icon={<Bell size={20} />}
          title="Notifications"
          badge={notificationCount}
          active={activeItem === 'notifications'}
          onClick={handleNavClick}
          collapsed={collapsed}
        />
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-gray-700 pt-2 pb-4 md:px-3 space-y-1">
        <NavItem
          href="/admin/help"
          icon={<HelpCircle size={20} />}
          title="Help & Support"
          active={activeItem === 'help'}
          onClick={handleNavClick}
          collapsed={collapsed}
        />

        <NavItem
          href="/logout"
          icon={<LogOut size={20} />}
          title="Logout"
          onClick={() => console.log('Logout clicked')}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
};

export default SideBar;