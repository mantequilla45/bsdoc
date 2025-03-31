'use client';

import React from 'react';
import CurrentAvailability from './CurrentAvailability';
import AddAvailability from './AddAvailability';

type Availability = {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
};

type AvailabilityManagementProps = {
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
  handleEditAvailability: (avail: Availability) => void;
  handleUpdateAvailability: (e: React.FormEvent) => Promise<void>;
  handleDeleteAvailability: (id: string) => void;
  handleAddAvailability: (e: React.FormEvent) => Promise<void>;
  cancelEdit: () => void;
};

export default function AvailabilityManagement({
  availability,
  editingAvailability,
  editForm,
  setEditForm,
  newAvailability,
  setNewAvailability,
  handleEditAvailability,
  handleUpdateAvailability,
  handleDeleteAvailability,
  handleAddAvailability,
  cancelEdit
}: AvailabilityManagementProps) {
  return (
    <div className="flex flex-col lg:w-1/4">
      {/* Current Availability */}
      <CurrentAvailability
        availability={availability}
        editingAvailability={editingAvailability}
        editForm={editForm}
        setEditForm={setEditForm}
        handleEditAvailability={handleEditAvailability}
        handleUpdateAvailability={handleUpdateAvailability}
        handleDeleteAvailability={handleDeleteAvailability}
        cancelEdit={cancelEdit}
      />

      {/* Add Availability Form */}
      <AddAvailability
        newAvailability={newAvailability}
        setNewAvailability={setNewAvailability}
        handleAddAvailability={handleAddAvailability}
      />
    </div>
  );
}
