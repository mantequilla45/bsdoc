'use client';
import { useEffect, useState } from 'react';
import SideBar from "@/app/layout/admin-sidebar/admin-sidebar";
import UserManagement from "./user-management/user-management";
import BugManagement from './bugs/bug-reports';
// Import other content components as needed

const AdminPage: React.FC = () => {
    const [activeContent, setActiveContent] = useState<string>('dashboard');

    // Function to render the appropriate content based on activeContent
    const renderContent = () => {
        // Convert to lowercase and check if string contains certain keywords
        const content = activeContent.toLowerCase();

        if (content === 'users' || content.includes('user')) {
            return <UserManagement />;
        } else if (content === 'bugs' || content.includes('bug') || content.includes('report')) {
            return <BugManagement />;
        } else if (content === 'dashboard' || content.includes('dash')) {
            return <div className="p-6 text-gray-600">Dashboard content will go here.</div>;
        } else {
            // Default fallback
            return <div className="p-6 text-gray-600">Select an option from the sidebar to get started.</div>;
        }
    };

    // Debug logging to check the activeContent value when it changes
    useEffect(() => {
        console.log("Active content changed to:", activeContent);
    }, [activeContent]);

    return (
        <div className="flex flex-row bg-[#62B6B8]">
            <SideBar onContentChange={setActiveContent} />
            <div className="bg-white w-full md:p-10 p-5 overflow-y-auto">
                <h1 className="md:text-2xl text-xl font-bold text-gray-900 mb-4 md:mb-0">
                    {activeContent
                        .replace(/-/g, ' ')
                        .toLowerCase()
                        .replace(/\b\w/g, (char) => char.toUpperCase())}

                </h1>
                {renderContent()}
            </div>
        </div>
    );
}

export default AdminPage;