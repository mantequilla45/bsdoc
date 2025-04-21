// src/app/(pages)/api/admin/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // Use admin client
// You might need createClient from supabaseServer for user context if needed,
// but admin validation likely uses supabaseAdmin like in other admin routes.

// Reuse or adapt the admin validation function from other admin routes
// like src/app/(pages)/api/admin/doctor-verifications/route.ts
async function validateAdminAccess(req: NextRequest): Promise<{ user?: any; error?: string; status?: number }> { //eslint-disable-line
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { error: 'Unauthorized: Missing token', status: 401 };
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
        return { error: 'Unauthorized: Invalid token', status: 401 };
    }
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    if (profileError || !profile || profile.role !== 'admin') {
        return { error: 'Forbidden: User is not an admin', status: 403 };
    }
    return { user };
}

export async function GET(req: NextRequest) {
    // Validate Admin Access
    const validation = await validateAdminAccess(req);
    if (validation.error) {
        return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') ?? 'all'; // 'all', 'unread'
    const countOnly = searchParams.get('countOnly') === 'true'; // To get only the count

    const notificationTypeFilter = searchParams.get('notificationType') ?? 'all'; // e.g., 'all', 'VERIFICATION_SUBMITTED', 'REPORT_SUBMITTED'

    try {
        // Base query using admin client
        let query = supabaseAdmin
            .from('notifications')
            // Select necessary fields, potentially join with profiles if sender info needed
            .select('*', { count: 'exact', head: countOnly }); // Use head:true for countOnly

        // Filter for admin-relevant notifications
        // Option 1: Filter by specific types admins care about
        const adminNotificationTypes = ['VERIFICATION_SUBMITTED', 'REPORT_SUBMITTED']; // Add other types as needed
        if (notificationTypeFilter === 'all') {
            // If 'all', filter by the list of relevant admin types
            query = query.in('type', adminNotificationTypes);
       } else if (adminNotificationTypes.includes(notificationTypeFilter)) {
            // If a specific valid type is provided, filter by that type
           query = query.eq('type', notificationTypeFilter);
       } else {
            // Optional: Handle invalid type filter - maybe return empty or error?
            // For now, let's assume it falls back to fetching none if type is invalid
            console.warn(`Invalid notificationType filter received: ${notificationTypeFilter}`);
             query = query.in('type', []); // Return nothing for invalid types
       }

        // Option 2: Filter by notifications sent TO any admin user_id (if you have admin IDs)
        // const { data: admins } = await supabaseAdmin.from('profiles').select('id').eq('role', 'admin');
        // const adminIds = admins?.map(a => a.id) || [];
        // query = query.in('user_id', adminIds); // *Choose Option 1 OR Option 2 based on your notification design*

        // Apply 'unread' filter if requested
        if (filter === 'unread') {
            query = query.eq('is_read', false);
        }

        query = query.order('created_at', { ascending: false });

        // Execute query
        const { data, error, count } = await query;

        if (error) {
            console.error("API GET /admin/notifications: Error:", error);
            return NextResponse.json({ error: 'Failed to fetch admin notifications' }, { status: 500 });
        }

        if (countOnly) {
            return NextResponse.json({ count: count ?? 0 }, { status: 200 });
        }

        return NextResponse.json({ data: data || [], count: count ?? 0 }, { status: 200 });

    } catch (error: unknown) {
        console.error("API GET /admin/notifications: Unexpected error:", error);
        return NextResponse.json({ error: 'An unexpected server error occurred' }, { status: 500 });
    }
}