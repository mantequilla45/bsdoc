// src/app/(pages)/api/admin/doctor-verifications/[verificationId]/reject/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Assume validateAdminAccess helper function exists and works...
async function validateAdminAccess(req: NextRequest) {
    // ... (keep your existing validation function)
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) { return { error: 'Unauthorized: Missing token', status: 401 }; }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) { return { error: 'Unauthorized: Invalid token', status: 401 }; }
    const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (profileError || !profile || profile.role !== 'admin') { return { error: 'Forbidden: User is not an admin', status: 403 }; }
    return { user };
}


export async function POST(req: NextRequest, { params }: { params: Promise<{ verificationId: string }> }) {
    // 1. Validate Admin Access
    console.log("REJECT Route: Validating admin access...");
    const validation = await validateAdminAccess(req);
    if ('error' in validation) {
        return NextResponse.json({ error: validation.error }, { status: validation.status });
    }
    console.log("REJECT Route: Admin access validated.");

    // 2. Get verificationId from URL path parameter
    const verificationId = (await params).verificationId;
    if (!verificationId) { return NextResponse.json({ error: 'Verification ID is missing' }, { status: 400 }); }
    console.log(`REJECT Route: Processing verificationId: ${verificationId}`);

    let userIdToDelete: string | null = null;
    let filePathToDelete: string | null = null;

    try {
        // 3. Fetch Verification Record to get user_id, file path and check status
        console.log("REJECT Route: Fetching verification record...");
        const { data: verificationData, error: fetchError } = await supabaseAdmin
            .from('doctor_verification')
            .select('user_id, prc_id_url, status')
            .eq('id', verificationId)
            .single();

        if (fetchError || !verificationData) {
            console.error('REJECT Route: Error fetching verification record:', fetchError);
            return NextResponse.json({ error: 'Verification record not found' }, { status: 404 });
        }
        console.log("REJECT Route: Verification record fetched:", verificationData);

        userIdToDelete = verificationData.user_id;
        filePathToDelete = verificationData.prc_id_url;

        // Check if we have a user ID before proceeding
        if (!userIdToDelete) {
             console.error("REJECT Route: Cannot proceed, userIdToDelete is null in verification record.");
             return NextResponse.json({ error: 'User ID missing from verification record.' }, { status: 500 });
        }

        // 4. Delete Storage File (if path exists)
        if (filePathToDelete) {
            console.log(`REJECT Route: Attempting to delete storage file: ${filePathToDelete}`);
            const { error: storageError } = await supabaseAdmin.storage
              .from('doctor-proofs') // Use your bucket name
              .remove([filePathToDelete]);
            if (storageError) { console.error("REJECT Route: Error deleting storage file (proceeding anyway):", storageError); }
            else { console.log("REJECT Route: Storage file deleted successfully."); }
        } else { console.warn(`REJECT Route: No file path found for verification ID: ${verificationId}. Skipping storage deletion.`); }

        // 5. *** NEW: Explicitly delete from public.users table ***
        console.log(`REJECT Route: Attempting to delete from public.users table for ID: ${userIdToDelete}`);
        const { error: publicUserDeleteError } = await supabaseAdmin
            .from('users') // Target the public.users table
            .delete()
            .eq('id', userIdToDelete);

        if (publicUserDeleteError) {
            // Log error but likely continue, deleting the auth user is most critical
             console.error(`REJECT Route: Error deleting from public.users table (proceeding anyway):`, publicUserDeleteError);
        } else {
            console.log(`REJECT Route: Entry deleted from public.users table for ID: ${userIdToDelete}`);
        }

        // 6. Update Verification Status to 'rejected' (Optional but good for tracking)
        console.log(`REJECT Route: Updating verification status to rejected for ID: ${verificationId}`);
        const { error: verificationUpdateError } = await supabaseAdmin
             .from('doctor_verification')
             .update({ status: 'rejected', verified_at: new Date().toISOString(), verifier_id: validation.user.id })
             .eq('id', verificationId);
         if (verificationUpdateError) { console.error("REJECT Route: Error updating verification status:", verificationUpdateError); }
         else { console.log("REJECT Route: Verification status updated to rejected."); }


        // 7. Delete the Auth User (This should cascade to profiles if set up correctly)
        console.log(`REJECT Route: Attempting to delete auth user: ${userIdToDelete}`);
        const { error: deletionError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);

        if (deletionError) {
           console.error(`REJECT Route: Error deleting auth user ${userIdToDelete}:`, deletionError);
           if (deletionError.message.includes('User not found')) {
                 return NextResponse.json({ error: 'User associated with this request was not found in auth (maybe already deleted).' }, { status: 404 });
           }
           // If deleting the auth user fails, the other deletions might have still happened.
           // Return a specific error indicating partial failure.
           return NextResponse.json({ error: `Failed to delete user from authentication system: ${deletionError.message}` }, { status: 500 });
        }
        console.log(`REJECT Route: Auth user ${userIdToDelete} deleted successfully.`);


        // 8. Return success response
        return NextResponse.json(
            { message: 'Doctor verification rejected and user fully deleted successfully.' },
            { status: 200 }
        );

    } catch (error: unknown) {
        console.error('REJECT Route: Unexpected error:', error);
        const details = error instanceof Error ? error.message : 'Unknown error';
        console.error(`REJECT Route: Error context - User ID attempted: ${userIdToDelete}`);
        return NextResponse.json(
            { error: 'An unexpected server error occurred during rejection', details },
            { status: 500 }
        );
    }
}