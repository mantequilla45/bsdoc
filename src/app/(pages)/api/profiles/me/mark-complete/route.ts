// Create file: src/app/(pages)/api/profiles/me/mark-complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) { //eslint-disable-line
    const supabaseServer = await createClient();
    try {
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
        if (authError || !user) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

        const { data: updatedProfile, error: updateError } = await supabaseServer
            .from('profiles')
            .update({ is_profile_complete: true })
            .eq('id', user.id)
            .select('id, is_profile_complete')
            .single();

        if (updateError) { return NextResponse.json({ error: 'Failed to mark profile as complete', details: updateError.message }, { status: 500 }); }
        if (!updatedProfile?.is_profile_complete) { return NextResponse.json({ error: 'Failed to confirm profile completion status.' }, { status: 500 }); }

        return NextResponse.json({ message: 'Profile marked as complete successfully', data: updatedProfile }, { status: 200 });
    } catch (error: unknown) { /* ... basic error handling ... */ } //eslint-disable-line
}