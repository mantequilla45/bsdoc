'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import SideBar from "@/app/layout/admin-sidebar/admin-sidebar";
import UserManagement from "./user-management/user-management";
import BugManagement from './bugs/bug-reports';
import { AdminPanelProvider } from '@/app/context/AdminPanelContext';
import { useSearchParams } from 'next/navigation';
import AdminDoctorVerificationPage from './doctor-verifications/doctor-verification';

function AdminPageContent() {
    const searchParams = useSearchParams();
    const [activeContentId, setactiveContentId] = useState<string>(() => searchParams.get('section') ?? 'dashboard');

    const handleContentChange = useCallback((contentId: string) => {
        setactiveContentId(contentId);
    }, []);

    const renderContent = () => {
        switch (activeContentId) {
            case 'user-management':
                return <UserManagement />;
            case 'bug-reports':
                return <BugManagement />;
            case 'dashboard':
                return <AdminDashboard />; // Render the dashboard component
            case 'doctor-verification':
                return <AdminDoctorVerificationPage />; // Render your Bug Reports component
            case 'notifications':
                return <AdminNotificationsPage/>
            default:
                return <div className="p-6 text-gray-600">Select an option from the sidebar or check the URL section.</div>;
        }
    };

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
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Admin...</div>}>
            <AdminPageContent />
        </Suspense>
    );
}