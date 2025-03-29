// /app/api/doctor-schedule/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUser } from '@/services/Auth/auth'; // Assuming you have this service

//eslint-disable-next-line
export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        // Log detailed user information
        console.log('API - getUser() result: ', user);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'doctor') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 }); // Forbidden
        }

        // Fetch doctor's ID first (assuming user is a doctor)
        const { data: doctorData, error: doctorError } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', user.id)
            .single();

        // Log doctor lookup details
        console.log('API - user.id for doctor lookup:', user.id);
        console.log('API - Doctor Lookup Query:', supabase.from('doctors').select('id').eq('user_id', user.id).single());
        console.log('API - Doctor Data:', doctorData);
        console.log('API - Doctor Error:', doctorError);

        if (doctorError || !doctorData) {
            return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });
        }

        // Fetch all upcoming appointments for this doctor
        const { data: appointments, error: appointmentsError } = await supabase
            .from('appointments')
            .select('*, patient:profiles(first_name, last_name)') // Modified: Fetch patient name
            .eq('doctor_id', doctorData.id)
            .gte('appointment_date', new Date().toISOString().split('T')[0]) // Only future appointments
            .order('appointment_date', { ascending: true })
            .order('appointment_time', { ascending: true });

        if (appointmentsError) {
            console.error('Error fetching appointments:', appointmentsError);
            return NextResponse.json({ error: 'Error fetching appointments' }, { status: 500 });
        }

        // Fetch doctor's availability
        const { data: availability, error: availabilityError } = await supabase
            .from('availability')
            .select('*')
            .eq('doctor_id', doctorData.id);

        if (availabilityError) {
            console.error('Error fetching availability:', availabilityError);
            return NextResponse.json({ error: 'Error fetching availability' }, { status: 500 });
        }

        return NextResponse.json({
            appointments,
            availability
        }, { status: 200 });
    } catch (error) {
        console.error('Error in doctor schedule GET route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch doctor's ID first
        const { data: doctorData, error: doctorError } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (doctorError || !doctorData) {
            return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });
        }

        const { type, data: scheduleData } = await req.json();

        switch (type) {
            case 'availability':
                // Add or update availability
                const { day_of_week, start_time, end_time } = scheduleData;
                const { data: availabilityData, error: availabilityError } = await supabase
                    .from('availability')
                    .upsert({
                        doctor_id: doctorData.id,
                        day_of_week,
                        start_time,
                        end_time,
                    })
                    .select('*')
                    .single();

                if (availabilityError) {
                    console.error('Error setting availability:', availabilityError);
                    return NextResponse.json({ error: 'Error setting availability' }, { status: 500 });
                }
                return NextResponse.json({ data: availabilityData }, { status: 201 });

            case 'block_time':
                // Block specific time slots
                const { date, time_slots } = scheduleData;
                const blockPromises = time_slots.map(async (slot: string) => {
                    return supabase.from('appointments').insert({
                        doctor_id: doctorData.id,
                        appointment_date: date,
                        appointment_time: slot,
                        status: 'blocked'
                    });
                });

                const blockResults = await Promise.all(blockPromises);
                const blockErrors = blockResults.filter(result => result.error);

                if (blockErrors.length > 0) {
                    console.error('Errors blocking time slots:', blockErrors);
                    return NextResponse.json({ error: 'Error blocking time slots' }, { status: 500 });
                }

                return NextResponse.json({ message: 'Time slots blocked successfully' }, { status: 201 });

            default:
                return NextResponse.json({ error: 'Invalid schedule type' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in doctor schedule POST route:', error);
        console.error('API Route Error Details:', error); // Log the error object
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, id, updates } = await req.json();

        switch (type) {
            case 'appointment':
                const { data, error } = await supabase
                    .from('appointments')
                    .update(updates)
                    .eq('id', id)
                    .select('*')
                    .single();

                if (error) {
                    console.error('Error updating appointment:', error);
                    return NextResponse.json({ error: 'Error updating appointment' }, { status: 500 });
                }

                return NextResponse.json({ data }, { status: 200 });

            case 'availability':
                const { data: availData, error: availError } = await supabase
                    .from('availability')
                    .update(updates)
                    .eq('id', id)
                    .select('*')
                    .single();

                if (availError) {
                    console.error('Error updating availability:', availError);
                    return NextResponse.json({ error: 'Error updating availability' }, { status: 500 });
                }

                return NextResponse.json({ data: availData }, { status: 200 });

            default:
                return NextResponse.json({ error: 'Invalid update type' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in doctor schedule PUT route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, id } = await req.json();

        switch (type) {
            case 'appointment':
                const { data: appointmentData, error: appointmentError } = await supabase
                    .from('appointments')
                    .delete()
                    .eq('id', id)
                    .select('*')
                    .single();

                if (appointmentError) {
                    console.error('Error deleting appointment:', appointmentError);
                    return NextResponse.json({ error: 'Error deleting appointment' }, { status: 500 });
                }

                return NextResponse.json({ data: appointmentData }, { status: 200 });

            case 'availability':
                const { data: availData, error: availError } = await supabase
                    .from('availability')
                    .delete()
                    .eq('id', id)
                    .select('*')
                    .single();

                if (availError) {
                    console.error('Error deleting availability:', availError);
                    return NextResponse.json({ error: 'Error deleting availability' }, { status: 500 });
                }

                return NextResponse.json({ data: availData }, { status: 200 });

            default:
                return NextResponse.json({ error: 'Invalid delete type' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in doctor schedule DELETE route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}