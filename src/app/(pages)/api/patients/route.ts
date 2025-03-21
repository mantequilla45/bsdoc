import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// eslint-disable-next-line
export async function GET(req: NextRequest) {
    try {
        // First, get all doctor IDs to exclude them
        const { data: doctors, error: doctorsError } = await supabase
            .from('doctors')
            .select('id');
            
        if (doctorsError) {
            console.error('Error fetching doctors:', doctorsError);
            return NextResponse.json({ error: 'Error fetching doctors' }, {
                status: 500,
            });
        }
        
        // Create an array of doctor IDs to exclude
        const doctorIds = doctors ? doctors.map(doctor => doctor.id) : [];
        
        // Query profiles that are not in the doctors table
        let query = supabase.from('profiles').select('*');
        
        // If we have doctor IDs, exclude them
        if (doctorIds.length > 0) {
            query = query.not('id', 'in', `(${doctorIds.join(',')})`);
        }
        
        // You might also have a role field you can filter by
        // query = query.eq('role', 'patient');
        
        const { data, error } = await query;

        if (error) {
            console.error('Error fetching patients:', error);
            return NextResponse.json({ error: 'Error fetching patients' }, {
                status: 500,
            });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Error in patients GET route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}