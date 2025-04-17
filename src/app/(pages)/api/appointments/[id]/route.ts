// Create file: src/app/(pages)/api/appointments/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // For user auth check
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // For DB operations

// --- Handler to update a specific appointment (e.g., cancel) ---
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const appointmentId = (await params).id; // Get ID from the URL path
    console.log(`[API Appointments PUT /${appointmentId}] Request received.`);

    if (!appointmentId) {
        return NextResponse.json({ error: 'Appointment ID is missing' }, { status: 400 });
    }

    try {
        // 1. Authenticate the user making the request
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) { return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 }); }
        const token = authHeader.split(' ')[1];
        const { data: { user: requestUser }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !requestUser) { return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 }); }
        console.log(`[API Appointments PUT /${appointmentId}] Authenticated user: ${requestUser.id}`);

        // 2. Parse Body (expecting status update)
        let updates;
        try {
            updates = await req.json();
            if (!updates || typeof updates !== 'object') throw new Error("Invalid JSON");
            console.log(`[API Appointments PUT /${appointmentId}] Request body:`, updates);
        } catch (e) {
            console.log('Error: ', e);
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        // Only allow setting status to 'cancelled' via this logic for now
        if (updates.status !== 'cancelled') {
            return NextResponse.json({ error: 'Only cancellation is supported via this method' }, { status: 400 });
        }

        // 3. Fetch the appointment and verify ownership/role
        console.log(`[API Appointments PUT /${appointmentId}] Fetching appointment details...`);
        const { data: appointment, error: fetchError } = await supabaseAdmin
            .from('appointments')
            .select('*, doctor_id, patient_id, doctor:doctors(id, profiles(first_name, last_name))') // Select needed fields
            .eq('id', appointmentId)
            .single();

        if (fetchError || !appointment) {
             console.error(`[API Appointments PUT /${appointmentId}] Error fetching appointment:`, fetchError);
             const status = fetchError?.message.includes('0 rows') ? 404 : 500;
             return NextResponse.json({ error: 'Appointment not found or query error' }, { status });
         }
        console.log(`[API Appointments PUT /${appointmentId}] Appointment found. Doctor ID: ${appointment.doctor_id}`);


        // 4. Authorize: Ensure the requester is the DOCTOR for this appointment
        const { data: requesterProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', requestUser.id)
            .single();

        if (profileError || !requesterProfile) { return NextResponse.json({ error: 'Could not verify user profile' }, { status: 500 }); }

        if (requesterProfile.role !== 'doctor' || appointment.doctor_id !== requestUser.id) {
            console.warn(`[API Appointments PUT /${appointmentId}] Auth failed. Requester role: ${requesterProfile.role}, Requester ID: ${requestUser.id}, Appt Doctor ID: ${appointment.doctor_id}`);
            return NextResponse.json({ error: 'Forbidden: You cannot modify this appointment' }, { status: 403 });
        }
        console.log(`[API Appointments PUT /${appointmentId}] Authorization successful.`);

        // 5. Update appointment status
        const { data: updatedAppointment, error: updateError } = await supabaseAdmin
            .from('appointments')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId)
            .select('*') // Select updated data
            .single();

        if (updateError) { console.error(`[API Appointments PUT /${appointmentId}] Error updating appointment:`, updateError); return NextResponse.json({ error: 'Failed to cancel appointment', details: updateError.message }, { status: 500 }); }
        if (!updatedAppointment) { return NextResponse.json({ error: 'Failed to confirm cancellation.' }, { status: 500 }); }

        console.log(`[API Appointments PUT /${appointmentId}] Appointment status updated to cancelled.`);

        // --- 6. Send Notification to Patient ---
        try {
            const patientId = appointment.patient_id;
            const doctorProfile = appointment.doctor?.profiles;
            const doctorName = doctorProfile ? `Dr. ${doctorProfile.first_name ?? ''} ${doctorProfile.last_name ?? ''}`.trim() : 'Your doctor';

            if (patientId) {
                 console.log(`[API Appointments PUT /${appointmentId}] Attempting to notify patient ${patientId}`);
                 const notificationPayload = {
                    user_id: patientId,
                    type: 'APPOINTMENT_CANCELLED_BY_DOCTOR',
                    message: `Your appointment with ${doctorName} on ${updatedAppointment.appointment_date} at ${updatedAppointment.appointment_time} has been cancelled.`,
                    link_url: '/appointments', // Link to patient's appointment list
                    metadata: { appointment_id: updatedAppointment.id, doctor_id: updatedAppointment.doctor_id }
                };
                // Insert using admin client
                 const { error: insertNotifyError } = await supabaseAdmin.from('notifications').insert(notificationPayload);
                 if (insertNotifyError) { console.error("[API Appointments PUT] Failed to insert patient notification:", insertNotifyError); }
                 else { console.log(`[API Appointments PUT] Successfully inserted notification for patient ${patientId}.`); }
            } else { console.warn(`[API Appointments PUT /${appointmentId}] Cannot notify patient: patient_id not found.`); }
        } catch (notifyError) { console.error("[API Appointments PUT] Error during patient notification process:", notifyError); }
        // --- End Notification Logic ---

        // 7. Return Success Response
        return NextResponse.json({ data: updatedAppointment, message: 'Appointment cancelled successfully.' }, { status: 200 });

    } catch (error) {
        console.error(`[API Appointments PUT /${appointmentId}] Unexpected error:`, error);
        return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error)}, { status: 500 });
    }
}

// Optional: Add GET handler for fetching a single appointment by ID if needed
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
     const appointmentId = (await params).id;
     // Add authentication/authorization if needed for fetching single appointments
     // ...
     try {
          const { data, error } = await supabaseAdmin // Or standard supabase depending on RLS
             .from('appointments')
             .select('*, doctor:doctors(*, profiles(*)), patient:profiles(*)')
             .eq('id', appointmentId)
             .single();

         if (error || !data) { return NextResponse.json({ error: 'Appointment not found' }, { status: 404 }); }
         return NextResponse.json({ data }, { status: 200 });
     } catch (error) { /* ... error handling ... */ } //eslint-disable-line
 }

// Optional: Add DELETE handler if you want doctors to fully delete cancelled appointments later
// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) { ... }