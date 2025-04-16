// Create folder: src/app/(pages)/account/components/ (or similar location)
// Create file: src/app/(pages)/account/components/EditDoctorProfileForm.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

// Interface for the form data
interface DoctorProfileData {
    specialization: string;
    bio: string;
    clinic_name: string;
    clinic_address: string;
    license_number: string;
    years_of_experience: number | '';
}

export default function EditDoctorProfileForm() {
    const router = useRouter();
    const [formData, setFormData] = useState<DoctorProfileData>({
        specialization: '', bio: '', clinic_name: '', clinic_address: '', license_number: '', years_of_experience: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);

    // Fetch existing profile data on mount
    const fetchProfile = useCallback(async () => {
        setInitialLoading(true); setError(null);
        console.log('[EditDoctorProfile] Fetching profile data...');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/'); return; }

            const response = await fetch('/api/doctors/profile', { // Use the GET endpoint
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const result = await response.json();
            console.log('[EditDoctorProfile] Profile data fetched:', result);


            if (!response.ok) { throw new Error(result.error || `HTTP error! status: ${response.status}`); }

            if (result.data) {
                // Pre-fill form with existing data
                setFormData({
                    specialization: result.data.specialization || '',
                    bio: result.data.bio || '',
                    clinic_name: result.data.clinic_name || '',
                    clinic_address: result.data.clinic_address || '',
                    license_number: result.data.license_number || '',
                    years_of_experience: result.data.years_of_experience ?? '', // Handle null/undefined
                });
            } else {
                 console.error("[EditDoctorProfile] No doctor data found for logged-in user.");
                 setError("Could not load your doctor profile data. Please contact support if this persists.");
                 toast.error("Failed to load profile data.");
                 // Optionally redirect if profile doesn't exist when it should
                 // router.push('/doctors/doctor-schedule');
            }
        } catch (err) {
            console.error("[EditDoctorProfile] Error fetching profile:", err);
            setError(err instanceof Error ? err.message : "An error occurred while loading profile data.");
            toast.error(`Error loading profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setInitialLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]); // Add other dependencies if needed, though router should be stable


    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]); // Fetch on mount


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError(null);
        const submitToastId = toast.loading('Saving changes...');

        // Validation (same as before)
        if (formData.years_of_experience === '' || formData.years_of_experience < 0) {
            setError('Years of experience must be a non-negative number.'); setLoading(false);
            toast.error('Years of experience is invalid.', { id: submitToastId }); return;
        }
        // Check if any field important for editing is empty (adjust if some fields are optional)
        if (!formData.specialization || !formData.bio || !formData.clinic_name || !formData.clinic_address || !formData.license_number) {
             setError('Please fill in all required fields.'); setLoading(false);
             toast.error('Please fill in all required fields.', { id: submitToastId }); return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
             if (!session) { throw new Error("Authentication error"); }

            // Send PUT request to the *same* endpoint
            const response = await fetch('/api/doctors/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ ...formData, years_of_experience: Number(formData.years_of_experience) }),
            });

            const result = await response.json();
            if (!response.ok) { throw new Error(result.error || `HTTP error! status: ${response.status}`); }

            toast.success('Profile updated successfully!', { id: submitToastId });
            // Optionally refetch data after update or just show success
            // fetchProfile(); // Refetch to show saved data immediately
            // No need to redirect usually from an edit form, just show success

        } catch (err) {
            console.error("Error submitting profile update:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred while saving.");
            toast.error(`Update failed: ${err instanceof Error ? err.message : 'Unknown error'}`, { id: submitToastId });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="flex justify-center items-center h-40">Loading profile...</div>;
    }

    // Use standard HTML or your own InputField/TextareaField components
    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
             <Toaster position="top-center" reverseOrder={false} />
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Edit Doctor Profile</h2>
            {error && <p className="text-red-500 text-center mb-4 p-3 bg-red-50 rounded border border-red-200">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
                 {/* Form fields - same as CompleteProfileForm */}
                 <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input type="text" name="specialization" id="specialization" value={formData.specialization} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                 </div>
                 <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio / Professional Statement</label>
                    <textarea name="bio" id="bio" value={formData.bio} onChange={handleChange} rows={4} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                 </div>
                 <div>
                    <label htmlFor="clinic_name" className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                    <input type="text" name="clinic_name" id="clinic_name" value={formData.clinic_name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                 </div>
                 <div>
                    <label htmlFor="clinic_address" className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
                    <textarea name="clinic_address" id="clinic_address" value={formData.clinic_address} onChange={handleChange} rows={3} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                 </div>
                  <div>
                    <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <input type="text" name="license_number" id="license_number" value={formData.license_number} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                 </div>
                 <div>
                    <label htmlFor="years_of_experience" className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input type="number" name="years_of_experience" id="years_of_experience" value={formData.years_of_experience} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                 </div>

                <button type="submit" disabled={loading || initialLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1BA391] hover:bg-[#157c6f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1BA391] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out">
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}