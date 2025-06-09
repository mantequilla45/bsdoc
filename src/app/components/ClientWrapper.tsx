/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Track if we're already redirecting to prevent loops
  const isRedirecting = useRef(false);

  const pathname = usePathname();
  const router = useRouter();

  const checkUserAndProfile = async () => {
    try {
      console.log('[ClientWrapper] Running checkUserAndProfile...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const sessionPromise = supabase.auth.getSession();
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
      
      const currentUser = session?.user ?? null;
      
      setUser(currentUser);
      console.log(`[ClientWrapper] User state set: ${currentUser?.id ?? 'null'}`);

      if (currentUser) {
        try {
          const profilePromise = supabase
            .from('profiles')
            .select('is_profile_complete')
            .eq('id', currentUser.id)
            .single();
            
          const { data: profileData, error: profileError } = await Promise.race([
            profilePromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Profile timeout')), 5000))
          ]) as any;

          if (profileError) {
            console.error('[ClientWrapper] Error fetching profile status:', profileError);
            // Assume profile is complete on error to avoid redirect loops
            setIsProfileComplete(true);
          } else {
            const profileComplete = profileData?.is_profile_complete ?? false;
            setIsProfileComplete(profileComplete);
            console.log(`[ClientWrapper] Fetched profile status: ${profileComplete}`);
          }
        } catch (profileErr) {
          console.error('[ClientWrapper] Profile check failed:', profileErr);
          // Assume profile is complete on timeout/error
          setIsProfileComplete(true);
        }
      } else {
        setIsProfileComplete(null);
        console.log('[ClientWrapper] No active user session.');
      }
    } catch (error) {
      console.error('[ClientWrapper] Error in checkUserAndProfile:', error);
      // On timeout or error, assume no user and complete profile
      setUser(null);
      setIsProfileComplete(null);
    } finally {
      setLoadingCheck(false);
      setHasInitialized(true);
      console.log('[ClientWrapper] Check finished - loading and initialization complete.');
    }
  };

  useEffect(() => {
    // Add safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (loadingCheck) {
        console.log('[ClientWrapper] Safety timeout triggered - forcing initialization');
        setLoadingCheck(false);
        setHasInitialized(true);
        setUser(null);
        setIsProfileComplete(null);
      }
    }, 15000); // 15 second fallback

    checkUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[ClientWrapper] Auth event: ${event}`);
      
      // Reset redirect flag on auth changes
      isRedirecting.current = false;
      
      // Handle different auth events appropriately
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsProfileComplete(null);
        setLoadingCheck(false);
        setHasInitialized(true);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Only recheck profile for relevant events
        await checkUserAndProfile();
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Only attempt redirect after initial load and when we have complete data
    if (!hasInitialized || loadingCheck || isRedirecting.current) {
      console.log(`[ClientWrapper] Skipping redirect check - hasInitialized: ${hasInitialized}, loadingCheck: ${loadingCheck}, isRedirecting: ${isRedirecting.current}`);
      return;
    }

    console.log(`[ClientWrapper Redirect Check] Evaluating redirect. User: ${!!user}, Complete: ${isProfileComplete}, Path: ${pathname}`);
    
    // Only redirect if:
    // 1. User is authenticated
    // 2. Profile is explicitly incomplete (false, not null)
    // 3. Not already on the account page
    // 4. Not already redirecting
    if (user && isProfileComplete === false && pathname !== '/account') {
      console.log('[ClientWrapper] ---> Profile incomplete, REDIRECTING to /account <---');
      isRedirecting.current = true;
      router.replace('/account');
    }
  }, [hasInitialized, loadingCheck, user, isProfileComplete, pathname, router]);

  // Show loading state while checking
  if (!hasInitialized || loadingCheck) {
    return (
      <SessionContextProvider supabaseClient={supabase}>
        <div>Loading...</div> {/* Or your loading component */}
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
