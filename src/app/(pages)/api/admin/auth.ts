// pages/api/admin/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}

export async function adminAuthMiddleware(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) {
  // Get the token from the request headers
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    // Verify the token with Supabase
    const { data: user, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.user.id)
      .single();
      
    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Add user to request object for future use
    req.user = user.user;
    
    // Continue to the actual API handler
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to wrap API handlers with the admin auth middleware
export function withAdminAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve) => {
      adminAuthMiddleware(req, res, () => {
        return handler(req, res).then(resolve);
      });
    });
  };
}