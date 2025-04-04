// src/app/(pages)/admin/bugs/[id]/components/BugReportView.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface BugReportWithProfile {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string | null;
    status: string;
    user_id: string | null;
    created_at: string;
    updated_at: string | null;
    profiles: {
        email: string | null;
    } | null;
}

interface BugReportViewProps {
    bugReport: BugReportWithProfile;
    userEmail?: string | null;
}

const BugReportView: React.FC<BugReportViewProps> = ({ bugReport, userEmail }) => {
    console.log("Submitter Email received in BugReportView:", userEmail);
    const router = useRouter();
    const [status, setStatus] = useState(bugReport.status || 'Open');
    const [updateStatusError, setUpdateStatusError] = useState<string | null>(null);
    const [updateStatusSuccess, setUpdateStatusSuccess] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    const bugId = bugReport.id;

    const [authToken, setAuthToken] = useState<string>('');
    
    // Get the auth token on component mount
    useEffect(() => {
        const getAuthToken = async () => {
            const { data } = await supabase.auth.getSession();
            setAuthToken(data.session?.access_token ?? '');
        };
        
        getAuthToken();
    }, []);

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(event.target.value);
    };

    const handleUpdateStatus = async () => {
        setUpdateStatusError(null);
        setUpdateStatusSuccess(false);
        // const { data: { session } } = await supabase.auth.getSession();
        // const authToken = session?.access_token;
        const response = await fetch(`/api/admin/bugs/${bugId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            setUpdateStatusError(errorData?.error || 'Failed to update status.');
        } else {
            setUpdateStatusSuccess(true);
            setTimeout(() => {
                router.push('/admin/bugs');
            }, 500);
        }
    };

    const handleDeleteReport = async () => {
        setDeleteError(null);
        setDeleteSuccess(false);
        if (window.confirm('Are you sure you want to delete this bug report?')) {
            // const { data: { session } } = await supabase.auth.getSession();
            // const authToken = session?.access_token;
            const response = await fetch(`/api/admin/bugs/${bugId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                setDeleteError(errorData?.error || 'Failed to delete bug report.');
            } else {
                setDeleteSuccess(true);
                setTimeout(() => {
                    router.push('/admin/bugs');
                }, 500);
            }
        }
    };

    return (
        <div className="bg-white shadow rounded-md p-6">
            <p className="mb-2"><strong>ID:</strong> {bugReport.id}</p>
            <p className="mb-2"><strong>Title:</strong> {bugReport.title}</p>
            <p className="mb-2"><strong>Category:</strong> {bugReport.category}</p>
            <p className="mb-2"><strong>Severity:</strong> {bugReport.severity ?? 'N/A'}</p>
            <p className="mb-2"><strong>Status:</strong> {bugReport.status}</p>
            <p className="mb-2"><strong>User:</strong> {bugReport.profiles?.email ?? 'Visitor'}</p>
            <p className="mb-2"><strong>Contact Email:</strong> {userEmail}</p>
            <p className="mb-2"><strong>Created At:</strong> {new Date(bugReport.created_at).toLocaleString()}</p>
            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="whitespace-pre-wrap">{bugReport.description}</p>
            </div>

            <div className="mt-6 flex items-center gap-4">
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                    </label>
                    <select
                        id="status"
                        value={status}
                        onChange={handleStatusChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="Open">Open</option>
                        <option value="Fixing">Fixing</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
                <button
                    onClick={handleUpdateStatus}
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Update Status
                </button>
                {updateStatusSuccess && <span className="text-green-500">Status updated!</span>}
                {updateStatusError && <span className="text-red-500">Error: {updateStatusError}</span>}
            </div>

            <div className="mt-4">
                <button
                    onClick={handleDeleteReport}
                    className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    Delete Report
                </button>
                {deleteSuccess && <span className="text-green-500">Report deleted! Redirecting...</span>}
                {deleteError && <span className="text-red-500">Error: {deleteError}</span>}
            </div>
            <button onClick={() => router.back()} className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Back to List
            </button>
        </div>
    );
};

export default BugReportView;