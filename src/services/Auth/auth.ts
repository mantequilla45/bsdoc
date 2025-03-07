import { supabase } from "@/lib/supabaseClient";

// const getDomain = () => {
//     // When running in the browser
//     if (typeof window !== 'undefined') {
//       return window.location.origin;
//     }
//     // Server-side fallback (this won't be perfect but helps)
//     return process.env.NODE_ENV === 'production'
//       ? 'https://bsdoc-project.vercel.app'
//       : 'http://localhost:3000';
//   };
  
//   // Notice HTTP not HTTPS for localhost (matching your error)
//   const getRedirectTo = () => {
//     const domain = getDomain();
//     return `${domain}/auth/callback`;
//   };

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
        //options: { redirectTo: getRedirectTo() }
        options: { redirectTo: 'https://bsdoc-project.vercel.app/auth/callback'}
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