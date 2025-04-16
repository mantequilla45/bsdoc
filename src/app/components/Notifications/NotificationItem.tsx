// src/app/components/Notifications/NotificationItem.tsx
import React, { useContext } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns'; // For relative time formatting
import { AdminPanelContext } from '@/app/context/AdminPanelContext';
import { useRouter } from 'next/navigation';

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    message: string;
    link_url?: string | null;
    is_read: boolean;
    created_at: string; // ISO string
    metadata?: any; //eslint-disable-line
}

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void; // Function to call when item is interacted with
    onClosePanel?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead, onClosePanel }) => {
    const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

    const router = useRouter();
    const adminPanelContext = useContext(AdminPanelContext);

    const isAdminLink = notification.link_url?.startsWith('admin:');
    const adminSectionId = isAdminLink ? notification.link_url?.split(':')[1] : null;

    const handleClick = (event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>) => {
        console.log(`[NotificationItem] Clicked. ID: ${notification.id}, Link URL: ${notification.link_url}`); // Log URL
        console.log(`[NotificationItem] isAdminLink: ${isAdminLink}, adminSectionId: ${adminSectionId}`); // Log parsed values
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }

        if (isAdminLink && adminSectionId) {
            event?.preventDefault();
            // --> Check if context exists before using <--
            if (adminPanelContext) {
                console.log(`[NotificationItem] Context found. Setting admin section: ${adminSectionId}`);
                adminPanelContext.setActiveAdminSection(adminSectionId);
            } else {
                console.log(`[NotificationItem] Context not found. Navigating to /admin?section=${adminSectionId}`);
                router.push(`/admin?section=${adminSectionId}`);
            }
            if (onClosePanel) onClosePanel();

        } else if (notification.link_url && !isAdminLink) {
            if (onClosePanel) onClosePanel();
        } else {
            if (onClosePanel) onClosePanel();
        }
        // Navigation will be handled by Link if link_url exists
    };

    const content = (
        <div
            className={`p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${notification.is_read ? 'opacity-70' : 'font-medium bg-blue-50' // Style unread differently
                }`}
            onClick={!notification.link_url ? handleClick : undefined} // Handle click only if no link
        >
            <p className="text-sm text-gray-800">{notification.message}</p>
            <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
        </div>
    );

    // --- Render Logic ---

    // If it's an admin link, render a simple div with onClick handler
    if (isAdminLink) {
        return (
            <div
                onClick={handleClick} // Pass the event implicitly
                className={`p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                    notification.is_read ? 'opacity-70' : 'font-medium bg-blue-50'
                }`}
            >
                <p className="text-sm text-gray-800">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
            </div>
        );
    }

    // If it's a standard link, wrap with Next <Link>
    if (notification.link_url && !isAdminLink) {
        return (
            <Link href={notification.link_url} passHref legacyBehavior>
                {/* Pass event explicitly to the anchor tag's onClick */}
                <a onClick={(e) => handleClick(e)}>
                    <div
                        className={`p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                            notification.is_read ? 'opacity-70' : 'font-medium bg-blue-50'
                        }`}
                    >
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
                    </div>
                </a>
            </Link>
        );
    }

    // If no link, render a div allowing click just for marking read
    return (
        <div
             onClick={handleClick} // Pass the event implicitly
             className={`p-3 border-b border-gray-200 hover:bg-gray-50 ${ // Maybe add cursor-pointer if marking read is the primary action
                 notification.is_read ? 'opacity-70' : 'font-medium bg-blue-50'
             }`}
        >
            <p className="text-sm text-gray-800">{notification.message}</p>
            <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
        </div>
    );

    return content;
};

export default NotificationItem;