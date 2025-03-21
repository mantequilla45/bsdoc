// /app/api/availability/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctor_id');
    const dayOfWeek = searchParams.get('day_of_week');

    if (!doctorId || !dayOfWeek) {
      return NextResponse.json({
        error: 'doctor_id and day_of_week are required',
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('day_of_week', dayOfWeek);

    if (error) {
      console.error('Error fetching availability:', error);
      return NextResponse.json({ error: 'Error fetching availability' }, {
        status: 500,
      });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in availability GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authentication and authorization logic here (check if user is a doctor)

    const { doctor_id, day_of_week, start_time, end_time } = await req.json();

    if (!doctor_id || !day_of_week || !start_time || !end_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('availability')
      .insert({
        doctor_id,
        day_of_week,
        start_time,
        end_time,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating availability:', error);
      return NextResponse.json({ error: 'Error creating availability' }, {
        status: 500,
      });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in availability POST route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}