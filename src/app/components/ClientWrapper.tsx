// src\app\components\ClientWrapper.tsx
'use client'; // <-- Make this a Client Component

import React, { useEffect, useState } from 'react'; //eslint-disable-line
import { usePathname, useRouter } from 'next/navigation';
import { ProfileCompletionProvider, useProfileCompletion } from '../context/ProfileCompletionContext';

interface ClientWrapperProps {
    children: React.ReactNode;
}

function RedirectLogic({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    // ---> Use the context hook <---
    const { user,isProfileComplete, isLoadingStatus } = useProfileCompletion();

    useEffect(() => {
        console.log(`[RedirectLogic Check] Evaluating redirect. Loading: ${isLoadingStatus}, Complete: ${isProfileComplete}, Path: ${pathname}`);

        // Redirect if check is done, profile is INCOMPLETE, and not already on /account
        if (!isLoadingStatus && user && isProfileComplete === false && pathname !== '/account') {
            console.log('[RedirectLogic] ---> Profile incomplete, REDIRECTING to /account <---');
            router.replace('/account');
        }
    }, [isLoadingStatus, isProfileComplete, pathname, router]); // Depend on context values

    // Render children while check is happening or if redirect isn't needed
    // if (isLoadingStatus) return <div>Loading user status...</div>; // Optional global loader
    return <>{children}</>;
}

interface ClientWrapperProps {
    children: React.ReactNode;
}

// This component contains the logic previously in AuthenticatedLayout example
const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
    return (
        <ProfileCompletionProvider>
            <RedirectLogic>
                {children}
            </RedirectLogic>
        </ProfileCompletionProvider>
    )
    // const router = useRouter();
    // const pathname = usePathname();
    // const [user, setUser] = useState<User | null>(null);
    // const [loadingCheck, setLoadingCheck] = useState(true);
    // const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);

    // // Effect to check user and profile status on mount and auth changes
    // useEffect(() => {
    //     const checkUserAndProfile = async () => {
    //         setLoadingCheck(true);
    //         console.log('[ClientWrapper] Running checkUserAndProfile...');
    //         const { data: { session } } = await supabase.auth.getSession();
    //         const currentUser = session?.user ?? null;
    //         setUser(currentUser);
    //         console.log(`[ClientWrapper] User state set: ${currentUser?.id ?? 'null'}`);

    //         let profileComplete = null;
    //         if (currentUser) {
    //             console.log(`[ClientWrapper] Fetching profile for user: ${currentUser.id}`);
    //             const { data: profileData, error: profileError } = await supabase
    //                 .from('profiles')
    //                 .select('is_profile_complete')
    //                 .eq('id', currentUser.id)
    //                 .single();

    //             if (profileError) {
    //                 console.error("[ClientWrapper] Error fetching profile status:", profileError);
    //             } else {
    //                 profileComplete = profileData?.is_profile_complete ?? false;
    //                 console.log(`[ClientWrapper] Fetched profile status: ${profileComplete}`);
    //             }
    //         } else {
    //             console.log("[ClientWrapper] No active user session.");
    //         }
    //         setIsProfileComplete(profileComplete);
    //         setLoadingCheck(false);
    //         console.log('[ClientWrapper] Check finished.');
    //     };

    //     checkUserAndProfile(); // Run on initial mount

    //     // Listen for auth changes
    //     const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => { //eslint-disable-line
    //         console.log(`[ClientWrapper] Auth event: ${event}`);
    //         checkUserAndProfile(); // Re-check on auth change
    //     });

    //     // Cleanup listener on component unmount
    //     return () => { authListener.subscription.unsubscribe(); };

    // }, []); // Empty dependency array, runs once on mount, plus auth listener cleanup


    // // Effect to perform redirect based on the fetched state
    // useEffect(() => {
    //     console.log(`[ClientWrapper Redirect Check] Evaluating redirect. Loading: ${loadingCheck}, User: ${!!user}, Complete: ${isProfileComplete}, Path: ${pathname}`);
    //     // Redirect if check done, user exists, profile is incomplete, AND not already on /account
    //     if (!loadingCheck && user && isProfileComplete === false && pathname !== '/account') {
    //         console.log('[ClientWrapper Check] ---> Profile incomplete, REDIRECTING to /account <---');
    //         router.replace('/account'); // Use replace to avoid polluting browser history
    //     }
    // }, [loadingCheck, user, isProfileComplete, pathname, router]); // Dependencies for the redirect check

    // // Render the children passed to it
    // // You could show a global loading spinner here based on loadingCheck if desired
    // // if (loadingCheck) return <div>Loading application...</div>; // Example global loader
    // return <>{children}</>;
};

export default ClientWrapper;