'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [loadingCheck, setLoadingCheck] = useState(true);

  const [hasInitialized, setHasInitialized] = useState(false);
  const isRedirecting = useRef(false);

  const pathname = usePathname();
  const router = useRouter();

  const checkUserAndProfile = async () => {
      try {
        setLoadingCheck(true);
        console.log('[ClientWrapper] Running checkUserAndProfile...');

        const { data: { session } } = await supabase.auth.getSession();
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
      }
      catch (e) {
        console.error('[ClientWrapper] Error in checkUserAndProfile:', e);
        setIsProfileComplete(null);
      }
      finally {
        setLoadingCheck(false);
        setHasInitialized(true);
        console.log('[ClientWrapper] Check finished.');
      }
    };

  useEffect(() => {
    checkUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      console.log(`[ClientWrapper] Auth event: ${event}`);

      isRedirecting.current = false;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsProfileComplete(null);
        setLoadingCheck(false);
        setHasInitialized(true);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkUserAndProfile();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasInitialized || loadingCheck || isRedirecting.current) {
      console.log(`[ClientWrapper] Skipping redirect check - hasInitialized: ${hasInitialized}, loadingCheck: ${loadingCheck}, isRedirecting: ${isRedirecting.current}`);
      return;
    }

    console.log(`[ClientWrapper Redirect Check] Evaluating redirect. Loading: ${loadingCheck}, User: ${!!user}, Complete: ${isProfileComplete}, Path: ${pathname}`);
    
    if (user && isProfileComplete === false && pathname !== '/account') {
      console.log('[ClientWrapper] ---> Profile incomplete, REDIRECTING to /account <---');
      isRedirecting.current = true;
      router.replace('/account');
    }
  }, [hasInitialized, loadingCheck, user, isProfileComplete, pathname, router]);

  if (!hasInitialized || loadingCheck) {
    return (
      <SessionContextProvider supabaseClient={supabase}>
        <div>Loading...</div>
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