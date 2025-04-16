// src/app/(pages)/api/appointments/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Keep for auth check based on user token
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // Use Admin client for backend DB operations

// GET Handler (Consider using supabaseAdmin here too for consistency)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const patientId = searchParams.get('patient_id');
        const doctorId = searchParams.get('doctor_id');

        // Using supabaseAdmin is generally preferred for backend data fetching
        let query = supabaseAdmin // Changed to supabaseAdmin
            .from('appointments')
            .select('*, doctor:doctors(*, profiles(*)), patient:profiles(*)');

        if (patientId) {
            query = query.eq('patient_id', patientId);
        }
        if (doctorId) {
            query = query.eq('doctor_id', doctorId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[API Appointments GET] Error fetching appointments:', error);
            return NextResponse.json({ error: 'Error fetching appointments' }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error('[API Appointments GET] Error in route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// POST Handler with notification logic and supabaseAdmin
export async function POST(req: NextRequest) {
    try {
        console.log('[API Appointments POST] Request received.');
        const { doctor_id, appointment_date, appointment_time } = await req.json();
        console.log('[API Appointments POST] Request body:', { doctor_id, appointment_date, appointment_time });

        // 1. Authenticate Patient (using standard client and token)
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[API Appointments POST] No authorization header.');
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        // Verify token using the standard client (acts as the user)
        const { data: { user: patientUser }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !patientUser) {
            console.log('[API Appointments POST] Invalid token or user not found', authError);
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }
        const patientId = patientUser.id;
        console.log(`[API Appointments POST] Authenticated Patient ID: ${patientId}`);

        // 2. Validate Input
        if (!doctor_id || !appointment_date || !appointment_time) {
            console.log('[API Appointments POST] Missing required fields.');
            return NextResponse.json({ error: 'Missing required fields: doctor_id, appointment_date, appointment_time' }, { status: 400 });
        }

        // 3. Check if time slot is already booked (use supabaseAdmin)
        const { data: existingAppointment, error: checkError } = await supabaseAdmin // Changed to supabaseAdmin
            .from('appointments')
            .select('id') // Only need to check existence
            .eq('doctor_id', doctor_id)
            .eq('appointment_date', appointment_date)
            .eq('appointment_time', appointment_time)
            .in('status', ['booked', 'confirmed']) // Check relevant statuses
            .limit(1) // Optimization: only need one row to confirm conflict
            .maybeSingle();

        if (checkError) {
            console.error('[API Appointments POST] Error checking existing appointments:', checkError);
            return NextResponse.json({ error: 'Error checking availability' }, { status: 500 });
        }

        if (existingAppointment) {
            console.log('[API Appointments POST] Conflict: Time slot already booked.');
            return NextResponse.json({ error: 'This time slot is already booked' }, { status: 409 });
        }

        // 4. Create the appointment (use supabaseAdmin)
        const { data: insertedAppointment, error: insertError } = await supabaseAdmin // Changed to supabaseAdmin
            .from('appointments')
            .insert({
                doctor_id,
                patient_id: patientId,
                appointment_date,
                appointment_time,
                status: 'booked',
            })
            .select('*') // Select the data needed for notification and response
            .single();

        if (insertError) {
            console.error('[API Appointments POST] Error booking appointment:', insertError);
            return NextResponse.json({ error: 'Error booking appointment', details: insertError.message }, { status: 500 });
        }

         if (!insertedAppointment) {
             console.error('[API Appointments POST] Appointment insert seemed successful but no data returned.');
             return NextResponse.json({ error: 'Failed to confirm appointment booking.' }, { status: 500 });
         }

        console.log(`[API Appointments POST] Appointment booked successfully. ID: ${insertedAppointment.id}`);

        // --- 5. Send Notification to Doctor ---
        try {
            console.log(`[API Appointments POST] Attempting to notify doctor ${insertedAppointment.doctor_id}`);
            // Fetch patient name (use supabaseAdmin)
            const { data: patientProfile, error: patientFetchError } = await supabaseAdmin // Changed to supabaseAdmin
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', insertedAppointment.patient_id) // Use patient_id from inserted data
                .single();

            // Handle potential errors fetching patient name but proceed
            if (patientFetchError) { console.error('[API Appointments POST] Error fetching patient name for notification:', patientFetchError); }
            const patientName = patientProfile ? `${patientProfile.first_name || ''} ${patientProfile.last_name || ''}`.trim() : 'A patient';

            // Construct notification payload
            const notificationPayload = {
                user_id: insertedAppointment.doctor_id, // Target doctor
                type: 'APPOINTMENT_BOOKED',
                message: `${patientName} booked an appointment with you on ${insertedAppointment.appointment_date} at ${insertedAppointment.appointment_time}.`,
                link_url: '/doctors/doctor-schedule',
                metadata: {
                    appointment_id: insertedAppointment.id,
                    patient_id: insertedAppointment.patient_id
                }
            };

            console.log('[API Appointments POST] Inserting notification:', notificationPayload);
            // Insert notification (use supabaseAdmin)
            const { error: insertNotifyError } = await supabaseAdmin // Changed to supabaseAdmin
                .from('notifications')
                .insert(notificationPayload);

            if (insertNotifyError) {
                console.error("[API Appointments POST] Failed to insert doctor notification:", insertNotifyError);
                // Log but don't fail the overall request
            } else {
                console.log(`[API Appointments POST] Successfully inserted notification for doctor ${insertedAppointment.doctor_id}.`);
            }
        } catch (notifyError) {
            console.error("[API Appointments POST] Error during doctor notification process:", notifyError);
             // Log but don't fail the overall request
        }
        // --- End Notification Logic ---

        // 6. Return Success Response (Return the created appointment data)
        // We already have insertedAppointment, no need to re-fetch unless you want joined data immediately
        // If you need joined data like in your original code, fetch it here using supabaseAdmin
        const { data: finalAppointmentData, error: finalFetchError } = await supabaseAdmin
             .from('appointments')
             .select('*, doctor:doctors(*, profiles(*)), patient:profiles(*)') // Your original select
             .eq('id', insertedAppointment.id)
             .single();

        if(finalFetchError){
            console.warn("[API Appointments POST] Failed to fetch full appointment data for response, returning basic data.", finalFetchError);
            // Fallback to returning the basic data if the detailed fetch fails
            return NextResponse.json({ data: insertedAppointment, message: "Appointment booked, notification sent (maybe)." }, { status: 201 });
        }

        return NextResponse.json({ data: finalAppointmentData, message: "Appointment booked successfully." }, { status: 201 });


    } catch (error) {
        console.error('[API Appointments POST] Unexpected error in POST handler:', error);
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
             return NextResponse.json({ error: 'Invalid JSON format in request body' }, { status: 400 });
         }
        return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error)}, { status: 500 });
    }
}