'use client';

import React from 'react';
import AddAvailabilityForm from './AddAvailabilityForm';

type AddAvailabilityProps = {
  newAvailability: {
    day_of_week: string;
    start_time: string;
    end_time: string;
  };
  setNewAvailability: React.Dispatch<React.SetStateAction<{
    day_of_week: string;
    start_time: string;
    end_time: string;
  }>>;
  handleAddAvailability: (e: React.FormEvent) => Promise<void>;
};

export default function AddAvailability({
  newAvailability,
  setNewAvailability,
  handleAddAvailability
}: AddAvailabilityProps) {
  return (
    <div>
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 px-8">
        <h2 className="font-semibold">Add Slots</h2>
      </div>
      <AddAvailabilityForm
        newAvailability={newAvailability}
        setNewAvailability={setNewAvailability}
        handleAddAvailability={handleAddAvailability}
      />
    </div>
  );
}