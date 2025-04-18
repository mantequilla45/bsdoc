// src\app\(pages)\doctors\doctor-schedule\components\Calendar.tsx
'use client';

import React from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';

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

type CalendarProps = {
  appointments: Appointment[];
  selectedMonth: number;
  selectedYear: number;
  changeMonth: (direction: 'next' | 'prev') => void;
  onAppointmentClick: (appointment: Appointment) => void;
};

export default function Calendar({ appointments, selectedMonth, selectedYear, changeMonth, onAppointmentClick }: CalendarProps) {
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

  const calendarDays = generateCalendarDays();

  return (
    <div className="shadow-md h-full lg:w-3/4 w-full">

      <div className="bg-gradient-to-r md:from-teal-400 md:to-teal-500 from-teal-500 to-teal-600 text-white py-4 px-8">
        <h2 className="font-semibold">Calendar</h2>
      </div>
      <div className="p-5 space-y-5">

        <CalendarHeader
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          changeMonth={changeMonth}
        />
        <CalendarGrid calendarDays={calendarDays} onAppointmentClick={onAppointmentClick}/>
      </div>
    </div>
  );
}