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
}

const AccountSection = ({ userId }: AccountSectionProps) => {
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

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // Primary fields (left column)
    const primaryFields = [
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
            label: 'Current Password', // Add this field
            name: 'currentPassword',
            icon: <MdVpnKey className="text-gray-500" />, // Maybe different color for current?
            type: 'password',
            placeholder: 'Enter your current password'
        },
        {
            label: 'New Password',
            name: 'newPassword', // Unique name for state handling
            icon: <MdVpnKey className="text-teal-500" />,
            type: 'password',
            placeholder: 'Enter new password'
        },
        {
            label: 'Confirm Password',
            name: 'confirmPassword', // Unique name for state handling
            icon: <MdVpnKey className="text-teal-500" />,
            type: 'password',
            placeholder: 'Confirm new password'
        }
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderFieldSection = (fields: any[]) => {
        return (
            <div className="space-y-4">
                {fields.map(({ label, name, icon, type, placeholder }) => (
                    <div key={name} className="flex items-start space-x-4">
                        <div className="w-10 flex justify-center pt-2">{icon}</div>
                        <div className="flex-grow min-w-0">
                            <label className="text-xs text-gray-500 block mb-1">{label}</label>
                            {loading ? (
                                <LoadingPlaceholder />
                            ) : name === 'newPassword' || name === 'confirmPassword' || name === 'currentPassword' ? ( // Add currentPassword here
                                // --- Password Field Specific Logic ---
                                isEditing ? (
                                    <input
                                        type={type}
                                        name={name}
                                        // Bind value based on name
                                        value={
                                            name === 'currentPassword' ? currentPassword :
                                                name === 'newPassword' ? newPassword :
                                                    confirmPassword
                                        }
                                        // Update state based on name
                                        onChange={(e) => {
                                            if (name === 'currentPassword') setCurrentPassword(e.target.value);
                                            if (name === 'newPassword') setNewPassword(e.target.value);
                                            if (name === 'confirmPassword') setConfirmPassword(e.target.value);
                                        }}
                                        placeholder={placeholder}
                                        className="w-full border-b border-gray-300 focus:border-teal-500 outline-none transition-colors"
                                        disabled={isSaving || isUpdatingPassword}
                                    />
                                ) : (
                                    <p className="text-gray-800">••••••••</p>
                                )
                                // --- End Password Field Specific Logic ---
                            ) : isEditing ? (
                                // --- Regular Field Logic (Editable) ---
                                <input
                                    type={type}
                                    name={name}
                                    value={formData?.[name as keyof Partial<Profile>] ?? ''}
                                    onChange={handleInputChange}
                                    placeholder={placeholder}
                                    className="w-full border-b border-gray-300 focus:border-teal-500 outline-none transition-colors truncate"
                                    disabled={isSaving || isUpdatingPassword} // Also disable if password is being updated
                                />
                            ) : (
                                // --- Regular Field Logic (Display) ---
                                <p className="text-gray-800 break-words overflow-hidden">
                                    {/* No need for password check here anymore */}
                                    {profile?.[name as keyof Profile] ?? '-'}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {/* --- Add Password Feedback & Button INSIDE the secondaryFields section --- */}
                {/* Check if this section contains password fields - a bit rudimentary check */}
                {fields.some(f => f.name === 'newPassword') && isEditing && (
                    <div className="mt-4 pt-2">
                        {passwordError && <p className="text-red-500 text-sm text-center mb-2">{passwordError}</p>}
                        <div className="flex justify-end">
                            <button
                                onClick={handleChangePassword}
                                disabled={
                                    isSaving ||
                                    isUpdatingPassword ||
                                    !currentPassword || // Add check for current password
                                    !newPassword ||
                                    !confirmPassword ||
                                    newPassword !== confirmPassword // Keep match check for immediate feedback
                                }
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                            >
                                {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                )}
                {/* --- End Password Feedback & Button --- */}
            </div>
        );
    };

    // Add this function inside the AccountSection component

    const handleChangePassword = async () => {
        setPasswordError(null);
        setIsUpdatingPassword(true); // Set loading state at the beginning

        // 1. Basic Validation (moved before loading state if preferred, but okay here too)
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill in all password fields.");
            setIsUpdatingPassword(false); // Turn off loading before returning
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

        let isPasswordVerified = false; // Flag to track verification success

        try {
            // 2. Verify Current Password
            console.log("Attempting re-authentication...");
            const { error: reauthError } = await supabase.auth.reauthenticate();

            if (reauthError) {
                console.warn("Re-authentication failed (this might be expected), trying signIn to verify current password.", reauthError);

                if (!profile?.email) {
                    setPasswordError("Could not verify current password. User email not found.");
                    throw new Error("User email not found for password verification."); // Throw to exit try block
                }

                // Try verifying by signing in with the current password
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: profile.email,
                    password: currentPassword
                });

                if (signInError) {
                    // If signIn fails, the entered current password was WRONG.
                    console.error('Current password verification failed:', signInError);
                    setPasswordError("Incorrect current password.");
                    // No need to set flag, will be caught by finally or check below
                    throw signInError; // Throw to exit try block
                } else {
                    // If signIn succeeds, the current password is CORRECT.
                    console.log("Current password verified via signIn.");
                    isPasswordVerified = true;
                }
            } else {
                // If reauthenticate() itself succeeds, consider password verified for this session.
                console.log("Re-authentication successful.");
                isPasswordVerified = true;
            }


            // 3. Proceed ONLY if password was verified
            if (!isPasswordVerified) {
                // This case should ideally not be reached if errors are thrown above, but acts as a safeguard
                console.error("Password verification flag not set, aborting update.");
                setPasswordError("Could not verify current credentials. Please try again.");
                throw new Error("Password verification failed unexpectedly."); // Exit try block
            }

            // 4. Update to New Password
            console.log("Updating user password...");
            const { data: updateData, error: updateError } = await supabase.auth.updateUser({ // Capture data too
                password: newPassword
            });

            if (updateError) {
                console.error('Error updating password:', updateError);
                setPasswordError(`Update failed: ${updateError.message}`);
                throw updateError; // Exit try block
            }

            // If update successful:
            console.log("Password update successful:", updateData);
            toast.success("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsEditing(false);

        } catch (error: unknown) {
            // Catch errors thrown from verification or update steps
            console.error('Password update process error caught:', error);
            // Ensure a user-facing error is set if not already done
            if (!passwordError) {
                const message = error instanceof Error ? error.message : 'An unknown error occurred';
                // Avoid setting generic message if a specific one was already set
                if (message !== "Incorrect current password.") { // Example check
                    setPasswordError(`Update failed: ${message}`);
                }
            }
        } finally {
            // Always turn off loading state
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className={`bg-white shadow-lg w-${isExpanded ? 'full' : '1/2'} transition-all duration-300 ease-in-out`}>
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

            <div className="p-6">
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

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column - Always visible */}
                    <div className={`${isExpanded ? 'md:w-1/2' : 'w-full'}`}>
                        {renderFieldSection(primaryFields)}
                    </div>

                    {/* Right Column - Only visible when expanded */}
                    {isExpanded && (
                        <div className="md:w-1/2 w-full border-l pl-6">
                            {renderFieldSection(secondaryFields)}
                        </div>
                    )}
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

                <button
                    onClick={toggleExpand}
                    className="mt-6 w-full flex items-center justify-center py-2 text-teal-500 hover:text-teal-600 transition-colors font-medium"
                >
                    {isExpanded ? (
                        <>
                            <MdChevronLeft className="mr-1 text-xl" /> Show Less
                        </>
                    ) : (
                        <>
                            <MdChevronRight className="mr-1 text-xl" /> Show More Details
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AccountSection;