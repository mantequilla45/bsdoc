export interface ProfileUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    profile_image_url?: string | null;
}