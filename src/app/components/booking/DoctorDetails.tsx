// src/app/components/DoctorDetails.tsx
import React, { useState, useEffect } from 'react';
//import { useRouter } from 'next/navigation';
import AvailabilityCalendar from './AvailabilityCalendar';

interface Doctor {
    id: string;
    profiles: {
        first_name: string;
        last_name: string;
    };
    specialization: string;
    bio: string;
}

const DoctorDetails: React.FC<{ doctorId: string }> = ({ doctorId }) => {
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null); // Date string in YYYY-MM-DD format

    useEffect(() => {
        const fetchDoctor = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/doctors/${doctorId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch doctor details');
                }
                const data = await response.json();
                setDoctor(data.data || null);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error has occurred';
                console.log(err)
                setError(errorMessage || 'Could not book appointment');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [doctorId]);

    if (loading) {
        return <div>Loading doctor details...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!doctor) {
        return <div>Doctor not found</div>;
    }

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
    };

    return (
        <div>
            <h2>{doctor.profiles.first_name} {doctor.profiles.last_name}</h2>
            <p>Specialization: {doctor.specialization}</p>
            <p>Bio: {doctor.bio}</p>

            <AvailabilityCalendar doctorId={doctor.id} onDateSelect={handleDateSelect} />

            {selectedDate && (
                <div>
                    <h3>Available Times on {selectedDate}</h3>
                    {/* Display available times fetched from API based on doctorId and selectedDate */}
                    {/* You'll need to create a component or logic to fetch and display these */}
                </div>
            )}
        </div>
    );
};

export default DoctorDetails;