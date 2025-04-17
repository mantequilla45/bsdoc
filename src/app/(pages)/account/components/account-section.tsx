import React, { useState, useEffect } from 'react';
import ProfileImageUpload from './profile';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from './index';
import LoadingPlaceholder from './loading';
import { MdEdit, MdSave, MdCancel, MdEmail, MdPhone, MdPerson } from "react-icons/md";
import { GrClose } from 'react-icons/gr';

interface AccountSectionProps {
    userId: string;
}

const AccountSection = ({ userId }: AccountSectionProps) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<Profile>>({});
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
                if (data[0].profile_image_url) {
                    setImagePreview(data[0].profile_image_url);
                }
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadProfileImage = async () => {
        if (!profileImage) return null;

        try {
            const fileExt = profileImage.name.split('.').pop();
            const fileName = `${userId}/profile_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('profile-picture')
                .upload(fileName, profileImage);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                return null;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('profile-picture')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error('Error in image upload:', error);
            return null;
        }
    };

    const handleSave = async () => {
        if (!formData) return;

        setIsSaving(true);

        try {
            let imageUrl = profile?.profile_image_url;
            if (profileImage) {
                const newImageUrl = await uploadProfileImage();
                if (newImageUrl) {
                    imageUrl = newImageUrl;
                }
            }

            const updateData = {
                ...formData,
                ...(imageUrl && { profile_image_url: imageUrl })
            };

            const { error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', userId);

            if (error) {
                console.error('Error updating profile:', error);
                alert('Failed to update profile. Please try again.');
            } else {
                setProfile(updateData as Profile);
                setIsEditing(false);
                setProfileImage(null);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(profile ?? {});
        setIsEditing(false);
        setProfileImage(null);
        setImagePreview(profile?.profile_image_url ?? null);
    };
    return (
        <div className="bg-white shadow-lg md:w-[40%] md:min-w-[300px] w-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-400 to-teal-500 text-white py-4 px-4 flex items-center justify-between">
                <h2 className="md:text-lg pl-4 text-md font-semibold">Account Details</h2>
                {isEditing ? (
                    <button
                        onClick={handleCancel}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                    >
                        <GrClose className="text-white" />
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                    >
                        <MdEdit className="text-white" />
                    </button>
                )}
            </div>

            <div className="p-6 py-16">
                <div className="flex flex-col items-center mb-6">
                    <ProfileImageUpload
                        imagePreview={imagePreview}
                        setImagePreview={setImagePreview}
                        handleImageChange={handleImageChange}
                        profile={profile}
                        handleSave={handleSave}
                        isSaving={isSaving}
                    />
                    {!isEditing && profile && (
                        <h3 className="md:mt-4 mt-6 text-xl font-semibold text-center text-gray-800">
                            {profile.first_name} {profile.last_name}
                        </h3>
                    )}
                </div>

                <div className="space-y-4">
                    {[
                        {
                            label: 'First Name',
                            name: 'first_name',
                            icon: <MdPerson className="text-teal-500" />,
                            type: 'text'
                        },
                        {
                            label: 'Last Name',
                            name: 'last_name',
                            icon: <MdPerson className="text-teal-500" />,
                            type: 'text'
                        },
                        {
                            label: 'Email',
                            name: 'email',
                            icon: <MdEmail className="text-teal-500" />,
                            type: 'email'
                        },
                        {
                            label: 'Phone',
                            name: 'phone_number',
                            icon: <MdPhone className="text-teal-500" />,
                            type: 'tel'
                        }
                    ].map(({ label, name, icon, type }) => (
                        <div key={name} className="flex items-start space-x-4">
                            <div className="w-10 flex justify-center pt-2">
                                {icon}
                            </div>
                            <div className="flex-grow min-w-0">
                                <label className="text-xs text-gray-500 block mb-1">{label}</label>
                                {loading ? (
                                    <LoadingPlaceholder />
                                ) : isEditing ? (
                                    <input
                                        type={type}
                                        name={name}
                                        value={formData?.[name as keyof Partial<Profile>] ?? ''}
                                        onChange={handleInputChange}
                                        className="w-full border-b border-gray-300 focus:border-teal-500 outline-none transition-colors truncate"
                                    />
                                ) : (
                                    <p className="text-gray-800 break-words overflow-hidden">
                                        {profile?.[name as keyof Profile] ?? '-'}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {isEditing && (
                    <div className="mt-6 flex space-x-3 justify-end">
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <MdCancel className="mr-2 inline" /> Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                        >
                            {isSaving ? 'Saving...' : (
                                <>
                                    <MdSave className="mr-2 inline" /> Save
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountSection;