// app/api/admin/users/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Helper function to validate admin access
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  try {
    // Validate admin access
    const validation = await validateAdminAccess(req);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    // Get user by ID
    const { data: userData, error: userGetError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (userGetError) {
      console.error('Error fetching user:', userGetError);
      return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
    }

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: userData }, { status: 200 });
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  try {
    // Validate admin access
    const validation = await validateAdminAccess(req);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    // Parse request body
    let reqBody;
    try {
      reqBody = await req.json();
    } catch {
      // No need to capture the error variable if we're not using it
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { email, first_name, last_name, role } = reqBody;

    // Validate required fields
    if (!email || !first_name || !last_name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ email, first_name, last_name, role })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
    }

    return NextResponse.json({ data: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userIdToDelete = (await params).id; // User ID from the URL path
  
  console.log(`DELETE /api/admin/users/${userIdToDelete} called`);

  if (!userIdToDelete) {
    return NextResponse.json({ error: 'User ID is missing in path' }, { status: 400 });
  }

  try {
    // 1. Validate admin access
    console.log("User Management DELETE: Validating admin access...");
    const validation = await validateAdminAccess(req);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }
    console.log("User Management DELETE: Admin access validated.");

    // Optional: Check if user exists in Auth before trying to delete related data
    const { data: { user: authUser }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userIdToDelete);
    if (getUserError || !authUser) {
      console.error(`User ${userIdToDelete} not found in auth:`, getUserError);
      return NextResponse.json({ error: 'User not found in authentication system' }, { status: 404 });
    }

    // 2. Explicitly delete from public.users table first
    console.log(`User Management DELETE: Attempting to delete from public.users table for ID: ${userIdToDelete}`);
    const { error: publicUserDeleteError } = await supabaseAdmin
      .from('users') // Target your public.users table
      .delete()
      .eq('id', userIdToDelete);

    if (publicUserDeleteError) {
      // Log error but continue, deleting the auth user is most critical
      console.error(`User Management DELETE: Error deleting from public.users table (proceeding anyway):`, publicUserDeleteError);
      // You might want different error handling depending on if public.users MUST be deleted first
    } else {
      console.log(`User Management DELETE: Entry deleted from public.users table for ID: ${userIdToDelete}`);
    }

    // 3. Delete the user from Supabase Authentication
    // This should cascade to delete the related 'profiles' row if linked correctly.
    // DO NOT delete from 'profiles' explicitly here if relying on cascade from auth deletion.
    console.log(`User Management DELETE: Attempting to delete auth user: ${userIdToDelete}`);
    const { data: deletionData, error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete); //eslint-disable-line

    if (authDeleteError) {
      console.error(`User Management DELETE: Error deleting auth user ${userIdToDelete}:`, authDeleteError);
      if (authDeleteError.message.includes('User not found')) {
        return NextResponse.json({ error: 'User not found in authentication system (maybe already deleted).' }, { status: 404 });
      }
      // If deleting the auth user fails, the public.users deletion might have still happened.
      return NextResponse.json({ error: `Failed to delete user from authentication: ${authDeleteError.message}` }, { status: 500 });
    }
    console.log(`User Management DELETE: Auth user ${userIdToDelete} deleted successfully.`);

    // 4. Return success response
    // Assuming cascade handled profiles deletion
    return NextResponse.json({ message: 'User deleted successfully from auth and related tables.' }, { status: 200 });

  } catch (error: unknown) {
    console.error('User Management DELETE: Unexpected error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error during user deletion', details }, { status: 500 });
  }
}