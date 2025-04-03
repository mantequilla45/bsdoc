// src\app\(pages)\api\admin\bugs\route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { title, description, category, severity, email } = await req.json(); //eslint-disable-line

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

    const { data, error } = await supabase //eslint-disable-line
      .from('bugs')
      .insert({ title, description, category, severity, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error('Error saving bug report:', error);
      return NextResponse.json({ error: 'Failed to submit bug report' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Bug report submitted successfully' }, { status: 201 });

  } catch (error) {
    console.error('Error processing bug report submission:', error);
    return NextResponse.json({ error: 'Failed to submit bug report' }, { status: 500 });
  }
}