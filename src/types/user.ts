// Base profile type that extends Supabase User
export interface ProfileUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

// Extended profile with total users count for listing
export interface ProfileUserWithMeta extends ProfileUser {
  totalUsers?: number;
}

// New user creation payload
export interface NewUser {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}

// Pagination result type
export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// API response types
export interface UserListResponse {
  data: ProfileUser[];
  pagination: PaginationResult;
  error?: string;
}

export interface UserResponse {
  data: ProfileUser;
  error?: string;
}