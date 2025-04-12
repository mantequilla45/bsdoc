// src/app/(pages)/api/admin/doctor-verifications/[verificationId]/proof-url/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Assume you have your validateAdminAccess helper function defined
// (similar to the one in the previous route)
// async function validateAdminAccess(req: NextRequest) { ... }

// Helper function to safely get path param
// Note: In Next.js 13+ App Router, params are passed directly to the handler
// function getVerificationId(req: NextRequest): string | null {
//     // Logic to extract ID from URL might differ based on router version
//     // Example for older versions or if needed:
//     // const { searchParams } = new URL(req.url);
//     // return searchParams.get('verificationId'); - Adjust if using query params
//     // For path params like /[verificationId]/, handle accordingly
//     return null; // Placeholder - adjust extraction
// }

async function validateAdminAccess(req: NextRequest) {
    // Check for authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Missing or invalid Authorization header', status: 401 };
    }

    const token = authHeader.split(' ')[1];

    // Verify token - fixed parameter type
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ verificationId: string }> }) {
    // 1. Validate Admin Access
    // Reuse the same validation logic as the GET /api/admin/doctor-verifications route
    // Validate admin access
    const validation = await validateAdminAccess(req);
    if ('error' in validation) {
        return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    // 2. Get verificationId from URL path parameter
    const verificationId = (await params).verificationId;
    if (!verificationId) {
        return NextResponse.json({ error: 'Verification ID is missing' }, { status: 400 });
    }

    const storageBucket = 'doctor-proofs';
    const expiresIn = 60; // Expiry time for the signed URL in seconds (e.g., 1 minute)

    try {
        // 3. Fetch the verification record to get the file path (prc_id_url)
        const { data: verificationData, error: fetchError } = await supabaseAdmin
            .from('doctor_verification')
            .select('prc_id_url')
            .eq('id', verificationId)
            .single(); // Expect only one record

        if (fetchError || !verificationData) {
            console.error('Error fetching verification record:', fetchError);
            return NextResponse.json({ error: 'Verification record not found' }, { status: 404 });
        }

        const filePath = verificationData.prc_id_url;
        if (!filePath) {
            return NextResponse.json({ error: 'File path not found for this record' }, { status: 404 });
        }

        // 4. Generate the Signed URL
        const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
            .from(storageBucket)
            .createSignedUrl(filePath, expiresIn);

        if (signedUrlError) {
            console.error('Error creating signed URL:', signedUrlError);
            // Check if the error is because the file doesn't exist in storage
            if (signedUrlError.message.includes('Object not found')) {
                return NextResponse.json({ error: 'Proof file not found in storage' }, { status: 404 });
            }
            return NextResponse.json({ error: 'Failed to generate secure URL for proof' }, { status: 500 });
        }

        if (!signedUrlData?.signedUrl) {
            return NextResponse.json({ error: 'Failed to generate signed URL data' }, { status: 500 });
        }

        // 5. Return the Signed URL
        return NextResponse.json({ signedUrl: signedUrlData.signedUrl }, { status: 200 });

    } catch (error: unknown) {
        console.error('Unexpected error generating proof URL:', error);
        return NextResponse.json({ error: 'An unexpected server error occurred' }, { status: 500 });
    }
}