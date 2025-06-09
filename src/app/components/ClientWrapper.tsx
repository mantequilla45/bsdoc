'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const checkUserAndProfile = useCallback(async () => {
    try {
      console.log('[ClientWrapper] Running checkUserAndProfile...');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[ClientWrapper] Session error:', sessionError);
        setUser(null);
        setIsProfileComplete(null);
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      console.log(`[ClientWrapper] User state set: ${currentUser?.id ?? 'null'}`);

      if (currentUser) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('is_profile_complete')
            .eq('id', currentUser.id)
            .single();

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              // Profile doesn't exist yet - treat as incomplete
              console.log('[ClientWrapper] Profile not found, treating as incomplete');
              setIsProfileComplete(false);
            } else {
              console.error('[ClientWrapper] Error fetching profile status:', profileError);
              setIsProfileComplete(null);
            }
          } else {
            const profileComplete = profileData?.is_profile_complete ?? false;
            setIsProfileComplete(profileComplete);
            console.log(`[ClientWrapper] Fetched profile status: ${profileComplete}`);
          }
        } catch (profileFetchError) {
          console.error('[ClientWrapper] Profile fetch error:', profileFetchError);
          setIsProfileComplete(null);
        }
      } else {
        setIsProfileComplete(null);
        console.log('[ClientWrapper] No active user session.');
      }
    } catch (error) {
      console.error('[ClientWrapper] Unexpected error in checkUserAndProfile:', error);
      setUser(null);
      setIsProfileComplete(null);
    } finally {
      setLoadingCheck(false);
      setIsInitialized(true);
      console.log('[ClientWrapper] Check finished.');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (isMounted) {
        await checkUserAndProfile();
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[ClientWrapper] Auth event: ${event}`);
      
      if (isMounted) {
        // Handle different auth events appropriately
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsProfileComplete(null);
          setLoadingCheck(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await checkUserAndProfile();
        }
      }
    });

    initializeAuth();

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [checkUserAndProfile]);

  useEffect(() => {
    // Only attempt redirect after initialization is complete
    if (!isInitialized || loadingCheck) {
      return;
    }

    console.log(`[ClientWrapper Redirect Check] Evaluating redirect. User: ${!!user}, Complete: ${isProfileComplete}, Path: ${pathname}`);
    
    // Redirect to profile completion if user exists but profile is incomplete
    if (user && isProfileComplete === false && pathname !== '/account') {
      console.log('[ClientWrapper] ---> Profile incomplete, REDIRECTING to /account <---');
      router.replace('/account');
    }
  }, [isInitialized, loadingCheck, user, isProfileComplete, pathname, router]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <SessionContextProvider supabaseClient={supabase}>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Initializing...</p>
          </div>
        </div>
      </SessionContextProvider>
    );
  }

  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
};

export default ClientWrapper;