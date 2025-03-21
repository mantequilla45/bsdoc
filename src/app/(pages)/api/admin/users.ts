// /pages/api/admin/users.ts
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from 'next';
import { ProfileUser, UserListResponse } from '@/types/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserListResponse | { error: string }>
) {
  if (req.method === 'GET') {
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

      // 2. Fetch Users (with Pagination - Example)
      const { data: users, error: usersError, count } = await supabase
        .from('profiles') // Adjust if you need data from other tables
        .select('*', { count: 'exact' })
        .range(0, 9); // Example: Fetch first 10 users

      if (usersError) {
        return res.status(500).json({ error: "Error fetching users" });
      }

      // 3. Calculate Pagination Metadata (Example)
      const page = 1; // Example: Assuming first page
      const limit = 10; // Example: 10 users per page
      const total = count || 0;
      const pages = Math.ceil(total / limit);

      const pagination = {
        page,
        limit,
        total,
        pages,
      };

      // 4. Return Response
      return res.status(200).json({ data: users as ProfileUser[], pagination });
    } catch (error) {
      console.error("Error in /api/admin/users:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}