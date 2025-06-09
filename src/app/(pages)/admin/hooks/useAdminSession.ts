// hooks/useAdminSession.ts
import { useState, useEffect, useCallback } from 'react';
import { useSession, useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseClient';

interface Profile {
    id: string;
    role: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    profile_image_url?: string | null;
}

export const useAdminSession = () => {
    const session = useSession();
    const { isLoading: isSessionLoading } = useSessionContext();
    
    const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const fetchAdminProfile = useCallback(async (userId: string) => {
        setIsLoadingProfile(true);
        setProfileError(null);
        
        try {
            console.log("[useAdminSession] Fetching profile for user:", userId);
            
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Profile fetch timeout')), 10000);
            });

            const fetchPromise = supabase
                .from('profiles')
                .select('id, first_name, last_name, role, email, profile_image_url')
                .eq('id', userId)
                .single();

            const { data: profileData, error: profileError } = await Promise.race([
                fetchPromise,
                timeoutPromise
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ]) as any;

            if (profileError) {
                if (profileError.code === 'PGRST116') {
                    console.log("[useAdminSession] Admin profile not found");
                    setAdminProfile(null);
                    setProfileError("Profile not found");
                } else {
                    console.error("[useAdminSession] Error fetching admin profile:", profileError);
                    setAdminProfile(null);
                    setProfileError(profileError.message ?? "Failed to fetch profile");
                }
            } else {
                setAdminProfile(profileData as Profile ?? null);
                console.log("[useAdminSession] Admin profile fetched:", profileData);
            }
        } catch (error) {
            console.error("[useAdminSession] Error fetching admin profile:", error);
            setAdminProfile(null);
            setProfileError(error instanceof Error ? error.message : "Unknown error");
        } finally {
            setIsLoadingProfile(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const initializeProfile = async () => {
            // Wait for session to be fully loaded
            if (isSessionLoading) {
                console.log("[useAdminSession] Session still loading...");
                return;
            }

            if (session?.user && isMounted) {
                console.log("[useAdminSession] Session available, fetching profile");
                await fetchAdminProfile(session.user.id);
            } else {
                console.log("[useAdminSession] No session available");
                setAdminProfile(null);
                setIsLoadingProfile(false);
            }
            
            if (isMounted) {
                setIsInitialized(true);
            }
        };

        initializeProfile();

        return () => {
            isMounted = false;
        };
    }, [session, isSessionLoading, fetchAdminProfile]);

    const isAdmin = adminProfile?.role === 'admin';
    const hasValidSession = !!session?.user;
    const isReady = isInitialized && !isSessionLoading;

    return {
        session,
        adminProfile,
        isAdmin,
        hasValidSession,
        isLoadingProfile,
        isSessionLoading,
        profileError,
        isReady,
        refetchProfile: () => session?.user ? fetchAdminProfile(session.user.id) : Promise.resolve()
    };
};