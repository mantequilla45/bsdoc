'use client';

import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { ProfileUser, Appointment, Availability } from './components/types';
import Calendar from './components/Calendar';
import AvailabilityManagement from './components/AvailabilityManagement';
import Footer from '@/app/layout/footer';
import { useRouter } from 'next/navigation';

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
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [user, setUser] = useState<ProfileUser | null>(null);

  // State for editing availability
  const [editingAvailability, setEditingAvailability] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    start_time: '',
    end_time: ''
  });

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("No session found:", sessionError);
        console.log("Error: ", error);
        setError("Not authenticated");
        // Redirect to login page
        router.push('/'); // Adjust the login route as needed
        return;
      }
      setLoading(false);
    };
    fetchUserRole();
  }, [router, error]); // Added error to dependency array

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


  const fetchDoctorSchedule = async () => {
    if (!user) {
      return; // Don't fetch if we don't have user yet
    }
    try {
      // Fetch doctor's ID based on user
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('id', user.id)
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

  // Fetch doctor's schedule
  useEffect(() => {
    fetchDoctorSchedule();
  }, [user]);

  // Navigation for month/year
  const changeMonth = (direction: 'next' | 'prev') => {
    const newDate = new Date(
      selectedYear,
      selectedMonth + (direction === 'next' ? 1 : -1)
    );
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  // Handle adding new availability
  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) {
      console.error('Doctor ID not available');
      return;
    }
    try {
      const response = await fetch('/api/availability', {
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

    await fetchDoctorSchedule();
  };

  // Handle editing availability
  const handleEditAvailability = (avail: Availability) => {
    setEditingAvailability(avail.id);
    setEditForm({
      start_time: avail.start_time,
      end_time: avail.end_time
    });
  };

  // Handle updating availability
  const handleUpdateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAvailability) {
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Not Authenticated.');
      }

      const response = await fetch(`/api/doctors/availability/${editingAvailability}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          start_time: editForm.start_time,
          end_time: editForm.end_time
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      // Update the state with the updated availability
      setAvailability(availability.map(avail =>
        avail.id === editingAvailability
          ? { ...avail, start_time: editForm.start_time, end_time: editForm.end_time }
          : avail
      ));

      // Reset the editing state
      setEditingAvailability(null);

      await fetchDoctorSchedule();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingAvailability(null);
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete availability');
      }

      // Update state to remove the deleted availability
      setAvailability(availability.filter((avail) => avail.id !== id));

      await fetchDoctorSchedule();
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  if (loading) {
    return;
  }

  return (
    <div className="flex flex-col">
      <div className="w-full min-h-screen">
        <main className="flex-grow overflow-hidden bg-white flex lg:flex-row flex-col">
          <Calendar
            appointments={appointments}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            changeMonth={changeMonth}
          />
          <AvailabilityManagement
            availability={availability}
            editingAvailability={editingAvailability}
            editForm={editForm}
            setEditForm={setEditForm}
            newAvailability={newAvailability}
            setNewAvailability={setNewAvailability}
            handleEditAvailability={handleEditAvailability}
            handleUpdateAvailability={handleUpdateAvailability}
            handleDeleteAvailability={handleDeleteAvailability}
            handleAddAvailability={handleAddAvailability}
            cancelEdit={cancelEdit}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
}
