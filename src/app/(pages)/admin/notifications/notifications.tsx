/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/(pages)/admin/notifications/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Import useContext
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link'; // Import Link
import { useRouter } from 'next/navigation'; // Import useRouter
import { formatDistanceToNow } from 'date-fns';
import { BellOff, AlertCircle, Loader2, Filter, Eye, EyeOff } from 'lucide-react'; // Icons
import { useAdminPanel } from '@/app/context/AdminPanelContext'; // Import the context

// --- Notification Type (Ensure this matches your actual type definition) ---
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
// --- End Notification Type ---

// --- MODIFIED Reusable Notification Item Component ---
const AdminNotificationItem: React.FC<{ notification: Notification; onMarkRead: (id: string) => void; }> = ({ notification, onMarkRead }) => {
    const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
    const router = useRouter();
    const adminPanelContext = useAdminPanel(); // Get context

    // Logic from shared NotificationItem
    const isAdminLink = notification.link_url?.startsWith('admin:');
    const adminSectionId = isAdminLink ? notification.link_url?.split(':')[1] : null;

    const handleClick = (event?: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>) => { // Make event optional
        console.log(`[AdminNotificationItem] Clicked. ID: ${notification.id}, Link URL: ${notification.link_url}`);
        console.log(`[AdminNotificationItem] isAdminLink: ${isAdminLink}, adminSectionId: ${adminSectionId}`);

        // Mark as read immediately on interaction
        if (!notification.is_read) {
            onMarkRead(notification.id);
        }

        // Handle admin links using context
        if (isAdminLink && adminSectionId) {
            event?.preventDefault(); // Prevent default link behavior if any
            if (adminPanelContext) {
                console.log(`[AdminNotificationItem] Context found. Setting admin section: ${adminSectionId}`);
                // *** IMPORTANT: Ensure 'switchContent' is the correct function name from your context provider ***
                adminPanelContext.setActiveAdminSection(adminSectionId);
            } else {
                // Fallback SHOULD NOT be needed if context is provided correctly in admin/page.tsx
                console.warn(`[AdminNotificationItem] AdminPanelContext not found! Navigating via URL.`);
                router.push(`/admin?section=${adminSectionId}`);
            }
            // No onClosePanel needed here as it's a full page

        } else if (notification.link_url && !isAdminLink) {
            // Standard link - navigation handled by <Link>, click just marks read.
            console.log(`[AdminNotificationItem] Standard link. Navigation handled by <Link>.`);
        } else {
            // No link - click just marks read.
            console.log(`[AdminNotificationItem] No link.`);
        }
    };

    const onButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation(); // IMPORTANT: Prevent click from bubbling to the parent div/link
        event.preventDefault(); // Prevent any default button behavior if needed
        if (!notification.is_read) {
            console.log(`[AdminNotificationItem] Mark as read BUTTON clicked. ID: ${notification.id}`);
            onMarkRead(notification.id); // Call the passed function
        }
    };

    // --- Render Logic (Adapted from shared NotificationItem) ---

    // Common content block
    const itemContent = (
        <div
            className={`p-3 border-b border-gray-200 transition-colors duration-150 ${notification.is_read
                ? 'opacity-70 bg-gray-50' // Style for read
                : 'bg-white hover:bg-indigo-50 font-medium' // Style for unread + hover
                }`}
        >
            <p className="text-sm text-gray-800 mb-1">{notification.message}</p>
            <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">{timeAgo}</span>
                {!notification.is_read && (
                    <button
                        onClick={onButtonClick} // Call prop function
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded"
                        aria-label={`Mark notification from ${timeAgo} as read`}
                    >
                        Mark as read
                    </button>
                )}
            </div>
        </div>
    );

    // If it's an admin link, render a div with onClick handler
    if (isAdminLink) {
        return (
            // Added focus styles for keyboard navigation/accessibility
            <div onClick={handleClick} className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded">
                {itemContent}
            </div>
        );
    }

    // If it's a standard link, wrap with Next <Link>
    if (notification.link_url && !isAdminLink) {
        return (
            <Link href={notification.link_url} passHref legacyBehavior>
                {/* Pass event explicitly to the anchor tag's onClick */}
                {/* Added focus styles to the anchor */}
                <a onClick={handleClick} className="block cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded">
                    {itemContent}
                </a>
            </Link>
        );
    }

    // If no link, render a div allowing click just for marking read
    return (
        // Added focus styles
        <div onClick={handleClick} className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded">
            {itemContent}
        </div>
    );
};
// --- End Modified Notification Item Component ---

type NotificationTypeFilter = 'all' | 'VERIFICATION_SUBMITTED' | 'REPORT_SUBMITTED';

interface AdminNotificationsPageProps {
    notifications: Notification[];
    isLoading: boolean;
    error: string | null;
    onMarkRead: (notificationId: string) => void; // Expect the handler from parent
    selectedType: NotificationTypeFilter;
    setSelectedType: (type: NotificationTypeFilter) => void;
    showRead: boolean;
    setShowRead: (show: boolean) => void;
    authToken: string | null;
}

const AdminNotificationsPage: React.FC<AdminNotificationsPageProps> = ({
    notifications,
    isLoading,
    error,
    onMarkRead, // Use the passed handler
    selectedType,
    setSelectedType, // Use the passed setter
    showRead,
    setShowRead, // Use the passed setter
    authToken
}) => {

    // Filter notifications based on props
    const filteredNotifications = useMemo(() => {
        let filtered = notifications;
        if (selectedType !== 'all') {
            filtered = filtered.filter(n => n.type === selectedType);
        }
        if (!showRead) {
            filtered = filtered.filter(n => !n.is_read);
        }
        return filtered;
    }, [notifications, selectedType, showRead]);

    // --- Render Logic (Uses props for data and state) ---
    return (
        <div className="p-4 md:p-6">
            {/* Filter Buttons (uses props) */}
             <div className="mb-4 flex flex-wrap gap-2 items-center border p-2 rounded-md bg-gray-50">
                 <Filter size={18} className="text-gray-500 shrink-0" />
                 <span className="text-sm font-medium text-gray-700 mr-2 shrink-0">Filter by type:</span>
                 {(['all', 'VERIFICATION_SUBMITTED', 'REPORT_SUBMITTED'] as NotificationTypeFilter[]).map((type) => {
                     const label = type === 'all' ? 'All' : (type === 'VERIFICATION_SUBMITTED' ? 'Verifications' : 'Bug Reports');
                     const isActive = selectedType === type;
                     return (
                         <button
                             key={type}
                             onClick={() => setSelectedType(type)} // Use prop setter
                             className={`px-3 py-1 text-sm rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${isActive ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                         >
                             {label}
                         </button>
                     );
                 })}
             </div>

            {/* Hide/Show Read Toggle (uses props) */}
            <div className="flex items-center mb-4">
                <label htmlFor="show-read-toggle" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" id="show-read-toggle" className="sr-only" checked={showRead} onChange={() => setShowRead(!showRead)} />
                        <div className={`block w-10 h-6 rounded-full transition ${showRead ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${showRead ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <div className="ml-2 text-sm text-gray-700 font-medium flex items-center">
                        {showRead ? <Eye size={16} className="mr-1" /> : <EyeOff size={16} className="mr-1" />}
                        {showRead ? 'Showing Read' : 'Hiding Read'}
                    </div>
                </label>
            </div>

            {/* Loading State */}
            {isLoading && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /><span className="ml-3 text-gray-500">Loading notifications...</span></div>}

            {/* Error State */}
            {!isLoading && error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert"><AlertCircle className="h-5 w-5 mr-2" /><div><strong className="font-bold">Error:</strong><span className="block sm:inline"> {error}</span></div></div>}

            {/* Not Authenticated State */}
             {!isLoading && !error && !authToken && <div className="text-center py-10 bg-gray-50 rounded-lg border"><p className="text-gray-500">Please log in to view notifications.</p></div>}

            {/* Empty State */}
             {!isLoading && !error && authToken && filteredNotifications.length === 0 && <div className="text-center py-16 bg-gray-50 rounded-lg border"><BellOff className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900">No notifications found</h3><p className="mt-1 text-sm text-gray-500">{selectedType !== 'all' || !showRead ? 'There are no notifications matching your current filters.' : 'You currently have no admin notifications.'}</p></div>}

            {/* Display List */}
            {!isLoading && !error && authToken && filteredNotifications.length > 0 && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                    <ul role="list" className="divide-y divide-gray-200">
                        {filteredNotifications.map(notification => (
                            <li key={notification.id}>
                                <AdminNotificationItem
                                    notification={notification}
                                    onMarkRead={onMarkRead} // Pass the handler down
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AdminNotificationsPage;

// // src/app/(pages)/admin/notifications/page.tsx
// 'use client';

// import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Import useContext
// import { supabase } from '@/lib/supabaseClient';
// import Link from 'next/link'; // Import Link
// import { useRouter } from 'next/navigation'; // Import useRouter
// import { formatDistanceToNow } from 'date-fns';
// import { BellOff, AlertCircle, Loader2, Filter, Eye, EyeOff } from 'lucide-react'; // Icons
// import { useAdminPanel } from '@/app/context/AdminPanelContext'; // Import the context

// // --- Notification Type (Ensure this matches your actual type definition) ---
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
// // --- End Notification Type ---

// // --- MODIFIED Reusable Notification Item Component ---
// const AdminNotificationItem: React.FC<{ notification: Notification; onMarkRead: (id: string) => void; }> = ({ notification, onMarkRead }) => {
//     const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
//     const router = useRouter();
//     const adminPanelContext = useAdminPanel(); // Get context

//     // Logic from shared NotificationItem
//     const isAdminLink = notification.link_url?.startsWith('admin:');
//     const adminSectionId = isAdminLink ? notification.link_url?.split(':')[1] : null;

//     const handleClick = (event?: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>) => { // Make event optional
//         console.log(`[AdminNotificationItem] Clicked. ID: ${notification.id}, Link URL: ${notification.link_url}`);
//         console.log(`[AdminNotificationItem] isAdminLink: ${isAdminLink}, adminSectionId: ${adminSectionId}`);

//         // Mark as read immediately on interaction
//         if (!notification.is_read) {
//             onMarkRead(notification.id);
//         }

//         // Handle admin links using context
//         if (isAdminLink && adminSectionId) {
//             event?.preventDefault(); // Prevent default link behavior if any
//             if (adminPanelContext) {
//                 console.log(`[AdminNotificationItem] Context found. Setting admin section: ${adminSectionId}`);
//                 // *** IMPORTANT: Ensure 'switchContent' is the correct function name from your context provider ***
//                 adminPanelContext.setActiveAdminSection(adminSectionId);
//             } else {
//                 // Fallback SHOULD NOT be needed if context is provided correctly in admin/page.tsx
//                 console.warn(`[AdminNotificationItem] AdminPanelContext not found! Navigating via URL.`);
//                 router.push(`/admin?section=${adminSectionId}`);
//             }
//             // No onClosePanel needed here as it's a full page

//         } else if (notification.link_url && !isAdminLink) {
//             // Standard link - navigation handled by <Link>, click just marks read.
//             console.log(`[AdminNotificationItem] Standard link. Navigation handled by <Link>.`);
//         } else {
//             // No link - click just marks read.
//             console.log(`[AdminNotificationItem] No link.`);
//         }
//     };

//     const onButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//         event.stopPropagation(); // IMPORTANT: Prevent click from bubbling to the parent div/link
//         event.preventDefault(); // Prevent any default button behavior if needed
//         if (!notification.is_read) {
//             console.log(`[AdminNotificationItem] Mark as read BUTTON clicked. ID: ${notification.id}`);
//             onMarkRead(notification.id); // Call the passed function
//         }
//     };

//     // --- Render Logic (Adapted from shared NotificationItem) ---

//     // Common content block
//     const itemContent = (
//         <div
//             className={`p-3 border-b border-gray-200 transition-colors duration-150 ${notification.is_read
//                 ? 'opacity-70 bg-gray-50' // Style for read
//                 : 'bg-white hover:bg-indigo-50 font-medium' // Style for unread + hover
//                 }`}
//         >
//             <p className="text-sm text-gray-800 mb-1">{notification.message}</p>
//             <div className="flex justify-between items-center mt-1">
//                 <span className="text-xs text-gray-500">{timeAgo}</span>
//                 {!notification.is_read && (
//                     <button
//                         onClick={onButtonClick} // Call prop function
//                         className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded"
//                         aria-label={`Mark notification from ${timeAgo} as read`}
//                     >
//                         Mark as read
//                     </button>
//                 )}
//             </div>
//         </div>
//     );

//     // If it's an admin link, render a div with onClick handler
//     if (isAdminLink) {
//         return (
//             // Added focus styles for keyboard navigation/accessibility
//             <div onClick={handleClick} className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded">
//                 {itemContent}
//             </div>
//         );
//     }

//     // If it's a standard link, wrap with Next <Link>
//     if (notification.link_url && !isAdminLink) {
//         return (
//             <Link href={notification.link_url} passHref legacyBehavior>
//                 {/* Pass event explicitly to the anchor tag's onClick */}
//                 {/* Added focus styles to the anchor */}
//                 <a onClick={handleClick} className="block cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded">
//                     {itemContent}
//                 </a>
//             </Link>
//         );
//     }

//     // If no link, render a div allowing click just for marking read
//     return (
//         // Added focus styles
//         <div onClick={handleClick} className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded">
//             {itemContent}
//         </div>
//     );
// };
// // --- End Modified Notification Item Component ---

// type NotificationTypeFilter = 'all' | 'VERIFICATION_SUBMITTED' | 'REPORT_SUBMITTED';

// function AdminNotificationsPage() {
//     const [notifications, setNotifications] = useState<Notification[]>([]);
//     const [isLoading, setIsLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
//     const [authToken, setAuthToken] = useState<string | null>(null);
//     const [selectedType, setSelectedType] = useState<NotificationTypeFilter>('all');
//     const [showRead, setShowRead] = useState<boolean>(true);

//     // Effect to get auth token
//     useEffect(() => {
//         const fetchSession = async () => {
//             const { data: { session } } = await supabase.auth.getSession();
//             setAuthToken(session?.access_token ?? null);
//             // We'll trigger fetch in the other effect based on token change
//             if (!session?.access_token) {
//                 setIsLoading(false); // Stop loading if no initial session
//             }
//         };
//         fetchSession(); // Fetch initial session immediately

//         const { data: authListener } = supabase.auth.onAuthStateChange(
//             (event, session) => {
//                 setAuthToken(session?.access_token ?? null);
//                 // Let the other effect handle fetching based on token change
//                 if (event === 'SIGNED_OUT') {
//                     setNotifications([]);
//                     setError(null);
//                     setIsLoading(false);
//                 }
//             }
//         );
//         return () => {
//             authListener?.subscription.unsubscribe();
//         };
//     }, []); // Empty dependency array, fetchNotifications is called internally

//     // Function to fetch notifications (using useCallback for stability)
//     const fetchNotifications = useCallback(async (token: string) => { // Removed typeFilter param if API doesn't use it
//         if (!token) {
//             setError("Authentication token is missing.");
//             setIsLoading(false);
//             setNotifications([]);
//             return;
//         }
//         setIsLoading(true);
//         setError(null);
//         console.log(`[AdminNotificationsPage] Fetching notifications...`);
//         try {
//             // **Using fetch to call the dedicated admin API endpoint**
//             // Construct URL without specific type filter param unless needed
//             const url = new URL('/api/admin/notifications', window.location.origin);

//             const response = await fetch(url.toString(), { // Use toString() here
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             });
//             if (!response.ok) {
//                 const errData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` })); // Graceful JSON parse error
//                 throw new Error(errData.error || `HTTP error! status: ${response.status}`);
//             }
//             const data = await response.json();
//             setNotifications(data.data ?? []);
//             console.log(`[AdminNotificationsPage] Fetched ${data.data?.length || 0} notifications.`);
//         } catch (err: any) { //eslint-disable-line
//             console.error("Failed to fetch admin notifications:", err);
//             setError(err.message || 'An unknown error occurred.');
//             setNotifications([]);
//         } finally {
//             setIsLoading(false);
//         }
//     }, []); // useCallback with empty dependencies

//     // Fetch notifications only when auth token changes
//     useEffect(() => {
//         if (authToken) {
//             fetchNotifications(authToken);
//         } else {
//             setIsLoading(false);
//             setNotifications([]);
//             if (!isLoading && !error) { // Avoid overwriting existing errors
//                 setError("User not authenticated.");
//             }
//         }
//     }, [authToken, fetchNotifications]);

//     // Function to mark a single notification as read
//     const handleMarkRead = useCallback(async (notificationId: string) => {
//         if (!authToken) {
//             console.error("Cannot mark read: No auth token.");
//             return;
//         }

//         // Optimistic UI update
//         const originalNotifications = notifications;
//         console.log(`[handleMarkRead] Marking ID: ${notificationId} as read.`);
//         setNotifications(prev => {
//             const updated = prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
//             console.log('[handleMarkRead] State AFTER optimistic update:', updated.find(n => n.id === notificationId));
//             return updated;
//         }
//         );

//         try {
//             const response = await fetch('/api/admin/notifications/mark-read', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${authToken}`
//                 },
//                 body: JSON.stringify({ notification_ids: [notificationId] })
//             });
//             const result = await response.json();
//             if (!response.ok) throw new Error(result.error || `Server failed (${response.status})`);
//             console.log(`[handleMarkRead] ID: ${notificationId} successfully marked as read on server.`);
//             // Successfully marked on server, UI is already updated.
//         } catch (err) {
//             console.error("Error marking notification as read:", err);
//             // Revert optimistic update on failure
//             setNotifications(originalNotifications);
//             // Show error toast to user? e.g., toast.error("Failed to mark notification as read");
//         }
//     }, [authToken, notifications]); // Include notifications in dependencies if needed for revert logic

//     // *** Filter notifications based on showRead and selectedType state ***
//     const filteredNotifications = useMemo(() => {
//         let filtered = notifications;

//         // Apply type filter first
//         if (selectedType !== 'all') {
//             filtered = filtered.filter(n => n.type === selectedType);
//         }

//         // Then apply read filter
//         if (!showRead) {
//             filtered = filtered.filter(n => !n.is_read);
//         }

//         return filtered;
//     }, [notifications, selectedType, showRead]);


//     // --- Render Logic ---
//     return (
//         <div className="p-4 md:p-6 max-w-4xl mx-auto"> {/* Added max-width and centering */}
//             {/* --- Filter Buttons --- */}
//             <div className="mb-4 flex flex-wrap gap-2 items-center border p-2 rounded-md bg-gray-50"> {/* Added flex-wrap and gap */}
//                 <Filter size={18} className="text-gray-500 shrink-0" /> {/* Prevent icon shrinking */}
//                 <span className="text-sm font-medium text-gray-700 mr-2 shrink-0">Filter by type:</span>
//                 {(['all', 'VERIFICATION_SUBMITTED', 'REPORT_SUBMITTED'] as NotificationTypeFilter[]).map((type) => {
//                     const label = type === 'all' ? 'All' : (type === 'VERIFICATION_SUBMITTED' ? 'Verifications' : 'Bug Reports');
//                     const isActive = selectedType === type;
//                     return (
//                         <button
//                             key={type}
//                             onClick={() => setSelectedType(type)}
//                             className={`px-3 py-1 text-sm rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${isActive
//                                 ? 'bg-indigo-600 text-white font-semibold shadow-sm'
//                                 : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
//                                 }`}
//                         >
//                             {label}
//                         </button>
//                     );
//                 })}
//             </div>

//             {/* Hide/Show Read Toggle */}
//             <div className="flex items-center mb-4">
//                 <label htmlFor="show-read-toggle" className="flex items-center cursor-pointer">
//                     <div className="relative">
//                         <input
//                             type="checkbox"
//                             id="show-read-toggle"
//                             className="sr-only" // Hide default checkbox
//                             checked={showRead}
//                             onChange={() => setShowRead(!showRead)}
//                         />
//                         {/* Custom toggle background */}
//                         <div className={`block w-10 h-6 rounded-full transition ${showRead ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
//                         {/* Custom toggle knob */}
//                         <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${showRead ? 'translate-x-4' : ''}`}></div>
//                     </div>
//                     <div className="ml-2 text-sm text-gray-700 font-medium flex items-center">
//                         {showRead ? <Eye size={16} className="mr-1" /> : <EyeOff size={16} className="mr-1" />}
//                         {showRead ? 'Showing Read' : 'Hiding Read'}
//                     </div>
//                 </label>
//             </div>

//             {/* Loading State */}
//             {isLoading && (
//                 <div className="flex justify-center items-center py-10">
//                     <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
//                     <span className="ml-3 text-gray-500">Loading notifications...</span>
//                 </div>
//             )}

//             {/* Error State */}
//             {!isLoading && error && (
//                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert">
//                     <AlertCircle className="h-5 w-5 mr-2" />
//                     <div>
//                         <strong className="font-bold">Error:</strong>
//                         <span className="block sm:inline"> {error}</span>
//                     </div>
//                 </div>
//             )}

//             {/* Not Authenticated State */}
//             {!isLoading && !error && !authToken && (
//                 <div className="text-center py-10 bg-gray-50 rounded-lg border">
//                     <p className="text-gray-500">Please log in to view notifications.</p>
//                 </div>
//             )}

//             {/* Empty State (considering filters) */}
//             {!isLoading && !error && authToken && filteredNotifications.length === 0 && (
//                 <div className="text-center py-16 bg-gray-50 rounded-lg border">
//                     <BellOff className="mx-auto h-12 w-12 text-gray-400" />
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications found</h3>
//                     <p className="mt-1 text-sm text-gray-500">
//                         {selectedType !== 'all' || !showRead
//                             ? 'There are no notifications matching your current filters.'
//                             : 'You currently have no admin notifications.'}

//                     </p>
//                 </div>
//             )}

//             {/* Display Notifications List */}
//             {!isLoading && !error && authToken && filteredNotifications.length > 0 && (
//                 <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
//                     <ul role="list" className="divide-y divide-gray-200">
//                         {filteredNotifications.map(notification => (
//                             <li key={notification.id}>
//                                 {/* Use the MODIFIED AdminNotificationItem */}
//                                 <AdminNotificationItem
//                                     notification={notification}
//                                     onMarkRead={handleMarkRead}
//                                 />
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             )}

//         </div >
//     );
// }

// export default AdminNotificationsPage;