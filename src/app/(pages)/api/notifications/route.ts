// src/app/(pages)/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
    const supabaseServer = await createClient();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') ?? '9+', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);
    const filter = searchParams.get('filter') ?? 'all'; // 'all', 'unread'

    try {
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let query = supabaseServer
            .from('notifications')
            .select('*', { count: 'exact' }) // Get total count for pagination
            .eq('user_id', user.id);

        if (filter === 'unread') {
            query = query.eq('is_read', false);
        }

        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error("API GET /notifications: Error fetching notifications:", error);
            return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
        }

        return NextResponse.json({
            data: data || [],
            count: count ?? 0, // Total count matching the query (before range)
            limit,
            offset
        }, { status: 200 });

    } catch (error: unknown) {
        console.error("API GET /notifications: Unexpected error:", error);
        return NextResponse.json({ error: 'An unexpected server error occurred' }, { status: 500 });
    }
}