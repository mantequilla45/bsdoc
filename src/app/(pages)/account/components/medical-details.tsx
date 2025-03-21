import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MedicalDetail } from './index';
import DetailSection from './details';
import Records from './records';

interface MedicalDetailsProps {
    userId: string;
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

const MedicalDetails = ({ userId }: MedicalDetailsProps) => {
    const [personalDetails, setPersonalDetails] = useState<string[] | null>(null);
    const [medicalHistory, setMedicalHistory] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            const details = await fetchMedicalDetails(userId);
            if (details) {
                setPersonalDetails(details.personalDetails);
                setMedicalHistory(details.medicalHistory);
            }
            setIsLoading(false);
        };

        fetchDetails();
    }, [userId]);

    return (
        <div className="w-full pl-10 border-l-[1px] border-[#00909A]/60">
            <p className="bg-[#00909A] rounded-md text-white text-center w-full py-3 duration-300 text-sm">
                MEDICAL DETAILS
            </p>
            <div className="flex flex-col gap-10 px-4 py-8">
                <DetailSection 
                    title="Personal Information" 
                    labels={["Blood Type", "Height", "Weight", "Age"]} 
                    details={personalDetails} 
                    isLoading={isLoading} 
                />
                <DetailSection 
                    title="Medical History" 
                    labels={["Conditions", "Allergies", "Medications", "Surgeries"]} 
                    details={medicalHistory} 
                    isLoading={isLoading} 
                />
                <Records userId={userId} />
            </div>
        </div>
    );
};

export default MedicalDetails;