import React, { useState, useEffect } from 'react';
import ProfileImageUpload from './profile';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from './index';
import LoadingPlaceholder from './loading';
import { MdEdit, MdSave, MdCancel, MdEmail, MdPhone, MdPerson, MdHome, MdVpnKey, MdChevronRight, MdChevronLeft, MdLocationCity, MdMarkunreadMailbox } from "react-icons/md";
import { GrClose } from 'react-icons/gr';
import toast from 'react-hot-toast';

interface AccountSectionProps {
    userId: string;
    onProfileUpdate: () => void;
}

const AccountSection = ({ userId, onProfileUpdate }: AccountSectionProps) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<Profile>>({});
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

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

        const firstName = formData.first_name?.trim();
        const lastName = formData.last_name?.trim();

        if (!firstName) {
            toast.error("First Name is required.");
            document.querySelector<HTMLInputElement>('input[name="first_name"]')?.focus();
            return;
        }
        if (!lastName) {
            toast.error("Last Name is required.");
            document.querySelector<HTMLInputElement>('input[name="last_name"]')?.focus();
            return;
        }

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
                first_name: firstName,
                last_name: lastName,
                ...(imageUrl && { profile_image_url: imageUrl })
            };

            const { data: updatedProfileData, error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', userId)
                .select()
                .single();

            toast.dismiss();

            if (error) {
                console.error('Error updating profile:', error);
                alert('Failed to update profile. Please try again.');
            } else if (updatedProfileData) {
                setProfile(updatedProfileData as Profile);
                setFormData(updatedProfileData);
                setIsEditing(false);
                setProfileImage(null);
                if (imageUrl !== undefined) { setImagePreview(imageUrl); }
                toast.success('Profile updated successfully!');
                onProfileUpdate();
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

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // Primary fields (left column)
    const primaryFields = [
        {
            label: 'First Name',
            name: 'first_name',
            icon: <MdPerson className="text-teal-500" />,
            type: 'text',
            required: true,
        },
        {
            label: 'Last Name',
            name: 'last_name',
            icon: <MdPerson className="text-teal-500" />,
            type: 'text',
            required: true,
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
    ];

    // Secondary fields (right column when expanded)
    const secondaryFields = [
        {
            label: 'Address',
            name: 'address',
            icon: <MdHome className="text-teal-500" />,
            type: 'text'
        },
        {
            label: 'City',
            name: 'city',
            icon: <MdLocationCity className="text-teal-500" />,
            type: 'text'
        },
        {
            label: 'Zip Code',
            name: 'zip_code',
            icon: <MdMarkunreadMailbox className="text-teal-500" />,
            type: 'text'
        },
        {
            label: 'Current Password',
            name: 'currentPassword',
            icon: <MdVpnKey className="text-gray-500" />,
            type: 'password',
            placeholder: 'Enter your current password'
        },
        {
            label: 'New Password',
            name: 'newPassword',
            icon: <MdVpnKey className="text-teal-500" />,
            type: 'password',
            placeholder: 'Enter new password'
        },
        {
            label: 'Confirm Password',
            name: 'confirmPassword',
            icon: <MdVpnKey className="text-teal-500" />,
            type: 'password',
            placeholder: 'Confirm new password'
        }
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderFieldSection = (fields: any[]) => {
        return (
            <div className="space-y-4 md:w-[300px] transition-all duration-300">
                {fields.map(({ label, name, icon, type, placeholder, required }) => (
                    <div key={name} className="flex items-start space-x-4">
                        <div className="w-10 flex justify-center pt-2">{icon}</div>
                        <div className="flex-grow min-w-0">
                            <label className="text-xs text-gray-500 block mb-1">
                                {label}
                                {required && isEditing && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {loading ? (
                                <LoadingPlaceholder />
                            ) : name === 'newPassword' || name === 'confirmPassword' || name === 'currentPassword' ? (
                                isEditing ? (
                                    <input
                                        type={type}
                                        name={name}
                                        value={
                                            name === 'currentPassword' ? currentPassword :
                                                name === 'newPassword' ? newPassword :
                                                    confirmPassword
                                        }
                                        onChange={(e) => {
                                            if (name === 'currentPassword') setCurrentPassword(e.target.value);
                                            if (name === 'newPassword') setNewPassword(e.target.value);
                                            if (name === 'confirmPassword') setConfirmPassword(e.target.value);
                                        }}
                                        placeholder={placeholder}
                                        className="w-full border-b border-gray-300 focus:border-teal-500 outline-none transition-colors font-light"
                                        disabled={isSaving || isUpdatingPassword}
                                    />
                                ) : (
                                    <p className="text-gray-800">••••••••</p>
                                )
                            ) : isEditing ? (
                                <input
                                    type={type}
                                    name={name}
                                    value={formData?.[name as keyof Partial<Profile>] ?? ''}
                                    onChange={handleInputChange}
                                    required={required}
                                    placeholder={placeholder}
                                    className="w-full border-b border-gray-300 focus:border-teal-500 outline-none transition-colors truncate"
                                    disabled={isSaving || isUpdatingPassword}
                                />
                            ) : (
                                <p className="text-gray-800 break-words overflow-hidden">
                                    {profile?.[name as keyof Profile] ?? '-'}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {fields.some(f => f.name === 'newPassword') && isEditing && (
                    <div className="mt-4 pt-2">
                        {passwordError && <p className="text-red-500 text-sm text-center mb-2">{passwordError}</p>}
                        {passwordSuccess && <p className="text-green-500 text-sm text-center">{passwordSuccess}</p>}
                        <div className="flex justify-end">
                            <button
                                onClick={handleChangePassword}
                                disabled={
                                    isSaving ||
                                    isUpdatingPassword ||
                                    !currentPassword ||
                                    !newPassword ||
                                    !confirmPassword ||
                                    newPassword !== confirmPassword
                                }
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                            >
                                {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const handleChangePassword = async () => {
        setPasswordError(null);
        setPasswordSuccess(null);
        setIsUpdatingPassword(true);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill in all password fields.");
            setIsUpdatingPassword(false);
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters long.");
            setIsUpdatingPassword(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            setIsUpdatingPassword(false);
            return;
        }
        if (currentPassword === newPassword) {
            setPasswordError("New password cannot be the same as the current password.");
            setIsUpdatingPassword(false);
            return;
        }
        if (!profile?.email) {
            setPasswordError("Could not verify current password. User email not found.");
            setIsUpdatingPassword(false);
            return;
        }

        try {
            console.log("Verifying current password...");
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: profile.email,
                password: currentPassword
            });

            if (signInError) {
                console.error('Current password verification failed:', signInError);
                setPasswordError("Incorrect current password.");
                throw new Error("Incorrect current password.");
            }

            console.log("Current password verified. Updating user password...");
            const { data: updateData, error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) {
                console.error('Error updating password:', updateError);
                setPasswordError(`Update failed: ${updateError.message}`);
                throw updateError;
            }

            console.log("Password update successful:", updateData);
            toast.success("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsEditing(false);

        } catch (error: unknown) {
            console.error('Password update process error caught:', error);
            if (!passwordError) {
                const message = error instanceof Error ? error.message : 'An unknown error occurred';
                if (message !== "Incorrect current password.") {
                    setPasswordError(`Update failed: ${message}`);
                }
            }
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div
            className="bg-white shadow-lg transition-all duration-500 ease-in-out relative"
            style={{
                width: isExpanded ? '100%' : (window.innerWidth < 768 ? '100%' : '350px'),
                transition: 'width 600ms'
            }}
        >
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

            <div className="p-6 transition-all duration-500 ease-in-out max-w-4xl mx-auto">
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

                <div className="flex flex-col md:flex-row gap-6 transition-all duration-500 ease-in-out">
                    {/* Left Column - Always visible */}
                    <div className={`flex-grow transition-all duration-500 ease-in-out ${isExpanded ? 'md:w-1/2 md:flex-grow-0' : 'w-full'
                        }`}>
                        {renderFieldSection(primaryFields)}
                    </div>

                    {/* Right Column - Improved transition */}
                    <div className={`md:border-l md:pl-2 transition-all duration-500 ease-in-out font-regular text-sm ${isExpanded
                        ? 'md:w-1/2 opacity-100 max-h-screen flex-shrink-0'
                        : 'w-0 opacity-0 max-h-0 md:pl-0 overflow-hidden flex-shrink'
                        }`}
                    >
                        {renderFieldSection(secondaryFields)}
                    </div>
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

                <div className="mt-10 pb-8"> {/* Added padding to ensure the button doesn't overlap content */}
                    <button
                        onClick={toggleExpand}
                        className="w-full flex items-center justify-center py-2 text-teal-500 hover:text-teal-600 transition-colors font-medium absolute bottom-5 right-0"
                    >
                        {isExpanded ? (
                            <>
                                <MdChevronLeft className="mr-1 text-xl md:rotate-0 rotate-90" /> Show Less
                            </>
                        ) : (
                            <>
                                <MdChevronRight className="mr-1 text-xl md:rotate-0 rotate-90" /> Show More Details
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountSection;