// /pages/api/admin/users/[id].ts
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from 'next';
import { ProfileUser, UserResponse } from '@/types/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserResponse | { error: string }>
) {
  const { id } = req.query;

  // Check if id is a valid string
  if (typeof id !== 'string') {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    // 1. Authenticate and Authorize
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Assuming you have a 'role' column in your profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profileData || profileData.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (req.method === 'GET') {
      // 2. GET User by ID
      const { data: user, error: userError } = await supabase
        .from('profiles') // Adjust if you need data from other tables
        .select('*')
        .eq('id', id)
        .single();

      if (userError) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ data: user as ProfileUser });
    } else if (req.method === 'PUT') {
      // 3. PUT (Update) User
      const { email, first_name, last_name, role } = req.body;

      // Basic validation - enhance as needed
      if (!email || !role) {
        return res.status(400).json({ error: "Email and role are required" });
      }

      const { data: updatedUser, error: updateUserError } = await supabase
        .from('profiles') // Adjust if you need to update other tables
        .update({ email, first_name, last_name, role })
        .eq('id', id)
        .select('*')
        .single();

      if (updateUserError) {
        return res.status(500).json({ error: "Error updating user" });
      }

      return res.status(200).json({ data: updatedUser as ProfileUser });
    } else if (req.method === 'DELETE') {
      // 4. DELETE User
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(id);

      if (deleteUserError) {
        return res.status(500).json({ error: "Error deleting user" });
      }

      return res.status(200).json({ data: {} as ProfileUser }); // Or a success message
    } else {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error in /api/admin/users/[id]:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}