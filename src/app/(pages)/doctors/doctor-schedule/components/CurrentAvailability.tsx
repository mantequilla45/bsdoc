'use client';

import React from 'react';
import AvailabilityTable from './AvailabilityTable';
import EditAvailabilityForm from './EditAvailabilityForm';

type Availability = {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
};

type CurrentAvailabilityProps = {
  availability: Availability[];
  editingAvailability: string | null;
  editForm: {
    start_time: string;
    end_time: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    start_time: string;
    end_time: string;
  }>>;
  handleEditAvailability: (avail: Availability) => void;
  handleUpdateAvailability: (e: React.FormEvent) => Promise<void>;
  handleDeleteAvailability: (id: string) => void;
  cancelEdit: () => void;
};

export default function CurrentAvailability({
  availability,
  editingAvailability,
  editForm,
  setEditForm,
  handleEditAvailability,
  handleUpdateAvailability,
  handleDeleteAvailability,
  cancelEdit
}: CurrentAvailabilityProps) {
  return (
    
    <div className="shadow-md md:min-h-[50%] w-full">
      
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 px-8">
        <h2 className="font-semibold">My Schedule</h2>
      </div>
      <AvailabilityTable
        availability={availability}
        editingAvailability={editingAvailability}
        handleEditAvailability={handleEditAvailability}
        handleDeleteAvailability={handleDeleteAvailability}
        cancelEdit={cancelEdit}
      />

      {/* Edit Form */}
      {editingAvailability && (
        <EditAvailabilityForm
          editForm={editForm}
          setEditForm={setEditForm}
          handleUpdateAvailability={handleUpdateAvailability}
          cancelEdit={cancelEdit}
        />
      )}
    </div>
  );
}