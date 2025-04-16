// src/app/components/Notifications/NotificationPanel.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import NotificationItem, { Notification } from './NotificationItem';
import toast from 'react-hot-toast';
import { FiRefreshCw } from 'react-icons/fi'; // Example icon

interface NotificationPanelProps {
    userId: string; // Pass the user ID to fetch relevant notifications
    onClose: () => void; // Function to close the panel
    onNotificationsUpdate: (notifications: Notification[]) => void; // Callback to update parent state if needed
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ userId, onClose, onNotificationsUpdate }) => { //eslint-disable-line
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [offset, setOffset] = useState(0);
    const limit = 10; // Number of notifications per page

    const fetchNotifications = useCallback(async (isInitialLoad = false) => {
        setLoading(true);
        setError(null);
        try {
            const currentOffset = isInitialLoad ? 0 : offset;
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData?.session?.access_token) {
                throw new Error("Not authenticated");
            }

            const response = await fetch(`/api/notifications?limit=${limit}&offset=${currentOffset}`, {
                headers: {
                    'Authorization': `Bearer ${sessionData.session.access_token}`
                }
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }

            setNotifications(prev => isInitialLoad ? result.data : [...prev, ...result.data]);
            setTotalCount(result.count || 0);
            if (isInitialLoad) setOffset(result.data.length);
             else setOffset(prev => prev + result.data.length);
             onNotificationsUpdate(isInitialLoad ? result.data : [...notifications, ...result.data]); // Update parent


        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError(err instanceof Error ? err.message : "Failed to load notifications.");
            toast.error("Could not load notifications.");
        } finally {
            setLoading(false);
        }
    }, [offset, limit, onNotificationsUpdate, notifications]); // Add notifications here

    useEffect(() => {
        fetchNotifications(true); // Initial fetch
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]); // Fetch when userId changes (login/logout)


    const handleMarkAsRead = async (notificationId: string | string[]) => {
        const idsToMark = Array.isArray(notificationId) ? notificationId : [notificationId];
        if (idsToMark.length === 0) return;

         // Optimistically update UI
         const previousNotifications = [...notifications];
         setNotifications(prev =>
            prev.map(n => (idsToMark.includes(n.id) ? { ...n, is_read: true } : n))
        );
         onNotificationsUpdate(notifications.map(n => (idsToMark.includes(n.id) ? { ...n, is_read: true } : n))); // Update parent

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData?.session?.access_token) {
                 throw new Error("Not authenticated");
            }

            const response = await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionData.session.access_token}`
                },
                body: JSON.stringify({ notification_ids: idsToMark }),
            });

            if (!response.ok) {
                 const result = await response.json();
                 throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }
            // No need to refetch if optimistic update is sufficient
            // fetchNotifications(true); // Or just update state locally

        } catch (err) {
            console.error("Error marking notification(s) as read:", err);
            toast.error("Failed to mark notification(s) as read.");
            // Revert optimistic update on error
            setNotifications(previousNotifications);
            onNotificationsUpdate(previousNotifications);
        }
    };

     const handleMarkAllRead = () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length > 0) {
            handleMarkAsRead(unreadIds);
        }
    };

    const handleLoadMore = () => {
       if (!loading && notifications.length < totalCount) {
            fetchNotifications();
        }
    }

    return (
        <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 flex flex-col">
            <div className="flex justify-between items-center p-3 border-b sticky top-0 bg-white z-10">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                 <button
                    onClick={() => fetchNotifications(true)} // Refresh button
                    disabled={loading}
                    className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                    aria-label="Refresh Notifications"
                 >
                     <FiRefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                 </button>
                 <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                    disabled={notifications.every(n => n.is_read)}
                >
                    Mark all read
                </button>
            </div>

            {loading && notifications.length === 0 && <p className="text-center p-4 text-gray-500">Loading...</p>}
            {error && <p className="text-center p-4 text-red-500">{error}</p>}

            {!loading && notifications.length === 0 && !error && (
                <p className="text-center p-4 text-gray-500">No notifications yet.</p>
            )}

            <div className="flex-grow overflow-y-auto">
                {notifications.map(notification => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onClosePanel={onClose}
                    />
                ))}
            </div>

             {notifications.length < totalCount && !loading && (
                <div className="p-2 border-t sticky bottom-0 bg-white z-10">
                     <button
                        onClick={handleLoadMore}
                        className="w-full text-sm text-blue-600 hover:underline"
                    >
                        Load More ({totalCount - notifications.length} remaining)
                    </button>
                </div>
             )}
             {loading && notifications.length > 0 && <p className="text-center p-2 text-gray-500 text-sm">Loading more...</p>}
        </div>
    );
};

export default NotificationPanel;