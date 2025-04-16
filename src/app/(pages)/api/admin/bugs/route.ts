// src\app\(pages)\api\admin\bugs\route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { title, description, category, severity, email } = await req.json();

    // Get user ID if available (user might not be logged in when submitting feedback)
    const authHeader = req.headers.get('authorization');
    let userId = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      } else {
        console.error('Error getting user ID from token:', authError);
        console.log('Error getting user ID from token:', authError);
        // If there's an error, we'll proceed without the user ID
      }
    }

    const { error } = await supabase
      .from('bugs')
      .insert({ title, description, category, severity, user_id: userId, email: email })
      .select()
      .single();

    if (error) {
      console.error('Error saving bug report:', error);
      return NextResponse.json({ error: 'Failed to submit bug report' }, { status: 500 });
    }

    // --- Send Notification to Admins (using supabaseAdmin) ---
    console.log(`[Report Route] Attempting to send notification to admins for user ID: ${userId}`);
    try {
      // Fetch all admin user IDs --> Use Admin Client to ensure RLS bypass if needed <--
      const { data: admins, error: adminFetchError } = await supabaseAdmin // Use admin client
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (adminFetchError) {
        console.error("[Report Route] Failed to fetch admins for notification:", adminFetchError);
      } else if (admins && admins.length > 0) {
        console.log(`[Report Route] Found ${admins.length} admin(s) to notify.`);
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          type: 'REPORT_SUBMITTED',
          message: `New Bug Report submitted by (${email}) needs review.`,
          link_url: 'admin:bug-reports',
          metadata: { applicant_user_id: userId }
        }));

        console.log(`[Report Route] Inserting ${notifications.length} notification(s).`);
        // --> Insert notifications using the Admin Client (bypasses RLS) <--
        const { error: insertNotifyError } = await supabaseAdmin
          .from('notifications')
          .insert(notifications);

        if (insertNotifyError) {
          // This error should NOT be the RLS violation anymore
          console.error("[Report Route] Failed to insert admin notifications:", insertNotifyError);
        } else {
          console.log(`[Report Route] Successfully inserted notifications for admins.`);
        }
      } else {
        console.warn("[Report Route] No admin users found to notify.");
      }
    } catch (notifyError) {
      console.error("[Report Route] Error during admin notification process:", notifyError);
    }
    // --- End Notification Logic ---

    return NextResponse.json({ message: 'Bug report submitted successfully' }, { status: 201 });

  } catch (error) {
    console.error('Error processing bug report submission:', error);
    return NextResponse.json({ error: 'Failed to submit bug report' }, { status: 500 });
  }
}
