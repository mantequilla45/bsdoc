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

    const adminUserId = validation.user.id;

    // try {
    //     const { notification_ids } = await req.json(); // Expect an array of IDs

    //     if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
    //         return NextResponse.json({ error: 'Invalid input: notification_ids must be a non-empty array.' }, { status: 400 });
    //     }

    //     // 2. Update using supabaseAdmin (bypasses RLS, doesn't need user_id check)
    //     const { error: updateError, count } = await supabaseAdmin
    //         .from('notifications')
    //         .update({ is_read: true }) // Also update updated_at
    //         .in('id', notification_ids);
    //         // No .eq('user_id', user.id) needed here for admins

    //     if (updateError) {
    //         console.error("API POST /admin/notifications/mark-read: Error updating notifications:", updateError);
    //         return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
    //     }

    //     console.log(`Admin marked <span class="math-inline">{count ?? '?'} notifications as read: IDs [</span>{notification_ids.join(', ')}]`);
    try {
        const { notification_ids } = await req.json();

        if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
            return NextResponse.json({ error: 'Invalid input: notification_ids must be a non-empty array.' }, { status: 400 });
        }

        // Prepare data for insertion into the junction table
        const readStatusData = notification_ids.map(id => ({
            notification_id: id,
            user_id: adminUserId,
            read_at: new Date().toISOString() // Set current time as read time
        }));

        // Insert into the junction table, ignoring duplicates (ON CONFLICT DO NOTHING)
        // This ensures that if the admin already read it, we don't get an error.
        const { error: upsertError, count } = await supabaseAdmin
            .from('notification_read_statuses')
            .upsert(
                readStatusData,
                {
                    onConflict: 'notification_id, user_id', // Specify columns causing conflict
                    ignoreDuplicates: true // Equivalent to ON CONFLICT DO NOTHING
                    // If you wanted to update 'read_at' instead, remove ignoreDuplicates
                    // and potentially use { onConflict: 'notification_id, user_id' }
                    // By default, upsert updates conflicting rows with the new data.
                }
            )
            .select(); // Still need .select() for count in V2

        if (upsertError) {
             console.error("API POST /admin/notifications/mark-read: Error upserting read statuses:", upsertError);
             // Provide more specific error detail if available
             return NextResponse.json({ error: `Failed to mark notifications as read: ${upsertError.message}` }, { status: 500 });
        }

        console.log(`Admin ${adminUserId} marked ${count ?? notification_ids.length} notifications as read: IDs [${notification_ids.join(', ')}]`);
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