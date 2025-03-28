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

// Changed TimeSlot interface to reflect 30-minute slots (strings)
type TimeSlot = string; // e.g., "14:00-14:30"

const TestBookingPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]); // Now an array of strings
    const [bookedTimes, setBookedTimes] = useState<TimeSlot[]>([]); // New state to track booked times
    const [selectedTime, setSelectedTime] = useState<string>(''); // Still a string, but now a slot
    const [bookingStatus, setBookingStatus] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch doctors - No changes needed here
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

        // Get current user - No changes needed here
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
        // Fetch availability - Modified to handle 30-minute slots and booked times
        const fetchAvailability = async () => {
            if (selectedDoctorId && selectedDate) {
                setIsLoading(true);
                setError('');
                try {
                    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                    });
                    const response = await fetch(
                        `/api/availability?doctor_id=${selectedDoctorId}&day_of_week=${dayOfWeek}&selected_date=${selectedDate}`
                    );
                    if (!response.ok) {
                        throw new Error('Failed to fetch availability');
                    }
                    const data = await response.json();

                    // Extract timeSlots and bookedTimes
                    if (data.data) {
                        setAvailableTimes(data.data.timeSlots || []);
                        setBookedTimes(data.data.bookedTimes || []); // New line to set booked times
                    } else {
                        setAvailableTimes([]); 
                        setBookedTimes([]); // Reset booked times
                    }

                } catch (error) {
                    console.error(error);
                    setError('Error loading available times');
                } finally {
                    setIsLoading(false);
                }
            } else {
                setAvailableTimes([]);
                setBookedTimes([]); // Reset booked times
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

                // Extract appointment_time from selectedTime
                const appointment_time = selectedTime.split('-')[0];

                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        doctor_id: selectedDoctorId,
                        appointment_date: selectedDate,
                        appointment_time: appointment_time,
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
                                    {availableTimes.map((timeSlot) => {
                                        const isBooked = bookedTimes.includes(timeSlot);
                                        return (
                                            <button
                                                key={timeSlot}
                                                className={`p-2 border rounded ${
                                                    selectedTime === timeSlot
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white'
                                                } ${
                                                    isBooked 
                                                        ? 'opacity-50 cursor-not-allowed bg-gray-200' 
                                                        : 'hover:bg-blue-100'
                                                }`}
                                                disabled={isBooked}
                                                onClick={isBooked ? () => {} : () => setSelectedTime(timeSlot)}
                                            >
                                                {timeSlot}
                                            </button>
                                        );
                                    })}
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