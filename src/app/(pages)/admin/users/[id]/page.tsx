// app/admin/users/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProfileUser } from '@/types/user';
import { supabase } from '@/lib/supabaseClient';

export default function UserEditPage() {
    const [user, setUser] = useState<ProfileUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    useEffect(() => {
        if (!id) return;

        const fetchUser = async () => {
            setLoading(true);
            setError(null);

            // 1. Check Session and Admin Role
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error("No session found:", sessionError);
                setError("Not authenticated");
                // Redirect to login page
                router.push('/login');
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (profileError || !profile || profile.role !== 'admin') {
                console.error("Not authorized:", profileError);
                setError("Not authorized");
                // Redirect to a "not authorized" page or homepage
                router.push('/');
                return;
            }

            try {
                // Get access token and include it in the request
                const accessToken = session.access_token;
                
                const response = await fetch(`/api/admin/users/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();

                if (response.ok) {
                    // Handle both data.data and direct data response formats
                    setUser(data.data || data);
                } else {
                    console.error("Error fetching user:", data.error || response.statusText);
                    setError(data.error || "Failed to fetch user");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                setError(`Failed to fetch user: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser(prevUser => prevUser ? {
            ...prevUser,
            [name]: value,
        } : null);
    };

    const handleUpdateUser = async () => {
        if (!user) return;
        try {
            // Get the current session to include the token
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                setError("Session expired. Please login again.");
                router.push('/');
                return;
            }
            
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
            console.log(response);
            
            if (response.ok) {
                // Redirect back to the admin dashboard
                router.push('/admin/dashboard');
            } else {
                const data = await response.json();
                console.error("Error updating user:", data.error || response.statusText);
                setError(data.error || "Failed to update user");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            setError(`Failed to update user: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div>
            <h1>Edit User</h1>
            <form>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={user.email || ""}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="first_name">First Name:</label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={user.first_name || ""}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="last_name">Last Name:</label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={user.last_name || ""}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="role">Role:</label>
                    <input
                        type="text"
                        id="role"
                        name="role"
                        value={user.role || ""}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="button" onClick={handleUpdateUser}>
                    Update User
                </button>
            </form>
        </div>
    );
}