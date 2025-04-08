// "use client";  

// import Image from 'next/image';
// import Header from "@/app/layout/header";
// import { useState } from 'react';

// const AppointmentPage = () => {
//     const [date, setDate] = useState('');
//     const [time, setTime] = useState('');

//     return (
//         <div className="bg-[#C3EFEB] min-h-screen">
//             <Header background="white" title="Account" />

//             <div className="relative min-h-screen flex justify-center items-center">
//                 {/* SVG background */}
//                 <div className="absolute inset-0 z-0 h-[100%]">
//                     <Image
//                         src="/graphics/searchpage.svg"
//                         alt="background"
//                         layout="fill"
//                         objectFit="cover"
//                         priority
//                     />
//                 </div>

//                 <div className='flex flex-col z-[1] gap-3 items-center'>
//                     {/* Heading Section */}
//                     <div className='flex flex-row'>
//                         <div className='flex flex-col mr-[50px] gap-10'>
//                             <div className="relative mt-[250px] mr-[100px] flex flex-col text-center">
//                                 <h1 className="text-6xl my-[10px] mr-[100px] font-regular">
//                                     Find A <span className="text-[#64B5B7]">Doctor</span> And
//                                 </h1>

//                                 {/* Curve under "Book an Appointment" */}
//                                 <div className="relative inline-block">
//                                     <h1 className='text-6xl font-regular'>Book an Appointment</h1>
//                                     <svg xmlns="http://www.w3.org/2000/svg" 
//                                          className="absolute left-1/2 -translate-x-1/2 mt-1 ml-[120px]"
//                                          width="410" 
//                                          height="50" 
//                                          viewBox="0 0 300 20" 
//                                          fill="none">
//                                         <path d="M5 10 C 70 50, 230 -40, 295 10" 
//                                               stroke="#E97A73" 
//                                               strokeWidth="4" 
//                                               fill="transparent"/>
//                                     </svg>
//                                 </div>
//                             </div>

//                             {/* Appointment Form Section */}
//                             <div className="border-2 border-[#64B5B7] my-[50px] rounded-lg p-6 w-full max-w-4xl bg-white shadow-md">
//                                 <h2 className="text-lg font-semibold mb-4">Book your appointment</h2>

//                                 <div className="flex flex-row items-center justify-between gap-4">
//                                     {/* Calendar & Time Picker */}
//                                     <input
//                                         type="date"
//                                         value={date}
//                                         onChange={(e) => setDate(e.target.value)}
//                                         className="border rounded-md p-3 w-1/4 focus:ring-2 focus:ring-[#62B6B8]"
//                                     />

//                                     <input
//                                         type="time"
//                                         value={time}
//                                         onChange={(e) => setTime(e.target.value)}
//                                         className="border rounded-md p-3 w-1/34 focus:ring-2 focus:ring-[#62B6B8]"
//                                     />

//                                     {/* Dropdowns */}
//                                     <select className="border rounded-md p-3 w-1/34">
//                                         <option>Name of Doctor</option>
//                                     </select>

//                                     {/* Submit Button */}
//                                     <button className="bg-[#62B6B8] text-white px-6 py-3 rounded-md">
//                                         Submit
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>

//                         <Image
//                             src="/graphics/appointment.svg"
//                             alt="appointment graphics"
//                             width='850'
//                             height='850'
//                         />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AppointmentPage;

// code above for reference on previous layout

// src\app\(pages)\appointment-page\page.tsx
'use client';

import Image from 'next/image';
import Header from '@/app/layout/header';
import { useState, useEffect } from 'react';
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

type TimeSlot = string; // e.g., "14:00-14:30"

const AppointmentPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [bookedTimes, setBookedTimes] = useState<TimeSlot[]>([]);
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
    // Fetch availability when doctor and date are selected
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
            setBookedTimes(data.data.bookedTimes || []);
          } else {
            setAvailableTimes([]);
            setBookedTimes([]);
          }
        } catch (error) {
          console.error(error);
          setError('Error loading available times');
        } finally {
          setIsLoading(false);
        }
      } else {
        setAvailableTimes([]);
        setBookedTimes([]);
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

        // Reset form after successful booking
        setSelectedDate('');
        setSelectedDoctorId('');
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
    <div className="bg-[#C3EFEB] min-h-screen">
      <Header background="white" title="Account" />

      <div className="relative min-h-screen flex justify-center items-center">
        {/* SVG background */}
        <div className="absolute inset-0 z-0 h-full">
          <Image
            src="/graphics/searchpage.svg"
            alt="background"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>

        <div className='flex flex-col z-[1] gap-3 items-center'>
          {/* Heading Section */}
          <div className='flex flex-row'>
            <div className='flex flex-col mr-[50px] gap-10'>
              <div className="relative mt-[250px] mr-[100px] flex flex-col text-center">
                <h1 className="text-6xl my-[10px] mr-[100px] font-regular">
                  Find A <span className="text-[#64B5B7]">Doctor</span> And
                </h1>

                {/* Curve under "Book an Appointment" */}
                <div className="relative inline-block">
                  <h1 className='text-6xl font-regular'>Book an Appointment</h1>
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-1/2 -translate-x-1/2 mt-1 ml-[120px]"
                    width="410"
                    height="50"
                    viewBox="0 0 300 20"
                    fill="none">
                    <path d="M5 10 C 70 50, 230 -40, 295 10"
                      stroke="#E97A73"
                      strokeWidth="4"
                      fill="transparent" />
                  </svg>
                </div>
              </div>

              {/* Appointment Form Section */}
              <div className="border-2 border-[#64B5B7] my-[50px] rounded-lg p-6 w-full bg-white shadow-md max-w-[700px]">
                <h2 className="text-lg font-semibold mb-4">Book your appointment</h2>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {error}
                  </div>
                )}

                {bookingStatus && (
                  <div className={`mb-4 px-4 py-3 rounded text-sm ${bookingStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {bookingStatus}
                  </div>
                )}

                <div className="flex flex-row items-center justify-between gap-4 mb-4">
                  {/* Calendar Picker */}
                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border rounded-md p-3 w-1/4 focus:ring-2 focus:ring-[#62B6B8]"
                    disabled={isLoading}
                  />

                  {/* Doctor Dropdown */}
                  <select
                    className="border rounded-md p-3 flex-1 focus:ring-2 focus:ring-[#62B6B8]"
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Select a Doctor</option>
                    {doctors && doctors.length > 0 && doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.profiles.first_name} {doctor.profiles.last_name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>

                  {/* Submit Button */}
                  <button
                    className="bg-[#62B6B8] text-white px-6 py-3 rounded-md disabled:bg-gray-400"
                    onClick={handleBooking}
                    disabled={isLoading || !selectedDoctorId || !selectedDate || !selectedTime}
                  >
                    {isLoading ? 'Processing...' : 'Book Now'}
                  </button>
                </div>

                {/* Time Slots Display */}
                {selectedDoctorId && selectedDate && (
                  <div className="mt-4">
                    <h3 className="text-md font-medium mb-2">Available Time Slots:</h3>
                    {isLoading ? (
                      <p className="text-sm text-gray-600">Loading available times...</p>
                    ) : availableTimes && availableTimes.length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                        {availableTimes.map((timeSlot) => {
                          const isBooked = bookedTimes.includes(timeSlot);
                          return (
                            <button
                              key={timeSlot}
                              className={`p-2 text-sm border rounded ${selectedTime === timeSlot
                                  ? 'bg-[#62B6B8] text-white'
                                  : 'bg-white'
                                } ${isBooked
                                  ? 'opacity-50 cursor-not-allowed bg-gray-200'
                                  : 'hover:bg-[#C3EFEB]'
                                }`}
                              disabled={isBooked}
                              onClick={isBooked ? undefined : () => setSelectedTime(timeSlot)}
                            >
                              {timeSlot}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No available times for this doctor on the selected date.</p>
                    )}
                  </div>
                )}

                {/* Selected Appointment Summary */}
                {selectedDoctorId && selectedDate && selectedTime && (
                  <div className="mt-4 p-3 bg-[#F0FFFE] border border-[#64B5B7] rounded-md">
                    <h3 className="text-md font-medium mb-1">Your Appointment:</h3>
                    <div className="grid grid-cols-3 text-sm">
                      <div>
                        <span className="font-medium">Doctor:</span>{' '}
                        {doctors.find((d) => d.id === selectedDoctorId)?.profiles.first_name}{' '}
                        {doctors.find((d) => d.id === selectedDoctorId)?.profiles.last_name}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {selectedDate}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {selectedTime}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Image
              src="/graphics/appointment.svg"
              alt="appointment graphics"
              width={850}
              height={850}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;