// /app/api/doctors/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*, profiles(*) ') // Join with profiles
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching doctor:', error);
      return NextResponse.json({ error: 'Error fetching doctor' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in doctor GET by ID route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}