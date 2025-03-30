'use client';

import React from 'react';
import { FaCheck, FaClock } from 'react-icons/fa6';
import { TbCancel } from 'react-icons/tb';
import { AnimatePresence, motion } from 'framer-motion';

type EditAvailabilityFormProps = {
  editForm: {
    start_time: string;
    end_time: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    start_time: string;
    end_time: string;
  }>>;
  handleUpdateAvailability: (e: React.FormEvent) => Promise<void>;
  cancelEdit: () => void;
  isOpen?: boolean; // Make this prop optional with a default value
};

export default function EditAvailabilityForm({
  editForm,
  setEditForm,
  handleUpdateAvailability,
  cancelEdit,
  isOpen = true // Default to true if not provided
}: EditAvailabilityFormProps) {
  // Calculate duration between start and end time
  const calculateDuration = (): string => {
    if (!editForm.start_time || !editForm.end_time) return '';
    
    const start = new Date(`2000-01-01T${editForm.start_time}`);
    const end = new Date(`2000-01-01T${editForm.end_time}`);
    
    // If end time is before start time, assume it's the next day
    let diff = end.getTime() - start.getTime();
    if (diff < 0) {
      const nextDay = new Date(`2000-01-02T${editForm.end_time}`);
      diff = nextDay.getTime() - start.getTime();
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full p-5 border rounded-lg bg-white shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800 flex items-center">
              <FaClock className="mr-1.5 text-blue-500" />
              Edit Availability
            </h3>
            {editForm.start_time && editForm.end_time && (
              <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                {calculateDuration()}
              </span>
            )}
          </div>
          
          <form onSubmit={handleUpdateAvailability} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="edit-start-time" className="block text-xs font-medium text-gray-700">
                  Start Time
                </label>
                <div className="relative">
                  <input
                    id="edit-start-time"
                    type="time"
                    value={editForm.start_time}
                    onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                    className="w-full p-2 pl-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="edit-end-time" className="block text-xs font-medium text-gray-700">
                  End Time
                </label>
                <div className="relative">
                  <input
                    id="edit-end-time"
                    type="time"
                    value={editForm.end_time}
                    onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                    className="w-full p-2 pl-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>
            </div>
            
            {editForm.start_time && editForm.end_time && editForm.start_time >= editForm.end_time && (
              <div className="text-xs text-amber-600 bg-amber-50 p-1.5 rounded-md flex items-start">
                <span className="mr-1">⚠️</span>
                <span>End time is before start time (next day).</span>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors flex items-center"
              >
                <TbCancel className="mr-1" />
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center"
              >
                <FaCheck className="mr-1" />
                Save
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}