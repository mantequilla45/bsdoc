// src\app\(pages)\doctors\doctor-schedule\components\CalendarGrid.tsx
'use client';

import React from 'react';

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

type CalendarDay = {
  date: string;
  day: number;
  appointments: Appointment[];
} | null;

type CalendarGridProps = {
  calendarDays: CalendarDay[];
  onAppointmentClick: (appointment: Appointment) => void;
};

export default function CalendarGrid({ calendarDays, onAppointmentClick }: CalendarGridProps) {
  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-800',
          hover: 'hover:bg-blue-200'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-100',
          border: 'border-red-300',
          text: 'text-red-800',
          hover: 'hover:bg-red-200'
        };
      case 'completed':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          text: 'text-green-800',
          hover: 'hover:bg-green-200'
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-800',
          hover: 'hover:bg-gray-200'
        };
    }
  };

  // Always ensure we have exactly 6 weeks (42 days) displayed
  // This makes the calendar height consistent across months
  const normalizedCalendarDays = [...calendarDays];

  // If we have fewer than 42 days, add null days to fill the grid
  if (normalizedCalendarDays.length < 42) {
    const additionalDays = 42 - normalizedCalendarDays.length;
    for (let i = 0; i < additionalDays; i++) {
      normalizedCalendarDays.push(null);
    }
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md ">
      <div className="grid grid-cols-7 bg-gray-700 text-white">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-3 text-white text-center">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6 gap-[1px] bg-gray-200 h-full">
        {normalizedCalendarDays.map((day, index) => (
          <div
            key={index}
            className={`${day ? 'bg-white hover:bg-gray-50 transition-colors' : 'bg-gray-100'
              } p-0 relative`}
          >
            {day && (
              <>
                <div className="flex justify-between items-center p-2 border-b border-gray-100">
                  <span className={`rounded-full w-7 h-7 text-sm flex items-center justify-center ${new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6
                      ? 'bg-gray-200 text-gray-700'
                      : 'text-gray-700'
                    }`}>
                    {day.day}
                  </span>
                  {day.appointments.length > 0 && (
                    <span className="text-xs font-medium bg-gray-200 text-gray-700 rounded-full px-2 py-0.5">
                      {day.appointments.length}
                    </span>
                  )}
                </div>
                <div className="p-1 overflow-y-auto md:min-h-[80px] min-h-[50px] scrollbar-thin">
                  {day.appointments.map((appt) => {
                    const statusColors = getAppointmentStatusColor(appt.status);
                    return (
                      <div
                        key={appt.id}
                        onClick={() => onAppointmentClick(appt)}
                        title={`Click to view/cancel appointment with ${appt.patient?.first_name} ${appt.patient?.last_name} at ${appt.appointment_time}`} // Add title for hover info
                        className={`p-2 rounded text-xs border ${statusColors.bg} ${statusColors.border} ${statusColors.text} ${appt.status !== 'cancelled' ? 'cursor-pointer hover:shadow-md hover:border-teal-400 transition-all duration-150' + statusColors.hover : 'cursor-not-allowed opacity-70'} `} // Make it clear it's clickable, disable for cancelled
                        //className={`mt-1 p-2 rounded text-xs border ${statusColors.bg} ${statusColors.border} ${statusColors.text} cursor-pointer hover:shadow-sm transition-shadow`}
                      >
                        <div className="font-medium">
                          {appt.appointment_time}
                        </div>
                        <div className="truncate">
                          {appt.patient?.first_name} {appt.patient?.last_name || 'Patient'}
                          {appt.status === 'cancelled' && <span className="ml-1 font-bold">(Cancelled)</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}