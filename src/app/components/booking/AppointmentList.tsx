// src/app/components/AppointmentList.tsx
'use client'
import React, { useState, useEffect } from 'react';

interface Appointment {
    id: string;
    doctor: {
        profiles: {
            first_name: string;
            last_name: string;
        };
    };
    appointment_date: string;
    appointment_time: string;
    status: string;
}

const AppointmentList: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]); // Fixed: Changed to array type
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            setError(null);

            try {
                // Assuming you have a way to get the current user's ID
                const userId = 'YOUR_USER_ID'; // Replace with actual user ID retrieval
                const response = await fetch(`/api/appointments?patient_id=${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch appointments');
                }
                const data = await response.json();
                setAppointments(data.data || []); // Fixed: Added empty array as fallback
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error has occurred.'
                console.log(err);
                setError(errorMessage || 'Could not fetch appointments');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []); // Fixed: Added empty dependency array

    if (loading) {
        return <div>Loading appointments...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>My Appointments</h2>
            {appointments.length > 0 ? (
                <ul>
                    {appointments.map((appointment) => (
                        <li key={appointment.id}>
                            {appointment.doctor.profiles.first_name} {appointment.doctor.profiles.last_name}
                            - {appointment.appointment_date} {appointment.appointment_time}
                            - Status: {appointment.status}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No appointments found.</p>
            )}
        </div>
    );
};

export default AppointmentList;