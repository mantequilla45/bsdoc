// Create folder: src/app/(pages)/doctors/complete-profile/components/
// Create file: src/app/(pages)/doctors/complete-profile/components/CompleteProfileForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
// Assuming you have standard input/textarea or adjust as needed
// import { InputField, TextareaField } from '@/app/components';
import toast, { Toaster } from 'react-hot-toast';

interface DoctorProfileData {
    specialization: string;
    bio: string;
    clinic_name: string;
    clinic_address: string;
    license_number: string;
    years_of_experience: number | '';
}

export default function ProfileForm() {
    const router = useRouter();
    const [formData, setFormData] = useState<DoctorProfileData>({
        specialization: '', bio: '', clinic_name: '', clinic_address: '', license_number: '', years_of_experience: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setInitialLoading(true); setError(null);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) { router.push('/'); return; }

                const response = await fetch('/api/doctors/profile', { // Call the GET endpoint
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                const result = await response.json();

                if (!response.ok) { throw new Error(result.error || `HTTP error! status: ${response.status}`); }

                if (result.data) {
                    if (result.data.is_profile_complete) {
                        toast.success("Profile already completed.", { duration: 2000 });
                        router.replace('/doctors/doctor-schedule'); // Use replace to avoid back button going here
                        return;
                    }
                    // Pre-fill form if data exists but incomplete
                    setFormData({
                        specialization: result.data.specialization || '', bio: result.data.bio || '',
                        clinic_name: result.data.clinic_name || '', clinic_address: result.data.clinic_address || '',
                        license_number: result.data.license_number || '', years_of_experience: result.data.years_of_experience ?? '',
                    });
                } else {
                    console.log(result.message || "No existing profile data found, starting fresh.");
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError(err instanceof Error ? err.message : "Error loading profile data.");
                toast.error(`Error loading profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError(null);
        const submitToastId = toast.loading('Updating profile...');

        if (formData.years_of_experience === '' || formData.years_of_experience < 0) {
            setError('Years of experience must be a non-negative number.'); setLoading(false);
            toast.error('Years of experience is invalid.', { id: submitToastId }); return;
        }
        if (Object.values(formData).some(val => val === '')) {
             setError('All fields are required.'); setLoading(false);
             toast.error('Please fill in all fields.', { id: submitToastId }); return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
             if (!session) { throw new Error("Authentication error"); }

            const response = await fetch('/api/doctors/profile', { // Call the PUT endpoint
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
            router.push('/doctors/doctor-schedule'); // Redirect after successful update

        } catch (err) {
            console.error("Error submitting profile:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            toast.error(`Update failed: ${err instanceof Error ? err.message : 'Unknown error'}`, { id: submitToastId });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="flex justify-center items-center h-40">Loading profile form...</div>;
    }

    // Replace inputs/textarea with your actual InputField/TextareaField if available, or use standard HTML
    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 border border-gray-200">
             <Toaster position="top-center" reverseOrder={false} />
            <h2 className="text-2xl font-semibold mb-6 text-center text-[#1BA391]">Complete Your Doctor Profile</h2>
            {error && <p className="text-red-500 text-center mb-4 p-3 bg-red-50 rounded border border-red-200">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
}