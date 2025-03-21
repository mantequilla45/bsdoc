// /app/api/doctors/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get('specialization'); // Example filter

    let query = supabase
        .from('doctors')
        .select('*, profiles(*)') // Join with profiles
        .in('profiles.role', ['doctor']);

    if (specialization) {
      query = query.eq('specialization', specialization);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching doctors:', error);
      return NextResponse.json({ error: 'Error fetching doctors' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in doctors GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}