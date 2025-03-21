// import { createClient } from "@supabase/supabase-js";

// const SUPABASE_URL = 'https://ipqwsnhygmzeljnwcysl.supabase.co';
// const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcXdzbmh5Z216ZWxqbndjeXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NzUxMDQsImV4cCI6MjA1MzQ1MTEwNH0.gZ-UM7qThZOacopwMtsYMRF34_gz1BdQaM42dD8jthI';

// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

export const supabase = createClient();