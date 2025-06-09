'use client';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import SideBar from "@/app/layout/admin-sidebar/admin-sidebar";
import UserManagement from "./user-management/user-management";
import BugManagement from './bugs/bug-reports';
import { AdminPanelProvider } from '@/app/context/AdminPanelContext';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminDoctorVerificationPage from './doctor-verifications/doctor-verification';
import AdminDashboard from './components/AdminDashboard';
import AdminNotificationsPage from './notifications/notifications';
import toast from 'react-hot-toast';
import { useAdminSession } from './hooks/useAdminSession'; // Import the custom hook

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

type NotificationTypeFilter = 'all' | 'VERIFICATION_SUBMITTED' | 'REPORT_SUBMITTED';

function AdminPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Use the custom hook instead of direct session management
    const {
        session,
        adminProfile,
        isAdmin,
        hasValidSession,
        isLoadingProfile,
        isSessionLoading,
        profileError,
        isReady
    } = useAdminSession();
    
    const [activeContentId, setActiveContentId] = useState<string>(() => 
        searchParams.get('section') ?? 'dashboard'
    );
    
    // Notification state
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);
    const [notificationError, setNotificationError] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<NotificationTypeFilter>('all');
    const [showRead, setShowRead] = useState<boolean>(true);

    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    const handleContentChange = useCallback((contentId: string) => {
        setActiveContentId(contentId);
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('section', contentId);
        window.history.replaceState({}, '', currentUrl.toString());
    }, []);

    // Fetch notifications with timeout and error handling
    const fetchNotifications = useCallback(async (accessToken: string) => {
        if (!accessToken) {
            setNotificationError("Authentication token is missing.");
            setIsLoadingNotifications(false);
            setNotifications([]);
            return;
        }

        setIsLoadingNotifications(true);
        setNotificationError(null);
        
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Notifications fetch timeout')), 10000);
            });

            const fetchPromise = fetch('/api/admin/notifications', {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                signal: AbortSignal.timeout(8000)
            });

            const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
            
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ 
                    error: `HTTP error ${response.status}` 
                }));
                throw new Error(errData.error ?? `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setNotifications(data.data ?? []);
        } catch (err: any) { //eslint-disable-line
            console.error("Failed to fetch admin notifications:", err);
            if (err.name === 'AbortError' || err.message.includes('timeout')) {
                setNotificationError('Request timed out. Please try again.');
            } else {
                setNotificationError(err.message ?? 'An unknown error occurred.');
            }
            setNotifications([]);
        } finally {
            setIsLoadingNotifications(false);
        }
    }, []);

    // Handle authentication and redirect logic
    useEffect(() => {
        if (!isReady) return;

        // Only run auth check once the session is fully ready
        if (!hasCheckedAuth) {
            setHasCheckedAuth(true);
            
            if (!hasValidSession) {
                console.log("[AdminPageContent] No valid session, redirecting to home");
                router.push('/');
                return;
            }

            if (adminProfile && !isAdmin) {
                console.log("[AdminPageContent] User is not admin, redirecting to home");
                toast.error("Access denied. Admin privileges required.");
                router.push('/');
                return;
            }

            // Fetch notifications if we have a valid admin session
            if (session?.access_token && isAdmin) {
                fetchNotifications(session.access_token);
            }
        }
    }, [isReady, hasValidSession, adminProfile, isAdmin, session?.access_token, hasCheckedAuth, router, fetchNotifications]);

    // Mark notification as read
    const handleMarkRead = useCallback(async (notificationId: string) => {
        if (!session?.access_token) return;

        const originalNotifications = [...notifications];
        // Optimistic update
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );

        try {
            const response = await fetch('/api/admin/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ notification_ids: [notificationId] }),
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) {
                const result = await response.json().catch(() => ({ error: 'Server error' }));
                throw new Error(result.error ?? `Server failed (${response.status})`);
            }
            
            console.log(`[AdminPageContent] Marked ${notificationId} as read successfully.`);
        } catch (err) {
            console.error("Error marking notification as read:", err);
            setNotifications(originalNotifications);
            
            if (err instanceof Error && err.name === 'AbortError') {
                toast.error("Request timed out. Please try again.");
            }
        }
    }, [session?.access_token, notifications]);

    // Calculate unread count
    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.is_read).length;
    }, [notifications]);

    const pageTitle = (contentId: string): string => {
        switch (contentId) {
            case 'user-management':
                return 'User Management';
            case 'bug-reports':
                return 'User Feedback';
            case 'dashboard':
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
    };

    const renderContent = () => {
        switch (activeContentId) {
            case 'user-management':
                return <UserManagement />;
            case 'bug-reports':
                return <BugManagement />;
            case 'dashboard':
                return <AdminDashboard />;
            case 'doctor-verification':
                return <AdminDoctorVerificationPage />;
            case 'notifications':
                return <AdminNotificationsPage
                    notifications={notifications}
                    isLoading={isLoadingNotifications}
                    error={notificationError}
                    onMarkRead={handleMarkRead}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    showRead={showRead}
                    setShowRead={setShowRead}
                    authToken={session?.access_token ?? null}
                />;
            default:
                return (
                    <div className="p-6 text-gray-600">
                        Select an option from the sidebar or check the URL section.
                    </div>
                );
        }
    };

    // Show loading while session and profile are being determined
    if (!isReady || isSessionLoading || isLoadingProfile) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        {isSessionLoading 
                            ? "Loading session..." 
                            : isLoadingProfile 
                            ? "Loading profile..." 
                            : "Initializing admin panel..."}
                    </p>
                </div>
            </div>
        );
    }

    // Error states
    if (profileError) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load admin profile: {profileError}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Final check: ensure we have valid admin session
    if (!hasValidSession || !adminProfile || !isAdmin) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Redirecting...</p>
                </div>
            </div>
        );
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
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Admin...</p>
                </div>
            </div>
        }>
            <AdminPageContent />
        </Suspense>
    );
}

// 'use client';
// import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
// import { useSession, useSessionContext } from '@supabase/auth-helpers-react';
// import SideBar from "@/app/layout/admin-sidebar/admin-sidebar";
// import UserManagement from "./user-management/user-management";
// import BugManagement from './bugs/bug-reports';
// import { AdminPanelProvider } from '@/app/context/AdminPanelContext';
// import { useSearchParams, useRouter } from 'next/navigation';
// import AdminDoctorVerificationPage from './doctor-verifications/doctor-verification';
// import AdminDashboard from './components/AdminDashboard';
// import AdminNotificationsPage from './notifications/notifications';
// import { supabase } from '@/lib/supabaseClient';
// import toast from 'react-hot-toast';

// interface Notification {
//     id: string;
//     user_id: string;
//     type: string;
//     message: string;
//     link_url?: string | null;
//     metadata?: Record<string, any> | null; //eslint-disable-line
//     created_at: string;
//     is_read: boolean;
// }

// interface Profile {
//     id: string;
//     role: string;
//     first_name?: string | null;
//     last_name?: string | null;
//     email?: string | null;
//     profile_image_url?: string | null;
// }

// type NotificationTypeFilter = 'all' | 'VERIFICATION_SUBMITTED' | 'REPORT_SUBMITTED';

// function AdminPageContent() {
//     const searchParams = useSearchParams();
//     const router = useRouter();
    
//     const session = useSession();
//     const { isLoading: isSessionLoading } = useSessionContext();
    
//     const [activeContentId, setActiveContentId] = useState<string>(() => 
//         searchParams.get('section') ?? 'dashboard'
//     );
    
//     // Notification state
//     const [notifications, setNotifications] = useState<Notification[]>([]);
//     const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);
//     const [notificationError, setNotificationError] = useState<string | null>(null);
//     const [selectedType, setSelectedType] = useState<NotificationTypeFilter>('all');
//     const [showRead, setShowRead] = useState<boolean>(true);
    
//     // Profile state
//     const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
//     const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
//     const [profileError, setProfileError] = useState<string | null>(null);

//     // Track initialization state
//     const [isInitialized, setIsInitialized] = useState(false);

//     const handleContentChange = useCallback((contentId: string) => {
//         setActiveContentId(contentId);
//         const currentUrl = new URL(window.location.href);
//         currentUrl.searchParams.set('section', contentId);
//         window.history.replaceState({}, '', currentUrl.toString());
//     }, []);

//     // Check if user is admin
//     const isAdmin = useMemo(() => {
//         return adminProfile?.role === 'admin';
//     }, [adminProfile]);

//     // Fetch admin profile with timeout and error handling
//     const fetchAdminProfile = useCallback(async (userId: string) => {
//         setIsLoadingProfile(true);
//         setProfileError(null);
        
//         try {
//             // Add timeout to prevent hanging
//             const timeoutPromise = new Promise((_, reject) => {
//                 setTimeout(() => reject(new Error('Profile fetch timeout')), 10000);
//             });

//             const fetchPromise = supabase
//                 .from('profiles')
//                 .select('id, first_name, last_name, role, email, profile_image_url')
//                 .eq('id', userId)
//                 .single();

//             const { data: profileData, error: profileError } = await Promise.race([
//                 fetchPromise,
//                 timeoutPromise
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             ]) as any;

//             if (profileError) {
//                 if (profileError.code === 'PGRST116') {
//                     console.log("Admin profile not found");
//                     setAdminProfile(null);
//                     setProfileError("Profile not found");
//                 } else {
//                     console.error("Error fetching admin profile:", profileError);
//                     setAdminProfile(null);
//                     setProfileError(profileError.message ?? "Failed to fetch profile");
//                 }
//             } else {
//                 setAdminProfile(profileData as Profile ?? null);
//                 console.log("[AdminPageContent] Admin profile fetched:", profileData);
//             }
//         } catch (error) {
//             console.error("Error fetching admin profile:", error);
//             setAdminProfile(null);
//             setProfileError(error instanceof Error ? error.message : "Unknown error");
//         } finally {
//             setIsLoadingProfile(false);
//         }
//     }, []);

//     // Fetch notifications with timeout and error handling
//     const fetchNotifications = useCallback(async (accessToken: string) => {
//         if (!accessToken) {
//             setNotificationError("Authentication token is missing.");
//             setIsLoadingNotifications(false);
//             setNotifications([]);
//             return;
//         }

//         setIsLoadingNotifications(true);
//         setNotificationError(null);
        
//         try {
//             // Add timeout to prevent hanging
//             const timeoutPromise = new Promise((_, reject) => {
//                 setTimeout(() => reject(new Error('Notifications fetch timeout')), 10000);
//             });

//             const fetchPromise = fetch('/api/admin/notifications', {
//                 headers: { 'Authorization': `Bearer ${accessToken}` },
//                 signal: AbortSignal.timeout(8000) // Additional timeout at fetch level
//             });

//             const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
            
//             if (!response.ok) {
//                 const errData = await response.json().catch(() => ({ 
//                     error: `HTTP error ${response.status}` 
//                 }));
//                 throw new Error(errData.error ?? `HTTP error! status: ${response.status}`);
//             }
            
//             const data = await response.json();
//             setNotifications(data.data ?? []);
//         } catch (err: any) { //eslint-disable-line
//             console.error("Failed to fetch admin notifications:", err);
//             if (err.name === 'AbortError' || err.message.includes('timeout')) {
//                 setNotificationError('Request timed out. Please try again.');
//             } else {
//                 setNotificationError(err.message ?? 'An unknown error occurred.');
//             }
//             setNotifications([]);
//         } finally {
//             setIsLoadingNotifications(false);
//         }
//     }, []);

//     // Initialize data when session is available
//     useEffect(() => {
//         let isMounted = true;

//         const initializeAdminData = async () => {
//             if (isSessionLoading) {
//                 console.log("[AdminPageContent] Session still loading, waiting...");
//                 return;
//             }

//             if (!session?.user) {
//                 console.log("[AdminPageContent] No session found, redirecting to home");
//                 setTimeout(() => {
//                     if (isMounted && !session?.user) {
//                         router.push('/');
//                     }
//                 }, 500);
//                 return;
//             }

//             if (isMounted) {
//                 // Fetch profile and notifications in parallel
//                 const profilePromise = fetchAdminProfile(session.user.id);
//                 const notificationsPromise = session.access_token 
//                     ? fetchNotifications(session.access_token)
//                     : Promise.resolve();

//                 try {
//                     await Promise.all([profilePromise, notificationsPromise]);
//                 } catch (error) {
//                     console.error("Error initializing admin data:", error);
//                 } finally {
//                     if (isMounted) {
//                         setIsInitialized(true);
//                     }
//                 }
//             }
//         };

//         initializeAdminData();

//         return () => {
//             isMounted = false;
//         };
//     }, [session, isSessionLoading, fetchAdminProfile, fetchNotifications, router]);

//     // Redirect non-admins after profile is loaded
//     useEffect(() => {
//         if (isInitialized && !isLoadingProfile && adminProfile && !isAdmin) {
//             console.log("[AdminPageContent] User is not admin, redirecting to home");
//             toast.error("Access denied. Admin privileges required.");
//             router.push('/');
//         }
//     }, [isInitialized, isLoadingProfile, adminProfile, isAdmin, router]);

//     // Mark notification as read
//     const handleMarkRead = useCallback(async (notificationId: string) => {
//         if (!session?.access_token) return;

//         const originalNotifications = [...notifications];
//         // Optimistic update
//         setNotifications(prev => 
//             prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
//         );

//         try {
//             const response = await fetch('/api/admin/notifications/mark-read', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${session.access_token}`
//                 },
//                 body: JSON.stringify({ notification_ids: [notificationId] }),
//                 signal: AbortSignal.timeout(5000) // 5 second timeout
//             });
            
//             if (!response.ok) {
//                 const result = await response.json().catch(() => ({ error: 'Server error' }));
//                 throw new Error(result.error ?? `Server failed (${response.status})`);
//             }
            
//             console.log(`[AdminPageContent] Marked ${notificationId} as read successfully.`);
//         } catch (err) {
//             console.error("Error marking notification as read:", err);
//             setNotifications(originalNotifications); // Revert on error
            
//             if (err instanceof Error && err.name === 'AbortError') {
//                 toast.error("Request timed out. Please try again.");
//             }
//         }
//     }, [session?.access_token, notifications]);

//     // Calculate unread count
//     const unreadCount = useMemo(() => {
//         return notifications.filter(n => !n.is_read).length;
//     }, [notifications]);

//     const pageTitle = (contentId: string): string => {
//         switch (contentId) {
//             case 'user-management':
//                 return 'User Management';
//             case 'bug-reports':
//                 return 'User Feedback';
//             case 'dashboard':
//                 return 'Dashboard';
//             case 'doctor-verification':
//                 return 'Doctor Verification';
//             case 'notifications':
//                 return 'Admin Notifications';
//             default:
//                 return contentId
//                     .replace(/-/g, ' ')
//                     .replace(/\b\w/g, (char) => char.toUpperCase());
//         }
//     };

//     const renderContent = () => {
//         switch (activeContentId) {
//             case 'user-management':
//                 return <UserManagement />;
//             case 'bug-reports':
//                 return <BugManagement />;
//             case 'dashboard':
//                 return <AdminDashboard />;
//             case 'doctor-verification':
//                 return <AdminDoctorVerificationPage />;
//             case 'notifications':
//                 return <AdminNotificationsPage
//                     notifications={notifications}
//                     isLoading={isLoadingNotifications}
//                     error={notificationError}
//                     onMarkRead={handleMarkRead}
//                     selectedType={selectedType}
//                     setSelectedType={setSelectedType}
//                     showRead={showRead}
//                     setShowRead={setShowRead}
//                     authToken={session?.access_token ?? null}
//                 />;
//             default:
//                 return (
//                     <div className="p-6 text-gray-600">
//                         Select an option from the sidebar or check the URL section.
//                     </div>
//                 );
//         }
//     };

//     // Loading state
//     if (isSessionLoading || (!session && !isInitialized)) {
//         return (
//             <div className="flex h-screen items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading Admin Panel...</p>
//                 </div>
//             </div>
//         );
//     }

//     // Error states
//     if (profileError) {
//         return (
//             <div className="flex h-screen items-center justify-center">
//                 <div className="text-center">
//                     <p className="text-red-600 mb-4">Failed to load admin profile: {profileError}</p>
//                     <button 
//                         onClick={() => window.location.reload()} 
//                         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                     >
//                         Retry
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     // No session or not admin
//     if (!session || !adminProfile || !isAdmin) {
//         return (
//             <div className="flex h-screen items-center justify-center">
//                 <div className="text-center">
//                     <p className="text-gray-600">Redirecting...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <AdminPanelProvider switchContent={handleContentChange}>
//             <div className="flex h-screen flex-row bg-gray-100">
//                 <SideBar
//                     onContentChange={handleContentChange}
//                     activeContentId={activeContentId}
//                     unreadNotificationsCount={unreadCount}
//                     adminProfile={adminProfile}
//                 />
//                 <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-6">
//                     <h1 className="text-2xl font-semibold text-gray-900 mb-6">
//                         {pageTitle(activeContentId)}
//                     </h1>
//                     {renderContent()}
//                 </main>
//             </div>
//         </AdminPanelProvider>
//     );
// }

// export default function AdminPage() {
//     return (
//         <Suspense fallback={
//             <div className="flex h-screen items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading Admin...</p>
//                 </div>
//             </div>
//         }>
//             <AdminPageContent />
//         </Suspense>
//     );
// }