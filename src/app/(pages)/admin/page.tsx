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
    // Initialize state *once* based on the initial URL.
    // Note: useState's initializer function runs only on the first render.
    const [activeContentId, setactiveContentId] = useState<string>(() => {
        const initialSection = searchParams.get('section') ?? 'dashboard';
        console.log(`[AdminPageContent Initial State] Setting initial section from URL: ${initialSection}`);
        return initialSection;
    });

    // Effect to sync state ONLY if URL param changes *after* initial load
    useEffect(() => {
        const sectionFromUrl = searchParams.get('section') ?? 'dashboard';
        console.log(`[AdminPageContent EFFECT Sync] URL params changed. Syncing state to: ${sectionFromUrl}`);
        // Directly set the state based on the URL parameter when it changes.
        // This avoids reading activeContentId inside the effect.
        setactiveContentId(sectionFromUrl);
    }, [searchParams]); // Depend only on searchParams

    // Handler passed to Sidebar and Context
    const handleContentChange = useCallback((contentId: string) => {
        console.log(`[AdminPageContent] handleContentChange called with: ${contentId}`);
        setactiveContentId(contentId);
        // Optional: Update URL to match state changes from clicks.
        // You might want to implement this for better UX (bookmarking, back/forward).
        // Consider using next/navigation's router.push or router.replace here.
        // e.g., router.push(`/admin?section=${contentId}`, { scroll: false });
    }, []); // Empty dependency array is correct IF this callback doesn't depend on changing props/state

    // Function to render the appropriate content based on activeContentId
    const renderContent = () => {
        console.log(`[AdminPageContent] Rendering content for activeContentId: ${activeContentId}`);
        switch (activeContentId) {
            case 'user-management':
                return <UserManagement />;
            case 'bug-reports':
                return <BugManagement />;
            case 'dashboard':
                return <div className="p-6 text-gray-600">Dashboard content will go here.</div>;
            case 'doctor-verification':
                return <AdminDoctorVerificationPage />; // Render your Bug Reports component
            case 'notifications':
                return <AdminNotificationsPage/>
            default:
                console.warn(`[AdminPageContent] Unknown content ID in render: ${activeContentId}. Falling back.`);
                // Fallback to a default view or dashboard if the section is unknown
                return <div className="p-6 text-gray-600">Select an option from the sidebar or check the URL section.</div>;
        }
    };

    // Debug logging to check the activeContentId value when it changes
    useEffect(() => {
        console.log("[AdminPageContent State Change] Active content changed to:", activeContentId);
    }, [activeContentId]);

    console.log(`[AdminPageContent Pre-Render] Final activeContentId: ${activeContentId}`);

    return (
        <AdminPanelProvider switchContent={handleContentChange}>
            <div className="flex h-screen flex-row bg-gray-100">
                <SideBar
                    onContentChange={handleContentChange}
                    activeContentId={activeContentId}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-6">
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
        // Suspense is needed because useSearchParams() might suspend
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Admin...</div>}>
            <AdminPageContent />
        </Suspense>
    );
};