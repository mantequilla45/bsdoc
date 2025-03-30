import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MedicalDetail } from './index';
import DetailSection from './details';
import Records from './records';
import { MdEdit, MdSave, MdCancel } from "react-icons/md";
import { GrClose } from 'react-icons/gr';

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
                    rawData.conditions?.join(', ') || '',
                    rawData.allergies?.join(', ') || '',
                    rawData.medications?.map((med) => `${med.name} ${med.dose}`).join(', ') || '',
                    rawData.surgeries?.map((surgery) => `${surgery.name} (${surgery.year})`).join(', ') || ''
                ];

                setPersonalDetails(personalDetails);
                setMedicalHistory(medicalHistory);
            }
            setIsLoading(false);
        };

        fetchDetails();
    }, [userId]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
        field: string
    ) => {
        const { value } = e.target;

        setFormData((prev) => {
            if (!prev) return prev;

            if (field === 'blood_type' || field === 'height' || field === 'weight' || field === 'age') {
                if (field === 'height' || field === 'weight' || field === 'age') {
                    // Parse the value first
                    let parsedValue = parseFloat(value);

                    // Check if it's a valid number
                    if (isNaN(parsedValue)) {
                        parsedValue = 0; // Default to 0 for invalid input
                    }

                    // Apply appropriate validation based on field
                    if (field === 'height') {
                        parsedValue = Math.min(Math.max(parsedValue, 0), 300);
                    } else if (field === 'weight') {
                        parsedValue = Math.min(Math.max(parsedValue, 0), 700);
                    } else if (field === 'age') {
                        parsedValue = Math.min(Math.max(Math.floor(parsedValue), 0), 130);
                    }

                    return {
                        ...prev,
                        [field]: parsedValue
                    };
                } else {
                    // Handle blood_type (string value)
                    return {
                        ...prev,
                        [field]: value
                    };
                }
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

        // Check if we're creating a new record or updating existing one
        if (medicalData) {
            // Update existing record
            const { error } = await supabase
                .from('medical_details')
                .update(formData)
                .eq('user_id', userId);

            if (error) {
                console.error('Error updating medical details:', error);
                alert('Failed to update medical details. Please try again.');
                setIsSaving(false);
                return;
            }
        } else {
            // Create new record
            const { error } = await supabase
                .from('medical_details')
                .insert({ ...formData, user_id: userId });

            if (error) {
                console.error('Error creating medical details:', error);
                alert('Failed to create medical details. Please try again.');
                setIsSaving(false);
                return;
            }
        }

        // Refresh the displayed data
        if (formData as MedicalDetail) {
            const rawData = formData as MedicalDetail;
            setMedicalData(rawData);

            const personalDetails = [
                rawData.blood_type || '',
                `${rawData.height || 0} cm`,
                `${rawData.weight || 0} kg`,
                `${rawData.age || 0}`
            ];

            const medicalHistory = [
                rawData.conditions?.join(', ') || '',
                rawData.allergies?.join(', ') || '',
                rawData.medications?.map((med) => `${med.name} ${med.dose}`).join(', ') || '',
                rawData.surgeries?.map((surgery) => `${surgery.name} (${surgery.year})`).join(', ') || ''
            ];

            setPersonalDetails(personalDetails);
            setMedicalHistory(medicalHistory);
        }

        setIsEditing(false);
        setIsSaving(false);
    };

    const handleCancel = () => {
        setFormData(medicalData || {});
        setIsEditing(false);
    };
    const handleAddMedication = () => {
        setFormData(prev => {
            if (!prev) return prev;

            const currentMeds = prev.medications || [];
            return {
                ...prev,
                medications: [...currentMeds, { name: '', dose: '' }]
            };
        });
    };

    const handleRemoveMedication = (index: number) => {
        setFormData(prev => {
            if (!prev || !prev.medications) return prev;

            const updatedMedications = [...prev.medications];
            updatedMedications.splice(index, 1);

            return {
                ...prev,
                medications: updatedMedications
            };
        });
    };

    const handleAddSurgery = () => {
        setFormData(prev => {
            if (!prev) return prev;

            const currentSurgeries = prev.surgeries || [];
            return {
                ...prev,
                surgeries: [...currentSurgeries, { name: '', year: new Date().getFullYear() }]
            };
        });
    };

    const handleRemoveSurgery = (index: number) => {
        setFormData(prev => {
            if (!prev || !prev.surgeries) return prev;

            const updatedSurgeries = [...prev.surgeries];
            updatedSurgeries.splice(index, 1);

            return {
                ...prev,
                surgeries: updatedSurgeries
            };
        });
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
                            <select
                                value={formData.blood_type || ''}
                                onChange={(e) => handleInputChange(e, 'blood_type')}
                                className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="" disabled>Select Blood Type</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                                    <option className="font-light " key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700">Height (cm)</label>
                            <input
                                type="number"
                                value={formData.height || ''}
                                onChange={(e) => handleInputChange(e, 'height')}
                                min="0"
                                max="300"
                                step="0"
                                className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700">Weight (kg)</label>
                            <input
                                type="number"
                                value={formData.weight || ''}
                                onChange={(e) => handleInputChange(e, 'weight')}
                                min="0"
                                max="700"
                                step="0"
                                className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700">Age</label>
                            <input
                                type="number"
                                value={formData.age || ''}
                                onChange={(e) => handleInputChange(e, 'age')}
                                min="0"
                                max="130"
                                step="1"
                                className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h3 className="text-2xl">Medical History</h3>
                    <div>
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
                        <label className="block text-sm text-gray-700">Medications</label>
                        {formData.medications && formData.medications.map((med, index) => (
                            <div key={index} className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    value={med.name}
                                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                                    placeholder="Medication name"
                                    className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                                <input
                                    type="text"
                                    value={med.dose}
                                    onChange={(e) => handleMedicationChange(index, 'dose', e.target.value)}
                                    placeholder="Dose"
                                    className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveMedication(index)}
                                    className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-md mt-1"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddMedication}
                            className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
                        >
                            + Add Medication
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700">Past Surgeries</label>
                        {formData.surgeries && formData.surgeries.map((surgery, index) => (
                            <div key={index} className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    value={surgery.name}
                                    onChange={(e) => handleSurgeryChange(index, 'name', e.target.value)}
                                    placeholder="Surgery name"
                                    className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                                <input
                                    type="number"
                                    value={surgery.year}
                                    onChange={(e) => handleSurgeryChange(index, 'year', e.target.value)}
                                    placeholder="Year"
                                    min="1900"
                                    max="2025"
                                    className="mt-1 block text-sm font-light w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSurgery(index)}
                                    className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-md mt-1"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddSurgery}
                            className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
                        >
                            + Add Surgery
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full border-[#00909A]/60">
            <div className="bg-gradient-to-r md:border-l border-l-1 border-teal-600 from-teal-500 to-teal-600 text-white py-4 px-4 flex items-center justify-between">
                <p className="md:text-lg text-md pl-4 text-white font-semibold">Medical Details</p>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                    >
                        <MdEdit className="text-white" />
                    </button>

                ) : (
                    <button
                        onClick={handleCancel}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                        disabled={isSaving}
                    >
                        <GrClose />
                    </button>)}
            </div>


            <div className="flex flex-col gap-10 p-10 pb-16">
                {isEditing ? (
                    <>
                        {renderEditForm()}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCancel}
                                className="py-3 pr-5 pl-4 text-sm rounded-xl border border-1px hover:bg-[#C8CCD2] transition duration-300 bg-gray-300 text-gray-700 flex items-center gap-2"
                                disabled={isSaving}
                            >
                                <MdCancel className="text-sm" /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="py-3 pr-5 pl-4 text-sm rounded-xl border border-1px hover:bg-[#4B8C8D] transition duration-300  bg-[#62B6B8] text-white flex items-center gap-2 hover:bg"
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