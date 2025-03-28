// app/doctor/schedule/page.tsx
'use client';

import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
//import { useSession } from '@/services/Auth/middleware'; // Import useSession (or similar)
import { ProfileUser } from '@/types/user'; // Import ProfileUser type

// Define types for our data
type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  patient: {
    first_name: string;
    last_name: string;
  };
};

type Availability = {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
};

//eslint-disable-next-line
type CalendarEvent = {
  date: string;
  title: string;
  status: string;
};

export default function DoctorSchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [newAvailability, setNewAvailability] = useState({
    day_of_week: '',
    start_time: '',
    end_time: ''
  });
  const [doctorId, setDoctorId] = useState<string | null>(null); // State for doctor's ID
  //const session = useSession(); // Get session - adjust based on your auth implementation
  const [user, setUser] = useState<ProfileUser | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { user: userData }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error getting user:", error);
        return;
      }

      if (userData) {
        // Fetch the user's profile to get the role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.id)
          .single();

        if (profileError || !profileData) {
          console.error('Error fetching profile:', profileError);
          return;
        }
        setUser(profileData);
      }
    };
    getSession();
  }, []);

  // Fetch doctor's schedule
  useEffect(() => {
    const fetchDoctorSchedule = async () => {
      if (!user) {
        return; // Don't fetch if we don't have user yet
      }
      try {
        // Fetch doctor's ID based on user
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('id')
          .eq('id', user.id) // Use 'id' from profiles table
          .single();

        if (doctorError || !doctorData) {
          console.error('Error fetching doctor profile:', doctorError);
          return;
        }

        const fetchedDoctorId = doctorData.id;
        setDoctorId(fetchedDoctorId);

        // Fetch appointments and availability using doctorId
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*, patient:profiles(*)')
          .eq('doctor_id', fetchedDoctorId)
          .gte('appointment_date', new Date().toISOString().split('T')[0])
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true });

        if (appointmentsError) {
          console.error('Error fetching appointments:', appointmentsError);
        } else {
          setAppointments(appointmentsData || []);
        }

        const { data: availabilityData, error: availabilityError } = await supabase
          .from('availability')
          .select('*')
          .eq('doctor_id', fetchedDoctorId);

        if (availabilityError) {
          console.error('Error fetching availability:', availabilityError);
        } else {
          setAvailability(availabilityData || []);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchDoctorSchedule();
  }, [user]); //  Depend on user

  // Generate calendar days for the selected month
  const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

    // Pad with empty days at the start
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(selectedYear, selectedMonth, i); //eslint-disable-line

      // Fix: Create date string in YYYY-MM-DD format without timezone conversion
      const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

      // Find appointments for this date
      const dayAppointments = appointments.filter(
        (appt) => appt.appointment_date === dateString
      );

      days.push({
        date: dateString,
        day: i,
        appointments: dayAppointments,
      });
    }

    return days;
  };

  // Handle adding new availability
  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) {
      console.error('Doctor ID not available');
      return;
    }
    try {
      const response = await fetch('/api/availability', { // Correct API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          day_of_week: newAvailability.day_of_week,
          start_time: newAvailability.start_time,
          end_time: newAvailability.end_time,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add availability');
      }

      const data = await response.json();
      setAvailability([...availability, data.data]);

      // Reset form
      setNewAvailability({
        day_of_week: '',
        start_time: '',
        end_time: '',
      });
    } catch (error) {
      console.error('Error adding availability:', error);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this availability?')) {
      return;
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Not Authenticated.');
      }

      const response = await fetch(`/api/doctors/availability/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': `application/json`,
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete availability');
      }

      // Update state to remove the deleted availability
      setAvailability(availability.filter((avail) => avail.id !== id));
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  // Navigation for month/year
  const changeMonth = (direction: 'next' | 'prev') => {
    const newDate = new Date(
      selectedYear,
      selectedMonth + (direction === 'next' ? 1 : -1)
    );
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Doctor Schedule Management</h1>

      {/* Calendar View */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => changeMonth('prev')}
            className="bg-gray-200 p-2 rounded"
          >
            Previous
          </button>
          <h2 className="text-xl font-semibold">
            {new Date(selectedYear, selectedMonth).toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </h2>
          <button
            onClick={() => changeMonth('next')}
            className="bg-gray-200 p-2 rounded"
          >
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="font-bold bg-gray-100 p-2">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`border p-2 min-h-[100px] ${day ? 'bg-white' : 'bg-gray-50'
                }`}
            >
              {day && (
                <>
                  <div className="font-bold">{day.day}</div>
                  {day.appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className={`mt-1 p-1 rounded ${appt.status === 'booked'
                          ? 'bg-blue-200'
                          : appt.status === 'cancelled'
                            ? 'bg-red-200'
                            : appt.status === 'completed'
                              ? 'bg-green-200'
                              : 'bg-gray-200'
                        }`}
                    >
                      {appt.appointment_time} -{' '}
                      {appt.patient?.first_name}{' '}
                      {appt.patient?.last_name || 'Patient'} {/* Modified: Display Name */}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Availability Management */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Current Availability */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Current Availability</h2>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Day</th>
                <th className="p-2">Start Time</th>
                <th className="p-2">End Time</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {availability.map((avail) => (
                <tr key={avail.id}>
                  <td className="p-2 border">{avail.day_of_week}</td>
                  <td className="p-2 border">{avail.start_time}</td>
                  <td className="p-2 border">{avail.end_time}</td>
                  <td className="p-2 border">
                    {/* Add Delete Button */}
                    <button
                      onClick={() => handleDeleteAvailability(avail.id)}
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Availability Form */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Add Availability</h2>
          <form onSubmit={handleAddAvailability} className="space-y-4">
            <div>
              <label className="block mb-2">Day of Week</label>
              <select
                value={newAvailability.day_of_week}
                onChange={(e) =>
                  setNewAvailability({
                    ...newAvailability,
                    day_of_week: e.target.value,
                  })
                }
                className="w-full p-2 border"
                required
              >
                <option value="">Select Day</option>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (day) => <option key={day} value={day}>{day}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block mb-2">Start Time</label>
              <input
                type="time"
                value={newAvailability.start_time}
                onChange={(e) =>
                  setNewAvailability({
                    ...newAvailability,
                    start_time: e.target.value,
                  })
                }
                className="w-full p-2 border"
                required
              />
            </div>
            <div>
              <label className="block mb-2">End Time</label>
              <input
                type="time"
                value={newAvailability.end_time}
                onChange={(e) =>
                  setNewAvailability({
                    ...newAvailability,
                    end_time: e.target.value,
                  })
                }
                className="w-full p-2 border"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Add Availability
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}