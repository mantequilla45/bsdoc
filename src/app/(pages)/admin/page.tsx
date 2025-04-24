'use client';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import SideBar from "@/app/layout/admin-sidebar/admin-sidebar";
import UserManagement from "./user-management/user-management";
import BugManagement from './bugs/bug-reports';
import { AdminPanelProvider } from '@/app/context/AdminPanelContext';
import { useSearchParams } from 'next/navigation';
import AdminDoctorVerificationPage from './doctor-verifications/doctor-verification';
import AdminDashboard from './components/AdminDashboard'; // Import the dashboard
import AdminNotificationsPage from './notifications/notifications';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
interface Notification {
    id: string;
    user_id: string;
    type: string;
    message: string;
    link_url?: string | null;
    metadata?: Record<string, any> | null; //eslint-disable-line
    created_at: string;
    is_read: boolean;
}

interface Profile {
    id: string;
    role: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    profile_image_url?: string | null;
}

type NotificationTypeFilter = 'all' | 'VERIFICATION_SUBMITTED' | 'REPORT_SUBMITTED';
// --- End Notification Filter Type ---

function AdminPageContent() {
    const searchParams = useSearchParams();
    const [activeContentId, setactiveContentId] = useState<string>(() => searchParams.get('section') ?? 'dashboard');
    // --- State Lifted from AdminNotificationsPage ---
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(true);
    const [notificationError, setNotificationError] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    // State for filters also lifted if managed here (optional, could stay in AdminNotificationsPage)
    const [selectedType, setSelectedType] = useState<NotificationTypeFilter>('all');
    const [showRead, setShowRead] = useState<boolean>(true);
    // --- End Lifted State ---
    const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

    const handleContentChange = useCallback((contentId: string) => {
        setactiveContentId(contentId);
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('section', contentId);
        window.history.replaceState({}, '', currentUrl.toString());
    }, []);

    useEffect(() => {
        const fetchUserAndData = async () => {
            setIsLoadingProfile(true);
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError; // Throw if session fetch fails

                const currentUser = session?.user;
                const currentToken = session?.access_token ?? null;
                setAuthToken(currentToken);
                if (currentUser) {
                    // Fetch Profile if user exists
                    console.log(`[AdminPageContent] User ${currentUser.id} found. Fetching profile...`);
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('id, first_name, last_name, role, email, profile_image_url') // Select fields needed for sidebar
                        .eq('id', currentUser.id)
                        .single();

                    if (profileError && profileError.code !== 'PGRST116') { // Ignore "not found"
                        console.error("Error fetching admin profile:", profileError);
                        setAdminProfile(null); // Clear profile on error
                        // Optionally show toast error for profile fetch
                        // toast.error("Could not load admin profile details.");
                    } else {
                        setAdminProfile(profileData as Profile ?? null);
                        console.log("[AdminPageContent] Admin profile fetched:", profileData);
                    }
                    setIsLoadingProfile(false);
                }
                else {
                    console.log("[AdminPageContent] No user session found.");
                    setAuthToken(null);
                    setAdminProfile(null);
                    setIsLoadingProfile(false);
                    setIsLoadingNotifications(false); // Stop loading if logged out initially
                }
            }
            catch (error) {
                console.error("Error fetching session or initial data:", error);
                toast.error("Failed to initialize admin session.");
                setAuthToken(null);
                setAdminProfile(null);
                setIsLoadingProfile(false);
                setIsLoadingNotifications(false);
            }
        };
        fetchUserAndData();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                const currentToken = session?.access_token ?? null;
                setAuthToken(currentToken);
                if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || _event === 'USER_UPDATED') {
                    if (session?.user && currentToken) {
                        setIsLoadingProfile(true);
                        const { data: profileData, error: profileError } = await supabase
                            .from('profiles')
                            .select('id, first_name, last_name, role, email, profile_image_url')
                            .eq('id', session.user.id)
                            .single();
                        if (!profileError) setAdminProfile(profileData as Profile ?? null);
                        else console.error("Error refetching profile on auth change:", profileError);
                        setIsLoadingProfile(false);
                        fetchNotifications(currentToken); // Refetch notifications
                    }
                }
                else if (_event === 'SIGNED_OUT') {
                    setNotifications([]);
                    setNotificationError(null);
                    setIsLoadingNotifications(false);
                }
                // Trigger refetch via the other effect when token changes
            }
        );
        return () => authListener?.subscription.unsubscribe();
    }, []);

    const fetchNotifications = useCallback(async (token: string) => {
        if (!token) {
            setNotificationError("Authentication token is missing.");
            setIsLoadingNotifications(false);
            setNotifications([]);
            return;
        }
        setIsLoadingNotifications(true);
        setNotificationError(null);
        try {
            // Fetch ALL relevant admin notifications, filtering happens in render/memo
            const response = await fetch('/api/admin/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
                throw new Error(errData.error ?? `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setNotifications(data.data ?? []);
        } catch (err: any) { //eslint-disable-line
            console.error("Failed to fetch admin notifications:", err);
            setNotificationError(err.message ?? 'An unknown error occurred.');
            setNotifications([]);
        } finally {
            setIsLoadingNotifications(false);
        }
    }, []);

    // Effect to fetch notifications when token changes
    useEffect(() => {
        if (authToken) {
            fetchNotifications(authToken);
        } else {
            // Clear state if token becomes null (logout)
            setIsLoadingNotifications(false);
            setNotifications([]);
            setNotificationError(null); // Clear any previous errors
        }
    }, [authToken, fetchNotifications]);

    // Function to mark a notification as read (updates state here)
    const handleMarkRead = useCallback(async (notificationId: string) => {
        if (!authToken) return;

        const originalNotifications = [...notifications]; // Shallow copy for revert
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));

        try {
            const response = await fetch('/api/admin/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ notification_ids: [notificationId] })
            });
            if (!response.ok) {
                const result = await response.json().catch(() => ({ error: 'Server error' }));
                throw new Error(result.error ?? `Server failed (${response.status})`);
            }
            // Success - state already updated optimistically
            console.log(`[AdminPageContent] Marked ${notificationId} as read successfully.`);
            // Optional: Could refetch here instead of optimistic update for guaranteed consistency
            // fetchNotifications(authToken);
        } catch (err) {
            console.error("Error marking notification as read:", err);
            setNotifications(originalNotifications); // Revert on error
        }
    }, [authToken, notifications]); // Removed fetchNotifications dependency if relying on optimistic update

    // === End Lifted Logic ===

    // --- Calculate Unread Count (using the managed state) ---
    const unreadCount = useMemo(() => {
        // Consider only specific admin types if needed, otherwise count all unread
        // const adminNotificationTypes = ['VERIFICATION_SUBMITTED', 'REPORT_SUBMITTED'];
        // return notifications.filter(n => !n.is_read && adminNotificationTypes.includes(n.type)).length;
        return notifications.filter(n => !n.is_read).length; // Count all unread fetched
    }, [notifications]);

    const pageTitle = (contentId: string): string => {
        switch (contentId) {
            case 'user-management':
                return 'User Management';
            case 'bug-reports':
                return 'User Feedback';
            case 'dashbord':
                return 'Dashboard';
            case 'doctor-verification':
                return 'Doctor Verification';
            case 'notifications':
                return 'Admin Notifications';
            default:
                return contentId
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (char) => char.toUpperCase());
        }
    }

    const renderContent = () => {
        switch (activeContentId) {
            case 'user-management':
                return <UserManagement />;
            case 'bug-reports':
                return <BugManagement />;
            case 'dashboard':
                return <AdminDashboard />; // Render the dashboard component
            case 'doctor-verification':
                return <AdminDoctorVerificationPage />;
            case 'notifications':
                return <AdminNotificationsPage
                    notifications={notifications}
                    isLoading={isLoadingNotifications}
                    error={notificationError}
                    onMarkRead={handleMarkRead} // Pass the central handler
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    showRead={showRead}
                    setShowRead={setShowRead}
                    authToken={authToken}
                />
            default:
                return <div className="p-6 text-gray-600">Select an option from the sidebar or check the URL section.</div>;
        }
    };


    useEffect(() => {
        console.log("[AdminPageContent State Change] Active content changed to:", activeContentId);
    }, [activeContentId]);

    console.log(`[AdminPageContent Pre-Render] Final activeContentId: ${activeContentId}`);

    if (isLoadingProfile && isLoadingNotifications && !adminProfile && !notifications.length) {
        // Show initial full page loading only if both profile and notifications haven't loaded
        return;
    }

    return (
        <AdminPanelProvider switchContent={handleContentChange}>
            <div className="flex h-screen flex-row bg-gray-100">
                <SideBar
                    onContentChange={handleContentChange}
                    activeContentId={activeContentId}
                    unreadNotificationsCount={unreadCount}
                    adminProfile={adminProfile}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                        {pageTitle(activeContentId)}
                    </h1>
                    {renderContent()}
                </main>
            </div>
        </AdminPanelProvider>
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Admin...</div>}>
            <AdminPageContent />
        </Suspense>
    );
}

// 'use client';
// import { Suspense, useCallback, useEffect, useState } from 'react';
// import SideBar from "@/app/layout/admin-sidebar/admin-sidebar";
// import UserManagement from "./user-management/user-management";
// import BugManagement from './bugs/bug-reports';
// import { AdminPanelProvider } from '@/app/context/AdminPanelContext';
// import { useSearchParams } from 'next/navigation';
// import AdminDoctorVerificationPage from './doctor-verifications/doctor-verification';
// import AdminDashboard from './components/AdminDashboard'; // Import the dashboard
// import AdminNotificationsPage from './notifications/notifications';

// function AdminPageContent() {
//     const searchParams = useSearchParams();
//     const [activeContentId, setactiveContentId] = useState<string>(() => searchParams.get('section') ?? 'dashboard');

//     const handleContentChange = useCallback((contentId: string) => {
//         setactiveContentId(contentId);
//     }, []);

//     const renderContent = () => {
//         switch (activeContentId) {
//             case 'user-management':
//                 return <UserManagement />;
//             case 'bug-reports':
//                 return <BugManagement />;
//             case 'dashboard':
//                 return <AdminDashboard />; // Render the dashboard component
//             case 'doctor-verification':
//                 return <AdminDoctorVerificationPage />;
//             case 'notifications':
//                 return <AdminNotificationsPage />
//             default:
//                 return <div className="p-6 text-gray-600">Select an option from the sidebar or check the URL section.</div>;
//         }
//     };

//     useEffect(() => {
//         console.log("[AdminPageContent State Change] Active content changed to:", activeContentId);
//     }, [activeContentId]);

//     console.log(`[AdminPageContent Pre-Render] Final activeContentId: ${activeContentId}`);

//     return (
//         <AdminPanelProvider switchContent={handleContentChange}>
//             <div className="flex h-screen flex-row bg-gray-100">
//                 <SideBar
//                     onContentChange={handleContentChange}
//                     activeContentId={activeContentId}
//                 />
//                 <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-6">
//                     <h1 className="text-2xl font-semibold text-gray-900 mb-6">
//                         {activeContentId
//                             .replace(/-/g, ' ')
//                             .replace(/\b\w/g, (char) => char.toUpperCase())}
//                     </h1>
//                     {renderContent()}
//                 </main>
//             </div>
//         </AdminPanelProvider>
//     );
// }

// export default function AdminPage() {
//     return (
//         <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Admin...</div>}>
//             <AdminPageContent />
//         </Suspense>
//     );
// }