// /api/doctors/availability/[id]
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;

    try {
        // Authentication and authorization logic here (check if user is a doctor)
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user: doctorUser }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !doctorUser) {
            console.error('Token verification failed:', authError);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Authorization: Ensure the user is a doctor
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', doctorUser.id)
            .single();

        if (profileError || !profile || profile.role !== 'doctor') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { start_time, end_time } = await req.json();

        if (!start_time || !end_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('availability')
            .update({
                start_time,
                end_time,
            })
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            console.error('Error updating availability:', error);
            return NextResponse.json({ error: 'Error updating availability' }, {
                status: 500,
            });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Error in availability PUT route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Define interfaces for type safety (can be moved to a types file)
// interface AppointmentForNotification {
//     id: string;
//     appointment_date: string;
//     appointment_time: string;
//     patient_id: string; // Need patient_id for notification
// }

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    console.log(`[API Dr Availability DELETE /${id}] Request received.`);

    try {
        // 1. Authentication
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('Token verification failed:', authError);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // 2. Authorization: Ensure the user is a doctor and is deleting their own availability
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'doctor') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Fetch the availability to be deleted to compare doctor IDs and get details
        console.log(`[API Dr Availability DELETE /${id}] Fetching availability and doctor info...`);
        const { data: availability, error: availabilityError } = await supabaseAdmin
            .from('availability')
            .select('*')
            .eq('id', id)
            .single();

        if (availabilityError || !availability) {
            return NextResponse.json({ error: 'Availability not found' }, { status: 404 });
        }

        if (availability.doctor_id !== user.id) {
            return NextResponse.json({ error: 'You are not authorized to delete this availability' }, { status: 403 });
        }

        console.log(`[API Dr Availability DELETE /${id}] Authorized Doctor: ${user.id}`);

        const doctorId = availability.doctor_id; // Get doctor ID from availability record
        console.log(`[API Dr Availability DELETE /${id}] Fetching doctor profile for ID: ${doctorId}...`);
        const { data: doctorProfile, error: doctorProfileError } = await supabaseAdmin
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', doctorId)
            .single();

        let doctorName = 'Your doctor'; // Default name
        if (doctorProfileError) {
            console.error(`[API Dr Availability DELETE /${id}] Warning: Could not fetch doctor profile for notification:`, doctorProfileError);
            // Proceed without the name if fetch fails
        } else if (doctorProfile) {
            doctorName = `Dr. ${doctorProfile.first_name || ''} ${doctorProfile.last_name || ''}`.trim();
        }
        console.log(`[API Dr Availability DELETE /${id}] Using doctor name: ${doctorName}`);

        // Day of week mapping
        const dayOfWeekMap: Record<string, number> = {
            'Sunday': 0,
            'Monday': 1,
            'Tuesday': 2,
            'Wednesday': 3,
            'Thursday': 4,
            'Friday': 5,
            'Saturday': 6
        };

        const dayNumber = dayOfWeekMap[availability.day_of_week];
        if (dayNumber === undefined) {
            return NextResponse.json({ error: 'Invalid day of week in availability' }, { status: 400 });
        }

        // Define interfaces for type safety
        interface Appointment {
            id: string;
            appointment_date: string;
            appointment_time: string;
            status?: string;
        }

        // Get all appointments for this doctor with 'booked' status
        const { data: doctorAppointments, error: doctorApptsError } = await supabase
            .from('appointments')
            .select('id, appointment_date, appointment_time, patient_id')
            .eq('doctor_id', availability.doctor_id)
            .eq('status', 'booked')
            .gte('appointment_time', availability.start_time)
            .lt('appointment_time', availability.end_time);

        if (doctorApptsError) {
            console.error('Error finding doctor appointments:', doctorApptsError);
            return NextResponse.json({ error: 'Error finding doctor appointments' }, {
                status: 500,
            });
        }

        // Then filter appointments by day of week manually
        const affectedAppointments = doctorAppointments?.filter((appointment: Appointment) => {
            const appointmentDate = new Date(appointment.appointment_date);
            const appointmentDayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
            return appointmentDayOfWeek === dayNumber;
        });
        console.log(`[API Dr Availability DELETE /${id}] Found ${affectedAppointments.length} affected appointments.`);

        // Update appointments
        let cancelledAppointmentIds: string[] = [];
        if (affectedAppointments && affectedAppointments.length > 0) {
            cancelledAppointmentIds = affectedAppointments.map((app) => app.id);
            console.log(`[API Dr Availability DELETE /${id}] Updating status to cancelled for IDs:`, cancelledAppointmentIds);
            //const appointmentIds = affectedAppointments.map((app: Appointment) => app.id);

            const { error: updateAppointmentsError } = await supabaseAdmin
                .from('appointments')
                .update({ status: 'cancelled', updated_at: new Date().toISOString() })
                .in('id', cancelledAppointmentIds);

            if (updateAppointmentsError) {
                console.error('Error updating appointments:', updateAppointmentsError);
                return NextResponse.json({ error: 'Error updating affected appointments' }, {
                    status: 500,
                });
            }
            console.log(`[API Dr Availability DELETE /${id}] Successfully updated status for ${cancelledAppointmentIds.length} appointments.`);
        }

        // --- 4. Send Notifications for Cancelled Appointments ---
        if (affectedAppointments.length > 0) {
            console.log(`[API Dr Availability DELETE /${id}] Inserting notifications for ${affectedAppointments.length} patients...`);
            const notificationPromises = affectedAppointments.map(appt => {
                const notificationPayload = {
                    user_id: appt.patient_id, // Target patient
                    type: 'APPOINTMENT_CANCELLED_BY_DOCTOR', // Same type as single cancel
                    message: `Your appointment with ${doctorName} on ${appt.appointment_date} at ${appt.appointment_time} has been cancelled due to a schedule change.`,
                    link_url: '/appointments',
                    metadata: { appointment_id: appt.id, doctor_id: availability.doctor_id }
                };
                return supabaseAdmin.from('notifications').insert(notificationPayload);
            });
            // Wait for all notifications inserts to attempt
            const results = await Promise.allSettled(notificationPromises);
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`[API Dr Availability DELETE /${id}] Failed to insert notification for patient ${affectedAppointments[index].patient_id}:`, result.reason);
                }
            });
            console.log(`[API Dr Availability DELETE /${id}] Finished sending notifications.`);
        }
        // --- End Notification Logic ---

        // Delete the availability
        const { data, error: deleteError } = await supabaseAdmin
            .from('availability')
            .delete()
            .eq('id', id)
            .select('*')
            .single();

        if (deleteError) {
            console.error('Error deleting availability:', deleteError);
            return NextResponse.json({ error: 'Error deleting availability' }, {
                status: 500,
            });
        }
        console.log(`[API Dr Availability DELETE /${id}] Availability slot deleted.`);

        return NextResponse.json({
            data,
            affectedAppointments: affectedAppointments?.length || 0,
            message: `Availability deleted and ${affectedAppointments?.length || 0} affected appointments cancelled`
        }, { status: 200 });
    } catch (error) {
        console.error('Error in availability DELETE route:', error);
        console.error('API Route Error Details:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}