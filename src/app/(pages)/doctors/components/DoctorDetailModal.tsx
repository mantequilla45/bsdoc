import React from 'react';
// Adjust the import path based on where you define the Doctor type
import { Doctor } from '../type';

interface DoctorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({ isOpen, onClose, doctor }) => {
  if (!isOpen || !doctor || !doctor.profiles) {
    return null; // Don't render anything if modal is closed or doctor data is missing
  }

  // Default image if profile_image_url is null
  const profileImageUrl = doctor.profiles.profile_image_url || '/default-profile.png'; // Provide a path to a default image

  return (
    // Modal Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out">
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl transform rounded-lg bg-white p-6 shadow-xl transition-all duration-300 ease-in-out sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Doctor Details */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start">
          {/* Profile Picture */}
          <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-6">
            <img
              src={profileImageUrl}
              alt={`${doctor.profiles.first_name || ''} ${doctor.profiles.last_name || ''}`}
              className="h-32 w-32 rounded-full border-2 border-gray-200 object-cover shadow-md"
              onError={(e) => {
                  // Handle image loading errors, e.g., show default
                  (e.target as HTMLImageElement).src = '/default-profile.png'; 
              }}
            />
          </div>

          {/* Text Info */}
          <div className="w-full text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-800">
              Dr. {doctor.profiles.first_name || ''} {doctor.profiles.last_name || ''}
            </h2>
            <p className="mt-1 text-lg font-medium text-teal-600">{doctor.specialization || 'N/A'}</p>
            {doctor.years_of_experience !== null && (
              <p className="mt-1 text-sm text-gray-500">
                {doctor.years_of_experience} {doctor.years_of_experience === 1 ? 'Year' : 'Years'} of Experience
              </p>
            )}

            {/* Separator */}
            <hr className="my-4" />

            {/* Clinic Info */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700">Clinic Information</h3>
              <p className="text-gray-600">
                <span className="font-medium">Name:</span> {doctor.clinic_name || 'N/A'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Address:</span> {doctor.clinic_address || 'N/A'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Available Days:</span> {doctor.availableDays?.join(', ') || 'N/A'}
              </p>
            </div>

            {/* Bio */}
            {doctor.bio && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700">About</h3>
                <p className="text-sm text-gray-600">{doctor.bio}</p>
              </div>
            )}

             {/* Contact & License */}
            <div className="text-sm text-gray-500">
                {doctor.profiles.email && <p>Email: {doctor.profiles.email}</p>}
                {doctor.profiles.phone_number && <p>Phone: {doctor.profiles.phone_number}</p>}
                {doctor.license_number && <p>License No: {doctor.license_number}</p>}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailModal;