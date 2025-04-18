// src/app/(pages)/api/appointments/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // For user auth check
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // For DB operations and notifications

// --- Handler to update a specific appointment (e.g., cancel by doctor OR patient) ---
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const appointmentId = (await params).id;
    console.log(`[API Appointments PUT /${appointmentId}] Request received.`);

    if (!appointmentId) {
        return NextResponse.json({ error: 'Appointment ID is missing' }, { status: 400 });
    }

    try {
        // 1. Authenticate the user making the request
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) { return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 }); }
        const token = authHeader.split(' ')[1];
        const { data: { user: requestUser }, error: authError } = await supabase.auth.getUser(token); // Use standard client for user context
        if (authError || !requestUser) { return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 }); }
        const requesterId = requestUser.id;
        console.log(`[API Appointments PUT /${appointmentId}] Authenticated user: ${requesterId}`);

        // 2. Parse Body (expecting status update)
        let updates;
        try {
            updates = await req.json();
            if (!updates || typeof updates !== 'object' || !updates.status) throw new Error("Invalid JSON or missing status");
            console.log(`[API Appointments PUT /${appointmentId}] Request body:`, updates);
        } catch (e) {
            const error = e as Error;
            console.log('Error parsing body: ', error.message);
            return NextResponse.json({ error: `Invalid request body: ${error.message}` }, { status: 400 });
        }

        // For now, only allow 'cancelled' status updates via this PUT method by non-admins
        // You could expand this later if needed
        if (updates.status !== 'cancelled') {
            // You might want to fetch the user's role here if admins should be allowed to make other updates
            return NextResponse.json({ error: 'Only cancellation is supported via this method for non-admins' }, { status: 400 });
        }

        // 3. Fetch the appointment using Admin client to bypass RLS for reading
        console.log(`[API Appointments PUT /${appointmentId}] Fetching appointment details...`);
        const { data: appointment, error: fetchError } = await supabaseAdmin
            .from('appointments')
             // Select fields needed for authorization and notifications
            .select('*, doctor_id, patient_id, doctor:doctors(id, profiles(first_name, last_name)), patient:profiles(id, first_name, last_name)')
            .eq('id', appointmentId)
            .single();

        if (fetchError || !appointment) {
             console.error(`[API Appointments PUT /${appointmentId}] Error fetching appointment:`, fetchError);
             const status = fetchError?.message.includes('0 rows') ? 404 : 500;
             return NextResponse.json({ error: 'Appointment not found or query error' }, { status });
         }
        console.log(`[API Appointments PUT /${appointmentId}] Appointment found. Doctor ID: ${appointment.doctor_id}, Patient ID: ${appointment.patient_id}`);

        // 4. Authorization: Check if the requester is EITHER the patient OR the doctor for this appointment
        const isPatient = appointment.patient_id === requesterId;
        const isDoctor = appointment.doctor_id === requesterId;

        if (!isPatient && !isDoctor) {
            // Maybe add admin check here later if needed
            console.warn(`[API Appointments PUT /${appointmentId}] Auth failed. Requester ID: ${requesterId} is neither Patient (${appointment.patient_id}) nor Doctor (${appointment.doctor_id}).`);
            return NextResponse.json({ error: 'Forbidden: You cannot modify this appointment' }, { status: 403 });
        }
        console.log(`[API Appointments PUT /${appointmentId}] Authorization successful. Requester is ${isPatient ? 'Patient' : 'Doctor'}.`);

        // Optional: Prevent cancelling appointments that are already cancelled or completed
        if (appointment.status === 'cancelled' || appointment.status === 'completed') {
             return NextResponse.json({ error: `Appointment is already ${appointment.status}.` }, { status: 409 }); // 409 Conflict
        }
         // Optional: Prevent cancelling past appointments (adjust tolerance as needed)
        // const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
        // if (appointmentDateTime < new Date(Date.now() - 5 * 60 * 1000)) { // Allow cancelling up to 5 mins past
        //     return NextResponse.json({ error: `Cannot cancel past appointments.` }, { status: 400 });
        // }


        // 5. Update appointment status (Use Admin client for the update)
        const { data: updatedAppointment, error: updateError } = await supabaseAdmin
            .from('appointments')
            .update({
                status: 'cancelled', // Set status from request body
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId)
             // Select necessary fields for the response/notification
            .select('*, doctor_id, patient_id, appointment_date, appointment_time')
            .single();

        if (updateError) {
            console.error(`[API Appointments PUT /${appointmentId}] Error updating appointment:`, updateError);
            return NextResponse.json({ error: 'Failed to cancel appointment', details: updateError.message }, { status: 500 });
        }
        if (!updatedAppointment) {
            return NextResponse.json({ error: 'Failed to confirm cancellation.' }, { status: 500 });
        }

        console.log(`[API Appointments PUT /${appointmentId}] Appointment status updated to ${updates.status}.`);

        // --- 6. Send Notification based on who cancelled ---
        try {
            if (isPatient) {
                // --- Notify Doctor ---
                const doctorId = appointment.doctor_id;
                 // Get patient name from fetched appointment data
                const patientProfile = appointment.patient?.profiles; // Using optional chaining
                const patientName = patientProfile ? `${patientProfile.first_name || ''} ${patientProfile.last_name || ''}`.trim() : 'A patient';

                if (doctorId) {
                    console.log(`[API Appointments PUT /${appointmentId}] Attempting to notify doctor ${doctorId}`);
                    const notificationPayload = {
                        user_id: doctorId, // Target doctor
                        type: 'APPOINTMENT_CANCELLED_BY_PATIENT', // Specific type
                        message: `${patientName} has cancelled their appointment with you on ${updatedAppointment.appointment_date} at ${updatedAppointment.appointment_time}.`,
                        link_url: '/doctors/doctor-schedule', // Link to doctor's schedule
                        metadata: { appointment_id: updatedAppointment.id, patient_id: requesterId }
                    };
                    const { error: insertNotifyError } = await supabaseAdmin.from('notifications').insert(notificationPayload);
                    if (insertNotifyError) { console.error("[API Appointments PUT] Failed to insert doctor notification:", insertNotifyError); }
                    else { console.log(`[API Appointments PUT] Successfully inserted notification for doctor ${doctorId}.`); }
                } else { console.warn(`[API Appointments PUT /${appointmentId}] Cannot notify doctor: doctor_id not found.`); }

            } else if (isDoctor) {
                // --- Notify Patient (Existing Logic) ---
                const patientId = appointment.patient_id;
                const doctorProfile = appointment.doctor?.profiles; // Using optional chaining
                const doctorName = doctorProfile ? `Dr. ${doctorProfile.first_name ?? ''} ${doctorProfile.last_name ?? ''}`.trim() : 'Your doctor';

                if (patientId) {
                    console.log(`[API Appointments PUT /${appointmentId}] Attempting to notify patient ${patientId}`);
                    const notificationPayload = {
                        user_id: patientId,
                        type: 'APPOINTMENT_CANCELLED_BY_DOCTOR',
                        message: `Your appointment with ${doctorName} on ${updatedAppointment.appointment_date} at ${updatedAppointment.appointment_time} has been cancelled.`,
                        link_url: '/appointments',
                        metadata: { appointment_id: updatedAppointment.id, doctor_id: requesterId }
                    };
                    const { error: insertNotifyError } = await supabaseAdmin.from('notifications').insert(notificationPayload);
                    if (insertNotifyError) { console.error("[API Appointments PUT] Failed to insert patient notification:", insertNotifyError); }
                    else { console.log(`[API Appointments PUT] Successfully inserted notification for patient ${patientId}.`); }
                } else { console.warn(`[API Appointments PUT /${appointmentId}] Cannot notify patient: patient_id not found.`); }
            }
        } catch (notifyError) { console.error("[API Appointments PUT] Error during notification process:", notifyError); }
        // --- End Notification Logic ---

        // 7. Return Success Response
        return NextResponse.json({ data: updatedAppointment, message: 'Appointment cancelled successfully.' }, { status: 200 });

    } catch (error) {
        console.error(`[API Appointments PUT /${appointmentId}] Unexpected error:`, error);
        const details = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: 'Internal server error', details: details }, { status: 500 });
    }
}

// Optional: Add GET handler if needed/route.ts]
// export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) { ... }

// Optional: Consider DELETE handler for HARD deletes (use with caution)
// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) { ... }