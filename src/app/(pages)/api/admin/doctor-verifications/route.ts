// src/app/(pages)/api/admin/doctor-verifications/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // Use admin client

async function validateAdminAccess(req: NextRequest) {
    console.log("Entering validateAdminAccess..."); // Log entry
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        console.error("validateAdminAccess: Missing token");
        return { error: 'Unauthorized: Missing token', status: 401 };
    }
    const token = authHeader.split(' ')[1];
    console.log("validateAdminAccess: Token received");

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
        console.error("validateAdminAccess: Invalid token or auth error", authError);
        return { error: 'Unauthorized: Invalid token', status: 401 };
    }
    console.log("validateAdminAccess: User retrieved, ID:", user.id);

    // Check if the user has admin role in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error("validateAdminAccess: Error fetching profile", profileError);
        // Return 500 here as it's likely a DB issue, not auth issue
        return { error: 'Server error: Could not fetch user profile', status: 500 };
    }
    if (!profile || profile.role !== 'admin') {
        console.error("validateAdminAccess: Forbidden - User is not an admin or profile not found. Role:", profile?.role);
        return { error: 'Forbidden: User is not an admin', status: 403 };
    }
    console.log("validateAdminAccess: Admin access validated for user ID:", user.id);
    return { user }; // Return user if validation passes
}

export async function GET(req: NextRequest) {
    console.log("--- GET /api/admin/doctor-verifications called ---"); // Log route entry

    // 1. Validate Admin Access
    console.log("Attempting admin access validation...");
    const validation = await validateAdminAccess(req);
    if ('error' in validation) {
        console.error("Admin validation failed:", validation);
        return NextResponse.json({ error: validation.error }, { status: validation.status });
    }
    console.log("Admin access successful for user ID:", validation.user.id);

    try {
        console.log("Attempting to fetch pending verifications from DB...");
        // 2. Fetch pending verification requests, joining with profiles
        const { data, error } = await supabaseAdmin
            .from('doctor_verification')
            .select(`
            id,
            user_id,
            prc_id_url,
            submitted_at,
            status,
            profile:profiles!user_id (
                first_name,
                last_name,
                email
            )
        `)
            .eq('status', 'pending')
            .order('submitted_at', { ascending: true });

        // Log the raw result from Supabase
        console.log("Raw Supabase fetch result:", { data, error });

        if (error) {
            console.error('Error fetching pending verifications:', error);
            return NextResponse.json({ error: `Failed to fetch pending requests: ${error.message}` }, { status: 500 });
        }

        console.log("Data fetch successful. Starting formatting...");
        // 3. Format/Return Data
        const formattedData = data?.map(item => {
            // Define expected profile structure (optional but good practice)
            interface ProfileData {
                first_name: string | null;
                last_name: string | null;
                email: string | null;
            }

            // Explicitly type the profile variable and determine its value
            let profile: ProfileData | null = null;

            if (Array.isArray(item.profile) && item.profile.length > 0) {
                // If it's a non-empty array, assume first element is the profile
                profile = item.profile[0] as ProfileData; // Use type assertion if TS needs it
            } else if (item.profile && typeof item.profile === 'object' && !Array.isArray(item.profile)) {
                // If it's a single object (and not null/array), use it directly
                profile = item.profile as ProfileData;
            }
            // If item.profile was null, empty array, or unexpected type, profile remains null

            return {
                verificationId: item.id,
                userId: item.user_id,
                prcIdUrl: item.prc_id_url,
                submittedAt: item.submitted_at,
                status: item.status,
                // Access via the explicitly typed 'profile' variable
                firstName: profile?.first_name ?? null,
                lastName: profile?.last_name ?? null,
                email: profile?.email ?? null,
            };
        }) || [];

        console.log("Data formatting successful. Count:", formattedData.length);
        return NextResponse.json({ data: formattedData }, { status: 200 });

    } catch (error: unknown) {
        console.error('Unexpected error in GET handler try block:', error);
        // Ensure error is an instance of Error to access message
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'An unexpected server error occurred', details: errorMessage }, { status: 500 });
    }
}