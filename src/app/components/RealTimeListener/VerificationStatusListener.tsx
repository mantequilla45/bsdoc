// src/app/components/RealtimeListener/VerificationStatusListener.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
// --> Import the extracted modal component <--
import SimpleModal from '@/app/components/modals/SimpleModal'; // Adjust path if needed

const VerificationStatusListener: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [modalInfo, setModalInfo] = useState<{ message: string; type: 'approved' | 'rejected', link?: string | null } | null>(null);
    const router = useRouter();

    // --> Remove the inline definition of SimpleModal from here <--

    useEffect(() => {
        // ... (auth listener logic remains the same) ...
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentUser(session?.user ?? null);
        };
        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setCurrentUser(session?.user ?? null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        // ... (realtime subscription logic remains the same) ...
        if (!currentUser) {
            return;
        }

        const channelName = `user-updates:${currentUser.id}`;
        console.log(`[Listener] Subscribing to channel: ${channelName}`);
        const channel = supabase.channel(channelName);

        channel
            .on('broadcast', { event: 'verification_result' }, (message) => {
                console.log('[Listener] Received broadcast event:', message);
                const payload = message.payload as { type: string; message: string; link?: string | null };

                if (payload.type === 'verification_approved') {
                    setModalInfo({ message: payload.message, type: 'approved', link: payload.link });
                } else if (payload.type === 'verification_rejected') {
                    setModalInfo({ message: payload.message, type: 'rejected' });
                }
            })
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[Listener] Successfully subscribed to ${channelName}`);
                } else if (err) {
                    console.error(`[Listener] Error subscribing to ${channelName}:`, err);
                }
            });

        return () => {
            console.log(`[Listener] Unsubscribing from ${channelName}`);
            supabase.removeChannel(channel).catch(err => console.error("Error removing channel:", err));
        };
    }, [currentUser]);

    const closeModal = useCallback(async () => {
        // Check the type of modal that was just visible *before* clearing it
        const closingModalType = modalInfo?.type;

        console.log(`[Listener] closeModal called. Closing modal type: ${closingModalType}`);
        setModalInfo(null); // Close the modal visually

        // If the modal being closed was the rejection one, trigger logout
        if (closingModalType === 'rejected') {
            console.log('[Listener] Rejection modal closed. Signing out...');
            try {
                await supabase.auth.signOut();
                console.log('[Listener] Sign out successful. Redirecting...');
                router.push('/'); // Redirect after successful sign out
            } catch (error) {
                console.error('[Listener] Error during sign out after rejection:', error);
                // Handle sign out error if needed, maybe redirect anyway?
                router.push('/');
            }
        }
    }, [modalInfo, router]); // Depend on modalInfo and router

    useEffect(() => {
        if (modalInfo) {
            console.log('[Listener] Modal info set. Modal should be rendering with message:', modalInfo.message);
        } else {
            console.log('[Listener] Modal info is null. Modal should not be rendering.');
        }
    }, [modalInfo]);

    return (
        <>
            {/* Render the imported modal component */}
            {modalInfo && (
                <SimpleModal
                    message={modalInfo.message}
                    onClose={closeModal}
                    // Pass link only for approved type, customize label
                    link={modalInfo.type === 'approved' ? modalInfo.link : null}
                    linkLabel={modalInfo.type === 'approved' ? "Complete Profile" : undefined}
                />
            )}
        </>
    );
};

export default VerificationStatusListener;