// src/app/(pages)/api/doctors/doctor-registration/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer'; // Fixed: server client with correct cookie usage
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const supabase = await createClient(); // Use the correct server-side Supabase client

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const defaultRole = 'user';
  const storageBucket = 'doctor-proofs';

  if (!file) {
    return NextResponse.json({ error: 'Proof of profession file is required' }, { status: 400 });
  }

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  let userId = '';
  let uploadedFilePath = '';

  try {
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id') // Select anything just to see if a row exists
      .eq('email', email)
      .maybeSingle(); // Returns one row or null, doesn't error if not found

    if (profileCheckError) {
      console.error('Error checking existing profile:', profileCheckError);
      // Don't expose internal errors directly, return a generic server error
      return NextResponse.json({ error: 'An error occurred during validation.' }, { status: 500 });
    }

    // If a profile with this email already exists, return the conflict error
    if (existingProfile) {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 }); // 409 Conflict
    }
    // 1. Create Auth User
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      if (signUpError.message.includes('User already registered')) {
        return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 });
      }
      return NextResponse.json({ error: `Authentication error: ${signUpError.message}` }, { status: 400 });
    }

    userId = signUpData.user?.id || signUpData.session?.user?.id || '';
    if (!userId) {
      return NextResponse.json({ error: 'User registration succeeded, but user ID is missing.' }, { status: 500 });
    }

    // 2. Upload Proof File
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: `Failed to upload file: ${uploadError.message}` }, { status: 500 });
    }

    uploadedFilePath = uploadData?.path ?? '';

    // 3. Update Profile
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        role: defaultRole,
      })
      .eq('id', userId);

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError);
      return NextResponse.json({ error: `Failed to update profile: ${profileUpdateError.message}` }, { status: 500 });
    }

    // 4. Insert Verification Request
    const { error: verificationInsertError } = await supabase
      .from('doctor_verification')
      .insert({
        user_id: userId,
        prc_id_url: uploadedFilePath,
        status: 'pending',
      });

    if (verificationInsertError) {
      console.error('Verification insert error:', verificationInsertError);
      return NextResponse.json({ error: `Failed to create verification record: ${verificationInsertError.message}` }, { status: 500 });
    }

    // --- Send Notification to Admins (using supabaseAdmin) ---
    console.log(`[Registration Route] Attempting to send notification to admins for user ID: ${userId}`);
    try {
        // Fetch all admin user IDs --> Use Admin Client to ensure RLS bypass if needed <--
        const { data: admins, error: adminFetchError } = await supabaseAdmin // Use admin client
            .from('profiles')
            .select('id')
            .eq('role', 'admin');

        if (adminFetchError) {
            console.error("[Registration Route] Failed to fetch admins for notification:", adminFetchError);
        } else if (admins && admins.length > 0) {
            console.log(`[Registration Route] Found ${admins.length} admin(s) to notify.`);
            const notifications = admins.map(admin => ({
                user_id: admin.id,
                type: 'VERIFICATION_SUBMITTED',
                message: `New doctor verification request from ${firstName} ${lastName} (${email}) needs review.`,
                link_url: '/admin/doctor-verifications',
                metadata: { applicant_user_id: userId }
            }));

             console.log(`[Registration Route] Inserting ${notifications.length} notification(s).`);
            // --> Insert notifications using the Admin Client (bypasses RLS) <--
            const { error: insertNotifyError } = await supabaseAdmin
                .from('notifications')
                .insert(notifications);

            if (insertNotifyError) {
                // This error should NOT be the RLS violation anymore
                console.error("[Registration Route] Failed to insert admin notifications:", insertNotifyError);
            } else {
                 console.log(`[Registration Route] Successfully inserted notifications for admins.`);
            }
        } else {
             console.warn("[Registration Route] No admin users found to notify.");
        }
    } catch (notifyError) {
         console.error("[Registration Route] Error during admin notification process:", notifyError);
    }
    // --- End Notification Logic ---

    return NextResponse.json(
      { message: 'Registration successful! Your application is pending review.' },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Unhandled error in registration route:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during registration.',
        details: (error as Error)?.message,
      },
      { status: 500 }
    );
  }
}
