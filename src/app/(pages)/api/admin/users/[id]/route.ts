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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    // Validate admin access
    const validation = await validateAdminAccess(req);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    // Check if user exists before deletion
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user
    const { error: deleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}