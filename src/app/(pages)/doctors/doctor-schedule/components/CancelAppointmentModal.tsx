// src/app/(pages)/doctors/doctor-schedule/components/CancelAppointmentModal.tsx
import React from 'react';
// Import the Appointment type
import { Appointment } from './types'; //

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  appointment: Appointment | null; // Allow null when no appointment is selected
}

const CancelAppointmentModal: React.FC<CancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appointment
}) => {
  // Don't render the modal if it's not open or no appointment is selected
  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out"> {/* Added transition */}
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale"> {/* Added animation */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Cancellation</h2>
        <p className="mb-3 text-gray-700">Are you sure you want to cancel the appointment with:</p>
        <div className="mb-4 p-4 bg-gray-100 rounded border border-gray-200">
          <p className="text-gray-900"><strong>Patient:</strong> {appointment.patient.first_name} {appointment.patient.last_name}</p>
          <p className="text-gray-900"><strong>Date:</strong> {appointment.appointment_date}</p>
          <p className="text-gray-900"><strong>Time:</strong> {appointment.appointment_time}</p>
          <p className={`text-sm font-semibold mt-1 ${appointment.status === 'cancelled' ? 'text-red-600' : 'text-blue-600'}`}>
             Status: {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
           </p>
        </div>
        <p className="text-sm text-red-600 mb-5">The patient will be notified if you confirm.</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors"
          >
            Keep Appointment
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
            // Disable button if appointment is already cancelled
            disabled={appointment.status === 'cancelled'}
          >
            {appointment.status === 'cancelled' ? 'Already Cancelled' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
      {/* Add some basic animation styles to globals.css or a relevant CSS file if needed */}
      <style jsx global>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CancelAppointmentModal;