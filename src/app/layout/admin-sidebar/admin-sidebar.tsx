'use client';
import React, { useState } from 'react';
import { 
  Users, 
  Settings, 
  BarChart2, 
  FileText, 
  Bell, 
  Grid, 
  Database, 
  HelpCircle, 
  LogOut,
  MessageSquare
} from 'lucide-react';
import NavItem from './components/NavItem';
import SubMenuItem from './components/SubMenuItem';

interface SideBarProps {
  onContentChange?: (contentId: string) => void;
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
    <div className={`flex flex-col h-screen bg-gray-900 ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && <span className="text-xl font-bold text-white">Admin Panel</span>}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1 rounded-full hover:bg-gray-700 text-gray-300"
        >
          <Grid size={20} />
        </button>
      </div>

      {/* Admin Info */}
      {!collapsed && (
        <div className="flex items-center p-4 border-b border-gray-700">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-400">Administrator</p>
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
        />
        
        <NavItem
          href="/admin/users" 
          icon={<Users size={20} />} 
          title="User Management" 
          active={activeItem === 'users'}
          onClick={handleNavClick}
        />
        <NavItem 
          href="/admin/orders" 
          icon={<FileText size={20} />} 
          title="Orders" 
          active={activeItem === 'orders'}
          onClick={handleNavClick}
        />
        
        <NavItem  
          href="/admin/bug-reports" 
          icon={<MessageSquare size={20} />} 
          title="Bug Reports" 
          active={activeItem === 'bug-report'}
          onClick={handleNavClick}
        />

        
        <div className="px-4 py-2 text-xs uppercase text-gray-500 font-semibold mt-4">
          System
        </div>
        
        <NavItem 
          href="/admin/settings" 
          icon={<Settings size={20} />} 
          title="Settings" 
          active={activeItem.startsWith('settings')}
          onClick={handleNavClick}
        >
          <SubMenuItem title="General" href="/admin/settings/general" onClick={handleNavClick} />
          <SubMenuItem title="Security" href="/admin/settings/security" onClick={handleNavClick} />
          <SubMenuItem title="Appearance" href="/admin/settings/appearance" onClick={handleNavClick} />
          <SubMenuItem title="Notifications" href="/admin/settings/notifications" onClick={handleNavClick} />
        </NavItem>
        
        <NavItem 
          href="/admin/database" 
          icon={<Database size={20} />} 
          title="Database" 
          active={activeItem === 'database'}
          onClick={handleNavClick}
        />
        
        <NavItem 
          href="/admin/notifications" 
          icon={<Bell size={20} />} 
          title={collapsed ? "" : `Notifications ${notificationCount > 0 ? `(${notificationCount})` : ""}`}
          active={activeItem === 'notifications'}
          onClick={handleNavClick}
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
        />
        
        <NavItem 
          href="/logout" 
          icon={<LogOut size={20} />} 
          title="Logout" 
          active={false}
          onClick={() => console.log('Logout clicked')}
        />
      </div>
    </div>
  );
};

export default SideBar;