// /api/doctors/availability/[id]
import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getUser } from '@/services/Auth/auth'; // Assuming you have this

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;

    try {
        // Authentication and authorization logic here (check if user is a doctor)
        const doctorUser = await getUser();
        if (!doctorUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;

    try {
        // Authentication and authorization logic here (check if user is a doctor)
        const doctorUser = await getUser();
        if (!doctorUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

        const { data, error } = await supabase
            .from('availability')
            .delete()
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            console.error('Error deleting availability:', error);
            return NextResponse.json({ error: 'Error deleting availability' }, {
                status: 500,
            });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Error in availability DELETE route:', error);
        console.error('API Route Error Details:', error); // Log the error object
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}