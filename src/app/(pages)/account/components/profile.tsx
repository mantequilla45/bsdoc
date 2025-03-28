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
        <div className="md:w-[85%] md:min-w-[150px] w-[300px] mx-auto relative">
            <div className="w-full aspect-square rounded-full border border-gray-300 relative group">
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
                    width={500}
                    height={500}
                    className="w-full h-full object-cover rounded-full"
                    onLoadingComplete={handleImageLoadingComplete}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultPlaceholder;
                        setIsImageLoading(false);
                    }}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 rounded-full">
                    {/* Edit/Upload Button or Save Button */}
                    {!forcedImagePreview ? (
                        <label className="absolute bottom-[21px] right-[21px] hover:bg-[#4B8C8D] duration-300 cursor-pointer bg-[#62B6B8] text-white rounded-full p-3 shadow-lg z-20">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <MdEdit className="w-5 h-5" />
                        </label>
                    ) : (
                        <button
                            onClick={handleSaveAndReset}
                            disabled={isSaving}
                            className="absolute bottom-[21px] right-[21px] hover:bg-[#4B8C8D] duration-300 bg-[#62B6B8] text-white rounded-full p-3 shadow-lg z-20 cursor-pointer disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="animate-spin">
                                    <FaCheck className="w-5 h-5 text-white" />
                                </div>
                            ) : (
                                <FaCheck className="w-5 h-5" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Buttons Container */}
            {forcedImagePreview && forcedImagePreview !== profile?.profile_image_url && (
                <div className="absolute bottom-0 right-0">
                    {/* Cancel Button */}
                    <button
                        onClick={handleCancelUpload}
                        className="absolute bottom-[63px] right-[3px] bg-gray-400 hover:bg-[#747474] text-white duration-300 rounded-full w-8 h-8 flex items-center justify-center shadow-lg cursor-pointer z-30"
                    >
                        <MdClose className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileImageUpload;