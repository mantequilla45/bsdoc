// src/app/(pages)/api/admin/doctor-verifications/[verificationId]/approve/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Reuse the same validation function from proof-url route
async function validateAdminAccess(req: NextRequest) {
    // Check for authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Missing or invalid Authorization header', status: 401 };
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
        console.error('Token verification failed:', error);
        return { error: 'Invalid token', status: 401 };
    }

    const user = data.user;

    // Check admin role
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile || profile.role !== 'admin') {
        console.error('Unauthorized: User is not an admin');
        return { error: 'Unauthorized', status: 403 };
    }

    return { user, profile };
}


export async function POST(req: NextRequest, { params }: { params: Promise<{ verificationId: string }> }) {
    // 1. Validate Admin Access
    const validation = await validateAdminAccess(req);
    if ('error' in validation) {
        return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    // 2. Get verificationId from URL path parameter
    const verificationId = (await params).verificationId;
    if (!verificationId) {
        return NextResponse.json({ error: 'Verification ID is missing' }, { status: 400 });
    }

    try {
        // 3. Parse request body to get userId
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 4. Transaction to update both user role and verification status
        const { error: transactionError } = await supabaseAdmin.rpc('approve_doctor_verification', {
            p_verification_id: verificationId,
            p_user_id: userId
        });

        if (transactionError) {
            console.error('Error in transaction:', transactionError);
            return NextResponse.json(
                { error: 'Failed to approve doctor verification' }, 
                { status: 500 }
            );
        }

        // 5. Return success response
        return NextResponse.json(
            { message: 'Doctor verification approved successfully' }, 
            { status: 200 }
        );

    } catch (error: unknown) {
        console.error('Unexpected error approving verification:', error);
        return NextResponse.json(
            { error: 'An unexpected server error occurred' }, 
            { status: 500 }
        );
    }
}