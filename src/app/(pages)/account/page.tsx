"use client";

import Header from "@/app/layout/header";
import Image from "next/image";
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';

// Interfaces for TypeScript
interface Medication {
    name: string;
    dose: string;
}

interface Surgery {
    name: string;
    year: number;
}

interface MedicalDetail {
    age: number;
    allergies: string[];
    blood_type: string;
    conditions: string[];
    height: number;
    id: string;
    medications: Medication[];
    surgeries: Surgery[];
    user_id: string;
    weight: number;
}

interface Record {
    date: string;
    weight: number;
    symptoms: string[];
    health_conditions: string[];
}

interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    created_at: string;
    updated_at: string;
    role: string;
}

// Fetch medical details from Supabase
const fetchMedicalDetails = async (userId: string): Promise<{ personalDetails: string[], medicalHistory: string[] } | null> => {
    try {
        const { data, error } = await supabase
            .from('medical_details')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        if (data.length > 0) {
            const medicalDetail: MedicalDetail = data[0];

            const personalDetails = [
                medicalDetail.blood_type,
                `${medicalDetail.height} cm`,
                `${medicalDetail.weight} kg`,
                `${medicalDetail.age}`
            ];

            const medicalHistory = [
                medicalDetail.conditions.join(', '),
                medicalDetail.allergies.join(', '),
                medicalDetail.medications.map((med) => `${med.name} ${med.dose}`).join(', '),
                medicalDetail.surgeries.map((surgery) => `${surgery.name} (${surgery.year})`).join(', ')
            ];

            return { personalDetails, medicalHistory };
        }
        return null;
    } catch (err) {
        console.error('Exception when fetching medical details:', err);
        return null;
    }
};

// MedicalDetails Component
const MedicalDetails = ({ userId }: { userId: string }) => {
    const [personalDetails, setPersonalDetails] = useState<string[]>([]);
    const [medicalHistory, setMedicalHistory] = useState<string[]>([]);

    useEffect(() => {
        const fetchDetails = async () => {
            const details = await fetchMedicalDetails(userId);
            if (details) {
                setPersonalDetails(details.personalDetails);
                setMedicalHistory(details.medicalHistory);
            }
        };

        fetchDetails();
    }, [userId]);

    return (
        <div className="w-full pl-10 border-l-[1px] border-[#00909A]/60">
            <p className="bg-[#00909A] rounded-md text-white text-center w-full py-3 duration-300 text-sm">
                MEDICAL DETAILS
            </p>
            <div className="flex flex-col gap-10 px-4 py-8">
                <DetailSection title="Personal Information" labels={["Blood Type", "Height", "Weight", "Age"]} details={personalDetails} />
                <DetailSection title="Medical History" labels={["Conditions", "Allergies", "Medications", "Surgeries"]} details={medicalHistory} />
                <Records userId={userId} />
            </div>
        </div>
    );
};

// DetailSection Component
const DetailSection = ({ title, labels, details }: { title: string; labels: string[]; details: string[] }) => (
    <div className="flex flex-col gap-2">
        <p className="text-2xl">{title}</p>
        <div className="flex flex-col text-sm font-light">
            {labels.map((label, index) => (
                <div className="flex flex-row h-8 items-center gap-16 border-b-[1px] border-[#D1D5DB]" key={index}>
                    <p className="w-[100px]">{label}</p>
                    <p>{details[index] || '-'}</p>
                </div>
            ))}
        </div>
    </div>
);

// Fetch Records Component
const Records = ({ userId }: { userId: string }) => {
    const [userRecords, setUserRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllRecords = async () => {
            try {
                const { data, error } = await supabase
                    .from('records')
                    .select('*')
                    .eq('user_id', userId);

                if (error) throw error;

                if (data) {
                    setUserRecords(data as Record[]);
                }
            } catch (err) {
                console.error('Error fetching records:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllRecords();
    }, [userId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    return (
        <div className="w-full space-y-3">
            <p className="text-2xl">BSDOC Records</p>
            {loading ? (
                <p>Loading records...</p>
            ) : (
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr>
                            {["Date", "Weight", "Symptoms", "Health Conditions"].map((label, index) => (
                                <th key={index} style={{ padding: "8px", fontWeight: "500", textAlign: "left" }}>
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {userRecords.map((record, rowIndex) => (
                            <tr key={rowIndex}>
                                <td>{formatDate(record.date)}</td>
                                <td>{record.weight} kg</td>
                                <td>{record.symptoms.join(', ')}</td>
                                <td>{record.health_conditions.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    created_at: string;
    updated_at: string;
    role: string;
}

const AccountSection = ({ userId }: { userId: string }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId);

            if (error) {
                console.error('Error fetching profile data:', error);
                setError(error.message);
            } else if (data?.length > 0) {
                setProfile(data[0]);
            } else {
                console.log('No profile data found for this user.');
            }

            setLoading(false);
        };

        fetchProfileData();
    }, [userId]);

    if (loading) return <div>Loading account details...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col w-[40%]">
            <p className="bg-[#00909A] rounded-md text-white text-center w-full py-3 duration-300 text-sm">
                ACCOUNT DETAILS
            </p>
            <div className="flex flex-col gap-10 px-4 py-8">
                <div className="w-full aspect-square rounded-full overflow-hidden border border-gray-300">
                    <Image
                        alt="Profile Picture"
                        src="/Images/profile/profile1.png"
                        width={500}
                        height={500}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col font-light text-sm w-full">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row">
                            <p className="w-1/2">FIRST NAME:</p>
                            <p className="w-1/2">{profile?.first_name || '-'}</p>
                        </div>
                        <div className="flex flex-row">
                            <p className="w-1/2">LAST NAME:</p>
                            <p className="w-1/2">{profile?.last_name || '-'}</p>
                        </div>
                        <div className="flex flex-row">
                            <p className="w-1/2">EMAIL:</p>
                            <p className="w-1/2">{profile?.email || '-'}</p>
                        </div>
                        <div className="flex flex-row">
                            <p className="w-1/2">PHONE:</p>
                            <p className="w-1/2">{profile?.phone_number || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ✅ Main AccountPage Component
const AccountPage = () => {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (data?.user) {
                setUserId(data.user.id);
            } else {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    if (!userId) return <p>Loading...</p>;

    return (
        <div className="bg-[#62B6B8]">
            <Header background="white" title="Account" />
            <div className="max-w-[1300px] mx-auto gap-10 my-5 flex flex-row bg-white h-auto p-10 rounded-xl">
                {/* ✅ AccountSection restored */}
                <AccountSection userId={userId} />
                <div className="w-full flex flex-col">
                    <MedicalDetails userId={userId} />
                </div>
            </div>
        </div>
    );
};

export default AccountPage;