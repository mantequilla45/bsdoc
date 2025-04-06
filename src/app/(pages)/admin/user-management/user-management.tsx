'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Search, Loader, AlertCircle } from 'lucide-react';
import { ProfileUser } from './components/ProfileUser';
import UserTable from './components/UserTable';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Toast } from './components/Toast';

const UserManagement = () => {
    const [users, setUsers] = useState<ProfileUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<ProfileUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        show: false,
        message: '',
        type: 'success'
    });
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const router = useRouter();

    // Show toast notification
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    useEffect(() => {
        const fetchUsers = async () => {
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
                // 2. Fetch Users from API
                const response = await fetch('/api/admin/users', {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    },
                });
                const data = await response.json();

                if (response.ok) {
                    // Ensure data.data is an array before setting state
                    if (Array.isArray(data.data)) {
                        setUsers(data.data);
                        setFilteredUsers(data.data);
                    } else {
                        console.error("API response is not an array:", data.data);
                        setError("Invalid data format received from API");
                    }
                } else {
                    console.error("Error fetching users:", data.error);
                    setError(data.error || "Failed to fetch users");
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                setError("Failed to fetch users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [router]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const filtered = users.filter(user =>
                (user?.email ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (user?.first_name ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (user?.last_name ?? '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (user?.role ?? '').toLowerCase().includes(lowerCaseSearchTerm)
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    // Function to handle user deletion
    const handleDeleteUser = async (id: string) => {
        // If not confirming, show confirmation first
        if (confirmDelete !== id) {
            setConfirmDelete(id);
            return;
        }

        // Get the current session first
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            setError("Not authenticated");
            router.push('/');
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });
            if (response.ok) {
                // Update the user list after deletion
                setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
                showToast('User deleted successfully', 'success');
            } else {
                const data = await response.json();
                console.error("Error deleting user:", data.error);
                setError(data.error || "Failed to delete user");
                showToast(data.error || "Failed to delete user", 'error');
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            setError("Failed to delete user");
            showToast("Failed to delete user", 'error');
        } finally {
            setConfirmDelete(null);
        }
    };

    // New function to handle saving user updates
    const handleSaveUser = async (id: string, updatedUserData: Partial<ProfileUser>) => {
        // Get the current session first
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            setError("Not authenticated");
            router.push('/');
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedUserData)
            });

            if (response.ok) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const updatedUser = await response.json();
                
                // Update the user in the state
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.id === id ? { ...user, ...updatedUserData } : user
                    )
                );
                
                showToast('User updated successfully', 'success');
            } else {
                const data = await response.json();
                console.error("Error updating user:", data.error);
                setError(data.error || "Failed to update user");
                showToast(data.error || "Failed to update user", 'error');
            }
        } catch (error) {
            console.error("Error updating user:", error);
            setError("Failed to update user");
            showToast("Failed to update user", 'error');
        }
    };

    // Function to cancel delete confirmation
    const cancelDelete = () => {
        setConfirmDelete(null);
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="mt-4 text-lg text-gray-700">Loading users...</p>
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
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#00909A]"
                        />
                        <Search className="w-5 h-5 absolute left-3 text-gray-400" />
                    </div>
                </div>

                <Card>
                    <UserTable 
                        users={filteredUsers}
                        totalUsers={users.length}
                        searchTerm={searchTerm}
                        confirmDelete={confirmDelete}
                        onSaveUser={handleSaveUser}
                        onDeleteUser={handleDeleteUser}
                        onCancelDelete={cancelDelete}
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

export default UserManagement;