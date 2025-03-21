// src/app/components/DoctorList.tsx
'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Doctor {
    id: string;
    profiles: { // Assuming you joined profiles in the API
        first_name: string;
        last_name: string;
    };
    specialization: string;
}

const DoctorList: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]); // Fixed: Changed type to Doctor array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/doctors');
                if (!response.ok) {
                    throw new Error('Failed to fetch doctors');
                }
                const data = await response.json();
                setDoctors(data.data || []); // Fixed: Added empty array fallback
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error has occurred';
                console.log(err);
                setError(errorMessage || 'Could not fetch doctors');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []); // Fixed: Added empty dependency array

    if (loading) {
        return <div>Loading doctors...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!doctors.length) {
        return <div>No doctors found.</div>;
    }

    return (
        <div className="doctor-list">
            <h2>Doctors</h2>
            <ul className="doctors-grid">
                {doctors.map((doctor) => (
                    <li key={doctor.id} className="doctor-card">
                        <Link href={`/doctors/${doctor.id}`} className="doctor-link">
                            <div className="doctor-name">
                                {doctor.profiles.first_name} {doctor.profiles.last_name}
                            </div>
                            <div className="doctor-specialization">
                                {doctor.specialization}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>

            <style jsx>{`
                .doctor-list {
                    padding: 1rem;
                }
                .doctors-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1rem;
                    list-style-type: none;
                    padding: 0;
                }
                .doctor-card {
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    overflow: hidden;
                    transition: all 0.2s ease;
                }
                .doctor-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .doctor-link {
                    display: block;
                    padding: 1rem;
                    color: inherit;
                    text-decoration: none;
                }
                .doctor-name {
                    font-weight: 600;
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                }
                .doctor-specialization {
                    color: #555;
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
};

export default DoctorList;