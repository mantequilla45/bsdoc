// Create file: src/app/(pages)/api/profiles/me/mark-complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer'; // Use server client

export async function POST(req: NextRequest) { //eslint-disable-line
    const supabaseServer = await createClient();
    console.log('[API MarkComplete POST] Received request.');

    try {
        // 1. Get Authenticated User
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
        if (authError || !user) {
            console.error('[API MarkComplete POST] Auth Error:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log(`[API MarkComplete POST] User authenticated: ${user.id}`);

        // 2. Update the flag in profiles table
        const { data: updatedProfile, error: updateError } = await supabaseServer
            .from('profiles')
            .update({ is_profile_complete: true }) // Set the flag to true
            .eq('id', user.id)
            .select('id, is_profile_complete') // Select updated data
            .single();

        if (updateError) {
            console.error(`[API MarkComplete POST] Error updating flag for ${user.id}:`, updateError);
            return NextResponse.json({ error: 'Failed to mark profile as complete', details: updateError.message }, { status: 500 });
        }

        // Verification step (optional but good)
        if (!updatedProfile?.is_profile_complete) {
            console.error(`[API MarkComplete POST] Update for ${user.id} seemed successful but flag is not true in returned data.`);
            // Note: Depending on Supabase return settings, 'updatedProfile' might be the old value.
            // A safer check might be just ensuring no error occurred.
            // Consider removing this check if updateError was null.
             return NextResponse.json({ error: 'Failed to confirm profile completion status update.' }, { status: 500 });
        }

        // 3. Return Success Response
        console.log(`[API MarkComplete POST] Profile marked complete successfully for user: ${user.id}`);
        return NextResponse.json(
            { message: 'Profile marked as complete successfully', data: updatedProfile },
            { status: 200 }
        );

    } catch (error: unknown) {
        console.error('[API MarkComplete POST] Unexpected error:', error);
        const details = error instanceof Error ? error.message : 'Unknown server error';
        return NextResponse.json(
            { error: 'An unexpected server error occurred', details },
            { status: 500 }
        );
    }
}