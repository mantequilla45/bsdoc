import { supabase } from "@/lib/supabaseClient";

export async function signUpWithEmail(email:string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });
    
    if (error) throw error;
    return data.user;
}

export async function singInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data.user;
}

export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google', 
    });

    if (error) throw error;
    return data.provider;
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