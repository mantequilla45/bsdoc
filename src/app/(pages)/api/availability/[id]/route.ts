// /app/api/appointments/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUser } from '@/services/Auth/auth'; // Assuming you have this

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patient_id');
    const doctorId = searchParams.get('doctor_id');

    let query = supabase.from('appointments').select('*, doctor:doctors(*, profiles(*)), patient:profiles(*)'); // Eager load related data

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json({ error: 'Error fetching appointments' }, {
        status: 500,
      });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in appointments GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(); // Get the currently logged-in user
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { doctor_id, appointment_date, appointment_time } = await req.json();

    if (!doctor_id || !appointment_date || !appointment_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        doctor_id,
        patient_id: user.id, // Use the user's ID as the patient_id
        appointment_date,
        appointment_time,
        status: 'booked',
      })
      .select('*, doctor:doctors(*, profiles(*)), patient:profiles(*)') // Eager load related data
      .single();

    if (error) {
      console.error('Error booking appointment:', error);
      return NextResponse.json({ error: 'Error booking appointment' }, {
        status: 500,
      });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in appointments POST route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  
    try {
      const user = await getUser(); // Get the currently logged-in user
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const {
        doctor_id,
        appointment_date,
        appointment_time,
        status,
      } = await req.json();
  
      const updates: {
        doctor_id?: string;
        appointment_date?: string;
        appointment_time?: string;
        status?: string;
      } = {};
  
      if (doctor_id) updates.doctor_id = doctor_id;
      if (appointment_date) updates.appointment_date = appointment_date;
      if (appointment_time) updates.appointment_time = appointment_time;
      if (status) updates.status = status;
  
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select('*, doctor:doctors(*, profiles(*)), patient:profiles(*)') // Eager load related data
        .single();
  
      if (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json({ error: 'Error updating appointment' }, {
          status: 500,
        });
      }
  
      if (!data) {
        return NextResponse.json({ error: 'Appointment not found' }, {
          status: 404,
        });
      }
  
      return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
      console.error('Error in appointments PUT route:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
  
  export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
  
    try {
      const user = await getUser(); // Get the currently logged-in user
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { data, error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .select('*, doctor:doctors(*, profiles(*)), patient:profiles(*)') // Eager load related data
        .single();
  
      if (error) {
        console.error('Error deleting appointment:', error);
        return NextResponse.json({ error: 'Error deleting appointment' }, {
          status: 500,
        });
      }
  
      if (!data) {
        return NextResponse.json({ error: 'Appointment not found' }, {
          status: 404,
        });
      }
  
      return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
      console.error('Error in appointments DELETE route:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }