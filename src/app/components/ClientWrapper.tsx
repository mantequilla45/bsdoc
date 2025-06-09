//src\app\components\ClientWrapper.tsx
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

  const pathname = usePathname();
  const router = useRouter();

  const checkUserAndProfile = useCallback(async () => {
    setLoadingCheck(true);
    console.log('[ClientWrapper] Running checkUserAndProfile...');

    try {
      // Get current session with automatic token refresh
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[ClientWrapper] Session error:', sessionError);
        setUser(null);
        setIsProfileComplete(null);
        setLoadingCheck(false);
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      console.log(`[ClientWrapper] User state set: ${currentUser?.id ?? 'null'}`);

      if (currentUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_profile_complete')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.error('[ClientWrapper] Error fetching profile status:', profileError);
          setIsProfileComplete(null);
        } else {
          const profileComplete = profileData?.is_profile_complete ?? false;
          setIsProfileComplete(profileComplete);
          console.log(`[ClientWrapper] Fetched profile status: ${profileComplete}`);
        }
      } else {
        setIsProfileComplete(null);
        console.log('[ClientWrapper] No active user session.');
      }
    } catch (error) {
      console.error('[ClientWrapper] Error in checkUserAndProfile:', error);
      setUser(null);
      setIsProfileComplete(null);
    } finally {
      setLoadingCheck(false);
      console.log('[ClientWrapper] Check finished.');
    }
  }, []);

  useEffect(() => {
    checkUserAndProfile();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[ClientWrapper] Auth event: ${event}`);
      
      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
          await checkUserAndProfile();
          break;
        case 'SIGNED_OUT':
          setUser(null);
          setIsProfileComplete(null);
          setLoadingCheck(false);
          break;
        default:
          // For other events, still check to be safe
          await checkUserAndProfile();
      }
    });

    // Set up automatic token refresh on tab focus
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[ClientWrapper] Tab became active, refreshing session...');
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (error) {
            console.error('[ClientWrapper] Error refreshing session on focus:', error);
          } else if (session) {
            console.log('[ClientWrapper] Session refreshed successfully on focus');
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      authListener.subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkUserAndProfile]);

  useEffect(() => {
    console.log(`[ClientWrapper Redirect Check] Evaluating redirect. Loading: ${loadingCheck}, User: ${!!user}, Complete: ${isProfileComplete}, Path: ${pathname}`);
    if (!loadingCheck && user && isProfileComplete === false && pathname !== '/account') {
      console.log('[ClientWrapper] ---> Profile incomplete, REDIRECTING to /account <---');
      router.replace('/account');
    }
  }, [loadingCheck, user, isProfileComplete, pathname, router]);

  return (
    <SessionContextProvider 
      supabaseClient={supabase}
      initialSession={null}
    >
      {children}
    </SessionContextProvider>
  );
};

export default ClientWrapper;