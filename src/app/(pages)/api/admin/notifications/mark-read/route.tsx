// src/app/(pages)/api/admin/notifications/mark-read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Reuse or adapt the admin validation function used in other admin routes
async function validateAdminAccess(req: NextRequest): Promise<{ user?: any; error?: string; status?: number }> { //eslint-disable-line
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) { return { error: 'Unauthorized: Missing token', status: 401 }; }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) { return { error: 'Unauthorized: Invalid token', status: 401 }; }
    const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (profileError || !profile || profile.role !== 'admin') { return { error: 'Forbidden: User is not an admin', status: 403 }; }
    return { user };
}

export async function POST(req: NextRequest) {
    // 1. Validate Admin Access
    const validation = await validateAdminAccess(req);
    if (validation.error) {
        return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    try {
        const { notification_ids } = await req.json(); // Expect an array of IDs

        if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
            return NextResponse.json({ error: 'Invalid input: notification_ids must be a non-empty array.' }, { status: 400 });
        }

        // 2. Update using supabaseAdmin (bypasses RLS, doesn't need user_id check)
        const { error: updateError, count } = await supabaseAdmin
            .from('notifications')
            .update({ is_read: true }) // Also update updated_at
            .in('id', notification_ids);
            // No .eq('user_id', user.id) needed here for admins

        if (updateError) {
            console.error("API POST /admin/notifications/mark-read: Error updating notifications:", updateError);
            return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
        }

        console.log(`Admin marked <span class="math-inline">{count ?? '?'} notifications as read: IDs [</span>{notification_ids.join(', ')}]`);
        return NextResponse.json({ message: 'Notifications marked as read successfully.', count: count }, { status: 200 });

    } catch (error: unknown) {
        console.error("API POST /admin/notifications/mark-read: Unexpected error:", error);
        const details = error instanceof Error ? error.message : 'Unknown error';
        // Check if JSON parsing error
         if (error instanceof SyntaxError && req.body) {
            return NextResponse.json({ error: 'Invalid JSON format in request body' }, { status: 400 });
        }
        return NextResponse.json({ error: 'An unexpected server error occurred', details }, { status: 500 });
    }
}