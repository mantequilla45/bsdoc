// src\app\(pages)\account\page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from "@/app/layout/header";
import AccountSection from './components/account-section';
import MedicalDetails from './components/medical-details';
import Footer from '@/app/layout/footer';
import EditDoctorProfileForm from '../doctors/profile/components/EditProfileForm';
import toast from 'react-hot-toast';
import { useProfileCompletion } from '@/app/context/ProfileCompletionContext';

interface Profile {
    id: string;
    role: string;
    is_profile_complete: boolean;
}

const AccountPage = () => {
    const [userId, setUserId] = useState<string | null>(null);
    //const [userRole, setUserRole] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCompletingProfile, setIsCompletingProfile] = useState(false);
    const { isProfileComplete, markProfileComplete, isLoadingStatus } = useProfileCompletion(); //eslint-disable-line

    const fetchUserData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user;

            if (currentUser) {
                setUserId(currentUser.id);
                console.log(`[AccountPage] User found: ${currentUser.id}. Fetching profile...`);
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, role, is_profile_complete, first_name, last_name, phone_number, profile_image_url')
                    .eq('id', currentUser.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile: ', profileError);
                    console.log('Error fetching profile: ', profileError);
                    setProfile(null);
                }
                else {
                    console.log('[AccountPage] Profile fetched: ', profileData);
                    setProfile(profileData as Profile);
                }
            }
            else {
                console.log('[AccountPage] No user session found.');
                setUserId(null);
                setProfile(null);
            }
        }
        catch (error) {
            console.error('Error fetching user/profile data: ', error);
            console.log('Error fetching user/profile data: ', error);
            setUserId(null);
            setProfile(null);
        }
        finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // useEffect(() => {
    //     const fetchUser = async () => {
    //         const { data, error } = await supabase.auth.getUser();
    //         if (data?.user) {
    //             setUserId(data.user.id);
    //             fetchUserRole(data.user.id);
    //         } else {
    //             console.error('Error fetching user:', error);
    //         }
    //     };

    //     fetchUser();
    // }, []);

    // const fetchUserRole = async (userId: string) => {
    //     try {
    //         const { data, error } = await supabase
    //             .from('profiles')
    //             .select('role')
    //             .eq('id', userId)
    //             .single();

    //         if (error) {
    //             console.error('Error fetching user profile:', error);
    //             setUserRole(null);
    //         } else if (data) { setUserRole(data.role); } 
    //         else { setUserRole(null); }
    //     } catch (error) {
    //         console.error('Error fetching user profile:', error);
    //         setUserRole(null);
    //     }
    // };

    const handleMarkProfileComplete = async () => {
        // Optional: Add basic checks if essential fields are filled using the 'profile' state
        // if (!profile?.first_name || !profile?.last_name /* || medical fields if required */) {
        //    toast.error("Please fill in your first and last name first.");
        //    return;
        // }

        setIsCompletingProfile(true);
        const toastId = toast.loading("Finalizing profile setup...");
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            const response = await fetch('/api/profiles/me/mark-complete', { // Call API
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error ?? "Failed to mark profile complete");

            markProfileComplete();

            toast.success("Profile setup complete!", { id: toastId });
            // Refetch profile data to update UI (hide button/prompt)
            //await fetchUserData(false);

        } catch (err) {
            console.error("Error marking profile complete:", err);
            toast.error(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`, { id: toastId });
        } finally {
            setIsCompletingProfile(false);
        }
    };

    useEffect(() => {
        const updateCssVariable = () => {
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 0;
            document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        };
        updateCssVariable();
        window.addEventListener('resize', updateCssVariable);

        return () => window.removeEventListener('resize', updateCssVariable);
    }, []);

    if (loading) { return <div>Loading Account...</div>; /* Better loading UI */ }
    if (!userId || !profile) { return <div>Please log in.</div>; /* Better no-user UI */ }

    return (
        <div className="flex flex-col bg-[#62B6B8]">
            <Header background="rgba(0,0,0,0.4)" title="Account" />
            <div className="md:mx-auto w-full max-w-[1300px] py-28 md:px-10 px-[25px]">
                {/* Conditionally show prompt/banner */}
                {!profile.is_profile_complete && (
                    <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-md shadow">
                        <p className="font-bold">Welcome! Complete Your Profile</p>
                        <p className="text-sm">Please review and fill in your details below. Click [Finish Setup] when you are done.</p>
                    </div>
                )}
                <main className="rounded-md w-full overflow-hidden ">
                    <div className="flex md:flex-row flex-col bg-white min-h-[70vh]">
                        {userId && (
                            <>
                                <AccountSection userId={userId} />
                                <MedicalDetails userId={userId} />
                                {profile?.role === 'doctor' && (
                                    <div className="w-full p-4 md:p-6 border-t md:border-t-0 md:border-l border-gray-200">
                                        <EditDoctorProfileForm />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    {/* Conditionally Render "Finish Setup" Button */}
                    {!profile.is_profile_complete && (
                        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                            <button
                                onClick={handleMarkProfileComplete}
                                disabled={isCompletingProfile}
                                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {isCompletingProfile ? 'Saving...' : 'Finish Profile Setup'}
                            </button>
                            <p className="mt-2 text-xs text-gray-500">Click this once you have filled in your details.</p>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AccountPage;