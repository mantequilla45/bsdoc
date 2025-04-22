// src/app/(pages)/appointment-page/components/DoctorAvailabilityOverview.tsx (or similar path)
'use client';

import React, { useState, useEffect } from 'react';
// Import the Doctor type - adjust path as needed
import { Doctor } from '../../doctors/type'; 

const DoctorAvailabilityOverview: React.FC = () => {
    const [doctorsWithAvailability, setDoctorsWithAvailability] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDoctorSchedules = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch from the endpoint that already includes availableDays
                const response = await fetch('/api/doctors'); 
                if (!response.ok) {
                    throw new Error(`Failed to fetch doctors. Status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Overview Raw Fetched Data:", data); 
                if (data && Array.isArray(data.data)) {
                    // Filter for doctors who have listed available days, if desired
                    // const filteredDoctors = data.data.filter(doc => doc.availableDays && doc.availableDays.length > 0);
                    // setDoctorsWithAvailability(filteredDoctors);
                    setDoctorsWithAvailability(data.data); // Or show all fetched doctors
                } else {
                    setDoctorsWithAvailability([]);
                    setError("Received unexpected data format.");
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred';
                console.error("Error fetching doctor schedules:", err);
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctorSchedules();
    }, []); // Fetch once on component mount

    if (loading) {
        return <div className="p-4 text-gray-600">Loading doctor schedules...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">Error loading schedules: {error}</div>;
    }

    return (
        <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Doctor Schedule Overview</h2>
            
            {doctorsWithAvailability.length === 0 ? (
                 <p className="text-gray-500">No doctor schedules found or available.</p>
            ) : (
                <div className="space-y-4">
                    {doctorsWithAvailability.map((doctor, index) => { //eslint-disable-line
                        // console.log(`Overview Map [${index}] - Doctor Object:`, doctor);
                        // console.log(`Overview Map [${index}] - Available Days:`, doctor?.availableDays);
                        
                        return (
                        doctor.profiles ? ( // Ensure profile exists
                            <div key={doctor.id} className="flex flex-col sm:flex-row items-start sm:items-center p-3 border-b last:border-b-0">
                                <img
                                    src={doctor.profiles.profile_image_url || '/default-profile.png'}
                                    alt={`Dr. ${doctor.profiles.first_name || ''} ${doctor.profiles.last_name || ''}`}
                                    className="h-14 w-14 rounded-full object-cover mr-4 mb-2 sm:mb-0 flex-shrink-0"
                                     onError={(e) => { (e.target as HTMLImageElement).src = '/default-profile.png'; }}
                                />
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-800">
                                        Dr. {doctor.profiles.first_name} {doctor.profiles.last_name}
                                    </p>
                                    <p className="text-sm text-teal-600">{doctor.specialization || 'N/A'}</p>
                                </div>
                                <div className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0 sm:w-1/3 text-sm text-gray-600 text-left sm:text-right">
                                     <span className="font-medium">Available Days:</span> <br/>
                                     {doctor.availableDays && doctor.availableDays.length > 0 
                                        ? ` ${doctor.availableDays.join(', ')}` 
                                        : ' Not Set'}
                                </div>
                            </div>
                        ) : null // Skip rendering if profile data is missing
                    )})}
                </div>
            )}
        </div>
    );
};

export default DoctorAvailabilityOverview;