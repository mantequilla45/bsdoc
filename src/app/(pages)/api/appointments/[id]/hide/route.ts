// src/app/(pages)/api/appointments/[id]/hide/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // For user auth check
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // For DB operations

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const appointmentId = (await params).id;
    console.log(`[API Appointments PATCH /${appointmentId}/hide] Request received.`);

    if (!appointmentId) {
        return NextResponse.json({ error: 'Appointment ID is missing' }, { status: 400 });
    }

    try {
        // 1. Authenticate the user making the request
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) { 
            return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 }); 
        }
        const token = authHeader.split(' ')[1];
        const { data: { user: requestUser }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !requestUser) { 
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 }); 
        }
        const requesterId = requestUser.id;
        console.log(`[API Appointments PATCH /${appointmentId}/hide] Authenticated user: ${requesterId}`);

        // 2. Fetch the appointment first to verify ownership
        console.log(`[API Appointments PATCH /${appointmentId}/hide] Fetching appointment details...`);
        const { data: appointment, error: fetchError } = await supabaseAdmin
            .from('appointments')
            .select('patient_id, status')
            .eq('id', appointmentId)
            .single();

        if (fetchError || !appointment) {
            console.error(`[API Appointments PATCH /${appointmentId}/hide] Error fetching appointment:`, fetchError);
            const status = fetchError?.message.includes('0 rows') ? 404 : 500;
            return NextResponse.json({ error: 'Appointment not found or query error' }, { status });
        }

        // 3. Verify user is the patient for this appointment
        if (appointment.patient_id !== requesterId) {
            console.warn(`[API Appointments PATCH /${appointmentId}/hide] Auth failed. Requester ID: ${requesterId} is not the patient (${appointment.patient_id}).`);
            return NextResponse.json({ error: 'Forbidden: You cannot modify this appointment' }, { status: 403 });
        }

        // 4. Optional: Check if the appointment is cancelled (you might want to enforce this requirement)
        if (appointment.status !== 'cancelled') {
            return NextResponse.json({ 
                error: 'Only cancelled appointments can be hidden' 
            }, { status: 400 });
        }

        // 5. Update the appointment to mark it as hidden
        const { data: updatedAppointment, error: updateError } = await supabaseAdmin
            .from('appointments')
            .update({
                is_hidden_by_patient: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', appointmentId)
            .select('id, is_hidden_by_patient')
            .single();

        if (updateError) {
            console.error(`[API Appointments PATCH /${appointmentId}/hide] Error updating appointment:`, updateError);
            return NextResponse.json({ error: 'Failed to hide appointment', details: updateError.message }, { status: 500 });
        }

        console.log(`[API Appointments PATCH /${appointmentId}/hide] Appointment successfully hidden.`);

        // 6. Return success response
        return NextResponse.json({ 
            data: updatedAppointment, 
            message: 'Appointment hidden successfully.' 
        }, { status: 200 });

    } catch (error) {
        console.error(`[API Appointments PATCH /${appointmentId}/hide] Unexpected error:`, error);
        const details = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: 'Internal server error', details: details }, { status: 500 });
    }
}