// src\app\(pages)\api\admin\bugs\[id]\route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Note: In Next.js App Router, params is no longer a Promise
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const bugId = (await params).id;
// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//     const bugId = params.id;

    // Log the request for debugging
    console.log(`API Request: GET api/admin/bugs/${bugId}`);

    // Authenticate admin (you might have a helper function for this)
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    const { data: user, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.user.id)
        .single();

    if (profileError || !profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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