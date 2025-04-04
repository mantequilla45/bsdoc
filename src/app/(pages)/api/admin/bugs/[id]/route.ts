// src\app\(pages)\api\admin\bugs\[id]\route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

async function validateAdminAccess(req: NextRequest) {
    // Check for authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Missing or invalid Authorization header', status: 401 };
    }

    const token = authHeader.split(' ')[1];

    // Verify token - fixed parameter type
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
        console.error('Token verification failed:', error);
        return { error: 'Invalid token', status: 401 };
    }

    const user = data.user;

    // Check admin role
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile || profile.role !== 'admin') {
        console.error('Unauthorized: User is not an admin');
        return { error: 'Unauthorized', status: 403 };
    }

    return { user, profile };
}


// Note: In Next.js App Router, params is no longer a Promise
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const bugId = (await params).id;

    // Log the request for debugging
    console.log(`API Request: GET api/admin/bugs/${bugId}`);

    const validation = await validateAdminAccess(req);
    if ('error' in validation) {
        return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    // Fetch the specific bug report
    const { data, error } = await supabaseAdmin
        .from('bugs')
        .select('*, profiles(email)')
        .eq('id', bugId)
        .single();

    if (error) {
        console.error('Error fetching bug report:', error);
        return NextResponse.json({ error: 'Error fetching bug report' }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: 'Bug report not found' }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const bugId = (await params).id;

    // Log the request for debugging
    console.log(`API Request: PUT api/admin/bugs/${bugId}`);

    // Authenticate admin (you might have a helper function for this)
    const validation = await validateAdminAccess(req);
    if ('error' in validation) {
        return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    let reqBody;
    try {
        reqBody = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body'}, { status: 400 });
    }

    const { status } = reqBody;

    const { data: updatedStatus, error: updateError } = await supabaseAdmin
        .from('bugs')
        .update({ status })
        .eq('id', bugId)
        .select()
        .single();

    if (updateError) {
        console.error('Error updating bug status: ', updateError);
        return NextResponse.json({ error: 'Error updating status'}, { status: 500 });
    }

    return NextResponse.json({ data: updatedStatus }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const bugId = (await params).id;
    
    console.log(`API Request: DELETE api/admin/bugs/${bugId}`);

    const validation = await validateAdminAccess(req);
    if ('error' in validation) {
        return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    const { error: deleteError } = await supabaseAdmin
        .from('bugs')
        .delete()
        .eq('id', bugId);

    if (deleteError) {
        console.error('Error deleting bug report: ', deleteError);
        console.log('Error deleting bug report: ', deleteError);
        return NextResponse.json({ error: 'Error deleting bug report' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Bug report deleted successfully' }, { status: 200 });
}