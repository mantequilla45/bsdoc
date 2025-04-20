export interface Medication {
    name: string;
    dose: string;
}

export interface Surgery {
    name: string;
    year: number;
}

export interface MedicalDetail {
    age: number;
    allergies: string[];
    blood_type: string;
    conditions: string[];
    height: number;
    id: string;
    medications: Medication[];
    surgeries: Surgery[];
    user_id: string;
    weight: number;
}

export interface Record {
    date: string;
    weight: number;
    symptoms: string[];
    health_conditions: string[];
}

export interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    created_at: string;
    updated_at: string;
    role: string;
    profile_image_url?: string;
    address?: string; // Make it optional if it's not always required
}