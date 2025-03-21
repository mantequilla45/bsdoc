"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from "@/app/layout/header";
import AccountSection from './components/account-section';
import MedicalDetails from './components/medical-details';
import Footer from '@/app/layout/footer';

const AccountPage = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setAuthLoading(true);
            const { data, error } = await supabase.auth.getUser();
            if (data?.user) {
                setUserId(data.user.id);
            } else {
                console.error('Error fetching user:', error);
            }
            setAuthLoading(false);
        };

        fetchUser();
    }, []);

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
        <div className="bg-[#62B6B8]">
            <Header background="white" title="Account" />
            <div className="py-5 px-10" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
                <div className="max-w-[1300px] mx-auto gap-10 flex h-full flex-row bg-white p-10 rounded-xl">
                    {authLoading ? (
                        <div className="w-full flex justify-center items-center p-10">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00909A] w-1/2 animate-pulse rounded-full"></div>
                            </div>
                        </div>
                    ) : userId ? (
                        <>
                            <AccountSection userId={userId} />
                            <div className="w-full flex flex-col">
                                <MedicalDetails userId={userId} />
                            </div>
                        </>
                    ) : (
                        <div className="w-full text-center p-10 text-gray-500">
                            Unable to load user data. Please try again or sign in.
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AccountPage;