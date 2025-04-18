// /app/api/doctors/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get('specialization'); // Example filter
    const excludeDoctorId = searchParams.get('exclude_doctor_id');

    // Start query - select doctors joined with their profiles
    // Ensure 'profiles.role' is correct based on your schema
    let query = supabase
      .from('doctors')
      // Ensure you select necessary fields from both doctors and profiles
      .select(`
            id,
            specialization,
            bio,
            clinic_name,
            clinic_address,
            license_number,
            years_of_experience,
            is_profile_complete,
            profiles (
              id,
              first_name,
              last_name,
              email,
              phone_number,
              role,
              profile_image_url
            )
        `)
      // Ensure the join condition correctly targets profiles with role 'doctor'
      // This might require ensuring the 'doctors' table links correctly or filtering profiles directly
      // A common pattern is joining 'doctors' with 'profiles' on doctors.id = profiles.id
      // and then ensuring profiles.role = 'doctor'. Let's assume the join works or use a filter:
      .eq('profiles.role', 'doctor'); // Filter based on role in the joined profiles table

    // Apply optional specialization filter
    if (specialization) {
      console.log(`Filtering doctors by specialization: ${specialization}`);
      query = query.eq('specialization', specialization);
    }

    // --- Apply optional exclusion filter ---
    if (excludeDoctorId) {
      console.log(`Excluding doctor ID: ${excludeDoctorId}`);
      // Use .neq() to exclude the specified doctor ID
      query = query.neq('id', excludeDoctorId); // Filter on the 'doctors' table ID
    }
    // --- End exclusion filter ---

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching doctors:', error);
      return NextResponse.json({ error: 'Error fetching doctors' }, { status: 500 });
    }

    // Return only doctors whose profile join was successful and are complete (optional)
    const completeDoctors = data?.filter(d => d.profiles && d.is_profile_complete) || [];

    console.log(`Returning ${completeDoctors.length} doctors.`);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in doctors GET route:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}