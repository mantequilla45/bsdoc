// src\app\(pages)\appointment-page\page.tsx
'use client';

import Image from 'next/image';
import Header from '@/app/layout/header'; // Assuming Header is responsive or handled separately
import { useState, useEffect } from 'react';
//import { useRouter } from 'next/navigation'; // Not used currently
import { supabase } from '@/lib/supabaseClient';
import { Loader } from 'lucide-react'; // Added Loader for consistency
import DoctorAvailabilityOverview from './components/DoctorAvailabilityOverview';

// Define proper types (keep as is)
interface Doctor {
  id: string;
  specialization: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

type TimeSlot = string;
interface UserProfile {
  id: string;
  role: string | null;
}

const AppointmentPage = () => {
  // --- State variables remain the same ---
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  // const [bookedTimes, setBookedTimes] = useState<TimeSlot[]>([]); // bookedTimes not used in UI logic, removing for clarity unless needed later
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingStatus, setBookingStatus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); // Combined loading state
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false); // Specific loading for availability
  const [error, setError] = useState<string>('');
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  // const router = useRouter();

  // --- useEffect hooks for fetching data remain largely the same ---
  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true); // Start initial loading
      setError('');
      let fetchedUserProfile: UserProfile | null = null;

      // 1. Get User Session and Profile
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (profileError) console.warn("Could not fetch user profile:", profileError.message);
          fetchedUserProfile = { id: session.user.id, role: profile?.role || null };
        } else {
          fetchedUserProfile = null;
        }
        setCurrentUserProfile(fetchedUserProfile);

        // 2. Fetch Doctors
        let apiUrl = '/api/doctors';
        if (fetchedUserProfile?.role === 'doctor') {
          apiUrl = `/api/doctors?exclude_doctor_id=${fetchedUserProfile.id}`;
        }

        const token = session?.access_token;
        const headers: HeadersInit = { 'Content-Type': 'application/json' }; // Ensure content-type
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(apiUrl, { headers });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch doctors, invalid response.' })); // Graceful JSON parse fail
          throw new Error(errorData.error || 'Failed to fetch doctors');
        }
        const data = await response.json();
        setDoctors(data.data || []);

      } catch (err) {
        console.error("Initialization Error:", err);
        setError(err instanceof Error ? `Error: ${err.message}` : 'An unknown error occurred');
        setCurrentUserProfile(null);
        setDoctors([]);
      } finally {
        setIsLoading(false); // Finish initial loading
      }
    };
    initializePage();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      setAvailableTimes([]); // Reset on change
      setSelectedTime('');  // Reset selected time when date/doctor changes
      if (selectedDoctorId && selectedDate) {
        setIsLoadingAvailability(true); // Start availability loading
        setError('');
        try {
          const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
          // Add session token to availability fetch if required by your API
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          const headers: HeadersInit = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const response = await fetch(
            `/api/availability?doctor_id=${selectedDoctorId}&day_of_week=${dayOfWeek}&selected_date=${selectedDate}`,
            { headers }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to fetch availability, invalid response.' }));
            throw new Error(errorData.error || 'Failed to fetch availability');
          }
          const data = await response.json();
          setAvailableTimes(data?.data?.timeSlots || []);
          // setBookedTimes(data?.data?.bookedTimes || []); // Uncomment if needed
        } catch (error) {
          console.error(error);
          setError('Error loading available times');
          setAvailableTimes([]); // Clear on error
        } finally {
          setIsLoadingAvailability(false); // End availability loading
        }
      }
    };
    fetchAvailability();
  }, [selectedDoctorId, selectedDate]);

  // --- handleBooking function remains the same ---
  const handleBooking = async () => {
    if (!currentUserProfile?.id) {
      setError("Please log in to book an appointment.");
      alert("Please log in to book an appointment."); // Add alert for clarity
      return;
    }

    if (selectedDoctorId && selectedTime && selectedDate) {
      setIsLoading(true); // Use main loading state for booking action
      setBookingStatus('');
      setError('');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('User not authenticated');
        const token = session.access_token;
        const appointment_time = selectedTime.split('-')[0]; // Get start time

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
        if (!response.ok) throw new Error(data.error || data.details || 'Failed to book appointment');

        setBookingStatus('Appointment booked successfully!');
        // Reset form fully
        setSelectedTime('');
        setSelectedDate('');
        setSelectedDoctorId('');
        setAvailableTimes([]);

      } catch (error) {
        console.error(error);
        const errorMsg = error instanceof Error ? error.message : String(error);
        setError(`Booking failed: ${errorMsg}`);
        setBookingStatus(''); // Clear booking status on error
      } finally {
        setIsLoading(false);
      }
    } else {
      const missing = [
        !selectedDoctorId ? 'Doctor' : null,
        !selectedDate ? 'Date' : null,
        !selectedTime ? 'Time Slot' : null
      ].filter(Boolean).join(', ');
      const errorMsg = `Please select all required fields. Missing: ${missing}`;
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  // --- Loading State for Initial Load ---
  if (isLoading && doctors.length === 0) { // Show full page loader only on initial data fetch
    return (
      <div className="bg-[#C3EFEB] min-h-screen flex items-center justify-center">
        <Loader className="h-16 w-16 animate-spin text-[#62B6B8]" />
      </div>
    );
  }

  return (
    <div className="bg-[#C3EFEB] min-h-screen pt-[150px]">
      <Header background="white" title="Book Appointment" /> {/* Changed title */}

      {/* Use fixed background */}
      <div className="fixed inset-0 z-[10]">
        <Image
          src="/graphics/searchpage.svg"
          alt="background"
          layout="fill"
          objectFit="cover"
          priority
          quality={75}
        />
      </div>

      {/* Responsive Content Area */}
      {/* Added padding-top to account for fixed header height */}
      <main className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-16">
        {/* Flex container for layout - stacks on mobile, row on large screens */}
        <div className='flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-8 md:gap-12'>

          <div className='w-full lg:w-1/2 h-full'>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-regular leading-tight">
              Find A <span className="text-[#64B5B7]">Doctor</span> And Book an Appointment
            </h1>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full z-20 -mt-10 -mb-5"
              viewBox="0 0 300 50"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M5 30 C 70 70, 230 -10, 295 30"
                stroke="#E97A73"
                strokeWidth="4"
                fill="transparent"
              />
            </svg>

            <div className="border-2 border-[#64B5B7] rounded-lg p-4 sm:p-6 w-full bg-white shadow-lg">
              <DoctorAvailabilityOverview/>
            </div>

            <div className="border-2 border-[#64B5B7] rounded-lg p-4 sm:p-6 w-full bg-white shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Book your appointment</h2>

              {/* Error and Status Messages */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                  {error}
                </div>
              )}
              {bookingStatus && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-sm">
                  {bookingStatus}
                </div>
              )}

              {/* Form Inputs: Stacks on mobile, row on tablet+ */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
                {/* Calendar Picker */}
                <div className='w-full sm:w-auto'>
                  <label htmlFor="appointment-date" className="sr-only">Date</label>
                  <input
                    id="appointment-date"
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border rounded-md p-2.5 w-full focus:ring-2 focus:ring-[#62B6B8] text-sm"
                    disabled={isLoading} // Disable during main load
                  />
                </div>

                {/* Doctor Dropdown */}
                <div className='w-full sm:flex-1'>
                  <label htmlFor="doctor-select" className="sr-only">Select Doctor</label>
                  <select
                    id="doctor-select"
                    className="border rounded-md p-2.5 w-full focus:ring-2 focus:ring-[#62B6B8] text-sm appearance-none bg-white pr-8" // Added appearance-none
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    disabled={isLoading || doctors.length === 0} // Disable during main load or if no doctors
                  >
                    <option value="">Select a Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.profiles.first_name} {doctor.profiles.last_name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                  {/* Dropdown arrow styling might be needed */}
                </div>

                {/* Submit Button */}
                <button
                  className="bg-[#62B6B8] text-white px-5 py-2.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto transition-colors hover:bg-[#55a3a5]"
                  onClick={handleBooking}
                  disabled={isLoading || isLoadingAvailability || !selectedDoctorId || !selectedDate || !selectedTime} // Disable during any loading or if fields missing
                >
                  {isLoading ? 'Processing...' : 'Book Now'}
                </button>
              </div>

              {/* Time Slots Display */}
              {selectedDoctorId && selectedDate && (
                <div className="mt-4">
                  <h3 className="text-md font-medium mb-2 text-gray-700">Available Time Slots:</h3>
                  {isLoadingAvailability ? (
                    <div className="flex items-center text-sm text-gray-500">
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Loading available times...
                    </div>
                  ) : availableTimes.length > 0 ? (
                    // Responsive Grid for time slots
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {availableTimes.map((timeSlot) => (
                        // const isBooked = bookedTimes.includes(timeSlot); // If bookedTimes is used
                        <button
                          key={timeSlot}
                          className={`p-2 text-xs sm:text-sm border rounded transition-colors duration-150 ${selectedTime === timeSlot
                            ? 'bg-[#62B6B8] text-white border-[#62B6B8]'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-[#e0f5f5] hover:border-[#a1d7d8]'
                            }`}
                          onClick={() => setSelectedTime(timeSlot)}
                        // Consider adding disabled state for booked times if needed
                        >
                          {timeSlot.split('-')[0]} {/* Show only start time */}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No available times found for this doctor on the selected date.</p>
                  )}
                </div>
              )}

              {/* Selected Appointment Summary (optional, good UX) */}
              {selectedDoctorId && selectedDate && selectedTime && (
                <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-md">
                  <h3 className="text-md font-medium mb-1 text-teal-800">Your Selection:</h3>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-teal-700 gap-1 sm:gap-4">
                    <span>
                      <span className="font-medium">Doctor:</span>{' '}
                      {doctors.find((d) => d.id === selectedDoctorId)?.profiles.first_name}{' '}
                      {doctors.find((d) => d.id === selectedDoctorId)?.profiles.last_name}
                    </span>
                    <span><span className="font-medium">Date:</span> {selectedDate}</span>
                    <span><span className="font-medium">Time:</span> {selectedTime.split('-')[0]}</span>
                  </div>
                </div>
              )}
            </div>



          </div>

          <div className='hidden lg:flex w-full lg:w-1/2 items-center justify-center mt-8 lg:mt-0'>
            <Image
              src="/graphics/appointment.svg"
              alt="Doctor and patient discussing appointment"
              width={600}
              height={600}
              className="max-w-full h-auto -mt-16 -mr-16"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppointmentPage;