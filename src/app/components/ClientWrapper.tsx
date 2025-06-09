'use client';

import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const checkUserAndProfile = async () => {
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
        } else {
          const profileComplete = profileData?.is_profile_complete ?? false;
          setIsProfileComplete(profileComplete);
          console.log(`[ClientWrapper] Fetched profile status: ${profileComplete}`);
        }
      } else {
        setIsProfileComplete(null);
        console.log('[ClientWrapper] No active user session.');
      }

      setLoadingCheck(false);
      console.log('[ClientWrapper] Check finished.');
    };

    checkUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      console.log(`[ClientWrapper] Auth event: ${event}`);
      checkUserAndProfile();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log(`[ClientWrapper Redirect Check] Evaluating redirect. Loading: ${loadingCheck}, User: ${!!user}, Complete: ${isProfileComplete}, Path: ${pathname}`);
    if (!loadingCheck && user && isProfileComplete === false && pathname !== '/account') {
      console.log('[ClientWrapper] ---> Profile incomplete, REDIRECTING to /account <---');
      router.replace('/account');
    }
  }, [loadingCheck, user, isProfileComplete, pathname, router]);

  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
};

export default ClientWrapper;
