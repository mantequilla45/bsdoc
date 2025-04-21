'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import SideBar from "@/app/layout/admin-sidebar/admin-sidebar";
import UserManagement from "./user-management/user-management";
import BugManagement from './bugs/bug-reports';
import { AdminPanelProvider } from '@/app/context/AdminPanelContext';
import { useSearchParams } from 'next/navigation';
import AdminDoctorVerificationPage from './doctor-verifications/doctor-verification';
import AdminNotificationsPage from './notifications/notifications';
// Import other content components as needed

function AdminPageContent() {
    const searchParams = useSearchParams();
    const initialSection = searchParams.get('section') ?? 'dashboard';
    console.log(`[AdminPage] Initial section from URL: ${initialSection}`); // Log initial value
    const [activeContentId, setactiveContentId] = useState<string>('dashboard');

    // Effect to sync state if URL param changes *after* initial load
    useEffect(() => {
        const sectionFromUrl = searchParams.get('section') ?? 'dashboard';
        console.log(`[AdminPageContent EFFECT Check] URL section: ${sectionFromUrl}, State section: ${activeContentId}`);
        if (sectionFromUrl !== activeContentId) {
            console.log(`[AdminPageContent EFFECT Update] State differs from URL. Syncing state to: ${sectionFromUrl}`);
            setactiveContentId(sectionFromUrl);
        }
    }, [searchParams]); // Depend only on searchParams to react to URL changes


    // Handler passed to Sidebar and Context
    const handleContentChange = useCallback((contentId: string) => {
        console.log(`[AdminPageContent] handleContentChange called with: ${contentId}`);
        setactiveContentId(contentId);
        // Optional: Update URL to match state changes from clicks
        // window.history.pushState({}, '', `/admin?section=${contentId}`);
    }, []); // Empty dependency array is fine here

    // Function to render the appropriate content based on activeContentId
    const renderContent = () => {
        // Convert to lowercase and check if string contains certain keywords
        // const content = activeContentId.toLowerCase();

        // if (content === 'users' || content.includes('user')) {
        //     return <UserManagement />;
        // } else if (content === 'bugs' || content.includes('bug') || content.includes('report')) {
        //     return <BugManagement />;
        // } else if (content === 'dashboard' || content.includes('dash')) {
        //     return <div className="p-6 text-gray-600">Dashboard content will go here.</div>;
        // } else {
        //     // Default fallback
        //     return <div className="p-6 text-gray-600">Select an option from the sidebar to get started.</div>;
        // }
        console.log(`[AdminPageContent] Rendering content for activeContentId: ${activeContentId}`);
        switch (activeContentId) {
            case 'user-management':
                return <UserManagement />; // Render your User Management component
            case 'bug-reports':
                return <BugManagement />; // Render your Bug Reports component
            // Add cases for 'database', 'notifications', 'help' etc.
            case 'dashboard':
                return <div className="p-6 text-gray-600">Dashboard content will go here.</div>;
            case 'doctor-verification':
                return <AdminDoctorVerificationPage />; // Render your Bug Reports component
            case 'notifications':
                return <AdminNotificationsPage/>
            default:
                console.warn(`[AdminPageContent] Unknown content ID in render: ${activeContentId}. Falling back.`);
                return <div className="p-6 text-gray-600">Select an option from the sidebar to get started.</div>; // Fallback to dashboard
        }
    };

    // Debug logging to check the activeContentId value when it changes
    useEffect(() => {
        console.log("Active content changed to:", activeContentId);
    }, [activeContentId]);

    console.log(`[AdminPageContent Pre-Render] Final activeContentId: ${activeContentId}`);

    return (
        <AdminPanelProvider switchContent={handleContentChange}>
            <div className="flex h-screen flex-row bg-gray-100"> {/* Adjusted background, ensure h-screen */}
                {/* Pass the *same* handler to SideBar's prop */}
                <SideBar
                    onContentChange={handleContentChange}
                    activeContentId={activeContentId}
                />
                {/* Main content area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-6"> {/* Changed bg, added padding */}
                    {/* Optional: Dynamic Title based on activeContentId */}
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                        {activeContentId
                            .replace(/-/g, ' ')
                            .replace(/\b\w/g, (char) => char.toUpperCase())}
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
};