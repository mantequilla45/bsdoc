'use client'

// pages/admin/dashboard/page.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Import client-side supabase

// Define the ProfileUser type if not imported
interface ProfileUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const AdminDashboardPage = () => {
    const [users, setUsers] = useState<ProfileUser[]>([]); // Initialize as empty array with correct type
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);

            // 1. Check Session and Admin Role
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error("No session found:", sessionError);
                setError("Not authenticated");
                // Redirect to login page
                router.push('/'); // Adjust the login route as needed
                return;
            }

            try {
                // 2. Fetch Users from API
                console.log('Session is available: ', !!session);
                console.log('Access token available: ', !!session?.access_token);
                const response = await fetch('/api/admin/users', {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`, // Include access token
                        'Content-Type': 'application/json'
                    },
                });
                const data = await response.json();

                if (response.ok) {
                    // Ensure data.data is an array before setting state
                    if (Array.isArray(data.data)) {
                        setUsers(data.data);
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
    }, [router]); // Add router to the dependency array

    // Function to handle user deletion
    const handleDeleteUser = async (id: string) => {
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
                headers: { // Include access token
                    Authorization: `Bearer ${session.access_token}`,
                },
            });
            if (response.ok) {
                // Update the user list after deletion
                setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
            } else {
                const data = await response.json();
                console.error("Error deleting user:", data.error);
                setError(data.error || "Failed to delete user");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            setError("Failed to delete user");
        }
    };

    // Function to handle user edit - Redirect to edit page
    const handleEditUser = (id: string) => {
        router.push(`/admin/users/${id}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>{user.first_name}</td>
                            <td>{user.last_name}</td>
                            <td>{user.role}</td>
                            <td>
                                <button onClick={() => handleEditUser(user.id)}>Edit</button>
                                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboardPage;