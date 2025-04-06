'use client';
import { useState } from 'react';
import SideBar from "@/app/layout/admin-sidebar/admin-sidebar";
import UserManagement from "./user-management/user-management";
// Import other content components as needed


const AdminPage: React.FC = () => {
    const [activeContent, setActiveContent] = useState<string>('dashboard');

    // Function to render the appropriate content based on activeContent
    const renderContent = () => {
        switch (activeContent) {
            case 'users':
                return <UserManagement />;
            default:
                return <div/>;
        }
    };

    return (
        <div className="flex flex-row bg-[#62B6B8]">
            <SideBar onContentChange={setActiveContent} />
            <div className="bg-white w-[1300px] p-6 overflow-y-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
                    {activeContent.charAt(0).toUpperCase() + activeContent.slice(1).replace(/-/g, ' ')}
                </h1>
                {renderContent()}
            </div>
        </div>
    );
}

export default AdminPage;