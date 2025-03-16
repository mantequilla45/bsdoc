import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = 'https://ipqwsnhygmzeljnwcysl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcXdzbmh5Z216ZWxqbndjeXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg3NTEwNCwiZXhwIjoyMDUzNDUxMTA0fQ.yLxCei6RhajPnTD6OmMvLzSGDKxkXjcS88d-N-jxi8E';

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);