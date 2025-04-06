'use client';
import React, { useState } from 'react';
import {
  Users,
  // Settings,
  BarChart2,
  Bell,
  Grid,
  Database,
  HelpCircle,
  LogOut,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import NavItem from './components/NavItem';
// import SubMenuItem from './components/SubMenuItem'; // Assuming SubMenuItem exists and works
import Link from 'next/link';
interface SideBarProps {
  onContentChange?: (contentId: string) => void;
}

const SideBar: React.FC<SideBarProps> = ({ onContentChange }) => {
  const [collapsed, setCollapsed] = useState(false); // Sidebar collapse state
  const [activeItem, setActiveItem] = useState('dashboard');
  const notificationCount = 3;

  const handleNavClick = (contentId: string) => {
    setActiveItem(contentId);
    if (onContentChange) {
      onContentChange(contentId);
    }
    // Optional: Automatically close submenus when a main item is clicked
    // This depends on how you want the UX to feel
  };

  // Separate handler for sub-menu items if needed, or adjust NavItem's logic
  // const handleSubNavClick = (contentId: string) => {
  //   setActiveItem(contentId); // Set active based on sub-item ID
  //   if (onContentChange) {
  //     onContentChange(contentId);
  //   }
  // };


  return (
    <div className={`flex flex-col h-screen bg-gray-800 ${collapsed ? 'w-16' : 'w-64'} transition-all duration-200 ease-in-out`}>
      {/* Logo and Toggle */}
      <Link href="/" className="py-1 text-white text-sm flex flex-row relative ">
        <div className="hover:bg-gray-900 duration-200 rounded-sm py-1 pl-2 pr-4 ">

          <ArrowLeft size={14} color='white' className="bottom-3 absolute" />
          <p className="pl-5 text-white">Home</p>
        </div>
      </Link>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && <span className="text-xl font-bold text-white truncate">Admin Panel</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-gray-700 text-gray-300"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} // Accessibility improvement
        >
          <Grid size={20} />
        </button>
      </div>

      {/* Admin Info - Conditionally render based on collapsed state */}
      {!collapsed && (
        <div className="flex items-center p-4 border-b border-gray-700">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-gray-400 truncate">Administrator</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 space-y-2">
        <NavItem
          href="/admin/dashboard"
          icon={<BarChart2 size={20} />}
          title="Dashboard"
          active={activeItem === 'dashboard'}
          onClick={handleNavClick}
          collapsed={collapsed} // Pass the state variable
        />

        <NavItem
          href="/admin/users"
          icon={<Users size={20} />}
          title="User Management"
          active={activeItem === 'users'}
          onClick={handleNavClick}
          collapsed={collapsed} // Pass the state variable
        />

        <NavItem
          href="/admin/bug-reports"
          icon={<MessageSquare size={20} />}
          title="Bug Reports"
          active={activeItem === 'bug-reports'} // Ensure contentId matches href suffix
          onClick={handleNavClick}
          collapsed={collapsed} // Pass the state variable
        />

        {/* System Header - Conditionally render based on collapsed state */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-2 text-xs uppercase text-gray-500 font-semibold">
            System
          </div>
        )}

        {/* <div className="hidden">
          <NavItem
            // No href for parent items with children if they only toggle
            icon={<Settings size={20} />}
            title="Settings"
            // Active state for parent can be tricky, often based on children
            active={activeItem.startsWith('settings')}
            collapsed={collapsed} // Pass the state variable
          // onClick is handled internally by NavItem for toggling children
          >
            <SubMenuItem title="General" href="/admin/settings/general" onClick={handleSubNavClick} active={activeItem === 'general'} />
            <SubMenuItem title="Security" href="/admin/settings/security" onClick={handleSubNavClick} active={activeItem === 'security'} />
            <SubMenuItem title="Appearance" href="/admin/settings/appearance" onClick={handleSubNavClick} active={activeItem === 'appearance'} />
            <SubMenuItem title="Notifications" href="/admin/settings/notifications" onClick={handleSubNavClick} active={activeItem === 'notifications'} />
          </NavItem></div>
         */}


        <NavItem
          href="/admin/database"
          icon={<Database size={20} />}
          title="Database"
          active={activeItem === 'database'}
          onClick={handleNavClick}
          collapsed={collapsed} // Pass the state variable
        />

        <NavItem
          href="/admin/notifications"
          icon={<Bell size={20} />}
          // Simpler title - the span holding it will be hidden anyway
          title={`Notifications ${notificationCount > 0 ? `(${notificationCount})` : ""}`}
          active={activeItem === 'notifications'}
          onClick={handleNavClick}
          collapsed={collapsed} // Pass the state variable
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <NavItem
          href="/admin/help"
          icon={<HelpCircle size={20} />}
          title="Help & Support"
          active={activeItem === 'help'}
          onClick={handleNavClick}
          collapsed={collapsed} // Pass the state variable
        />

        <NavItem
          href="/logout" // Or maybe just use onClick for actions like logout
          icon={<LogOut size={20} />}
          title="Logout"
          active={false} // Logout usually isn't an "active" state
          onClick={() => console.log('Logout clicked')} // Handle logout action
          collapsed={collapsed} // Pass the state variable
        />
      </div>
    </div>
  );
};

export default SideBar;