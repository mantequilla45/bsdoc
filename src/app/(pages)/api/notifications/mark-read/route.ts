// src/app/(pages)/api/notifications/mark-read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
    const supabaseServer = await createClient();

    try {
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { notification_ids } = await req.json(); // Expect an array of IDs to mark as read

        if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
             return NextResponse.json({ error: 'Invalid input: notification_ids must be a non-empty array.' }, { status: 400 });
        }

        // Note: The RLS policy ensures users can only update their own notifications.
        const { data, error: updateError } = await supabaseServer //eslint-disable-line
            .from('notifications')
            .update({ is_read: true })
            .in('id', notification_ids)
            .eq('user_id', user.id); // Double check user_id just in case

        if (updateError) {
             console.error("API POST /notifications/mark-read: Error updating notifications:", updateError);
            return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
        }

        // Return the number of notifications updated (optional)
        // Supabase update doesn't directly return count in JS v2, check documentation if needed

        return NextResponse.json({ message: 'Notifications marked as read successfully.' }, { status: 200 });

    } catch (error: unknown) {
         console.error("API POST /notifications/mark-read: Unexpected error:", error);
         const details = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'An unexpected server error occurred', details }, { status: 500 });
    }
}