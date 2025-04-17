// src/app/components/Notifications/NotificationBell.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, RealtimeChannel } from '@supabase/supabase-js'; // Import RealtimeChannel
import NotificationPanel from './NotificationPanel';
import { Notification } from './NotificationItem'; // Import the interface
import { FiBell } from 'react-icons/fi'; // Example icon
import toast from 'react-hot-toast';
import { useProfileCompletion } from '@/app/context/ProfileCompletionContext';

const NotificationBell = () => {
    const { user, isLoadingStatus: isLoadingUserContext } = useProfileCompletion();
    //const [user, setUser] = useState<User | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showPanel, setShowPanel] = useState(false);
    const [isLoadingCount, setIsLoadingCount] = useState(true);
    const [notificationsInPanel, setNotificationsInPanel] = useState<Notification[]>([]);
    const panelRef = useRef<HTMLDivElement>(null);
    const channelRef = useRef<RealtimeChannel | null>(null); // Ref to store the channel


    const fetchUnreadCount = useCallback(async (currentUser: User | null) => {
        if (!currentUser) {
            console.log('[NotificationBell] fetchUnreadCount: No user, skipping fetch.');
            setUnreadCount(0);
            setIsLoadingCount(false);
            return; // Don't fetch if no user
        }
        console.log('[NotificationBell] fetchUnreadCount: User found, fetching count...');
        setIsLoadingCount(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) {
                throw new Error("No access token found for authenticated user.");
            }
            const response = await fetch(`/api/notifications?filter=unread&limit=0`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setUnreadCount(result.count ?? 0);
            console.log(`[NotificationBell] fetchUnreadCount: Count fetched: ${result.count || 0}`);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
            setUnreadCount(0);
        } finally {
            setIsLoadingCount(false);
        }
    }, []);

    const updateCountFromPanel = useCallback((panelNotifications: Notification[]) => {
        setNotificationsInPanel(panelNotifications);
        const currentUnread = panelNotifications.filter(n => !n.is_read).length;
        setUnreadCount(currentUnread);
    }, []);

    useEffect(() => {
        console.log("[NotificationBell] User context changed:", user?.id);
        // Fetch count when user becomes available or changes
        fetchUnreadCount(user);

        // Also reset count if user becomes null (logout)
        if (!user) {
            setUnreadCount(0);
            setShowPanel(false);
            setIsLoadingCount(false); // Stop loading on logout
        }
    }, [user, fetchUnreadCount]);

    // useEffect(() => {
    //     const { data: authListener } = supabase.auth.onAuthStateChange(
    //         async (event, session) => {
    //             const currentUser = session?.user ?? null;
    //             const currentToken = session?.access_token ?? null;
    //             setUser(currentUser);

    //             // Unsubscribe from previous user's channel if user changes
    //             if (channelRef.current && channelRef.current.state === 'joined') {
    //                 console.log('Auth change: Unsubscribing from previous channel');
    //                 supabase.removeChannel(channelRef.current).catch(err => console.error("Error removing channel on auth change:", err));
    //                 channelRef.current = null;
    //             }


    //             if (currentUser && currentToken) {
    //                 fetchUnreadCount(currentToken);
    //                 // Subscribe to the new user's channel (logic moved to separate effect below)
    //             } else {
    //                 setUnreadCount(0);
    //                 setShowPanel(false);
    //                 setIsLoadingCount(false);
    //             }
    //         }
    //     );

    //     supabase.auth.getSession().then(({ data: { session } }) => {
    //         const currentUser = session?.user ?? null;
    //         const currentToken = session?.access_token ?? null;
    //         setUser(currentUser);
    //         if (currentUser && currentToken) {
    //             fetchUnreadCount(currentToken);
    //         } else {
    //             setIsLoadingCount(false);
    //         }
    //     });

    //     return () => {
    //         authListener?.subscription.unsubscribe();
    //         // Ensure cleanup on component unmount
    //         if (channelRef.current) {
    //             supabase.removeChannel(channelRef.current).catch(err => console.error("Error removing channel on unmount:", err));
    //         }
    //     };
    // }, [fetchUnreadCount]);

    // Separate Effect for Real-time Subscription based on User
    // useEffect(() => {
    //     if (!user) {
    //         // If user becomes null, ensure any existing channel is removed
    //         if (channelRef.current) {
    //             supabase.removeChannel(channelRef.current).catch(err => console.error("Error removing channel on user logout:", err));
    //             channelRef.current = null;
    //         }
    //         return;
    //     }

    //     // Only create a new channel if one doesn't exist for the current user
    //     if (!channelRef.current || channelRef.current.state !== 'joined') {
    //         const newChannel = supabase
    //             .channel(`notifications:${user.id}`) // Unique channel per user
    //             .on<Notification>( // Directly use the Notification type for the payload's 'new' property
    //                 'postgres_changes',
    //                 { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
    //                 (payload) => {
    //                     // Access properties directly on payload.new
    //                     const newNotification = payload.new;
    //                     console.log('Realtime: New notification received!', newNotification);

    //                     const isAlreadyInPanelAndRead = notificationsInPanel.some(n => n.id === newNotification.id && n.is_read);
    //                     if (!isAlreadyInPanelAndRead) {
    //                         setUnreadCount(prev => prev + 1);
    //                     }

    //                     // Use the message from the new notification object
    //                     toast(`New notification: ${newNotification.message.substring(0, 50)}...`, { icon: '🔔' });

    //                     if (showPanel) {
    //                         // If panel is open, prepend the new notification to the list displayed
    //                         // This provides a more immediate update than requiring a full refresh
    //                         setNotificationsInPanel(prev => [newNotification, ...prev]);
    //                         // Update the count based on the *new* panel state
    //                         setUnreadCount(prevCount => { //eslint-disable-line
    //                             const currentUnread = [newNotification, ...notificationsInPanel].filter(n => !n.is_read).length;
    //                             return currentUnread;
    //                         });
    //                     }
    //                 }
    //             )
    //             .subscribe((status, err) => {
    //                 if (status === 'SUBSCRIBED') {
    //                     console.log(`Subscribed to notifications channel for user ${user.id}!`);
    //                 }
    //                 if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
    //                     console.error('Notifications channel error:', err);
    //                     toast.error('Real-time notification connection issue.');
    //                 }
    //                 if (status === 'CLOSED') {
    //                     console.log('Notifications channel closed.');
    //                 }
    //             });
    //         channelRef.current = newChannel; // Store the reference
    //     }


    //     // No return function needed here as cleanup is handled in the auth effect and unmount
    // }, [user, showPanel, notificationsInPanel]); // Re-evaluate when user, panel visibility, or panel content changes

    useEffect(() => {
        // Unsubscribe logic needs to be robust
        const currentChannel = channelRef.current;
        if (currentChannel) {
            console.log(`[NotificationBell] Cleaning up previous channel subscription: ${currentChannel.topic}`);
            supabase.removeChannel(currentChannel).catch(err => console.error("Error removing channel:", err));
            channelRef.current = null;
        }

        if (!user) {
            console.log("[NotificationBell] No user, skipping Realtime subscription.");
            return; // Don't subscribe if no user
        }

        // Create and store new channel
        console.log(`[NotificationBell] Subscribing to Realtime for user: ${user.id}`);
        const newChannel = supabase
            .channel(`notifications:${user.id}`) // Channel name based on user ID
            // ... (rest of the .on() and .subscribe() logic remains the same) ...
            .on<Notification>(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    const newNotification = payload.new;
                    console.log('Realtime: New notification received!', newNotification);
                    // Update count (only if not already read in panel - edge case)
                    const isAlreadyInPanelAndRead = notificationsInPanel.some(n => n.id === newNotification.id && n.is_read);
                    if (!isAlreadyInPanelAndRead) {
                        setUnreadCount(prev => prev + 1);
                    }
                    toast(`New notification: ${newNotification.message.substring(0, 50)}...`, { icon: '🔔' });
                    // Update panel if open
                    if (showPanel) {
                        setNotificationsInPanel(prev => [newNotification, ...prev]);
                        setUnreadCount(prev => [newNotification, ...notificationsInPanel].filter(n => !n.is_read).length); //eslint-disable-line
                    }
                }
            )
            .subscribe((status, err) => { /* ... status logging ... */ }); //eslint-disable-line

        channelRef.current = newChannel; // Store the new channel reference

        // Cleanup function for this specific subscription
        return () => {
            console.log(`[NotificationBell] Unsubscribing from Realtime channel: ${newChannel.topic}`);
            supabase.removeChannel(newChannel).catch(err => console.error("Error removing channel on cleanup:", err));
            channelRef.current = null; // Clear ref on cleanup
        };
        // Depend only on user object - resubscribe if user changes
    }, [user, showPanel, notificationsInPanel]); // Added dependencies bac


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setShowPanel(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const displayLoading = isLoadingUserContext ?? isLoadingCount;

    if (!user) {
        return null;
    }

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none"
                aria-label="Toggle Notifications"
            >
                <FiBell className="h-6 w-6" />
                {!displayLoading && unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full ring-2 ring-white bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
                {displayLoading && (
                    <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full ring-2 ring-white bg-gray-400 animate-pulse"></span>
                )}
            </button>

            {showPanel && user && (
                <NotificationPanel
                    userId={user.id}
                    onClose={() => setShowPanel(false)}
                    onNotificationsUpdate={updateCountFromPanel}
                />
            )}
        </div>
    );
};

export default NotificationBell;