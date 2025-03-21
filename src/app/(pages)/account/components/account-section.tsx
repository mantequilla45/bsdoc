import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { supabase } from '@/lib/supabaseClient';
import { Profile } from './index';
import LoadingPlaceholder from './loading';
import { MdEdit, MdSave, MdCancel } from "react-icons/md";

interface AccountSectionProps {
    userId: string;
}

const AccountSection = ({ userId }: AccountSectionProps) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<Profile>>({});
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId);

            if (error) {
                console.error('Error fetching profile data:', error);
            } else if (data?.length > 0) {
                setProfile(data[0]);
                setFormData(data[0]);
            } else {
                console.log('No profile data found for this user.');
            }

            setLoading(false);
        };

        fetchProfileData();
    }, [userId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        if (!formData) return;
        
        setIsSaving(true);
        
        const { error } = await supabase
            .from('profiles')
            .update(formData)
            .eq('id', userId);
            
        if (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } else {
            setProfile(formData as Profile);
            setIsEditing(false);
        }
        
        setIsSaving(false);
    };

    const handleCancel = () => {
        setFormData(profile || {});
        setIsEditing(false);
    };

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
                        <div className="flex flex-row items-center">
                            <p className="w-1/2">FIRST NAME:</p>
                            {loading ? (
                                <div className="w-1/2"><LoadingPlaceholder /></div>
                            ) : isEditing ? (
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData?.first_name || ''}
                                    onChange={handleInputChange}
                                    className="w-1/2 border border-gray-300 rounded px-2 py-1"
                                />
                            ) : (
                                <p className="w-1/2 px-[9px] py-[5px]">{profile?.first_name || '-'}</p>
                            )}
                        </div>
                        <div className="flex flex-row items-center">
                            <p className="w-1/2">LAST NAME:</p>
                            {loading ? (
                                <div className="w-1/2"><LoadingPlaceholder /></div>
                            ) : isEditing ? (
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData?.last_name || ''}
                                    onChange={handleInputChange}
                                    className="w-1/2 border border-gray-300 rounded px-2 py-1"
                                />
                            ) : (
                                <p className="w-1/2 px-[9px] py-[5px]">{profile?.last_name || '-'}</p>
                            )}
                        </div>
                        <div className="flex flex-row items-center">
                            <p className="w-1/2">EMAIL:</p>
                            {loading ? (
                                <div className="w-1/2"><LoadingPlaceholder /></div>
                            ) : isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={formData?.email || ''}
                                    onChange={handleInputChange}
                                    className="w-1/2 border border-gray-300 rounded px-2 py-1"
                                />
                            ) : (
                                <p className="w-1/2 px-[9px] py-[5px]">{profile?.email || '-'}</p>
                            )}
                        </div>
                        <div className="flex flex-row items-center">
                            <p className="w-1/2">PHONE:</p>
                            {loading ? (
                                <div className="w-1/2"><LoadingPlaceholder /></div>
                            ) : isEditing ? (
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData?.phone_number || ''}
                                    onChange={handleInputChange}
                                    className="w-1/2 border border-gray-300 rounded px-2 py-1"
                                />
                            ) : (
                                <p className="w-1/2 px-[9px] py-[5px]">{profile?.phone_number || '-'}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-full w-full flex items-end justify-end gap-2">
                {isEditing ? (
                    <>
                        <button 
                            onClick={handleCancel}
                            className="py-3 px-5 rounded-xl border border-1px bg-gray-300 text-gray-700 flex items-center gap-1"
                            disabled={isSaving}
                        >
                            <MdCancel /> Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="py-3 px-5 rounded-xl border border-1px bg-[#00909A] text-white flex items-center gap-1"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : <><MdSave /> Save</>}
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="py-3 pr-5 pl-4 text-sm rounded-xl border border-1px bg-[#62B6B8] text-white flex items-center gap-2"
                    >
                        <MdEdit className="text-xs"/> Edit
                    </button>
                )}
            </div>
        </div>
    );
};

export default AccountSection;