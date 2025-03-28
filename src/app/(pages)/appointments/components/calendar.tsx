"use client"

import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// TypeScript interface for events
interface AppointmentEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: 'Scheduled' | 'Confirmed' | 'Completed';
}

const localizer = momentLocalizer(moment);

const DoctorSchedule: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [events, setEvents] = useState<AppointmentEvent[]>([
    {
      id: '1',
      title: 'John Doe - Checkup',
      start: new Date(2024, 2, 15, 10, 0),
      end: new Date(2024, 2, 15, 11, 0),
      status: 'Scheduled'
    },
    {
      id: '2', 
      title: 'Jane Smith - Consultation',
      start: new Date(2024, 2, 16, 14, 0),
      end: new Date(2024, 2, 16, 15, 0),
      status: 'Confirmed'
    }
  ]);

  // Custom event styling
  const eventStyleGetter = (event: AppointmentEvent) => {
    let backgroundColor = '#3174ad';
    if (event.status === 'Scheduled') backgroundColor = '#ffc107';
    if (event.status === 'Confirmed') backgroundColor = '#28a745';
    if (event.status === 'Completed') backgroundColor = '#17a2b8';

    return {
      style: {
        backgroundColor,
        borderRadius: '0px',
        opacity: 0.8,
        color: 'white',
        border: 'none'
      }
    };
  };

  // Handle selecting an event
  const handleSelectEvent = (event: AppointmentEvent) => {
    alert(`Selected Event: ${event.title}\nStatus: ${event.status}`);
    // You can add more complex logic here like opening a modal
  };

  return (
    <div style={{ height: '600px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ margin: '50px' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        views={['month', 'week', 'day']}
      />
    </div>
  );
};

export default DoctorSchedule;