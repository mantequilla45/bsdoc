// Create file: src/app/context/ProfileCompletionContext.tsx
'use client';

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface ProfileCompletionContextType {
    user: User | null;
    isProfileComplete: boolean | null; // null = loading/unknown, false = incomplete, true = complete
    isLoadingStatus: boolean;
    checkCompletionStatus: () => Promise<void>; // Function to manually trigger a re-check
    markProfileComplete: () => void; // Function to optimistically update status after API call
}

const ProfileCompletionContext = createContext<ProfileCompletionContextType | undefined>(undefined);

export const useProfileCompletion = (): ProfileCompletionContextType => {
    const context = useContext(ProfileCompletionContext);
    if (!context) {
        throw new Error('useProfileCompletion must be used within a ProfileCompletionProvider');
    }
    return context;
};

interface ProfileCompletionProviderProps {
    children: ReactNode;
}

export const ProfileCompletionProvider: React.FC<ProfileCompletionProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null); // Initial state unknown
    const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

    // const checkCompletionStatus = useCallback(async (currentUser: User | null) => {
    //     console.log('[CompletionContext] Checking status...');
    //     setIsLoadingStatus(true);
    //     setIsProfileComplete(null); // Reset while checking

    //     if (!currentUser) {
    //          console.log('[CompletionContext] No user, status unknown.');
    //          setIsProfileComplete(null);
    //          setIsLoadingStatus(false);
    //          return;
    //     }

    //     try {
    //          console.log(`[CompletionContext] Fetching profile for user ${currentUser.id}`);
    //         const { data, error } = await supabase
    //             .from('profiles')
    //             .select('is_profile_complete')
    //             .eq('id', currentUser.id)
    //             .single();

    //         if (error) {
    //             console.error('[CompletionContext] Error fetching status:', error);
    //             setIsProfileComplete(null); // Error state
    //         } else {
    //              const status = data?.is_profile_complete ?? false; // Default to false if profile exists but flag is null
    //              setIsProfileComplete(status);
    //              console.log(`[CompletionContext] Status fetched: ${status}`);
    //         }
    //     } catch (error) {
    //         console.error('[CompletionContext] Exception fetching status:', error);
    //          setIsProfileComplete(null);
    //     } finally {
    //         setIsLoadingStatus(false);
    //          console.log('[CompletionContext] Check finished.');
    //     }
    // }, []); // useCallback ensures function identity is stable

    const checkUserAndProfileStatus = useCallback(async (currentUser: User | null) => {
        console.log('[CompletionContext] Checking user and status...');
        setIsLoadingStatus(true);
        setIsProfileComplete(null); // Reset while checking
        setUser(currentUser); // Update user state immediately

        if (!currentUser) {
            console.log('[CompletionContext] No user.');
            setIsProfileComplete(null);
            setIsLoadingStatus(false);
            return;
        }

        try {
            console.log(`[CompletionContext] Fetching profile for user ${currentUser.id}`);
            const { data, error } = await supabase
                .from('profiles')
                .select('is_profile_complete')
                .eq('id', currentUser.id)
                .single();

            if (error) {
                console.error('[CompletionContext] Error fetching status:', error);
                setIsProfileComplete(null);
            } else {
                const status = data?.is_profile_complete ?? false;
                setIsProfileComplete(status);
                console.log(`[CompletionContext] Status fetched: ${status}`);
            }
        } catch (error) {
            console.error('[CompletionContext] Exception fetching status:', error);
            setIsProfileComplete(null);
        } finally {
            setIsLoadingStatus(false);
            console.log('[CompletionContext] Check finished.');
        }
    }, []); // Empty dependency array

    // Check on initial load and auth change
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[CompletionContext] Auth event: ${event}`);
            const currentUser = session?.user ?? null;
            //setUser(currentUser); // Update user state
            await checkUserAndProfileStatus(currentUser); // Check status for the new user/session state
        });

        // Initial check
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            const initialUser = session?.user ?? null;
            //setUser(initialUser);
            await checkUserAndProfileStatus(initialUser);
        });

        return () => { authListener.subscription.unsubscribe(); };
    }, [checkUserAndProfileStatus]); // Rerun if checkCompletionStatus changes (it shouldn't due to useCallback)


    // Function for components to call *after* they successfully call the API to mark complete
    const markProfileComplete = useCallback(() => {
        console.log('[CompletionContext] Mark profile complete called (optimistic update).');
        setIsProfileComplete(true); // Update state immediately
        // Optionally, could trigger a background refetch via checkCompletionStatus for verification
        // setTimeout(() => checkCompletionStatus(user), 1000);
    }, []); // Keep user dependency? No, rely on external trigger after API


    const value = {
        user,
        isProfileComplete,
        isLoadingStatus,
        checkCompletionStatus: () => checkUserAndProfileStatus(user), // Expose re-check capability tied to current user state
        markProfileComplete,
    };

    return (
        <ProfileCompletionContext.Provider value={value}>
            {children}
        </ProfileCompletionContext.Provider>
    );
};