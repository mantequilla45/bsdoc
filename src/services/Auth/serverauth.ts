'use server'

import { revalidatePath } from 'next/cache'
//import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

interface AuthResponse {
  success: boolean;
  error?: { message: string; code?: string; status?: number };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: email,
    password: password,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.log(error);
    return {
      success: false,
      error: {
        message: error.message,
        //code: error.code, // Include code/status if needed
        status: error.status
      }
    }
  }

  revalidatePath('/', 'layout')
  return { success: true };
}

export async function signup(email: string, password: string): Promise<AuthResponse> {
  const supabase = await createClient(); // Client for signup
  //const data = { email, password };
  const lowerCaseEmail = email.toLowerCase(); // Use lowercase for check

  try {
    // --- Check if user exists using Admin client querying 'users' table ---
    console.log(`[Server Action Signup] Checking existence for email: ${lowerCaseEmail} via from('users')`);
    let userExists = false;
    try {
        // Query auth.users table directly BUT ONLY SELECT 'id'
        const { data: existingUserData, error: existingUserError } = await supabaseAdmin
          .from('users') 
          .select('id') // <-- Select ONLY 'id' to avoid the missing column error
          .eq('email', lowerCaseEmail) 
          .limit(1); // We only need to know if at least one exists

        if (existingUserError) {
          // If there's an error querying (permissions?), log it and treat as potential existence
          console.error('[Server Action Signup] Error checking existing user:', existingUserError);
          userExists = true; // Treat unexpected errors during check as potential existence
        } else if (existingUserData && existingUserData.length > 0) {
           // If data array is not empty, a user with that email exists
           console.log(`[Server Action Signup] User found via from('users') for email: ${lowerCaseEmail}`);
           userExists = true;
        } else {
           // No error and empty array means user doesn't exist
           console.log(`[Server Action Signup] User not found via from('users') for email: ${lowerCaseEmail}. Safe to proceed.`);
           userExists = false;
        }
    } catch (checkError) {
       // Catch potential errors during the check itself
       console.error('[Server Action Signup] Unexpected error during user check:', checkError);
       userExists = true; // Treat as potential existence if check fails
    }


    // If the check determined the user exists, return the error now
    if (userExists) {
        return { 
            success: false, 
            error: { 
                message: "This email is already registered. Please try logging in." 
            } 
        };
    }
    // --- End user existence check ---


    // If user does not exist, proceed with signup using the regular client
    console.log(`[Server Action Signup] Proceeding with Supabase signUp for ${email}.`);
    const { error: signUpError } = await supabase.auth.signUp({ email, password }); 

    if (signUpError) {
      console.error('[Server Action Signup] Supabase signUp Error:', signUpError);
      return { 
          success: false, 
          error: { 
              message: signUpError.message, 
              code: signUpError.code,
              status: signUpError.status
          } 
      };
    }

    // Success Case (New User Signup)
    console.log(`[Server Action Signup] Supabase signUp successful for ${email}.`);
    revalidatePath('/', 'layout');
    return { success: true };

  } catch (unexpectedError) {
      // Catch any other unexpected errors during the overall process
      console.error('[Server Action Signup] Outer unexpected error:', unexpectedError);
      return { success: false, error: { message: "An unexpected server error occurred during signup." } };
  }
}