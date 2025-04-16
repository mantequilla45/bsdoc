"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from "@/app/layout/header";
import AccountSection from './components/account-section';
import MedicalDetails from './components/medical-details';
import Footer from '@/app/layout/footer';
import EditDoctorProfileForm from '../doctors/profile/components/EditProfileForm';

const AccountPage = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (data?.user) {
                setUserId(data.user.id);
                fetchUserRole(data.user.id);
            } else {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    const fetchUserRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
                setUserRole(null);
            } else if (data) { setUserRole(data.role); } 
            else { setUserRole(null); }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setUserRole(null);
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

    return (
        <div className="flex flex-col bg-[#62B6B8]">
            <Header background="rgba(0,0,0,0.4)" title="Account" />
            <div className="md:mx-auto w-full max-w-[1300px] py-28 md:px-10 px-[25px]">
                <main className="rounded-md w-full overflow-hidden ">
                    <div className="flex md:flex-row flex-col bg-white min-h-[70vh]">
                        {userId && (
                            <>
                                <AccountSection userId={userId} />
                                <MedicalDetails userId={userId} />
                                {userRole === 'doctor' && (
                                    <div className="w-full p-4 md:p-6 border-t md:border-t-0 md:border-l border-gray-200">
                                        <EditDoctorProfileForm />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AccountPage;