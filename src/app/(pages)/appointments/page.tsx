// src/app/(pages)/appointments/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; //
import Footer from '@/app/layout/footer'; // Assuming default export
import Header from '@/app/layout/header';

// Define a type for the appointment data expected on this page
// We need doctor details here
type UserAppointment = {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: 'booked' | 'cancelled' | 'completed' | string; // Allow other statuses if needed
    created_at: string;
    is_hidden_by_patient: boolean;
    doctor: {
        // Assuming 'doctors' table has these fields joined from 'profiles'
        id: string; // Doctor's ID (from doctors table)
        specialization?: string;
        profiles: {
            first_name: string | null;
            last_name: string | null;
            profile_image_url?: string | null;
            // Add other profile fields if needed
        } | null; // profiles might be null if join fails or no profile exists
    } | null; // doctor itself might be null
    // Add other fields if needed from your 'appointments' table
};

export default function UserAppointmentsPage() {
    const [appointments, setAppointments] = useState<UserAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null); //eslint-disable-line
    const router = useRouter();

    const [showCancelled, setShowCancelled] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null); // Track cancelling state

    const [hidingId, setHidingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserAndAppointments = async () => {
            setLoading(true);
            setError(null);

            // 1. Get User Session and ID
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session?.user) {
                console.error("Authentication Error:", sessionError);
                setError("You must be logged in to view appointments.");
                setLoading(false);
                // Optional: Redirect to login after a delay
                // setTimeout(() => router.push('/'), 2000);
                return;
            }
            const currentUserId = session.user.id;
            setUserId(currentUserId);

            // 2. Fetch Appointments for the User
            try {
                const token = session.access_token;
                // Call your existing API endpoint, filtering by patient_id
                // The API route already handles joining doctor/profile data
                const response = await fetch(`/api/appointments?patient_id=${currentUserId}&include_hidden=false`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Cache-Control': 'no-cache, no-store',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Failed to fetch appointments (status: ${response.status})`);
                }

                const responseData = await response.json();
                console.log("Fetched Appointments:", responseData.data);

                // Sort appointments by date and time (newest first)
                const sortedAppointments = (responseData.data || []).sort((a: UserAppointment, b: UserAppointment) => {
                    const dateComparison = new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime();
                    if (dateComparison !== 0) return dateComparison;
                    // If dates are the same, sort by time
                    return b.appointment_time.localeCompare(a.appointment_time);
                });

                const visibleAppointments = sortedAppointments.filter(
                    (appt: UserAppointment) => !appt.is_hidden_by_patient
                );

                setAppointments(visibleAppointments);

            } catch (fetchError) {
                console.error("Error fetching appointments:", fetchError);
                setError(fetchError instanceof Error ? fetchError.message : "Could not load appointments.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndAppointments();
    }, [router]); // Dependency on router for potential redirect

    // Memoize filtered appointments based on the showCancelled state
    const filteredAppointments = useMemo(() => {
        if (showCancelled) {
            return appointments; // Show all if toggle is on
        }
        // Filter out cancelled ones if toggle is off
        return appointments.filter(appt => appt.status !== 'cancelled');
    }, [appointments, showCancelled]);

    // --- Function to Handle Cancellation ---
    const handleCancelAppointment = async (appointmentId: string) => {
        if (!window.confirm("Are you sure you want to cancel this appointment? The doctor will be notified.")) {
            return;
        }
        setCancellingId(appointmentId); // Set loading state for this specific button
        setError(null); // Clear previous errors

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (sessionError || !token) {
                throw new Error("Authentication error. Please log in again.");
            }

            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'cancelled' }) // Send cancel status
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to cancel appointment');
            }

            const updatedAppointment = await response.json(); //eslint-disable-line

            // Update the state to reflect the cancellation
            setAppointments(prevAppointments =>
                prevAppointments.map(appt =>
                    appt.id === appointmentId
                        ? { ...appt, status: 'cancelled' } // Update status locally
                        : appt
                )
            );
            alert("Appointment cancelled successfully."); // Feedback

        } catch (cancelError) {
            console.error("Error cancelling appointment:", cancelError);
            setError(cancelError instanceof Error ? cancelError.message : "Could not cancel appointment.");
            alert(`Cancellation failed: ${cancelError instanceof Error ? cancelError.message : 'Unknown error'}`); // Show error alert
        } finally {
            setCancellingId(null); // Reset loading state for the button
        }
    };

    // --- Function to Handle Removing Cancelled Appointment from List ---
    const handleRemoveFromList = async (appointmentId: string) => {
        // Optional: Confirm before removing
        // if (!window.confirm("Remove this cancelled appointment from the list? This action only hides it for this session.")) {
        //     return;
        // }
        console.log("Removing appointment ID from list:", appointmentId);
        setHidingId(appointmentId);
        setError(null);

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (sessionError || !token) {
                throw new Error("Authentication error. Please log in again.");
            }

            // Call the new API endpoint to mark as hidden
            const response = await fetch(`/api/appointments/${appointmentId}/hide`, {
                method: 'PATCH', // Use PATCH
                headers: {
                    'Authorization': `Bearer ${token}`
                    // No body needed if the endpoint only does one thing (hides)
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to hide appointment');
            }

            // Success: Remove from local state for immediate feedback
            console.log("Hiding appointment ID from list:", appointmentId);
            setAppointments(prevAppointments =>
                prevAppointments.filter(appt => appt.id !== appointmentId)
            );
            alert("Appointment hidden from list."); // Feedback

            console.log("API response for hiding:", await response.json());

        } catch (hideError) {
            console.error("Error hiding appointment:", hideError);
            setError(hideError instanceof Error ? hideError.message : "Could not hide appointment.");
            alert(`Error: ${hideError instanceof Error ? hideError.message : 'Could not hide appointment.'}`);
        } finally {
            setHidingId(null); // Reset loading state
        }
        router.refresh();
        // Filter the appointment out of the main state array
        // setAppointments(prevAppointments =>
        //     prevAppointments.filter(appt => appt.id !== appointmentId)
        // );
        // Note: This does not delete from the database. Refreshing the page
        // without persistent storage for hidden items would bring it back.
    };

    // Helper function to format date/time (customize as needed)
    const formatDateTime = (dateStr: string, timeStr: string) => {
        try {
            const date = new Date(`${dateStr}T${timeStr}`);
            return date.toLocaleString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
            });
        } catch {
            return `${dateStr} ${timeStr}`; // Fallback
        }
    };

    // Helper function to get status color
    const getStatusClass = (status: string): string => {
        switch (status?.toLowerCase()) {
            case 'booked': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800 line-through'; // Add line-through for cancelled
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };


    return (
        <div className="overflow-x-hidden bg-[#EEFFFE]">
            <Header background="#EEFFFE" title="Scheduled Appointments" />
            <div className="max-w-[1300px] mx-auto min-h-screen md:pt-[100px] pt-[100px] justify-start md:flex-col">
                <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-800">
                        My Appointments
                    </h1>

                    {/* --- Loading / Error / Empty States --- */}
                    {loading && <div className="text-center py-10 text-gray-600">Loading appointments...</div>}
                    {!loading && error && <div className="text-center text-red-600 bg-red-100 border border-red-400 p-4 rounded-md max-w-md mx-auto mb-6">Error: {error}</div>}

                    {/* --- Filter Toggle --- */}
                    {!loading && !error && appointments.length > 0 && (
                        <div className="flex justify-center items-center mb-6">
                            <label htmlFor="showCancelledToggle" className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        id="showCancelledToggle"
                                        className="sr-only"
                                        checked={showCancelled}
                                        onChange={() => setShowCancelled(!showCancelled)}
                                    />
                                    <div className={`block w-10 h-6 rounded-full transition ${showCancelled ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${showCancelled ? 'translate-x-full' : ''}`}></div>
                                </div>
                                <div className="ml-3 text-gray-700 text-sm font-medium">
                                    Show Cancelled Appointments
                                </div>
                            </label>
                        </div>
                    )}


                    {/* --- Appointments List --- */}
                    {!loading && !error && filteredAppointments.length === 0 && appointments.length > 0 && (
                        <div className="text-center text-gray-500 mt-6">
                            <p>All cancelled appointments are hidden.</p>
                        </div>
                    )}
                    {!loading && !error && filteredAppointments.length === 0 && appointments.length === 0 && (
                        <div className="text-center text-gray-500 mt-6">
                            <p>You have no scheduled appointments.</p>
                        </div>
                    )}

                    {!loading && !error && filteredAppointments.length > 0 && (
                        <div className="space-y-5 max-w-3xl mx-auto">
                            {filteredAppointments.map((appt) => {
                                const doctorProfile = appt.doctor?.profiles;
                                const doctorName = doctorProfile ? `Dr. ${doctorProfile.first_name || ''} ${doctorProfile.last_name || ''}`.trim() : 'Doctor details unavailable';
                                const statusClass = getStatusClass(appt.status);
                                const isCancellable = appt.status === 'booked'; // Define if cancellable
                                const isCancelled = appt.status === 'cancelled';
                                // Optional: Add time check - const isPast = new Date(`${appt.appointment_date}T${appt.appointment_time}`) < new Date();

                                return (
                                    <div key={appt.id} className={`bg-white relative p-5 rounded-lg shadow-md border-l-4 md:h-[120px] h-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${appt.status === 'cancelled' ? 'border-red-300' : appt.status === 'completed' ? 'border-green-400' : 'border-blue-400'}`}>
                                        {/* Appointment Info */}
                                        <div className="flex-grow h-full ">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                                                <h2 className="text-lg font-semibold text-black mb-1 sm:mb-0">
                                                    {doctorName}
                                                </h2>
                                            </div>
                                            <p className="text-gray-700 text-sm mb-1">
                                                <span className="font-medium">Time:</span> {formatDateTime(appt.appointment_date, appt.appointment_time)}
                                            </p>
                                            {appt.doctor?.specialization && (
                                                <p className="text-gray-600 text-xs">
                                                    <span className="font-medium">Specialization:</span> {appt.doctor.specialization}
                                                </p>
                                            )}
                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full absolute top-5 right-5 ${statusClass}`}>
                                                {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                                            </span>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex flex-col justify-end h-full">
                                            {isCancellable && ( // Only show Cancel button if applicable
                                                <button
                                                    onClick={() => handleCancelAppointment(appt.id)}
                                                    disabled={cancellingId === appt.id} // Disable while this specific one is cancelling
                                                    className={`px-3 py-1.5 text-xs font-medium rounded ${cancellingId === appt.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:ring-opacity-50'} text-white transition-colors duration-150`}
                                                >
                                                    {cancellingId === appt.id ? 'Cancelling...' : 'Cancel Appointment'}
                                                </button>
                                            )}
                                            {/* Add Delete button if needed later for cancelled appointments */}
                                            {isCancelled && (
                                                <button
                                                    onClick={() => handleRemoveFromList(appt.id)}
                                                    disabled={hidingId === appt.id} // Disable while hiding this specific one
                                                    className={`px-3 py-1.5 text-xs font-medium rounded ${hidingId === appt.id ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-400 hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50'} text-white transition-colors duration-150`}
                                                    title="Remove this cancelled appointment from your list"
                                                >
                                                    {hidingId === appt.id ? 'Removing...' : 'Remove from List'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}