// src\app\(pages)\api\appointments\route.ts

import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const patientId = searchParams.get('patient_id');
        const doctorId = searchParams.get('doctor_id');

        let query = supabase
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
        console.log('POST /api/appointments called');

        const { doctor_id, appointment_date, appointment_time } = await req.json();
        console.log('Request body:', { doctor_id, appointment_date, appointment_time });

        // Instead of using cookies and createServerClient, directly use the supabase client
        // Get the session from the request
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No authorization header found');
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token with Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.log('Invalid token or user not found', authError);
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }

        const patientId = user.id;

        if (!doctor_id || !appointment_date || !appointment_time) {
            console.log('Missing required fields');
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if this time slot is already booked
        const { data: existingAppointment, error: checkError } = await supabase
            .from('appointments')
            .select('*')
            .eq('doctor_id', doctor_id)
            .eq('appointment_date', appointment_date)
            .eq('appointment_time', appointment_time)
            .eq('status', 'booked');

        if (checkError) {
            console.error('Error checking existing appointments:', checkError);
            return NextResponse.json({ error: 'Error checking availability' }, { status: 500 });
        }

        if (existingAppointment && existingAppointment.length > 0) {
            return NextResponse.json({ error: 'This time slot is already booked' }, { status: 409 });
        }

        // Create the appointment
        const { data, error } = await supabase
            .from('appointments')
            .insert({
                doctor_id,
                patient_id: patientId,
                appointment_date,
                appointment_time,
                status: 'booked',
            })
            .select('*, doctor:doctors(*, profiles(*)), patient:profiles(*)')
            .single();

        if (error) {
            console.error('Error booking appointment:', error);
            return NextResponse.json({
                error: 'Error booking appointment',
                details: error.message
            }, { status: 500 });
        }

        if (data) { // Check if insert was successful and returned data
            try {
                // Fetch patient name for a more informative message
                const { data: patientProfile, error: patientFetchError } = await supabase
                    .from('profiles')
                    .select('first_name, last_name')
                    .eq('id', data.patient_id)
                    .single();

                const patientName = patientFetchError || !patientProfile ? 'A patient' : `${patientProfile.first_name} ${patientProfile.last_name}`;

                const { error: insertNotifyError } = await supabase
                    .from('notifications')
                    .insert({
                        user_id: data.doctor_id, // The Doctor who received the booking
                        type: 'APPOINTMENT_BOOKED',
                        message: `${patientName} booked an appointment with you on ${data.appointment_date} at ${data.appointment_time}.`,
                        link_url: '/doctors/doctor-schedule', // Link to doctor's schedule
                        metadata: { appointment_id: data.id, patient_id: data.patient_id }
                    });

                if (insertNotifyError) {
                    console.error("Failed to insert doctor appointment notification:", insertNotifyError);
                }
            } catch (notifyError) {
                console.error("Error during doctor notification process:", notifyError);
            }
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
        console.error('Error in appointments POST route:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}