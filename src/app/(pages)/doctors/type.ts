// src\app\(pages)\doctors\type.ts
export interface DoctorProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone_number: string | null;
    role: string | null;
    profile_image_url: string | null;
  }
  
  export interface Doctor {
    id: string;
    specialization: string | null;
    bio: string | null;
    clinic_name: string | null;
    clinic_address: string | null;
    license_number: string | null;
    years_of_experience: number | null;
    is_profile_complete: boolean | null;
    profiles: DoctorProfile | null; // Assuming the join returns a single profile object
    availableDays?: string[];
  }