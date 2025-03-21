'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/services/Auth/auth';
import { supabase } from '@/lib/supabaseClient';

// Define proper types
interface Doctor {
    id: string;
    specialization: string;
    profiles: {
        first_name: string;
        last_name: string;
    };
}

interface TimeSlot {
    id: string;
    start_time: string;
}

const TestBookingPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [bookingStatus, setBookingStatus] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch doctors
        const fetchDoctors = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await fetch('/api/doctors');
                if (!response.ok) {
                    throw new Error('Failed to fetch doctors');
                }
                const data = await response.json();
                setDoctors(data.data || []);
            } catch (error) {
                console.error(error);
                setError('Error loading doctors');
            } finally {
                setIsLoading(false);
            }
        };

        // Get current user
        const getCurrentUser = async () => {
            setIsLoading(true);
            setError('');
            try {
                const user = await getUser();
                if (user) {
                    setCurrentUserId(user.id);
                } else {
                    // Redirect to login or show error if no user
                    router.push('/'); // Or your login page
                }
            } catch (error) {
                console.error(error);
                setError('Error loading user');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctors();
        getCurrentUser();
    }, [router]);

    useEffect(() => {
        // Fetch availability
        const fetchAvailability = async () => {
            if (selectedDoctorId && selectedDate) {
                setIsLoading(true);
                setError('');
                try {
                    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                    });
                    const response = await fetch(
                        `/api/availability?doctor_id=${selectedDoctorId}&day_of_week=${dayOfWeek}`
                    );
                    if (!response.ok) {
                        throw new Error('Failed to fetch availability');
                    }
                    const data = await response.json();
                    setAvailableTimes(data.data || []);
                } catch (error) {
                    console.error(error);
                    setError('Error loading available times');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setAvailableTimes([]);
            }
        };

        fetchAvailability();
    }, [selectedDoctorId, selectedDate]);

    const handleBooking = async () => {
        if (selectedDoctorId && selectedTime && selectedDate && currentUserId) {
            setIsLoading(true);
            setBookingStatus('');
            setError('');
    
            try {
                // Get the current session token
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session) {
                    throw new Error('User not authenticated');
                }
    
                const token = session.access_token;
    
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        doctor_id: selectedDoctorId,
                        appointment_date: selectedDate,
                        appointment_time: selectedTime,
                    }),
                });
    
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(data.error || data.details || 'Failed to book appointment');
                }
    
                setBookingStatus('Appointment booked successfully!');
                setSelectedTime('');
            } catch (error) {
                console.error(error);
                setError(`Error: ${error instanceof Error ? error.message : String(error)}`);
                setBookingStatus('Error booking appointment.');
            } finally {
                setIsLoading(false);
            }
        } else {
            setError('Please select all required fields');
        }
    };

    // Get today's date in YYYY-MM-DD format for the date input min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Appointment Booking</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {/* Removed Patient Selection */}

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Select a Doctor</h2>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedDoctorId}
                            onChange={(e) => setSelectedDoctorId(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">-- Select a Doctor --</option>
                            {doctors && doctors.length > 0 && doctors.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.profiles.first_name} {doctor.profiles.last_name} -{' '}
                                    {doctor.specialization}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Select a Date</h2>
                        <input
                            className="w-full p-2 border rounded"
                            type="date"
                            min={today}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {selectedDoctorId && selectedDate && (
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Available Times</h2>
                            {isLoading ? (
                                <p>Loading available times...</p>
                            ) : availableTimes && availableTimes.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {availableTimes.map((timeSlot) => (
                                        <button
                                            key={timeSlot.id}
                                            className={`p-2 border rounded ${
                                                selectedTime === timeSlot.start_time
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white'
                                            }`}
                                            onClick={() => setSelectedTime(timeSlot.start_time)}
                                        >
                                            {timeSlot.start_time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p>No available times.</p>
                            )}
                        </div>
                    )}

                    {selectedDoctorId && currentUserId && selectedDate && selectedTime && (
                        <div className="mt-6 p-4 border rounded bg-gray-50">
                            <h2 className="text-xl font-semibold mb-2">Confirm Booking</h2>
                            <div className="space-y-2 mb-4">
                                <p>
                                    <span className="font-medium">Doctor:</span>{' '}
                                    {
                                        doctors.find((doctor) => doctor.id === selectedDoctorId)
                                            ?.profiles.first_name
                                    }{' '}
                                    {
                                        doctors.find((doctor) => doctor.id === selectedDoctorId)
                                            ?.profiles.last_name
                                    }
                                </p>
                                <p><span className="font-medium">Date:</span> {selectedDate}</p>
                                <p><span className="font-medium">Time:</span> {selectedTime}</p>
                            </div>
                            <button
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:bg-gray-400"
                                onClick={handleBooking}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Booking...' : 'Book Appointment'}
                            </button>
                            {bookingStatus && (
                                <p className={`mt-2 ${bookingStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                                    {bookingStatus}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestBookingPage;