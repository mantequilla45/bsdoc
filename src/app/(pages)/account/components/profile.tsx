import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import Image from 'next/image';
import { MdClose, MdEdit } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';

interface Profile {
    profile_picture?: string;
    profile_image_url?: string;
    first_name?: string;
}

interface ProfileImageUploadProps {
    imagePreview: string | null;
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
    handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
    profile?: Profile | null;
    handleSave: () => Promise<void>;
    isSaving: boolean;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
    imagePreview,
    setImagePreview,
    handleImageChange,
    profile,
    handleSave,
    isSaving
}) => {
    const [forcedImagePreview, setForcedImagePreview] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const defaultPlaceholder = "/Images/profile/user-placeholder.svg";

    useEffect(() => {
        // Only set forcedImagePreview if it's a new, actual image
        if (imagePreview && imagePreview !== profile?.profile_image_url) {
            setForcedImagePreview(imagePreview);
        } else {
            setForcedImagePreview(null);
        }
    }, [imagePreview, profile]);

    const handleImageLoadingComplete = () => {
        setIsImageLoading(false);
    };

    const handleCancelUpload = () => {
        setForcedImagePreview(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSaveAndReset = async () => {
        await handleSave();
        setForcedImagePreview(null);
        setImagePreview(null);
    };

    return (
        <div className="w-32 h-32 relative">
            <div className="w-full h-full rounded-full border border-gray-300 relative overflow-hidden">
                {/* Loading Overlay */}
                {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <div className="animate-pulse">
                            <div className="w-full h-full bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                )}

                <Image
                    alt="Profile Picture"
                    src={forcedImagePreview || profile?.profile_image_url || profile?.profile_picture || defaultPlaceholder}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover rounded-full"
                    quality={100}
                    priority
                    unoptimized={true} // <-- Add this to disable Next.js optimization
                    onLoadingComplete={handleImageLoadingComplete}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultPlaceholder;
                        setIsImageLoading(false);
                    }}
                />

                {/* Edit/Upload Button or Save Button */}

            </div>
            {!forcedImagePreview ? (
                <label className="absolute bottom-0 right-0 hover:bg-teal-600 duration-300 cursor-pointer bg-teal-500 text-white rounded-full p-2 shadow-md z-50">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                    <MdEdit className="w-4 h-4" />
                </label>
            ) : (
                <button
                    onClick={handleSaveAndReset}
                    disabled={isSaving}
                    className="absolute bottom-0 right-0 hover:bg-teal-600 duration-300 bg-teal-500 text-white rounded-full p-2 shadow-md z-20 cursor-pointer disabled:opacity-50"
                >
                    {isSaving ? (
                        <div className="animate-spin">
                            <FaCheck className="w-4 h-4 text-white" />
                        </div>
                    ) : (
                        <FaCheck className="w-4 h-4" />
                    )}
                </button>
            )}
            {/* Cancel Button */}
            {forcedImagePreview && forcedImagePreview !== profile?.profile_image_url && (
                <button
                    onClick={handleCancelUpload}
                    className="absolute top-0 right-0 bg-gray-400 hover:bg-gray-500 text-white duration-300 rounded-full w-6 h-6 flex items-center justify-center shadow-lg cursor-pointer z-30"
                >
                    <MdClose className="w-3 h-3" />
                </button>
            )}
        </div>
    );
};

export default ProfileImageUpload;