'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Search, Loader, AlertCircle } from 'lucide-react';
import { Button } from '../user-management/components/Button';
import { Card } from '../user-management/components/Card';
import { Toast } from '../user-management/components/Toast';
import BugTable from './components/BugTable';

interface BugReport {
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

    // Show toast notification
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    useEffect(() => {
        const fetchBugs = async () => {
            setLoading(true);
            setError(null);

            // 1. Check Session and Admin Role
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error("No session found:", sessionError);
                router.push('/');
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('bugs')
                    .select('*, profiles(email)')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching bug reports:", error);
                    setError("Failed to fetch bug reports");
                }

                if (data) {
                    setBugs(data as BugReport[]);
                    setFilteredBugs(data as BugReport[]);
                }
            } catch (error) {
                console.error("Error fetching bugs:", error);
                setError("Failed to fetch bugs");
            } finally {
                setLoading(false);
            }
        };

        fetchBugs();
    }, [router]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredBugs(bugs);
        } else {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const filtered = bugs.filter(bug =>
                (bug?.title ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (bug?.description ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (bug?.category ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (bug?.status ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (bug?.profiles?.email ?? '').toLowerCase().includes(lowerCaseSearchTerm)
            );
            setFilteredBugs(filtered);
        }
    }, [searchTerm, bugs]);

    // Function to handle viewing a bug detail
    const handleViewBug = (id: string) => {
        router.push(`/admin/bugs/${id}`);
    };
    
    // Function to handle updating a bug
    const handleUpdateBug = async (id: string, updatedBugData: Partial<BugReport>) => {
        // Get the current session first
        const { data: { session } } = await supabase.auth.getSession();
    
        if (!session) {
            setError("Not authenticated");
            router.push('/');
            return;
        }
    
        try {
            const { data, error } = await supabase
                .from('bugs')
                .update(updatedBugData)
                .eq('id', id)
                .select();
    
            if (error) {
                console.error("Error updating bug:", error);
                setError("Failed to update bug");
                showToast("Failed to update bug", 'error');
                return;
            }
    
            if (data) {
                // Update the local state
                setBugs(prevBugs => 
                    prevBugs.map(bug => 
                        bug.id === id ? { ...bug, ...updatedBugData } : bug
                    )
                );
                
                showToast('Bug updated successfully', 'success');
            }
        } catch (error) {
            console.error("Error updating bug:", error);
            setError("Failed to update bug");
            showToast("Failed to update bug", 'error');
        }
    };

    // Function to handle deleting a bug
    const handleDeleteBug = async (id: string) => {
        // Get the current session first
        const { data: { session } } = await supabase.auth.getSession();
    
        if (!session) {
            setError("Not authenticated");
            router.push('/');
            return;
        }
    
        try {
            const { error } = await supabase
                .from('bugs')
                .delete()
                .eq('id', id);
    
            if (error) {
                console.error("Error deleting bug:", error);
                setError("Failed to delete bug");
                showToast("Failed to delete bug", 'error');
                return;
            }
    
            // Update the bug list after deletion
            setBugs(prevBugs => prevBugs.filter(bug => bug.id !== id));
            showToast('Bug deleted successfully', 'success');
        } catch (error) {
            console.error("Error deleting bug:", error);
            setError("Failed to delete bug");
            showToast("Failed to delete bug", 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="mt-4 text-lg text-gray-700">Loading bug reports...</p>
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
                        onClick={() => window.location.reload()}
                        variant="primary"
                        className="mt-4"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="">
            <div className="">
                <div className="flex flex-col md:flex-row justify-end items-start md:items-center mb-6">
                    <div className="flex items-center relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search bugs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#00909A]"
                        />
                        <Search className="w-5 h-5 absolute left-3 text-gray-400" />
                    </div>
                </div>

                <Card>
                    <BugTable 
                        bugs={filteredBugs}
                        totalBugs={bugs.length}
                        searchTerm={searchTerm}
                        onViewBug={handleViewBug}
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
        </div>
    );
};

export default BugManagement;