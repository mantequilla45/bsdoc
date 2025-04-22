import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

async function validateAdminAccess(req: NextRequest) {
    // (Your existing validateAdminAccess function here)
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
    const validation = await validateAdminAccess(req);
    if ('error' in validation) {
        return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    try {
        const { data, error } = await supabaseAdmin.rpc('get_health_condition_counts');

        if (error) {
            console.error('Error fetching health condition counts:', error);
            return NextResponse.json({ error: 'Failed to fetch health condition counts' }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error: unknown) { // Changed from 'any' to 'unknown'
        if (error instanceof Error) {
            console.error('Error in GET handler:', error);
            return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
        } else {
            console.error('Error in GET handler:', error);
            return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
        }
    }
}