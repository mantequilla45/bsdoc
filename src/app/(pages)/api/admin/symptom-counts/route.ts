import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // Use supabaseAdmin to bypass RLS

async function validateAdminAccess(req: NextRequest) {
    // (Your existing validateAdminAccess function here - VERY IMPORTANT)
    // Or reuse the one from another api route if you have it
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { error: 'Unauthorized: Missing token', status: 401 };
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) { return { error: 'Unauthorized: Invalid token', status: 401 }; }
    const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (profileError || !profile || profile.role !== 'admin') { return { error: 'Forbidden: User is not an admin', status: 403 }; }
    return { user };
}

export async function GET(req: NextRequest) {
    // 1. Validate Admin Access
    const validation = await validateAdminAccess(req);
    if ('error' in validation) {
        return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    try {
        const { data, error } = await supabaseAdmin.rpc('get_symptom_counts'); // Call the function

        if (error) {
            console.error('Error fetching symptom counts:', error);
            return NextResponse.json({ error: 'Failed to fetch symptom counts' }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error in GET handler:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
    }
}