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
            profiles!inner (
              id,
              first_name,
              last_name,
              email,
              phone_number,
              role,
              profile_image_url
            ),
            availability (
              day_of_week
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

    // Process data to get unique days per doctor
    const processedData = data?.map(doctor => {
      // Ensure availability is an array and handle potential null/undefined
      const availabilityArray = Array.isArray(doctor.availability) ? doctor.availability : [];
      // Get unique days
      const availableDays = [...new Set(availabilityArray.map((a) => a.day_of_week))];
      return {
        ...doctor,
        availability: undefined, // Remove original availability array if desired
        availableDays: availableDays, // Add the processed list of days
      };
    }) || [];

    // Return only doctors whose profile join was successful and are complete (optional)
    const completeDoctors = processedData?.filter(d => d.profiles && d.is_profile_complete) || [];

    console.log(`[API Doctors GET] Processed data being sent (first item):`, JSON.stringify(completeDoctors[0], null, 2));

    console.log(`[API Doctors GET] Final structure being sent:`, { data: completeDoctors }); 
    return NextResponse.json({ data: completeDoctors }, { status: 200 });
  } catch (error) {
    console.error('Error in doctors GET route:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 });
  }
}