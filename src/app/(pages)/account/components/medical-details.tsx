import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MedicalDetail } from './index';
import DetailSection from './details';
import Records from './records';
import { MdEdit, MdSave, MdCancel } from "react-icons/md";

interface MedicalDetailsProps {
    userId: string;
}

// Fetch medical details from Supabase
const fetchMedicalDetails = async (userId: string): Promise<MedicalDetail | null> => {
    try {
        const { data, error } = await supabase
            .from('medical_details')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        if (data.length > 0) {
            return data[0] as MedicalDetail;
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
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [medicalData, setMedicalData] = useState<MedicalDetail | null>(null);
    const [formData, setFormData] = useState<Partial<MedicalDetail>>({});

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            const rawData = await fetchMedicalDetails(userId);

            if (rawData) {
                setMedicalData(rawData);
                setFormData(rawData);

                const personalDetails = [
                    rawData.blood_type,
                    `${rawData.height} cm`,
                    `${rawData.weight} kg`,
                    `${rawData.age}`
                ];

                const medicalHistory = [
                    rawData.conditions.join(', '),
                    rawData.allergies.join(', '),
                    rawData.medications.map((med) => `${med.name} ${med.dose}`).join(', '),
                    rawData.surgeries.map((surgery) => `${surgery.name} (${surgery.year})`).join(', ')
                ];

                setPersonalDetails(personalDetails);
                setMedicalHistory(medicalHistory);
            }
            setIsLoading(false);
        };

        fetchDetails();
    }, [userId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        const { value } = e.target;

        setFormData(prev => {
            if (!prev) return prev;

            if (field === 'blood_type' || field === 'height' || field === 'weight' || field === 'age') {
                return {
                    ...prev,
                    [field]: field === 'height' || field === 'weight' || field === 'age'
                        ? parseFloat(value)
                        : value
                };
            } else if (field === 'conditions' || field === 'allergies') {
                return {
                    ...prev,
                    [field]: value.split(',').map(item => item.trim())
                };
            }
            return prev;
        });
    };

    const handleMedicationChange = (index: number, field: 'name' | 'dose', value: string) => {
        setFormData(prev => {
            if (!prev || !prev.medications) return prev;

            const updatedMedications = [...prev.medications];
            updatedMedications[index] = {
                ...updatedMedications[index],
                [field]: value
            };

            return {
                ...prev,
                medications: updatedMedications
            };
        });
    };

    const handleSurgeryChange = (index: number, field: 'name' | 'year', value: string) => {
        setFormData(prev => {
            if (!prev || !prev.surgeries) return prev;

            const updatedSurgeries = [...prev.surgeries];
            updatedSurgeries[index] = {
                ...updatedSurgeries[index],
                [field]: field === 'year' ? parseInt(value) : value
            };

            return {
                ...prev,
                surgeries: updatedSurgeries
            };
        });
    };

    const handleSave = async () => {
        if (!formData) return;

        setIsSaving(true);

        const { error } = await supabase
            .from('medical_details')
            .update(formData)
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating medical details:', error);
            alert('Failed to update medical details. Please try again.');
        } else {
            // Refresh the displayed data
            if (formData as MedicalDetail) {
                const rawData = formData as MedicalDetail;
                setMedicalData(rawData);

                const personalDetails = [
                    rawData.blood_type,
                    `${rawData.height} cm`,
                    `${rawData.weight} kg`,
                    `${rawData.age}`
                ];

                const medicalHistory = [
                    rawData.conditions.join(', '),
                    rawData.allergies.join(', '),
                    rawData.medications.map((med) => `${med.name} ${med.dose}`).join(', '),
                    rawData.surgeries.map((surgery) => `${surgery.name} (${surgery.year})`).join(', ')
                ];

                setPersonalDetails(personalDetails);
                setMedicalHistory(medicalHistory);
            }
            setIsEditing(false);
        }

        setIsSaving(false);
    };

    const handleCancel = () => {
        setFormData(medicalData || {});
        setIsEditing(false);
    };

    // Render edit form
    const renderEditForm = () => {
        if (!formData) return null;

        return (
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <h3 className="text-2xl">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-700">Blood Type</label>
                            <input
                                type="text"
                                value={formData.blood_type || ''}
                                onChange={(e) => handleInputChange(e, 'blood_type')}
                                className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700">Height (cm)</label>
                            <input
                                type="number"
                                value={formData.height || ''}
                                onChange={(e) => handleInputChange(e, 'height')}

                                className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700">Weight (kg)</label>
                            <input
                                type="number"
                                value={formData.weight || ''}
                                onChange={(e) => handleInputChange(e, 'weight')}

                                className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700">Age</label>
                            <input
                                type="number"
                                value={formData.age || ''}
                                onChange={(e) => handleInputChange(e, 'age')}

                                className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h3 className="text-2xl">Medical History</h3>
                    <div>
                        <label className="block text-sm text-gray-700">Conditions (comma separated)</label>
                        <textarea
                            value={formData.conditions ? formData.conditions.join(', ') : ''}
                            onChange={(e) => handleInputChange(e, 'conditions')}
                            className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2"
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700">Allergies (comma separated)</label>
                        <textarea
                            value={formData.allergies ? formData.allergies.join(', ') : ''}
                            onChange={(e) => handleInputChange(e, 'allergies')}

                            className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2" rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700">Medications</label>
                        {formData.medications && formData.medications.map((med, index) => (
                            <div key={index} className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    value={med.name}
                                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                                    placeholder="Medication name"

                                    className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2" />
                                <input
                                    type="text"
                                    value={med.dose}
                                    onChange={(e) => handleMedicationChange(index, 'dose', e.target.value)}
                                    placeholder="Dose"

                                    className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2" />
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700">Surgeries</label>
                        {formData.surgeries && formData.surgeries.map((surgery, index) => (
                            <div key={index} className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    value={surgery.name}
                                    onChange={(e) => handleSurgeryChange(index, 'name', e.target.value)}
                                    placeholder="Surgery name"

                                    className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2" />
                                <input
                                    type="number"
                                    value={surgery.year}
                                    onChange={(e) => handleSurgeryChange(index, 'year', e.target.value)}
                                    placeholder="Year"

                                    className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full pl-10 border-l-[1px] border-[#00909A]/60">
            <div className="relative flex justify-center items-center bg-[#62B6B8] rounded-md text-white w-full py-3 px-4">
                <p className="text-center text-white text-sm">MEDICAL DETAILS</p>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="absolute right-0 py-3 pl-3 pr-4 rounded-r-md text-white hover:bg-[#00909A] text-sm flex items-center gap-1 transition duration-300"
                    >
                        <MdEdit size={16} /> Edit
                    </button>

                ) : (
                    <button
                        onClick={handleCancel}
                        className="absolute right-0 py-3 pl-3 pr-4 rounded-r-md text-white hover:bg-[#00909A] transition duration-300 text-sm flex items-center gap-1"
                        disabled={isSaving}
                    >
                        <MdCancel /> Cancel
                    </button>)}
            </div>


            <div className="flex flex-col gap-10 px-4 py-8">
                {isEditing ? (
                    <>
                        {renderEditForm()}
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={handleCancel}
                                className="py-3 pr-5 pl-4 text-sm rounded-xl border border-1px hover:bg-[#C8CCD2] transition duration-300 bg-gray-300 text-gray-700 flex items-center gap-2"
                                disabled={isSaving}
                            >
                                <MdCancel className="text-sm" /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="py-3 pr-5 pl-4 text-sm rounded-xl border border-1px hover:bg-[#529E9F] transition duration-300  bg-[#62B6B8] text-white flex items-center gap-2 hover:bg"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : <><MdSave className="text-sm" /> Save</>}
                            </button>
                        </div>
                        <Records userId={userId} />
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default MedicalDetails;