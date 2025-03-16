// app/api/admin/users/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
// Remove the unused import of ProfileUser

export async function GET(req: NextRequest) {
    try {
        // 1. Authenticate and Authorize
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        // Fix the parameter type to be a string instead of an object
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !data?.user) {
            console.error('Token verification failed:', error);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const user = data.user;

        // Authorize: Fetch user profile and check role
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log("User profile: ", profile);
        console.log('User role: ', profile?.role);

        if (profileError || !profile || profile.role !== 'admin') {
            console.error('Unauthorized: User is not an admin');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 2. Fetch Users from Database
        const { data: users, error: usersError } = await supabaseAdmin
            .from('profiles')
            .select('*'); // Adjust this query as needed

        if (usersError) {
            console.error('Error fetching users:', usersError);
            return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
        }

        // Fix the response structure to be more straightforward
        return NextResponse.json({ data: users }, { status: 200 });
    } catch (error) {
        console.error('Error in handler:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}