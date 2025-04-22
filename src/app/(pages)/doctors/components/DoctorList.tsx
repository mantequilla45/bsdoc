// src/app/(pages)/doctors/components/DoctorList.tsx
'use client'
import React, { useState, useEffect, useMemo } from 'react';
import DoctorDetailModal from './DoctorDetailModal'; // Assuming modal is in the same folder
import { Doctor } from '../type'; // Import the more complete Doctor type
import Image from 'next/image';

type SortKey = 'lastName' | 'firstName' | 'specialization';
type SortOrder = 'asc' | 'desc';

const DoctorList: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State for sorting
    const [sortKey, setSortKey] = useState<SortKey>('lastName');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/doctors');
                if (!response.ok) {
                    throw new Error(`Failed to fetch doctors. Status: ${response.status}`);
                }
                const data = await response.json();
                if (data && Array.isArray(data.data)) {
                    setDoctors(data.data);
                } else {
                    console.error("API response format incorrect:", data);
                    setDoctors([]);
                    setError("Received unexpected data format from server.");
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                console.error("Error fetching doctors:", err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    // Memoized sorted list
    const sortedDoctors = useMemo(() => {
        return [...doctors].sort((a, b) => {
            // Ensure profiles exist for comparison
            if (!a.profiles || !b.profiles) return 0;

            let valA: string | number | null = null;
            let valB: string | number | null = null;

            switch (sortKey) {
                case 'lastName':
                    valA = a.profiles.last_name;
                    valB = b.profiles.last_name;
                    break;
                case 'firstName':
                    valA = a.profiles.first_name;
                    valB = b.profiles.first_name;
                    break;
                case 'specialization':
                    valA = a.specialization;
                    valB = b.specialization;
                    break;
            }

            // Handle nulls and case-insensitive comparison for strings
            const comparison = (valA === null || valB === null)
                ? (valA === valB ? 0 : (valA === null ? -1 : 1)) // Place nulls consistently (e.g., at the beginning)
                : (typeof valA === 'string' && typeof valB === 'string'
                    ? valA.localeCompare(valB, undefined, { sensitivity: 'base' })
                    : (valA < valB ? -1 : (valA > valB ? 1 : 0)));

            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [doctors, sortKey, sortOrder]);

    const handleDoctorClick = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDoctor(null);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortKey(e.target.value as SortKey);
    };

    const toggleSortOrder = () => {
        setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-600">Loading doctors...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-600">Error: {error}</div>;
    }

    if (!doctors.length) {
        return <div className="p-4 text-center text-gray-500">No doctors found.</div>;
    }

    return (
        <div className="doctor-list p-1">
            {/* Sorting Controls */}
            <div className="mb-4 flex items-center justify-end space-x-2 rounded-md bg-gray-50 p-3 shadow-sm">
                <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                    id="sort-select"
                    value={sortKey}
                    onChange={handleSortChange}
                    className="rounded border border-gray-300 p-1.5 text-sm focus:border-teal-500 focus:ring-teal-500"
                >
                    <option value="lastName">Name (Last)</option>
                    <option value="firstName">Name (First)</option>
                    <option value="specialization">Specialization</option>
                    {/* Add other sortable fields here if needed */}
                </select>
                <button
                    onClick={toggleSortOrder}
                    className="rounded border border-gray-300 bg-white p-1.5 text-gray-600 hover:bg-gray-100"
                    aria-label={`Sort order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                >
                    {sortOrder === 'asc' ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 12.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-7-8a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" /></svg>
                    ) : (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 11-1.414 1.414L10 7.414l-2.293 2.293a1 1 0 01-1.414 0z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-7-8a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" /></svg>
                    )}
                </button>
            </div>

            {/* Grid using the sorted list */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {/* Map over sortedDoctors instead of doctors */}
                {sortedDoctors.map((doctor) => (
                    doctor && doctor.profiles ? (
                        <div
                            key={doctor.id}
                            className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm transition duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1"
                            onClick={() => handleDoctorClick(doctor)}
                        >
                            <Image
                                src={doctor.profiles.profile_image_url || '/default-profile.png'}
                                alt={`${doctor.profiles.first_name || ''} ${doctor.profiles.last_name || ''}`}
                                fill
                                className="rounded-full border-2 border-gray-200 object-cover shadow-md"
                                onError={() => {
                                    // With Next/Image, we handle fallbacks differently
                                    // Using a conditional src above is cleaner
                                }}
                            />
                            <div className="mb-1 truncate text-lg font-semibold text-gray-800">
                                Dr. {doctor.profiles.first_name} {doctor.profiles.last_name}
                            </div>
                            <div className="mb-2 text-sm text-teal-600">
                                {doctor.specialization || 'Specialization N/A'}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">
                                {doctor.bio || `Providing expert care at ${doctor.clinic_name || 'the clinic'}.`}
                            </p>
                        </div>
                    ) : null
                ))}
            </div>

            {/* Render the Modal */}
            <DoctorDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                doctor={selectedDoctor}
            />
        </div>
    );
};

export default DoctorList;