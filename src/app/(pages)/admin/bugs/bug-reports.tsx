'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader, AlertCircle } from 'lucide-react'; // Added Eye
import { Button } from '../user-management/components/Button';
import { Card } from '../user-management/components/Card';
import { Toast } from '../user-management/components/Toast';
import BugTable from './components/BugTable';
import SearchInput from '../components/SearchInput'; // Adjust path if necessary
import BugDetailModal from './components/BugModal';

// Keep BugReport interface definition here or import if moved
export interface BugReport {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string | null;
    status: string;
    user_id: string | null;
    created_at: string;
    updated_at: string | null;
    email: string | null;
    updated_by_admin_id: string | null; // <-- ADD: ID of admin who last updated
    reporter: {                         // <-- RENAME: Original submitter's profile
        email: string | null;
    } | null;
    updater: {                          // <-- ADD: Profile of admin who last updated
        first_name: string | null;
        last_name: string | null;
        email: string | null;
    } | null;
}


const BugManagement = () => {
    const [bugs, setBugs] = useState<BugReport[]>([]);
    const [filteredBugs, setFilteredBugs] = useState<BugReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        show: false,
        message: '',
        type: 'success'
    });
    const router = useRouter();

    // *** State for Modal ***
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
    // *** End Modal State ***

    // --- showToast, fetchBugs, filtering useEffect ---
    // ... (These functions remain the same as the previous working version) ...
     // Show toast notification
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    // *** Reverted fetchBugs to use direct Supabase client call ***
    useEffect(() => {
        const fetchBugs = async () => {
            setLoading(true);
            setError(null);

            // 1. Check Session (still important)
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error("No session found:", sessionError);
                router.push('/');
                return;
            }

            // *** Make the direct Supabase call like originally ***
            try {
                const { data, error: fetchDbError } = await supabase
                    .from('bugs')
                    .select(`
                        *, 
                        reporter:profiles!bugs_user_id_fkey(email),
                        updater:profiles!bugs_updated_by_admin_id_fkey(first_name, last_name, email)
                    `)
                    .order('created_at', { ascending: false });

                if (fetchDbError) {
                    console.error("Error fetching bug reports:", fetchDbError);
                    setError(`Failed to fetch bug reports: ${fetchDbError.message}`);
                } else if (data) {
                    // Ensure data is treated as BugReport[]
                    setBugs(data as BugReport[]);
                    setFilteredBugs(data as BugReport[]);
                } else {
                     // Handle case where data is null without error
                     setBugs([]);
                     setFilteredBugs([]);
                }
            } catch (catchError) {
                // Catch any unexpected errors during the process
                console.error("Error fetching bugs (catch block):", catchError);
                setError(catchError instanceof Error ? catchError.message : "An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchBugs();
    }, [router]); // Dependency array remains the same

    // Filtering useEffect remains the same
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredBugs(bugs);
        } else {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const filtered = bugs.filter(bug =>
                (bug?.id ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (bug?.title ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (bug?.description ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (bug?.category ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (bug?.status ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (bug?.reporter?.email ?? '').toLowerCase().includes(lowerCaseSearchTerm)
            );
            setFilteredBugs(filtered);
        }
    }, [searchTerm, bugs]);


    // --- handleUpdateBug, handleDeleteBug ---
    // ... (These functions remain the same, using API calls or direct supabase) ...
    const handleUpdateBug = async (id: string, updatedBugData: Partial<Pick<BugReport, 'status'>>) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setError("Not authenticated"); router.push('/'); return; }

        try {
            const response = await fetch(`/api/admin/bugs/${id}`, {
                 method: 'PUT',
                 headers: {
                     'Authorization': `Bearer ${session.access_token}`,
                     'Content-Type': 'application/json'
                 },
                 body: JSON.stringify(updatedBugData)
            });
             const result = await response.json();

             if (response.ok && result.data) {
                 setBugs(prevBugs =>
                     prevBugs.map(bug =>
                         bug.id === id ? { ...bug, ...result.data } : bug
                     )
                 );
                 showToast('Bug status updated successfully', 'success');
             } else {
                 console.error("Error updating bug:", result.error);
                 setError(result.error ?? "Failed to update bug status");
                 showToast(result.error ?? "Failed to update bug status", 'error');
             }

        } catch (error) {
             console.error("Error updating bug status:", error);
             setError("Failed to update bug status");
             showToast("Failed to update bug status", 'error');
        }
    };

    const handleDeleteBug = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this bug report?")) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setError("Not authenticated"); router.push('/'); return; }

        try {
            const response = await fetch(`/api/admin/bugs/${id}`, {
                 method: 'DELETE',
                 headers: {
                     'Authorization': `Bearer ${session.access_token}`
                 },
            });
              const result = await response.json();

             if (response.ok) {
                 setBugs(prevBugs => prevBugs.filter(bug => bug.id !== id));
                 showToast(result.message ?? 'Bug deleted successfully', 'success');
             } else {
                  console.error("Error deleting bug:", result.error);
                  setError(result.error ?? "Failed to delete bug");
                  showToast(result.error ?? "Failed to delete bug", 'error');
             }
        } catch (error) {
             console.error("Error deleting bug:", error);
             setError("Failed to delete bug");
             showToast("Failed to delete bug", 'error');
        }
    };

    // *** MODIFIED handleViewBug to open modal ***
    const handleViewBug = (id: string) => {
        const bugToShow = bugs.find(bug => bug.id === id); // Find the bug in the full list
        if (bugToShow) {
            setSelectedBug(bugToShow);
            setIsModalOpen(true);
            // router.push(`/admin/bugs/${id}`); // Remove navigation
        } else {
             showToast("Could not find bug details.", "error");
        }
    };

    // --- Loading and Error states ---
    // ... (Loading and Error JSX remains the same) ...
    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="mt-4 text-lg text-gray-700">Loading user feedback...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center bg-red-50 p-8 rounded-lg shadow-md">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                    <h2 className="mt-4 text-xl font-semibold text-red-900">Error</h2>
                    <p className="mt-2 text-center text-red-700">{error}</p>
                    <Button
                        onClick={() => window.location.reload()} // Or call fetchBugs()
                        variant="primary"
                        className="mt-4"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }


    // --- Component Return JSX ---
    return (
        <div className="">
            <div className="">
                <div className="flex flex-col md:flex-row justify-end items-start md:items-center mb-6">
                    <SearchInput
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="Search bugs (ID, title, desc, email...)"
                        className="w-full md:w-72"
                    />
                </div>

                <Card>
                    <BugTable
                        bugs={filteredBugs}
                        totalBugs={bugs.length}
                        searchTerm={searchTerm}
                        onViewBug={handleViewBug} // Pass the modified handler
                        onUpdateBug={handleUpdateBug}
                        onDeleteBug={handleDeleteBug}
                    />
                </Card>
            </div>

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Render the Modal */}
            <BugDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)} // Function to close the modal
                bug={selectedBug} // Pass the selected bug data
            />
        </div>
    );
};

export default BugManagement;