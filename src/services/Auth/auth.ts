import { supabase } from "@/lib/supabaseClient";

export async function signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw error;

    return data.user;
}

export async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data.user;
}

export async function signInWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { 
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }, 
            },
        });

        if (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }

        // Get the session to ensure we have the user and user_metadata
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData?.session?.user) {
            console.error("Error getting session after Google sign-in:", sessionError);
            // Consider a more user-friendly error handling here
            throw new Error("Failed to retrieve user session.");
        }

        const user = sessionData.session.user;
        const firstName = user.user_metadata?.first_name|| '';
        const lastName = user.user_metadata?.last_name || '';
        const id = user.id;

        // Update profiles table with Google-specific data
        const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({
                first_name: firstName,
                last_name: lastName,
            })
            .eq('id', id);

        if (profileUpdateError) {
            console.error("Error updating profile:", profileUpdateError);
            throw profileUpdateError;
        }
        return data.provider; // Or a success message if needed

    } catch (error) {
        // Centralized error handling
        console.error("Error during Google Sign-In and profile handling:", error);
        // Always rethrow or return a consistent error format
        throw error;
    }
}

export async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;   
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}