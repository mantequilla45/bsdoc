'use client';

import React from 'react';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';

type Availability = {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
};

type AvailabilityTableProps = {
  availability: Availability[];
  editingAvailability: string | null;
  handleEditAvailability: (avail: Availability) => void;
  handleDeleteAvailability: (id: string) => void;
  cancelEdit: () => void;
};

export default function AvailabilityTable({
  availability,
  editingAvailability,
  handleEditAvailability,
  handleDeleteAvailability,
}: AvailabilityTableProps) {
  // Format day of week to look nicer
  const formatDayOfWeek = (day: string) => {
    const days: Record<string, string> = {
      "monday": "Monday",
      "tuesday": "Tuesday",
      "wednesday": "Wednesday",
      "thursday": "Thursday",
      "friday": "Friday",
      "saturday": "Saturday",
      "sunday": "Sunday",
      "1": "Monday",
      "2": "Tuesday",
      "3": "Wednesday",
      "4": "Thursday",
      "5": "Friday",
      "6": "Saturday",
      "0": "Sunday"
    };

    return days[day.toLowerCase()] || day;
  };

  // Format time to display without spaces between time and AM/PM
  const formatTime = (timeString: string) => {
    const date = new Date(`2000-01-01T${timeString}`);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes}${ampm}`;
  };

  // Get days of week in correct order starting with Monday
  const sortedAvailability = [...availability].sort((a, b) => {
    const dayOrder: Record<string, number> = {
      'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
      'friday': 5, 'saturday': 6, 'sunday': 7,
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '0': 7
    };

    const dayA = a.day_of_week.toLowerCase();
    const dayB = b.day_of_week.toLowerCase();

    return (dayOrder[dayA] || 0) - (dayOrder[dayB] || 0);
  });

  return (
    <div className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="py-3 px-4 text-left font-normal">Day</th>
            <th className="py-3 px-4 text-left font-normal">Start</th>
            <th className="py-3 px-4 text-left font-normal">End</th>
            <th className="py-3 px-4 text-left font-normal">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedAvailability.map((avail) => (
            <tr key={avail.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-sm font-medium text-gray-800">
                {formatDayOfWeek(avail.day_of_week)}
              </td>
              <td className="py-3 px-4 text-sm text-gray-700">
                {formatTime(avail.start_time)}
              </td>
              <td className="py-3 px-4 text-sm text-gray-700">
                {formatTime(avail.end_time)}
              </td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  {editingAvailability === avail.id ? (
                    <>
                      <div className="w-8 h-8" />
                      <div className="w-8 h-8" />
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditAvailability(avail)}
                        className="flex items-center justify-center rounded-full w-8 h-8 bg-[#c6efff] text-[#286d74] hover:bg-[#bae0f0] transition-colors duration-300"
                        title="Edit"
                      >
                        <MdModeEditOutline className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAvailability(avail.id)}
                        className="flex items-center justify-center rounded-full w-8 h-8 bg-[#ffcaca] text-red-700 hover:bg-[#ffaeae] transition-colors duration-300"
                        title="Delete"
                      >
                        <MdDeleteForever className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {sortedAvailability.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-500">
                No slots created.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}