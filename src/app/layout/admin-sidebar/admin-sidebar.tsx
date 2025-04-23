/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useCallback, useEffect, useState } from 'react';
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
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { signOut } from '@/services/Auth/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface SideBarProps {
  onContentChange?: (contentId: string) => void;
  activeContentId: string;
  unreadNotificationsCount: number;
}

const SideBar: React.FC<SideBarProps> = ({ onContentChange, activeContentId, unreadNotificationsCount }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState(activeContentId || 'dashboard');
  const router = useRouter();
  //const notificationCount = 3;

  // const [unreadCount, setUnreadCount] = useState<number>(0);
  // const [isLoadingCount, setIsLoadingCount] = useState<boolean>(true);

  // const [user, setUser] = useState<User | null>(null); // eslint-disable-line
  // const [authToken, setAuthToken] = useState<string | null>(null);

  // // *** 3. Effect to handle Authentication State and get Token ***
  // useEffect(() => {
  //   // Initial check for session
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setUser(session?.user ?? null);
  //     setAuthToken(session?.access_token ?? null);
  //     // Initial fetch might be triggered by the second useEffect if token is found
  //   });

  //   // Listen for auth changes
  //   const { data: authListener } = supabase.auth.onAuthStateChange(
  //     (event, session) => {
  //       console.log('Admin Sidebar Auth Event:', event); // Log auth events
  //       const currentUser = session?.user ?? null;
  //       const currentToken = session?.access_token ?? null;
  //       setUser(currentUser);
  //       setAuthToken(currentToken);

  //       if (event === 'SIGNED_OUT') {
  //         setUnreadCount(0); // Reset count on logout
  //         setIsLoadingCount(false); // Stop loading on logout
  //       }
  //       // Fetching logic will be handled by the second useEffect below
  //     }
  //   );

  //   // Cleanup listener on component unmount
  //   return () => {
  //     authListener?.subscription.unsubscribe();
  //   };
  // }, []); // Runs only once on mount

  // // --- Function to fetch count (now depends on token availability) ---
  // const fetchUnreadCount = useCallback(async (token: string) => {
  //   setIsLoadingCount(true);
  //   console.log('[AdminSidebar] Fetching unread count...');
  //   try {
  //     const response = await fetch('/api/admin/notifications?filter=unread&countOnly=true', {
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });
  //     if (!response.ok) {
  //       const errorData = await response.text();
  //       console.error(`[AdminSidebar] Failed to fetch count: ${response.status}`, errorData);
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const result = await response.json();
  //     setUnreadCount(result.count ?? 0);
  //     console.log(`[AdminSidebar] Unread count fetched: ${result.count ?? 0}`);
  //   } catch (error) {
  //     console.error('[AdminSidebar] Error fetching unread count:', error);
  //     setUnreadCount(0); // Default to 0 on error
  //   } finally {
  //     setIsLoadingCount(false);
  //   }
  // }, []); // useCallback ensures the function identity is stable


  // // *** 4. Separate Effect to Fetch Count when authToken is available ***
  // useEffect(() => {
  //   if (authToken) {
  //     // Fetch count only when we have a token
  //     fetchUnreadCount(authToken);
  //   } else {
  //     // If token becomes null (e.g., after logout handled by auth listener), reset state
  //     setUnreadCount(0);
  //     setIsLoadingCount(false); // Ensure loading stops if token disappears
  //   }
  // }, [authToken, fetchUnreadCount]); // Re-run this effect if authToken changes

  const handleNavClick = (contentId: string) => {
    setActiveItem(contentId);
    if (onContentChange) {
      onContentChange(contentId);
    }
  };

  const handleLogout = async () => {
    console.log('Logout initiated...');
    try {
      await signOut(); // Call the signOut function from your auth service
      console.log('Sign out successful.');
      toast.success('Sign out successful.');
      // Redirect to homepage after logout
      router.push('/');
      // Optionally, refresh the page to ensure all state is cleared, though Next.js routing should handle much of this.
      router.refresh(); // Helps ensure layout components might refetch user state
    } catch (error) {
      console.error("Error logging out:", error);
      // Optionally show an error message to the user
      toast.error("Logout failed. Please try again.");
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
          title="User Feedback"
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
          badge={unreadNotificationsCount > 0 ? unreadNotificationsCount : 0} // Show count only when logged in and not loading
          active={activeItem === 'notifications'}
          onClick={handleNavClick}
          collapsed={collapsed}
        />
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-gray-700 pt-2 pb-4 md:px-3 space-y-1">
        {/* <NavItem
          href="/admin/help"
          icon={<HelpCircle size={20} />}
          title="Help & Support"
          active={activeItem === 'help'}
          onClick={handleNavClick}
          collapsed={collapsed}
        /> */}

        <NavItem
          href="/logout"
          icon={<LogOut size={20} />}
          title="Logout"
          onClick={handleLogout}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
};

export default SideBar;