'use client';

import React, { useState } from 'react';
import { Clock, Calendar } from 'lucide-react';

type AddAvailabilityFormProps = {
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

export default function AddAvailabilityForm({
  newAvailability,
  setNewAvailability,
  handleAddAvailability
}: AddAvailabilityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateTimes = () => {
    if (!newAvailability.start_time || !newAvailability.end_time) return true;
    
    const start = new Date(`2000-01-01T${newAvailability.start_time}`);
    const end = new Date(`2000-01-01T${newAvailability.end_time}`);
    
    return start < end;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTimes()) {
      setValidationError('End time must be after start time');
      return;
    }
    
    setValidationError('');
    setIsSubmitting(true);
    
    try {
      await handleAddAvailability(e);
      // Clear form after successful submission
      setNewAvailability({
        day_of_week: '',
        start_time: '',
        end_time: ''
      });
    } catch (error) {
      console.error('Error adding availability:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      
      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {validationError}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="day-of-week" className="block text-sm font-medium text-gray-700 mb-1">
            Day of Week
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5  text-gray-400" />
            </div>
            <select
              id="day-of-week"
              value={newAvailability.day_of_week}
              onChange={(e) =>
                setNewAvailability({
                  ...newAvailability,
                  day_of_week: e.target.value,
                })
              }
              className="pl-10 block text-sm w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">Select Day</option>
              {days.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="start-time"
                type="time"
                value={newAvailability.start_time}
                onChange={(e) =>
                  setNewAvailability({
                    ...newAvailability,
                    start_time: e.target.value,
                  })
                }
                className="pl-10 block text-sm w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="end-time"
                type="time"
                value={newAvailability.end_time}
                onChange={(e) =>
                  setNewAvailability({
                    ...newAvailability,
                    end_time: e.target.value,
                  })
                }
                className="pl-10 block text-sm w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#37b34b] hover:bg-[#319e43] transition-colors duration-300 ${
          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Adding...' : 'Add Slot'}
      </button>
    </form>
  );
}