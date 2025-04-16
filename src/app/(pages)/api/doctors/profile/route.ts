// Create file: src/app/(pages)/api/doctors/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer'; // Use server client for auth context

export async function PUT(req: NextRequest) {
    const supabaseServer = await createClient();

    try {
        // 1. Get Authenticated User & Verify Role
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
        if (authError || !user) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

        const { data: profile, error: profileError } = await supabaseServer
            .from('profiles').select('role').eq('id', user.id).single();
        if (profileError || !profile) { return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 }); }
        if (profile.role !== 'doctor') { return NextResponse.json({ error: 'Forbidden: Only doctors can update doctor profiles' }, { status: 403 }); }

        // 2. Parse Request Body
        let reqBody;
        try { reqBody = await req.json(); }
        catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

        // 3. Extract and Validate Profile Data
        const { specialization, bio, clinic_name, clinic_address, license_number, years_of_experience } = reqBody;
        if (!specialization || !bio || !clinic_name || !clinic_address || !license_number || years_of_experience === undefined || years_of_experience < 0) {
            return NextResponse.json({ error: 'Missing required profile fields or invalid data' }, { status: 400 });
        }

        // 4. Update Doctor's Profile
        const { data: updatedDoctor, error: updateError } = await supabaseServer
            .from('doctors')
            .update({
                specialization, bio, clinic_name, clinic_address, license_number, years_of_experience,
                is_profile_complete: true // Mark profile as complete
            })
            .eq('id', user.id) // Update the row matching the authenticated doctor's ID
            .select('*').single();

        if (updateError) {
            console.error('API /doctors/profile PUT: Error updating doctor profile:', updateError);
            if (updateError.code === 'PGRST116') { return NextResponse.json({ error: 'Doctor profile entry not found.' }, { status: 404 }); }
            return NextResponse.json({ error: 'Failed to update doctor profile' }, { status: 500 });
        }
        if (!updatedDoctor) { return NextResponse.json({ error: 'Failed to confirm profile update.' }, { status: 500 }); }

        // 5. Return Success Response
        return NextResponse.json({ message: 'Doctor profile updated successfully', data: updatedDoctor }, { status: 200 });

    } catch (error: unknown) {
        console.error('API /doctors/profile PUT: Unexpected error:', error);
        const details = error instanceof Error ? error.message : 'Unknown server error';
        return NextResponse.json({ error: 'An unexpected server error occurred', details }, { status: 500 });
    }
}

export async function GET(req: NextRequest) { //eslint-disable-line
    const supabaseServer = await createClient();
     try {
        // 1. Get Authenticated User
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
        if (authError || !user) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

        // 2. Fetch Doctor Profile (check role via join)
        const { data: doctorProfile, error: fetchError } = await supabaseServer
            .from('doctors')
            .select(`*, profile:profiles!inner(role)`) // Ensure join checks profile exists
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle as profile might be incomplete initially

        if (fetchError) {
             console.error('API /doctors/profile GET: Error fetching doctor profile:', fetchError);
            return NextResponse.json({ error: 'Failed to fetch doctor profile' }, { status: 500 });
        }

        if (!doctorProfile) {
             // Check if the user is actually a doctor in profiles table
             const { data: profileRole } = await supabaseServer.from('profiles').select('role').eq('id', user.id).single();
             if(profileRole?.role === 'doctor') {
                return NextResponse.json({ data: null, message: 'Doctor profile not yet completed.' }, { status: 200 }); // OK, profile data is just null
             } else {
                return NextResponse.json({ error: 'User is not a doctor' }, { status: 403 }); // Forbidden
             }
        }
         // Double check role from join
         if (doctorProfile.profile?.role !== 'doctor') {
            return NextResponse.json({ error: 'Forbidden: Associated profile is not a doctor' }, { status: 403 });
        }

        // 3. Return Profile Data
        return NextResponse.json({ data: doctorProfile }, { status: 200 });

    } catch (error: unknown) {
        console.error('API /doctors/profile GET: Unexpected error:', error);
        const details = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'An unexpected server error occurred', details }, { status: 500 });
    }
}